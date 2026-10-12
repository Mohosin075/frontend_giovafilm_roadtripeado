const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function createIcoFromPng(png32Buffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0); // width
  dirEntry.writeUInt8(32, 1); // height
  dirEntry.writeUInt8(0, 2);  // color count
  dirEntry.writeUInt8(0, 3);  // reserved
  dirEntry.writeUInt16LE(1, 4); // planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(png32Buffer.length, 8); // size
  dirEntry.writeUInt32LE(22, 12); // offset (6 + 16)

  return Buffer.concat([header, dirEntry, png32Buffer]);
}

async function generate() {
  const publicDir = path.join(__dirname, "..", "public");
  const appDir = path.join(__dirname, "..", "app");

  // Center of RT logo mark is (1521, 1501).
  // RT logo letters width is 1834, height is 672.
  // We crop 2000x2000 so the RT mark is large and legible even in 16x16 / 32x32 browser tabs!
  const squareSize = 2000;
  const squareLeft = Math.round(1521 - squareSize / 2);
  const squareTop = Math.round(1501 - squareSize / 2);

  // 1. High-res square RT icon (512x512) with subtle rounded corners
  const iconBuffer = await sharp(path.join(publicDir, "RT-Logo.png"))
    .extract({ left: squareLeft, top: squareTop, width: squareSize, height: squareSize })
    .resize(512, 512)
    .toBuffer();

  const roundedMask = Buffer.from(
    `<svg width="512" height="512">
      <rect x="0" y="0" width="512" height="512" rx="64" ry="64" fill="#fff"/>
    </svg>`
  );

  const rounded512 = await sharp(iconBuffer)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Save app icons
  fs.writeFileSync(path.join(publicDir, "icon-512.png"), rounded512);
  fs.writeFileSync(path.join(appDir, "apple-icon.png"), await sharp(rounded512).resize(180, 180).png().toBuffer());
  fs.writeFileSync(path.join(publicDir, "apple-icon.png"), await sharp(rounded512).resize(180, 180).png().toBuffer());

  // 2. 32x32 PNG favicon for Next.js App Router (app/icon.png & public/icon.png)
  const png32 = await sharp(rounded512).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(appDir, "icon.png"), png32);
  fs.writeFileSync(path.join(publicDir, "icon.png"), png32);

  // 3. Valid .ico for fallback (app/favicon.ico & public/favicon.ico)
  const icoBuffer = createIcoFromPng(png32);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);

  console.log("SUCCESS! All favicons and browser icons created from RT-Logo!");
}

generate().catch(err => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
