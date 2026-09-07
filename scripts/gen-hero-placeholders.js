// One-off: regenerate hero placeholder JPGs so they're a clean brand gradient
// instead of a stock photo with baked-in text (e.g. "Interpreter (Penerjemah
// Lisan)") that duplicated the page's own <h1> and looked like a broken icon
// under the dark overlay + kanji watermark already drawn in HTML.
// Run: node scripts/gen-hero-placeholders.js
const sharp = require('sharp');
const path = require('path');

const W = 1600, H = 800;

const files = [
  'hero-interpreter.jpg',
  'hero-kursus.jpg',
  'hero-tokutei.jpg',
  'hero-penerjemah.jpg',
  'hero-dokumen.jpg',
  'hero-elearning.jpg',
  'hero-video.jpg',
  'hero-website.jpg',
];

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1c1a"/>
      <stop offset="55%" stop-color="#141212"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#c0392b" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#c0392b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ink)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`;

const outDir = path.join(__dirname, '..', 'images');

(async () => {
  for (const file of files) {
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 85 })
      .toFile(path.join(outDir, file));
    console.log('wrote', file);
  }
})();
