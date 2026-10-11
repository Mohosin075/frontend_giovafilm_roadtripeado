const sharp = require("sharp");
const { execSync } = require("child_process");

async function checkFill() {
  const whiteBuf = execSync("git show HEAD:public/white-logo.png");
  const logoBuf = execSync("git show HEAD:public/logo.png");

  // Let's invert logoBuf (black to white)
  // In logo.png:
  // Black text (0,0,0) -> Inverted: (255, 255, 255)
  // Transparent alpha remains transparent!
  // That will make "ROAD" white outline AND "TRIPEADO" solid white fill!
  const invertedLogo = await sharp(logoBuf)
    .negate({ alpha: false })
    .toBuffer();

  await sharp(invertedLogo).png().toFile("public/test-inverted.png");
  console.log("Inverted logo generated!");
}

checkFill();
