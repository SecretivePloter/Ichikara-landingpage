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
  'hero-rental-mobil.jpg',
];

// "Layanan" cards on beranda.html — plain white card, real <h3> title right
// below the image, so the placeholder itself must carry NO title text. But a
// FLAT color alone reads as "image missing" to visitors (no photo texture,
// no icon) — so each card gets the same big kanji watermark treatment used
// on the matching page's own hero (see .japanese-watermark in css/style.css:
// 訳=jasa-penerjemah, 通=jasa-interpreter, 学=kursus-bahasa, 働=tokutei-ginou),
// just at higher opacity since here it's the card's only visual content.
const CARD_W = 1200, CARD_H = 750;
function cardSvg(colorA, colorB, kanji) {
  return `
<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_W}" height="${CARD_H}" fill="url(#g)"/>
  <text x="${CARD_W / 2}" y="${CARD_H / 2 + 130}" font-family="Noto Serif JP, Yu Mincho, MS Mincho, serif"
        font-size="560" font-weight="700" fill="#ffffff" fill-opacity="0.28" text-anchor="middle">${kanji}</text>
</svg>`;
}

const cardFiles = [
  { file: 'layanan-penerjemahan.jpg', colorA: '#1f1c1a', colorB: '#0a0a0a', kanji: '訳' }, // ink
  { file: 'layanan-interpreter.jpg',  colorA: '#c0392b', colorB: '#8f2a1f', kanji: '通' }, // red
  { file: 'layanan-kursus.jpg',       colorA: '#b8960c', colorB: '#8c7209', kanji: '学' }, // gold
  { file: 'layanan-tokutei.jpg',      colorA: '#0a0a0a', colorB: '#8f2a1f', kanji: '働' }, // ink → red
  { file: 'armada-avanza.jpg',        colorA: '#b8960c', colorB: '#8c7209', kanji: '車' }, // gold
  { file: 'armada-innova.jpg',        colorA: '#1f1c1a', colorB: '#0a0a0a', kanji: '車' }, // ink
  { file: 'metode-konsekutif.jpg',    colorA: '#1f1c1a', colorB: '#0a0a0a', kanji: '通' }, // ink
  { file: 'metode-simultan.jpg',      colorA: '#c0392b', colorB: '#8f2a1f', kanji: '通' }, // red
];

(async () => {
  for (const file of heroFiles) {
    await sharp(Buffer.from(heroSvg)).jpeg({ quality: 85 }).toFile(path.join(outDir, file));
    console.log('wrote', file);
  }
  for (const { file, colorA, colorB, kanji } of cardFiles) {
    await sharp(Buffer.from(cardSvg(colorA, colorB, kanji))).jpeg({ quality: 85 }).toFile(path.join(outDir, file));
    console.log('wrote', file);
  }
})();
