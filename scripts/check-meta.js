const sharp = require("sharp");
const { execSync } = require("child_process");

async function check() {
  const logoBuf = execSync("git show HEAD:public/logo.png");
  const whiteBuf = execSync("git show HEAD:public/white-logo.png");

  const logoMeta = await sharp(logoBuf).metadata();
  const whiteMeta = await sharp(whiteBuf).metadata();

  console.log("Git HEAD logo.png:", logoMeta.width, "x", logoMeta.height);
  console.log("Git HEAD white-logo.png:", whiteMeta.width, "x", whiteMeta.height);
}

check();
