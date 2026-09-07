// One-off: regenerate placeholder JPGs so they're a clean brand gradient
// instead of a stock photo with baked-in title text (e.g. "Interpreter
// (Penerjemah Lisan)", "Translater (Penerjemah Tulisan)") that duplicated
// the page's own <h1>/<h3> right next to it and looked like a broken icon.
// Run: node scripts/gen-hero-placeholders.js
const sharp = require('sharp');
const path = require('path');

const outDir = path.join(__dirname, '..', 'images');

// Hero banners (dark, under a black gradient overlay + kanji watermark in HTML)
const HERO_W = 1600, HERO_H = 800;
const heroSvg = `
<svg width="${HERO_W}" height="${HERO_H}" xmlns="http://www.w3.org/2000/svg">
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
  <rect width="${HERO_W}" height="${HERO_H}" fill="url(#ink)"/>
  <rect width="${HERO_W}" height="${HERO_H}" fill="url(#glow)"/>
</svg>`;

const heroFiles = [
  'hero-interpreter.jpg',
  'hero-kursus.jpg',
  'hero-tokutei.jpg',
  'hero-penerjemah.jpg',
  'hero-dokumen.jpg',
  'hero-elearning.jpg',
  'hero-video.jpg',
  'hero-website.jpg',
];

// "Layanan" cards on beranda.html — plain white card, real <h3> title right
// below the image, so the placeholder itself must carry NO text. One brand
// tone per card for visual variety (still only the site's own 3 colors).
const CARD_W = 1200, CARD_H = 750;
function cardSvg(colorA, colorB) {
  return `
<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_W}" height="${CARD_H}" fill="url(#g)"/>
</svg>`;
}

const cardFiles = [
  { file: 'layanan-penerjemahan.jpg', colorA: '#1f1c1a', colorB: '#0a0a0a' }, // ink
  { file: 'layanan-interpreter.jpg',  colorA: '#c0392b', colorB: '#8f2a1f' }, // red
  { file: 'layanan-kursus.jpg',       colorA: '#b8960c', colorB: '#8c7209' }, // gold
  { file: 'layanan-tokutei.jpg',      colorA: '#0a0a0a', colorB: '#8f2a1f' }, // ink → red
];

(async () => {
  for (const file of heroFiles) {
    await sharp(Buffer.from(heroSvg)).jpeg({ quality: 85 }).toFile(path.join(outDir, file));
    console.log('wrote', file);
  }
  for (const { file, colorA, colorB } of cardFiles) {
    await sharp(Buffer.from(cardSvg(colorA, colorB))).jpeg({ quality: 85 }).toFile(path.join(outDir, file));
    console.log('wrote', file);
  }
})();
