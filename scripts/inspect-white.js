const sharp = require("sharp");
const { execSync } = require("child_process");

async function inspectWhiteLogo() {
  const whiteBuf = execSync("git show HEAD:public/white-logo.png");
  const { data, info } = await sharp(whiteBuf).raw().toBuffer({ resolveWithObject: true });
  console.log("White logo raw info:", info);
  
  // Sample pixels across width around the vertical middle (y = 45)
  for (let x = 0; x < info.width; x += 30) {
    const idx = (45 * info.width + x) * 4;
    console.log(`x=${x}: rgba(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}, ${data[idx+3]})`);
  }
}

inspectWhiteLogo();
