// One-off: tighten logo.png's transparent margins and derive a favicon set
// from just the icon mark (the wordmark is illegible at 16-32px anyway).
// Run: node scripts/gen-logo-favicon.js
const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '_backup-images', 'logo-original.png');
const OUT_DIR = path.join(__dirname, '..', 'images');

(async () => {
  // 1) Full lockup (icon + wordmark), trimmed tight — used in header/footer.
  await sharp(SRC)
    .trim({ threshold: 10 })
    .png()
    .toFile(path.join(OUT_DIR, 'logo.png'));
  console.log('wrote logo.png (trimmed)');

  // 2) Icon-only crop (left ~410px of the 1200px canvas holds the mark;
  //    trim() then tightens it to the actual swoosh shape).
  const iconTight = await sharp(SRC)
    .extract({ left: 0, top: 0, width: 393, height: 591 }) // stop before the "I" of Ichikara starts (~x=405)
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });

  const { width: iw, height: ih } = iconTight.info;
  const side = Math.round(Math.max(iw, ih) * 1.18); // ~9% padding each side, squared canvas

  // Pad the tight icon into a transparent square once, then downscale per size.
  const squared = await sharp(iconTight.data)
    .resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  async function favicon(size, file) {
    await sharp(squared).resize(size, size).png().toFile(path.join(OUT_DIR, file));
    console.log('wrote', file);
  }

  await favicon(16, 'favicon-16.png');
  await favicon(32, 'favicon-32.png');
  await favicon(180, 'apple-touch-icon.png');
  await favicon(512, 'favicon-512.png');
})();
