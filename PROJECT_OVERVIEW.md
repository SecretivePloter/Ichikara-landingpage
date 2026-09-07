# PROJECT_OVERVIEW — Website PT. Ichikara

> Dokumentasi ini dibuat oleh coding agent untuk membantu orientasi saat melakukan perubahan.
> Terakhir diperbarui: 2026-08-28

---

## 1. Nama & Deskripsi Singkat

**Website PT. Ichikara** — website landing page multi-halaman (Bahasa Indonesia) untuk perusahaan jasa bahasa Jepang di Indonesia.

Tujuan project: mempresentasikan dan menjual 4 layanan utama PT. Ichikara, yaitu:

1. **Penerjemahan** (dokumen, e-learning, video, website)
2. **Interpretasi** (simultan, consecutive, pendamping bisnis, jarak jauh)
3. **Kursus Bahasa Jepang** (JLPT, Business Japanese, private)
4. **Program Tokutei Ginou / SSW** (persiapan kerja di Jepang)

Fitur tambahan: halaman **Kisah Sukses** (success stories) yang bisa dikelola via panel admin, strip logo klien, dan panel admin untuk mengelola konten dinamis.

**Domain deployment:** `https://kode-vert.vercel.app` (Vercel).

---

## 2. Tech Stack

| Aspek | Teknologi |
|---|---|
| Bahasa | HTML, CSS, JavaScript (vanilla, ES5-style `var`/`function`) |
| Framework UI | **Tailwind CSS via CDN** (tanpa build step) + `tailwind-config.js` custom |
| Font/Icon | Google Fonts: Inter (body), Noto Serif JP (heading), Material Symbols Outlined (icon) |
| Arsitektur | **Multi-page static site** — tidak ada backend, tidak ada build step |
| "Database" | **localStorage browser** (data dikelola dari panel admin) |
| Auth admin | **Supabase Auth** (email + password), library `supabase-js@2` via CDN |
| Hosting | **Vercel** (konfigurasi di `vercel.json`) |
| Aset gambar | `images/` (JPG/PNG) + `images/clients/` (logo klien `client-1.png` s.d. `client-8.png`) |

Tidak ada npm package di project utama (hanya folder variasi React terpisah, lihat §7).

---

## 3. Struktur Folder

```
kode/
├── beranda.html              # Halaman Beranda (di-rewrite ke "/" oleh Vercel)
├── jasa-penerjemah.html      # Halaman utama layanan penerjemahan
├── jasa-interpreter.html     # Halaman utama layanan interpreter
├── kursus-bahasa.html        # Halaman kursus bahasa Jepang
├── tokutei-ginou.html        # Halaman program Tokutei Ginou / SSW
├── tentang-kami.html         # Halaman tentang perusahaan
├── success-story.html        # Halaman kisah sukses (dinyamati dari localStorage)
│
├── jasa-penerjemah/          # Sub-halaman detail penerjemahan (pakai data-site-root="../")
│   ├── dokumen-translation.html
│   ├── e-learning.html
│   ├── video-translation.html
│   └── website-translation.html
│
├── admin/                    # Panel admin (noindex via Vercel + robots.txt)
│   ├── index.html            # Dashboard: auth Supabase, kelola story/client/settings, export
│   └── assets.html           # Asset manager (upload gambar via File System Access API)
│
├── css/
│   └── style.css             # Stylesheet global (header, card, accordion, tab, animasi)
│
├── js/
│   ├── header-loader.js      # INJEKSI header & footer untuk SEMUA halaman (single source)
│   └── tailwind-config.js    # Tema Tailwind (warna, font, spacing) — dimuat di semua halaman
│
├── images/                   # Foto hero, layanan, guru, story, logo, bendera bahasa
│   └── clients/              # client-1.png … client-8.png (logo klien)
│
├── website-ichikara-variasi-minori/   # ⚠️ PROYEK VARIASI TERPISAH (React + Vite) — bukan bagian deploy utama
│
├── vercel.json               # Rewrite / → beranda.html + security headers + noindex /admin
├── robots.txt                # Disallow /admin/, Sitemap: https://kode-vert.vercel.app/sitemap.xml
└── .gitignore                # Hanya mengabaikan .vercel
```

> **Catatan:** tidak ada file `sitemap.xml` di repo, padahal `robots.txt` merujuk padanya.

---

## 4. Fitur / Modul Utama

| # | Fitur | File terkait | Keterangan |
|---|---|---|---|
| 1 | Navigasi & header global | `js/header-loader.js`, `css/style.css` | Header fixed transparent→solid saat scroll, dropdown "Layanan", menu mobile hamburger, toggle bahasa ID/JP (cosmetik, belum berfungsi), CTA "Hubungi Kami" (WhatsApp) |
| 2 | Footer global | `js/header-loader.js` | Footer hitam minimal, diinjeksi ke semua halaman |
| 3 | Beranda dinamis | `beranda.html` + `js/site-data.js` | Baca `ichikara_web_content` dari Supabase (real-time) → render jumlah logo klien + cerita unggulan; fallback localStorage/statis |
| 4 | Tab layanan di beranda | `beranda.html` (script inline) | 4 tab (penerjemahan/interpreter/kursus/tokutei), data hardcoded, swap konten via `switchTab()` |
| 5 | Halaman kisah sukses | `success-story.html` + `js/site-data.js` | Render semua story dari Supabase (real-time), filter per kategori, fallback localStorage/statis |
| 6 | Panel admin — login | `admin/index.html` | Auth gate email+password via Supabase Auth |
| 7 | Panel admin — kelola story | `admin/index.html` | CRUD "Kisah Sukses" (judul, kategori, ringkasan, foto) → tabel `ichikara_web_content`; upload foto ke Supabase Storage; backup/import JSON; Export HTML (cadangan statis) |
| 8 | Panel admin — gambar & logo klien | `admin/index.html` | Upload/mengganti SEMUA gambar website ke Supabase Storage (tanpa deploy), via override `media`; atur jumlah slot logo (1–20); Reset kembali ke file repo |
| 9 | Panel admin — pengaturan beranda | `admin/index.html` | Pilih cerita yang di-featured (featuredIds) di beranda |
| 10 | Animasi & interaksi | `js/header-loader.js`, `css/style.css` | Fade-in on scroll (IntersectionObserver), accordion FAQ, smooth scroll, `prefers-reduced-motion` |
| 11 | Keamanan & SEO | `vercel.json`, `robots.txt` | Header keamanan (nosniff, X-Frame-Options, Referrer-Policy), noindex `/admin/`, robots disallow `/admin/` |

---

## 5. Alur Kerja Penting

### 5.1 Alur Login Admin
```
Buka /admin/ → admin/index.html
  → Auth gate tampil (fullscreen overlay)
  → Input email + password
  → supabase.auth.signInWithPassword()
      ├─ sukses → gate disembunyikan, dashboard aktif
      └─ gagal  → pesan error "Email atau kata sandi salah"
  (sesi tersimpan di Supabase; cek otomatis via getSession() saat load)
```
> Login memverifikasi identitas; setelah masuk, semua penulisan data & upload gambar **langsung ke Supabase** (tabel + Storage) — bukan localStorage. (Sebelum 2026-08-28 data masih di localStorage; tombol **Migrate** di admin memindahkan data lama.)

### 5.2 Alur Input Data (Kisah Sukses) — alur utama
```
admin/index.html (tab "Kisah Sukses")
  → Tambah/edit: judul, kategori, tanggal, link, ringkasan (rich text)
  → foto: klik kotak foto → upload ke bucket ichikara-web-media → URL publik disimpan ke story.image
  → Simpan → persist() → upsert baris section='stories' di ichikara_web_content
        │  (Supabase Realtime mengirim sinyal perubahan ke semua pengunjung)
        ├─► success-story.html  → onContent() re-fetch → render SEMUA story (live, tanpa reload)
        └─► beranda.html        → onContent() → featured stories sesuai baris section='beranda'

Fallback (jika Supabase tidak terjangkau / file dibuka lokal):
  localStorage lama (ichikara-stories-v1) → konten statis di HTML
```
> ⚠️ **Catatan penting:** perubahan admin kini berlaku **global & real-time** ke semua pengunjung (asalkan bucket & tabel tersedia). Tombol **Export HTML** tetap ada sebagai cadangan statis.

### 5.3 Alur Gambar (Logo Klien & Gambar Halaman)
```
Logo klien:  tab "Logo Klien" → klik kartu → upload ke bucket (clients/) →
             URL disimpan di baris section='media' { overrides: { 'images/clients/client-N.png': url } }
             + jumlah slot di section='clients' { count: N }
Gambar lain: tab "Gambar Website" → klik kartu → upload ke bucket (media/) → override 'images/<file>'
             (tombol Reset menghapus override → kembali ke file repo images/)
        │
        └─► semua halaman publik: js/site-data.js applyMediaOverrides()
            mengganti src SEMUA <img> yang key-nya ada di overrides (tanpa reload, tanpa deploy)
            (fallback: file bawaan di folder images/ tetap ada di repo)
```

### 5.4 Alur Kontak / CTA
```
Semua tombol CTA → https://wa.me/XXXXXXXXXX  (⚠️ MASIH PLACEHOLDER — lihat §7.3)
Atau → mailto:info@ichikara.co.id
Tidak ada form backend sama sekali.
```

### 5.5 Alur Muat Halaman (setiap halaman publik)
```
<head>:
  Tailwind CDN → js/tailwind-config.js (harus berurutan, tanpa defer/async)
  → Supabase UMD CDN → js/site-data.js (membuat window.IchikaraSite)
  → css/style.css
<body data-site-root="" atau "../">:
  <div id="site-header">  ← diisi header-loader.js
  <main>…konten…</main>   ← script inline halaman (mis. tab, onContent untuk stories)
  <div id="site-footer">  ← diisi header-loader.js
  <script src="js/header-loader.js">  ← HARUS terakhir di body
  header-loader.js:
    inject header/footer (prefix path = data-site-root)
    → init scroll (class .scrolled), hamburger, dropdown mobile
    → highlight nav aktif (navMap berdasarkan nama file halaman)
    → IntersectionObserver untuk .fade-in → .visible
    → IchikaraSite.onContent() → applyMediaOverrides() ke SEMUA <img> (real-time)
```
> Urutan skrip <head> wajib: Tailwind CDN → tailwind-config.js → Supabase UMD → site-data.js.
> `site-data.js` aman dimuat di <head> karena semua akses DOM-nya lazy (dipanggil saat body sudah ada).

---

## 6. Konfigurasi & "Environment" Penting

Project ini statis — **tidak ada `.env`**. Semua konfigurasi hardcoded:

| Item | Lokasi | Nilai / Catatan |
|---|---|---|
| Supabase URL | `admin/index.html` (script auth) + `js/site-data.js` + semua halaman publik | `https://pfvlxlfykdabrwijqqxa.supabase.co` — ⚠️ **project ini BERSAMA dengan sistem absensi karyawan. Jangan pernah ALTER/DROP/UPDATE/DELETE objek apa pun yang bukan milik website. Objek website hanya boleh CREATE dengan nama unik ber-prefix `ichikara_web_` (tabel `ichikara_web_content`, bucket `ichikara-web-media`). Lihat §6.1. |
| Tabel konten website | Supabase (dibuat 2026-08-28) | `public.ichikara_web_content` — PK `section` (`stories`/`clients`/`beranda`/`media`), kolom `data` JSONB, `updated_at`. RLS: anonymous SELECT, authenticated ALL. |
| Bucket gambar website | Supabase Storage | `ichikara-web-media` (public) — folder internal: `stories/`, `clients/`, `media/`. |
| Konten dinamis | `js/site-data.js` (dimuat semua halaman publik di `<head>`) | `window.IchikaraSite`: `loadContent()`, `onContent(cb)` (real-time), `imgSrc(path)`, `applyMediaOverrides(content)`. Fallback: localStorage + konten statis HTML. |
| Supabase Publishable Key | `admin/index.html` (script auth) | `sb_publishable_…` (key publik; login diverifikasi di project Supabase ini — akun email perlu dibuat di sana) |
| Nomor WhatsApp | `js/header-loader.js` + banyak halaman | `https://wa.me/XXXXXXXXXX` — **placeholder, wajib diganti** (ada komentar `TODO: Replace XXXXXXXXXX`) |
| Email kontak | `beranda.html`, footer | `info@ichikara.co.id` |
| Key localStorage | `admin/index.html`, `beranda.html`, `success-story.html` | `ichikara-stories-v1`, `ichikara-clients-v1`, `ichikara-beranda-settings` — **kontrak antar file, jangan diubah sembarangan** |
| Routing | `vercel.json` | `/` → `/beranda.html`; header keamanan; noindex + no-cache untuk `/admin/*` |
| SEO | `robots.txt` | Disallow `/admin/`; sitemap (belum ada file-nya) |
| Nama folder admin | — | `/admin/` — jika diganti, update `vercel.json` + `robots.txt` |

### 6.0 Arsitektur Konten Dinamis (Supabase, sejak 2026-08-28)

Konten dinamis website **kini berasal dari Supabase, bukan localStorage**:

```
admin/index.html (login Supabase Auth)
  ├── persist()        → upsert baris section='stories'   (ichikara_web_content)
  ├── saveClients...   → upsert baris section='clients'   { count }
  ├── saveBeranda...   → upsert baris section='beranda'   { featuredIds }
  ├── upload gambar    → Supabase Storage bucket ichikara-web-media
  │     └── foto story        → field story.image = URL publik storage
  │     └── gambar halaman    → upsert baris section='media' { overrides: { 'images/<file>': url } }
  └── tombol Migrate   → sekali jalan: pindahkan data localStorage lama → Supabase

Halaman publik (semua 11 halaman)
  ├── js/site-data.js (di <head>): window.IchikaraSite — 1 fetch + Realtime channel
  ├── js/header-loader.js: onContent() → applyMediaOverrides() ke SEMUA <img> (hero, logo, dll)
  ├── beranda.html:       onContent() → client strip (count) + featured stories
  ├── success-story.html: onContent() → grid semua stories
  └── fallback (Supabase gagal): localStorage lama + konten statis di HTML
```

Kontrak data baris `ichikara_web_content`:
| section | bentuk `data` |
|---|---|
| `stories` | `[{ id, category: achievement\|activity\|client-story, title, date, link, image (URL absolut storage ATAU nama file repo), imageAlt, excerpt (HTML) }]` |
| `clients` | `{ count: N }` (1–20) |
| `beranda` | `{ featuredIds: [id, id, id] }` (maks 3) |
| `media` | `{ overrides: { 'images/<nama-file>': 'https://…supabase.co/storage/…' } }` |

Aturan gambar: field `image` story boleh URL absolut (upload storage) atau nama file repo lama (`images/…` tetap valid). Override `media` diprioritaskan oleh `imgSrc()` dan `applyMediaOverrides()`.

### 6.1 ⚠️ Batasan Keras: Project Supabase Dibagi dengan Sistem Absensi Karyawan

Project Supabase `pfvlxlfykdabrwijqqxa` **sudah memuat data produksi sistem absensi karyawan**. Aturan mutlak untuk coding agent:

1. **Hanya CREATE objek baru** untuk website (tabel, bucket, policy). DILARANG `ALTER TABLE`, `DROP`, `UPDATE`, `DELETE`, atau mengubah policy/index/schema milik objek lain.
2. **Gunakan nama unik ber-prefix** `ichikara_web_` (tabel) / `ichikara-web-` (bucket) untuk semua objek baru, agar tidak bentrok dengan sistem absensi.
3. Kode website hanya boleh query tabel `ichikara_web_content` dan bucket `ichikara-web-media` — tidak boleh menyentuh tabel lain sama sekali.
4. Jika perlu verifikasi struktur, gunakan query read-only (`information_schema`, `SELECT ... LIMIT 0`) dan jangan pernah menjalankan script yang mengubah data absensi.
5. **JANGAN** menambah/menghapus data tabel `ichikara_web_content` langsung dari SQL Editor untuk kebutuhan konten — selalu lewat admin (biar `updated_at` konsisten). Exception: membersihkan baris `media.overrides` bila diperlukan.

---

## 7. Hal yang Perlu Diperhatikan Saat Mengubah

### 7.1 Ketergantungan antar modul
1. **Header/footer satu-satunya sumbernya `js/header-loader.js`.** Jangan membuat header/footer di HTML halaman. Tambah item nav = ubah template desktop + mobile **dan** daftar di `highlightActiveNav()` (L403–431) agar link aktif ter-highlight.
2. **`data-site-root`** di `<body>` adalah kontrak path: `""` untuk halaman root, `"../"` untuk `jasa-penerjemah/*.html`. Halaman subfolder baru **wajib** menyetel ini agar semua link/aset tidak pecah.
3. **Urutan skrip wajib**: `tailwind-config.js` harus langsung setelah CDN Tailwind; `header-loader.js` harus skrip **terakhir** di body.
4. **Kontrak localStorage** (§6) dikomunikasikan antara admin dan 2 halaman publik. Ubah key/struktur → ubah ketiganya sekaligus.
5. **`vercel.json` rewrite** `/ → /beranda.html`: jangan rename `beranda.html` tanpa update rewrite.

### 7.2 Potensi breaking change
- **Tailwind via CDN** = tidak ada purge/best build; class yang di-generate dari string (mis. `switchTab()` di beranda) aman selama class-nya muncul literal di kode JS.
- **File System Access API** (admin assets: `showDirectoryPicker`) hanya jalan di Chrome/Edge & konteks secure (https/localhost).
- **`localStorage` per browser** — admin di laptop A tidak akan memengaruhi pengunjung di perangkat lain. Sampaikan ini ke owner; jalur "resmi" publikasi konten dinamis saat ini = tombol **Export HTML** di admin lalu merge hasilnya ke `success-story.html`/`beranda.html`.
- Admin (`admin/index.html` + `assets.html`) memakai **palet warna sendiri** (navy `#021a38`, merah `#b02d21`) yang **berbeda** dari palet situs publik (`#0a0a0a` ink, `#c0392b`). Ubah warna situsnya tanpa mengubah admin = admin akan terlihat tidak senada (dan sebaliknya).
- `css/style.css` memuat kelas legacy (`.accent-border-red`, dll.) yang sengaja dipertahankan — jangan dihapus sebelum yakin tidak terpakai.
- `beranda.html` & `success-story.html` punya **fallback statis** jika localStorage kosong — jika Anda mengubah struktur data, fallback ini pun harus konsisten.

### 7.3 TODO / item yang belum beres
- ❌ Nomor WhatsApp `wa.me/XXXXXXXXXX` masih placeholder di banyak file (cari string ini; ada komentar `TODO`).
- ❌ Toggle bahasa ID/JP di header **hanya cosmetik** (tidak ada logika切换 halaman/terjemahan).
- ❌ `robots.txt` merujuk `sitemap.xml` yang **tidak ada** di repo.
- ℹ️ Tidak ada histori git (bukan git repository) — pertimbangkan `git init` untuk tracking perubahan ke depan.

### 7.4 Konvensi penamaan
- Nama file halaman: **kebab-case Bahasa Indonesia** (`beranda.html`, `tentang-kami.html`, `success-story.html`).
- Kelas utilitas: Tailwind + kelas semantik di `style.css` (`.service-card`, `.story-card`, `.fade-in`, `.tab-active`, `.accordion-item`, `.label-kicker`, `.ma-divider`).
- Token desain: semua warna/font/spacing via `tailwind-config.js` (nama token ala Material: `primary`, `on-surface`, `surface-container`, dll.) — **jangan hardcode hex** di HTML, pakai token.
- Gaya JS: ES5-style (`var`, `function`, IIFE) di file publik; admin memakai `const`/`let` + template modern — ikuti gaya file yang sedang diedit.

---

## 8. Project Variasi (bukan bagian deploy utama)

`website-ichikara-variasi-minori/` adalah **project terpisah**: SPA React 18 + Vite + React Router + Tailwind (dengan `node_modules`), berisi eksplorasi desain "Minori style" (palet `ichikara-red` `#D32F2F` / `ichikara-blue` `#1A237E`) dengan halaman Home, Tentang, Kontak, FAQ, Artikel (+ detail), Galeri, Admin, dan 4 halaman layanan. Data dinamisnya memakai util `src/utils/localDB.js` (CRUD localStorage).

- Memiliki `changelog.md` sendiri di dalam foldernya.
- **Tidak di-deploy** oleh `vercel.json` root (deploy root = file HTML statis di root saja).
- Jangan mencampur perubahan di sini dengan situs utama kecuali diminta.
