const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

/**
 * Creates a standard uncompressed DIB (Device Independent Bitmap) ICO file.
 * This is the canonical ICO format supported by all operating systems,
 * browsers, and the Rust image-rs library used by Next.js / Turbopack.
 */
async function makeStandardDIBIco(inputPath, width, height) {
  const raw = await sharp(inputPath)
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const data = raw.data; // RGBA top-down

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dibHeaderSize = 40;
  const xorSize = width * height * 4;
  const andRowSize = Math.ceil(width / 32) * 4; // 32 bits = 4 bytes per row
  const andSize = andRowSize * height;
  const imageSize = dibHeaderSize + xorSize + andSize;

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width >= 256 ? 0 : width, 0);
  dirEntry.writeUInt8(height >= 256 ? 0 : height, 1);
  dirEntry.writeUInt8(0, 2); // Color count
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(imageSize, 8); // Size
  dirEntry.writeUInt32LE(22, 12); // Offset (6 + 16)

  const bih = Buffer.alloc(dibHeaderSize);
  bih.writeUInt32LE(dibHeaderSize, 0); // biSize
  bih.writeInt32LE(width, 4); // biWidth
  bih.writeInt32LE(height * 2, 8); // biHeight (2x in ICO for XOR + AND masks)
  bih.writeUInt16LE(1, 12); // biPlanes
  bih.writeUInt16LE(32, 14); // biBitCount
  bih.writeUInt32LE(0, 16); // BI_RGB (uncompressed)
  bih.writeUInt32LE(xorSize + andSize, 20); // biSizeImage
  bih.writeInt32LE(0, 24);
  bih.writeInt32LE(0, 28);
  bih.writeUInt32LE(0, 32);
  bih.writeUInt32LE(0, 36);

  // XOR mask: bottom-up BGRA
  const xorMask = Buffer.alloc(xorSize);
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y; // bottom-up
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      xorMask[dstIdx + 0] = data[srcIdx + 2]; // B
      xorMask[dstIdx + 1] = data[srcIdx + 1]; // G
      xorMask[dstIdx + 2] = data[srcIdx + 0]; // R
      xorMask[dstIdx + 3] = data[srcIdx + 3]; // A
    }
  }

  // AND mask: all 0 for fully opaque
  const andMask = Buffer.alloc(andSize, 0);

  return Buffer.concat([header, dirEntry, bih, xorMask, andMask]);
}

async function generateAuthenticIcons() {
  const rootDir = path.join(__dirname, "..");
  const publicDir = path.join(rootDir, "public");
  const appDir = path.join(rootDir, "app");

  const originalSrc = path.join(publicDir, "RT-Logo.png");
  console.log("Reading original source from:", originalSrc);

  const meta = await sharp(originalSrc).metadata();
  console.log("Original dimensions:", meta.width, "x", meta.height);

  // 1. High quality Lanczos3 PNGs with exact original proportions & spacing
  const png32 = await sharp(originalSrc)
    .resize(32, 32, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const png180 = await sharp(originalSrc)
    .resize(180, 180, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const png192 = await sharp(originalSrc)
    .resize(192, 192, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const png512 = await sharp(originalSrc)
    .resize(512, 512, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  // 2. Standard DIB ICO (100% compatible with Next.js Turbopack image decoder)
  const icoBuffer = await makeStandardDIBIco(originalSrc, 32, 32);

  // Write Next.js App Router icons
  fs.writeFileSync(path.join(appDir, "icon.png"), png32);
  fs.writeFileSync(path.join(appDir, "apple-icon.png"), png180);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuffer);

  // Write Public directory icons
  fs.writeFileSync(path.join(publicDir, "icon.png"), png32);
  fs.writeFileSync(path.join(publicDir, "favicon.png"), png32);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(publicDir, "apple-icon.png"), png180);
  fs.writeFileSync(path.join(publicDir, "icon-192.png"), png192);
  fs.writeFileSync(path.join(publicDir, "icon-512.png"), png512);
  fs.writeFileSync(path.join(publicDir, "rt-icon-rounded.png"), png512);

  console.log("All authentic icons generated successfully from original RT-Logo.png!");
}

generateAuthenticIcons().catch(err => {
  console.error("Error generating authentic icons:", err);
  process.exit(1);
});
