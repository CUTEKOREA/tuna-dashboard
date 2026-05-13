const Jimp = require('jimp');

async function removeBackground() {
  const imagePath = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/southern-bluefin-tuna.png';
  console.log('Reading image...', imagePath);
  const image = await Jimp.read(imagePath);

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Pure black background removal
    if (r < 15 && g < 15 && b < 15) {
      this.bitmap.data[idx + 3] = 0; // set alpha to 0 completely
    } else if (r < 40 && g < 40 && b < 40) {
       // Anti-aliasing soft edge for very dark pixels
       const maxVal = Math.max(r, g, b);
       this.bitmap.data[idx + 3] = Math.floor((maxVal / 40) * 255);
    }
  });

  await image.writeAsync('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/southern-bluefin-tuna.png');
  console.log('Background removed successfully.');
}

removeBackground().catch(console.error);
