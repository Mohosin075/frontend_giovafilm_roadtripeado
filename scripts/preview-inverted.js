const sharp = require("sharp");

async function previewInverted() {
  await sharp({
    create: {
      width: 700,
      height: 150,
      channels: 4,
      background: { r: 11, g: 15, b: 25, alpha: 1 }
    }
  })
  .composite([{ input: "public/test-inverted.png", left: 20, top: 25 }])
  .png()
  .toFile("public/test-inverted-dark.png");
}

previewInverted();
