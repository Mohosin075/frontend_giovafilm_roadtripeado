const sharp = require("sharp");
const { execSync } = require("child_process");
const path = require("path");

async function buildPerfectLogos() {
  const publicDir = path.join(__dirname, "..", "public");

  // Read clean original files from git
  const origLogoBuf = execSync("git show HEAD:public/logo.png");
  const origWhiteBuf = execSync("git show HEAD:public/white-logo.png");

  // Get trimmed bounding boxes
  const logoTrimmed = await sharp(origLogoBuf).trim().toBuffer({ resolveWithObject: true });
  const whiteTrimmed = await sharp(origWhiteBuf).trim().toBuffer({ resolveWithObject: true });

  console.log("logoTrimmed:", logoTrimmed.info.width, "x", logoTrimmed.info.height);
  console.log("whiteTrimmed:", whiteTrimmed.info.width, "x", whiteTrimmed.info.height);

  // We want a standard height for the logo text, e.g. targetHeight = 80px
  const targetTextHeight = 72;
  
  // Resize both trimmed texts to exactly targetTextHeight
  const lightText = await sharp(logoTrimmed.data)
    .resize({ height: targetTextHeight, fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  // For dark mode, let's create a text that is HIGH CONTRAST and completely legible!
  // In git white-logo, what does whiteTrimmed have?
  // Let's make sure whiteText is bright and solid white!
  const darkText = await sharp(whiteTrimmed.data)
    .resize({ height: targetTextHeight, fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  console.log("lightText resized:", lightText.info.width, "x", lightText.info.height);
  console.log("darkText resized:", darkText.info.width, "x", darkText.info.height);
}

buildPerfectLogos();
