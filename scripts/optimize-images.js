/*
 * optimize-images.js — Kompres & resize gambar website PT. Ichikara.
 *
 * AMAN: tidak menghapus apapun.
 *  - Original di-copy ke _backup-images/ SEBELUM dikompres (sekali saja).
 *  - File yang sudah di-backup (sudah pernah dioptimasi) dilewati,
 *    jadi script idempoten dan tidak mengompak ulang hasil kompres.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'images');
const BACKUP_DIR = path.join(ROOT, '_backup-images');
const MARKER = path.join(BACKUP_DIR, '.optimized-mark');

// Batas dimensi & kualitas per kategori (lebar max, mempertahankan rasio)
const JPEG_Q = 74; // kualitas mozjpeg — seimbang antara ukuran & ketajaman
const MAX_W = {
  hero: 1920,      // hero full-bleed
  normal: 1600,    // konten biasa (layanan, tentang, story)
  avatar: 800,     // foto guru (kotak kecil)
};

function walk(dir, exts) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

async function main() {
  // 1. Backup satu kali
  if (!fs.existsSync(MARKER)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    for (const f of walk(IMG_DIR, ['.jpg', '.jpeg', '.png'])) {
      const rel = path.relative(IMG_DIR, f);
      const dest = path.join(BACKUP_DIR, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(f, dest);
    }
    fs.writeFileSync(MARKER, new Date().toISOString());
    console.log('[backup] original disimpan ke _backup-images/');
  } else {
    console.log('[backup] sudah pernah dibackup — dilewati.');
  }

  // 2. Kompres
  const files = walk(IMG_DIR, ['.jpg', '.jpeg']);
  const pngs  = walk(IMG_DIR, ['.png']);
  let saved = 0;

  for (const f of files) {
    const before = fs.statSync(f).size;
    const name = path.basename(f).toLowerCase();
    let maxW;
    if (name.startsWith('hero-')) maxW = MAX_W.hero;
    else if (name.startsWith('guru-')) maxW = MAX_W.avatar;
    else maxW = MAX_W.normal;

    let img = sharp(f).rotate(); // normalize EXIF
    const meta = await img.metadata();
    if (meta.width && meta.width > maxW) img = img.resize({ width: maxW });
    await img
      .jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true })
      .toFile(f + '.tmp');
    fs.renameSync(f + '.tmp', f);

    const after = fs.statSync(f).size;
    saved += before - after;
    const pct = ((1 - after / before) * 100).toFixed(1);
    console.log(`${path.relative(IMG_DIR, f).padEnd(34)} ${fmt(before).padStart(8)} → ${fmt(after).padStart(8)}  (-${pct}%)`);
  }

  for (const f of pngs) {
    const before = fs.statSync(f).size;
    if (before < 500) continue; // file sangat kecil (ikon flag) — biarkan
    let img = sharp(f).rotate();
    const meta = await img.metadata();
    if (meta.width && meta.width > 1200) img = img.resize({ width: 1200 });
    try {
      await img
        .png({ palette: true, quality: 85, compressionLevel: 9 })
        .toFile(f + '.tmp');
      fs.renameSync(f + '.tmp', f);
      const after = fs.statSync(f).size;
      saved += before - after;
      const pct = ((1 - after / before) * 100).toFixed(1);
      console.log(`${path.relative(IMG_DIR, f).padEnd(34)} ${fmt(before).padStart(8)} → ${fmt(after).padStart(8)}  (-${pct}%)`);
    } catch (e) {
      // palette gagal (mis. foto PNG) — simpan versi asli
      try { fs.unlinkSync(f + '.tmp'); } catch (_) {}
      console.log(`${path.relative(IMG_DIR, f).padEnd(34)} dilewati (${e.message})`);
    }
  }

  console.log(`\nTotal hemat: ${fmt(saved)}`);
}

function fmt(bytes) {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}

main().catch((e) => { console.error(e); process.exit(1); });