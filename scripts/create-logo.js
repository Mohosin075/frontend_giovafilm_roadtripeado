const sharp = require("sharp");
const path = require("path");

async function generateAssets() {
  const publicDir = path.join(__dirname, "..", "public");

  // Center is (1521, 1501).
  // Total RT mark width is 1834, height is 672.
  // To enclose the entire RT mark with comfortable padding inside a square:
  const squareSize = 2200;
  const squareLeft = Math.round(1521 - squareSize / 2);
  const squareTop = Math.round(1501 - squareSize / 2);

  const iconBuffer = await sharp(path.join(publicDir, "RT-Logo.png"))
    .extract({ left: squareLeft, top: squareTop, width: squareSize, height: squareSize })
    .resize(512, 512)
    .toBuffer();

  // 1. Rounded App Icon / Favicon (512x512)
  const roundedMask = Buffer.from(
    `<svg width="512" height="512">
      <rect x="0" y="0" width="512" height="512" rx="96" ry="96" fill="#fff"/>
    </svg>`
  );

  await sharp(iconBuffer)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toFile(path.join(publicDir, "rt-icon-rounded.png"));

  // 2. Generate Favicon from this icon
  await sharp(iconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, "favicon.png"));

  // 3. Create the combined [RT Icon Badge] + [ROADTRIPEADO]
  // Original text logo is 588 x 142
  const origLogo = await sharp(path.join(publicDir, "logo.png")).metadata();
  const iconH = origLogo.height; // 142
  const iconW = iconH; // 142

  const badgeMask = Buffer.from(
    `<svg width="${iconW}" height="${iconH}">
      <rect x="0" y="0" width="${iconW}" height="${iconH}" rx="28" ry="28" fill="#fff"/>
    </svg>`
  );

  const badge = await sharp(iconBuffer)
    .resize(iconW, iconH, { fit: "cover" })
    .composite([{ input: badgeMask, blend: "dest-in" }])
    .toBuffer();

  const gap = 20;
  const totalW = iconW + gap + origLogo.width;
  const totalH = iconH;

  // Light mode combined logo
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: badge, left: 0, top: 0 },
    { input: path.join(publicDir, "logo.png"), left: iconW + gap, top: 0 }
  ])
  .png()
  .toFile(path.join(publicDir, "combined-logo-light.png"));

  // Dark mode combined logo
  await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: badge, left: 0, top: 0 },
    { input: path.join(publicDir, "white-logo.png"), left: iconW + gap, top: 0 }
  ])
  .png()
  .toFile(path.join(publicDir, "combined-logo-dark.png"));

  console.log("Assets updated perfectly!");
}

generateAssets();
