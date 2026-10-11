const sharp = require("sharp");
const { execSync } = require("child_process");

async function renderDarkTest() {
  const whiteBuf = execSync("git show HEAD:public/white-logo.png");
  const logoBuf = execSync("git show HEAD:public/logo.png");

  await sharp({
    create: {
      width: 700,
      height: 150,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 } // #0b0f19
    }
  })
  .composite([{ input: whiteBuf, left: 20, top: 25 }])
  .png()
  .toFile("public/test-white-git.png");

  await sharp({
    create: {
      width: 700,
      height: 150,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 } // #0b0f19
    }
  })
  .composite([{ input: logoBuf, left: 20, top: 25 }])
  .png()
  .toFile("public/test-logo-git.png");
}

renderDarkTest();
