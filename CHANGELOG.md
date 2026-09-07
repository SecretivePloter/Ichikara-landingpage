# CHANGELOG — Website PT. Ichikara

Log perubahan project. Format entri: **tanggal — ringkasan perubahan — file/modul terdampak**.

> **Aturan untuk coding agent:** SETIAP kali melakukan perubahan pada project ini, WAJIB
> menambahkan entri baru di bawah ini (di bagian paling atas, terbaru dulu) SEBELUM
> menyatakan tugas selesai.

---

## 2026-09-07 — Cek & perbaikan tampilan mobile sebelum deploy
- Ditemukan 4 gambar lagi dengan pola sama seperti hero placeholder sebelumnya: `images/layanan-penerjemahan.jpg`, `layanan-interpreter.jpg`, `layanan-kursus.jpg`, `layanan-tokutei.jpg` (dipakai di 4 kartu "Layanan Kami" beranda.html) ternyata baked-in teks judul (bahkan ada typo "Translater") yang duplikat dengan `<h3>` di bawahnya — makin terlihat jelek/terpotong di layar mobile sempit.
- Diganti gradient brand bersih (ink/merah/emas, tanpa teks) via `scripts/gen-hero-placeholders.js` (diperluas untuk menangani kedua kategori: hero 2:1 dan kartu layanan 16:10).
- Verifikasi mobile (375px, resize_window preset mobile) untuk: beranda.html (marquee logo + kartu layanan), kursus-bahasa.html (semua tabel harga — scroll horizontal per-tabel via `overflow-x-auto`, tidak ada overflow di level halaman), tentang-kami.html (grid Visi & Misi). Semua `document.body.scrollWidth` = `window.innerWidth` (tidak ada horizontal scroll bocor ke halaman).
- Terdampak: `images/layanan-*.jpg` (4 file), `scripts/gen-hero-placeholders.js`.

## 2026-09-07 — Tim Pengajar kini fully admin-controlled + isi Tentang Kami ditulis ulang dari brosur
- **Tab admin baru "Pengajar":** section Supabase baru `teachers` (`js/site-data.js`, `admin/index.html`). Admin sekarang bisa tambah/edit/hapus pengajar (nama, spesialisasi, foto — upload ke Supabase Storage bucket `ichikara-web-media/teachers/`), persis pola CRUD "Kisah Sukses" yang sudah ada. TIDAK ada seed data bawaan.
- `kursus-bahasa.html`: 5 kartu "Sensei" hardcoded (nama karangan: Aiko/Hiro/Yuki/Kenji/Riko) dihapus, diganti render dinamis dari Supabase (`applyTeachers()`). Section `#pengajar` mulai `hidden` dan hanya muncul kalau admin sudah menambahkan minimal 1 pengajar — sama seperti pola `#kisah-sukses` di beranda.
- Slot upload lama `guru-1.jpg`...`guru-5.jpg` dihapus dari manifest `admin/index.html` (foto pengajar sekarang dikelola per-orang di tab Pengajar, bukan slot file tetap).
- **Tentang Kami** (`tentang-kami.html`): paragraf "Kisah PT. Ichikara" yang sebelumnya berisi klaim tak terverifikasi ("berdiri lebih dari satu dekade") dan cerita arti nama perusahaan yang dikarang ("一花 berarti satu bunga...") diganti deskripsi berbasis fakta brosur (bidang penerjemahan, pendidikan bahasa Jepang, program pra-pemagangan ke Jepang kerja sama pemerintah), ditulis naratif — bukan copy-paste brosur. Ditambahkan section baru **Visi & Misi** (1 pernyataan visi + 4 kartu misi) dari brosur, dengan penulisan ulang yang lebih menarik.
- `PROJECT_OVERVIEW.md` diperbarui: kontrak data section `teachers` + baris modul admin.
- Terdampak: `js/site-data.js`, `admin/index.html`, `kursus-bahasa.html`, `tentang-kami.html`, `PROJECT_OVERVIEW.md`.

## 2026-09-07 — Konten Kursus Bahasa Jepang diganti data asli dari brosur
- **Sebelumnya:** `kursus-bahasa.html` isinya 100% fiktif — kartu "Program JLPT" generik, 3 kartu "Jenis Kelas" tanpa harga, dan tabel jadwal reguler karangan (hari/jam/status "Tersedia"/"Hampir Penuh" tidak nyata).
- **Diganti dengan data brosur asli:** deskripsi "Program Bimbel" + 4 poin "Kelebihan Metode Bimbel"; tabel "Level of Learning" (Level 1–12 → Bab); "Courses Fee" (Registration/Guidebook/Deposit + tabel biaya per level JLPT N5–N3); tabel "Kelas Kecil" (Private/Semi Private/Grup Kecil + biaya buku); tabel "Kelas Reguler" 6–7 orang (Reguler 1–4, Minna no Nihongo 1); dua tabel "Kelas Perusahaan" 8–10 orang (jalur Reguler s.d N5 termasuk Paket Kelas N5 hemat + biaya transportasi per area, dan jalur Intensif Beginner1/Beginner2/Intermediate dengan rincian kosakata/kanji/jam belajar); section baru "Pencapaian Kursus Bahasa" (14 program in-house/expatriat nyata untuk Toyota, Showa, OMRON, Kyoraku, Sumco, Sugity, YKK Zipco, DMC Technology, Trimitra Indrahasta, Gonze, Aisan Nasmoco, Shiroki).
- Section "Alur Pembelajaran" (7 tahap) dan "Tim Pengajar" (5 foto) TIDAK diubah — brosur tidak memuat data ini, jadi dibiarkan seperti semula (di luar scope permintaan).
- Meta description & subjudul hero disesuaikan agar mencerminkan penawaran nyata (privat/semi privat/grup/reguler/perusahaan, N5–N3) alih-alih klaim generik "N5 hingga N1".
- Terdampak: `kursus-bahasa.html`.

## 2026-09-07 — Mini story "Kisah Sukses Terbaru" di beranda kini murni admin-controlled
- **Masalah:** `#kisah-sukses` di `beranda.html` punya 3 kartu cerita HARDCODED di HTML statis (judul/foto fiktif — `images/story-otomotif.jpg`, `story-negosiasi.jpg`, `story-aichi.jpg` — yang tidak pernah ada di folder `images/`, jadi tampil sebagai gambar patah). Kartu ini tidak terhubung ke sistem admin sama sekali, jadi tetap muncul terus walau admin belum mengatur apa-apa.
- **Fix:** 3 kartu statis dihapus dari `beranda.html`; `<section id="kisah-sukses">` sekarang mulai dengan class `hidden` dan HANYA dimunculkan oleh `applyStories()` kalau memang ada cerita untuk ditampilkan (dari `featuredIds` admin, atau fallback 3 cerita terbaru). Kalau admin belum punya cerita sama sekali, section otomatis tetap tersembunyi — tidak lagi menampilkan apa pun.
- Slot upload usang `story-otomotif.jpg` / `story-negosiasi.jpg` / `story-aichi.jpg` dihapus dari manifest `admin/index.html` (tidak relevan lagi — foto+teks+pemilihan cerita sekarang 100% lewat tab Cerita di admin, sudah mendukung upload foto, rich-text excerpt, dan toggle "featured" per cerita).
- Terdampak: `beranda.html`, `admin/index.html`.

## 2026-09-07 — Sederhanakan menu, logo klien jadi marquee 2 baris, banner foto untuk sub-halaman penerjemah
- **Menu Layanan disederhanakan:** dropdown desktop & mobile di `js/header-loader.js` sebelumnya berisi 5 link penerjemahan (Jasa Penerjemah, Dokumen, E-Learning, Video, Website) — kini hanya "Jasa Penerjemah" (4 sub-halaman tetap bisa diakses lewat kartu di `jasa-penerjemah.html`, tidak dihapus).
- **Logo klien di beranda** (`#klien` di `beranda.html`): dari strip statis 56px jadi marquee 2 baris (baris atas geser kiri, baris bawah geser kanan, auto-loop, pause saat hover, edge-fade mask). Ukuran logo naik ke `h-20` (80px). CSS baru: bagian "11. Client logo marquee" di `css/style.css`. Fungsi `applyClients()` di `beranda.html` ditulis ulang agar tetap generate markup marquee dari jumlah slot admin (Supabase), bukan cuma strip datar.
- **Catatan asset:** `images/clients/client-1.png` s/d `client-8.png` ternyata bukan logo transparan per-klien, tapi crop kolase (beberapa logo + caption per file, background putih solid) — jadi nyaris tak kelihatan di section putih. Bukan bug marquee; perlu diganti via admin (`admin/index.html` tab Logo Klien) dengan PNG transparan per logo.
- **Banner/hero halaman:** `hero-interpreter.jpg`, `hero-kursus.jpg`, `hero-tokutei.jpg`, `hero-penerjemah.jpg` sebelumnya adalah foto stok dengan teks judul ter-bake (mis. "Interpreter (Penerjemah Lisan)") yang tumpang tindih dengan `<h1>` halaman — diganti gradient ink polos (skrip sekali-jalan `scripts/gen-hero-placeholders.js`, pakai `sharp`) supaya jadi placeholder netral sampai admin upload foto asli.
- **4 sub-halaman `jasa-penerjemah/*.html`** (dokumen/e-learning/video/website-translation) sebelumnya TIDAK punya foto hero sama sekali (cuma watermark kanji di atas `bg-primary`) — ditambahkan `<img>` + overlay gradient + placeholder baru (`hero-dokumen.jpg`, `hero-elearning.jpg`, `hero-video.jpg`, `hero-website.jpg`), dan didaftarkan sebagai slot upload baru di `admin/index.html` (section `penerjemah`).
- Terdampak: `js/header-loader.js`, `beranda.html`, `css/style.css`, `jasa-penerjemah/dokumen-translation.html`, `jasa-penerjemah/e-learning.html`, `jasa-penerjemah/video-translation.html`, `jasa-penerjemah/website-translation.html`, `admin/index.html`, `images/hero-*.jpg` (8 file), `scripts/gen-hero-placeholders.js` (baru).

## 2026-08-29 — Deploy ke Vercel Production
- Deploy via `npx vercel --prod` (project `kode`, org `secretiveploters-projects`).
- URL production: **https://kode-vert.vercel.app** (Ready dalam 8s; presentasi langsung oleh vercel.json).
- Cek hasil: semua halaman 200 (beranda, success-story, 12 halaman layanan), `js/site-data.js` & `js/header-loader.js` 200, `images/hero-beranda.jpg` 212KB & `pamflet-ssw.jpg` 299KB (kompresi live), WhatsApp `wa.me/6288291469464` sudah muncul di HTML production.
- Catatan: `jasa-penerjemah/index.html` tidak ada (folder hanya berisi sub-halaman) — navigasi tidak mengacu ke sana, bukan bug.
- Terdampak: seluruh website (deploy) — tanpa perubahan kode tambahan.
- Nomor resmi: **+62 882-9146-9464** → `https://wa.me/6288291469464`.
- Diganti di 27 kemunculan / 12 file: 7 halaman root (beranda, jasa-penerjemah, jasa-interpreter, kursus-bahasa, success-story, tentang-kami, tokutei-ginou), 4 subhalaman `jasa-penerjemah/*`, dan `js/header-loader.js` (CTA header + footer).
- Terdampak: semua halaman + `js/header-loader.js`. Tidak ada perubahan di folder referensi lama.
- Catatan: komentar TODO di HTML tidak diubah — tidak memengaruhi runtime.

## 2026-08-29 — Optimasi performa: lazy-loading gambar non-hero
- Ditambahkan `loading="lazy"` ke semua `<img>` non-hero di 7 halaman root (beranda, success-story, jasa-penerjemah, jasa-interpreter, kursus-bahasa, tokutei-ginou, tentang-kami).
- Hero (`hero-*`, `kantor-ichikara`, `cta-tokutei`) dan logo sengaja TIDAK di-lazy (LCP/Critical image).
- Terdampak: 7 halaman root + `scripts/add-lazy-loading.py` (tool sekali-jalan).
- Total: 37 gambar non-hero kini lazy-load — penghematan bandwidth awal halaman cukup signifikan setelah kompresi.

## 2026-08-29 — Optimasi performa: kompresi & resize seluruh gambar
- Ditambahkan `scripts/optimize-images.js` (Node + sharp) + `package.json` (devDep `sharp`).
- Semua gambar di `images/` dikompres: total 11.05 MB hemat (`images/` ±12 MB → kini ±1.4 MB).
  Contoh: `hero-beranda.jpg` 2.22 MB → 212 KB; `pamflet-ssw.jpg` 2.34 MB → 299 KB; `guru-1.jpg` 1.25 MB → 34 KB; `logo.png` 340 KB → 64 KB.
- Original gambar di-backup ke `_backup-images/` (tidak dihapus). `flag-id.png` di-restore dari backup (kompresi malah membesarkan).
- Ditambahkan `.vercelignore` (jangan upload `_backup-images`, `node_modules`, `scripts`) & update `.gitignore`.
- Terdampak: semua file `images/**`, `scripts/optimize-images.js`, `package.json`, `.vercelignore`, `.gitignore`.
- Catatan: kompresi `flag-id.png` dibatalkan karena fail — file ikon masih asli/512 B.

## 2026-08-28 — Migrasi konten dinamis dari localStorage ke Supabase (real-time)
- **Fitur utama:** data website (stories, jumlah logo klien, featured beranda) kini disimpan di tabel Supabase `ichikara_web_content` dan gambar di bucket Storage `ichikara-web-media`. Perubahan di admin langsung tampil di semua halaman publik secara real-time (Supabase Realtime), tanpa deploy.
- **File baru:** `js/site-data.js` — modul bersama halaman publik (`window.IchikaraSite`: `loadContent`, `onContent` real-time, `imgSrc`, `applyMediaOverrides`).
- **Terdampak:**
  - `admin/index.html` — `load()`/`persist()` kini fetch/upsert Supabase (fallback localStorage bila offline); form foto story = file picker → upload Storage (auto-fill URL); tab "Gambar Website" & "Logo Klien" = upload ke Supabase via override `media` + tombol Reset (menggantikan File System Access API yang hanya bisa menulis folder lokal); indikator status sinkron di top bar; tombol **Migrate** (sekali jalan) untuk memindah data localStorage lama ke Supabase; backup/import JSON & Export HTML tetap ada sebagai cadangan.
  - `beranda.html`, `success-story.html`, + 9 halaman publik lain — muat Supabase UMD + `site-data.js` di `<head>`; renderer cerita & client strip pindah ke `onContent()` dengan fallback localStorage/statis.
  - `js/header-loader.js` — tambahan `applyMediaOverrides()` via `onContent()`: SEMUA `<img>` di SEMUA halaman mengikuti gambar yang diupload admin (hero, logo, thumbnail) tanpa deploy.
- **Catatan keamanan:** sesuai §6.1 PROJECT_OVERVIEW — hanya objek baru ber-prefix `ichikara_web_`/`ichikara-web-`; tidak ada satu pun perubahan pada data/tabel sistem absensi di project Supabase yang sama. Tabel & RLS dibuat oleh owner (SQL), kode hanya SELECT (publik) + upsert (admin terautentikasi).
- **Syarat aktivasi:** bucket Storage `ichikara-web-media` (public) masih perlu dibuat di dashboard Supabase sebelum upload gambar berfungsi (data stories sudah berfungsi).

## 2026-08-28 — Pendokumentasian batasan Supabase (shared dengan sistem absensi)
- `PROJECT_OVERVIEW.md`: ditambahkan §6.1 — project Supabase `pfvlxlfykdabrwijqqxa`
  BERSAMA dengan sistem absensi karyawan; aturan mutlak: hanya CREATE objek baru
  dengan prefix `ichikara_web_`, dilarang menyentuh objek lain.
- Terdampak: `PROJECT_OVERVIEW.md` (dokumentasi saja, **tidak ada perubahan kode**).
- Konteks: persiapan migrasi data dinamis website (stories/clients/beranda) dari
  localStorage ke Supabase (tabel `ichikara_web_content` + bucket `ichikara-web-media`).

## 2026-08-28 — Initial documentation setup
- Dibuat `PROJECT_OVERVIEW.md` (dokumentasi struktur, arsitektur, alur kerja, konfigurasi,
  dan catatan perubahan) dan `CHANGELOG.md` (file ini) berdasarkan hasil audit kode.
- Terdampak: root project (hanya dokumentasi, **tidak ada perubahan kode**).
- Catatan: tidak ditemukan histori git (project bukan git repository), sehingga entri
  historis sebelumnya tidak dapat disimpulkan dari commit log.
