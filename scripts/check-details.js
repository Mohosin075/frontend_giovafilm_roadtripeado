const sharp = require("sharp");
const { execSync } = require("child_process");

async function checkDetails() {
  const logoBuf = execSync("git show HEAD:public/logo.png");
  const whiteBuf = execSync("git show HEAD:public/white-logo.png");

  // Trim to find actual content bounding boxes
  const trimmedLogo = await sharp(logoBuf).trim().toBuffer({ resolveWithObject: true });
  const trimmedWhite = await sharp(whiteBuf).trim().toBuffer({ resolveWithObject: true });

  console.log("Trimmed logo:", trimmedLogo.info.width, "x", trimmedLogo.info.height);
  console.log("Trimmed white-logo:", trimmedWhite.info.width, "x", trimmedWhite.info.height);
}

checkDetails();
