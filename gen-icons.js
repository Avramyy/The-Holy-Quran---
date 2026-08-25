const sharp = require('sharp');
const path = require('path');

const INPUT = path.join('C:', 'Users', 'LENOVO', 'AppData', 'Local', 'Temp', 'freebuff-desktop-pastes', 'paste-1787676200812-3524.png');

async function removeBg(inputPath, outputPath, size) {
  // Resize with WHITE background so edges are white, not black
  const resized = await sharp(inputPath)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  
  // Only remove pixels that are very close to pure white (255,255,255)
  // This removes the background while keeping ALL the calligraphy
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Very strict: only near-pure white
    if (r > 240 && g > 240 && b > 240) {
      data[i+3] = 0; // transparent
    }
    // Smooth edge for slightly off-white pixels
    else if (r > 225 && g > 225 && b > 225) {
      const brightness = (r + g + b) / 3;
      data[i+3] = Math.round(((255 - brightness) / 30) * 255);
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toFile(outputPath);
  
  // Quick verification
  const check = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true });
  let nonTransparent = 0;
  for (let i = 3; i < check.data.length; i += 4) {
    if (check.data[i] > 0) nonTransparent++;
  }
  const pct = Math.round(nonTransparent / (check.data.length/4) * 100);
  console.log(`✅ ${outputPath}: ${pct}% visible pixels`);
}

async function main() {
  await removeBg(INPUT, 'bismillah-icon.png', 400);
  await removeBg(INPUT, 'icon-192.png', 192);
  await removeBg(INPUT, 'icon-512.png', 512);
  await removeBg(INPUT, 'apple-touch-icon.png', 180);
  await removeBg(INPUT, 'favicon.png', 64);
  console.log('🎉 All icons generated!');
}

main().catch(console.error);
