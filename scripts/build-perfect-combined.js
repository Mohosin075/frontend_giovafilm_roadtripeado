const sharp = require("sharp");
const { execSync } = require("child_process");
const path = require("path");

async function buildCombined() {
  const publicDir = path.join(__dirname, "..", "public");

  // 1. Get trimmed black text (light mode)
  const origLogoBuf = execSync("git show HEAD:public/logo.png");
  const trimmedLightTextBuf = await sharp(origLogoBuf).trim().toBuffer();
  
  // 2. Invert black text to create solid crisp white text (dark mode)
  const trimmedDarkTextBuf = await sharp(trimmedLightTextBuf)
    .negate({ alpha: false })
    .toBuffer();

  // Target text height
  const textH = 72;
  const resizedLightText = await sharp(trimmedLightTextBuf)
    .resize({ height: textH, fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const resizedDarkText = await sharp(trimmedDarkTextBuf)
    .resize({ height: textH, fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const textW = resizedLightText.info.width;
  console.log("Resized text:", textW, "x", textH);

  // 3. Create RT Badge with exact height = textH (72x72)
  // Extract center square from RT-Logo.png
  // Center is (1521, 1501). Size: 2200x2200
  const squareSize = 2200;
  const squareLeft = Math.round(1521 - squareSize / 2);
  const squareTop = Math.round(1501 - squareSize / 2);

  const iconBuffer = await sharp(path.join(publicDir, "RT-Logo.png"))
    .extract({ left: squareLeft, top: squareTop, width: squareSize, height: squareSize })
    .resize(textH, textH, { fit: "cover" })
    .toBuffer();

  const badgeMask = Buffer.from(
    `<svg width="${textH}" height="${textH}">
      <rect x="0" y="0" width="${textH}" height="${textH}" rx="16" ry="16" fill="#fff"/>
    </svg>`
  );

  const badge = await sharp(iconBuffer)
    .composite([{ input: badgeMask, blend: "dest-in" }])
    .toBuffer();

  // 4. Dimensions & Alignment
  const gap = 16;
  const paddingRight = 16;
  const totalW = textH + gap + textW + paddingRight;
  const totalH = textH;

  // Composite Light Logo
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
    { input: resizedLightText.data, left: textH + gap, top: 0 }
  ])
  .png()
  .toFile(path.join(publicDir, "perfect-logo-light.png"));

  // Composite Dark Logo
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
    { input: resizedDarkText.data, left: textH + gap, top: 0 }
  ])
  .png()
  .toFile(path.join(publicDir, "perfect-logo-dark.png"));

  // Also composite on dark preview background to verify
  await sharp({
    create: {
      width: totalW + 40,
      height: totalH + 40,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 } // #0b0f19
    }
  })
  .composite([
    { input: path.join(publicDir, "perfect-logo-dark.png"), left: 20, top: 20 }
  ])
  .png()
  .toFile(path.join(publicDir, "preview-dark-navbar.png"));

  console.log("SUCCESS! Created perfect logos. Total size:", totalW, "x", totalH);
}

buildCombined().catch(console.error);
