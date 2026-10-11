const sharp = require("sharp");
const path = require("path");

async function generateFavicons() {
  const publicDir = path.join(__dirname, "..", "public");
  const appDir = path.join(__dirname, "..", "app");
  
  const src = path.join(publicDir, "rt-icon-rounded.png");

  // app/icon.png (Next.js automatically uses this as the favicon for browser tabs)
  await sharp(src)
    .resize(32, 32)
    .png()
    .toFile(path.join(appDir, "icon.png"));

  // app/apple-icon.png
  await sharp(src)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));

  console.log("Favicons generated!");
}

generateFavicons();
