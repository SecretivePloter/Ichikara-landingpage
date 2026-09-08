# Catatan Migrasi DNS — ichikara.co.id → Vercel

Domain `ichikara.co.id` terdaftar & dikelola DNS-nya di **Niagahoster** (cPanel Zone Editor).
Nameserver: `ns1.niagahoster.com`, `ns2.niagahoster.com` (TIDAK diganti — hanya record spesifik yang diubah).

⚠️ Email aktif di domain ini (`@ichikara.co.id`) — semua perubahan dilakukan sehati-hati mungkin agar email tidak putus.

---

## 1. Kondisi SEBELUM migrasi (backup untuk rollback)

Hosting lama (cPanel Niagahoster) — **IP: `83.136.216.189`**

### A Records (sebelum diubah)
| Name | TTL | Value |
|---|---|---|
| `ichikara.co.id.` | 14400 | **`83.136.216.189`** ← nilai rollback kalau perlu kembali ke hosting lama |
| `cpcontacts.ichikara.co.id.` | 14400 | `83.136.216.189` |
| `webdisk.ichikara.co.id.` | 14400 | `83.136.216.189` |
| `webmail.ichikara.co.id.` | 14400 | `83.136.216.189` |

### CNAME Records (sebelum diubah)
| Name | TTL | Value |
|---|---|---|
| `ftp.ichikara.co.id.` | 14400 | `ichikara.co.id` |
| `mail.ichikara.co.id.` | 14400 | `ichikara.co.id` |
| `www.ichikara.co.id.` | 14400 | `ichikara.co.id` |
| `edu.ichikara.co.id.` | 14400 | `b2aa0bc9ac31d310.vercel-dns-017.com` — **project Vercel LAIN, tidak terkait migrasi ini, JANGAN diubah** |
| `edukasi.ichikara.co.id.` | 14400 | `50336153e90ba0de.vercel-dns-017.com` — **project Vercel LAIN, tidak terkait migrasi ini, JANGAN diubah** |

### MX Records
⏳ **Belum sempat dicatat** — user diminta screenshot filter "MX" di Zone Editor, belum dikirim. **Isi bagian ini begitu datanya ada**, sebelum menganggap backup ini lengkap.

---

## 2. Perubahan yang dilakukan (target akhir untuk Vercel)

Project Vercel: **"kode"** (`kode-vert.vercel.app`, project ID `prj_UFV45uEiUAqgb5Wans8KVDk0dw3k`)

| Name | TTL baru | Value baru | Status |
|---|---|---|---|
| `ichikara.co.id.` (A) | 300 | `216.198.79.1` | ✅ Diubah, ⏳ tapi Vercel masih "Invalid Configuration" — cek propagasi/kemungkinan A record duplikat (lihat §5) |
| `www.ichikara.co.id.` (CNAME) | 300 | `b53c54800082a388.vercel-dns-017.com.` | ✅ **Valid Configuration** dikonfirmasi di dashboard Vercel |
| `mail.ichikara.co.id.` | — | Ubah dari CNAME→`ichikara.co.id` **menjadi A record** → `83.136.216.189` | ⏳ Instruksi diberikan, belum dikonfirmasi selesai — **penting**, kalau tidak diubah, `mail.ichikara.co.id` ikut resolve ke Vercel dan bisa memutus koneksi email client (IMAP/SMTP) yang pakai hostname ini |
| `ftp.ichikara.co.id.` | — | Ubah dari CNAME→`ichikara.co.id` **menjadi A record** → `83.136.216.189` | ⏳ Instruksi diberikan, belum dikonfirmasi selesai — sama alasannya, FTP client yang pakai hostname ini akan gagal connect kalau tidak diubah |

---

## 3. Cara rollback penuh ke kondisi semula

1. Edit A record `ichikara.co.id.` → kembalikan value ke `83.136.216.189`
2. Edit CNAME `www.ichikara.co.id.` → kembalikan value ke `ichikara.co.id`
3. Kalau `mail`/`ftp` sudah diubah jadi A record → kembalikan jadi CNAME ke `ichikara.co.id` (atau biarkan sebagai A record ke `83.136.216.189` — hasilnya sama karena root akan kembali ke IP itu juga)
4. TTL boleh dikembalikan ke `14400` atau dibiarkan `300` (tidak masalah)
5. **Jangan sentuh** `edu`/`edukasi` — tidak pernah diubah, tidak perlu di-rollback
6. Tunggu propagasi (lebih cepat karena TTL sudah rendah)

---

## 5. Troubleshooting — root domain "Invalid Configuration" padahal www sudah valid

Kalau `www.ichikara.co.id` sudah ✅ Valid tapi `ichikara.co.id` (root) masih ❌ Invalid setelah ditunggu + Refresh:
1. Cek dnschecker.org khusus untuk `ichikara.co.id` tipe A (bukan www) — pastikan semua lokasi resolve ke `216.198.79.1`
2. Cek Zone Editor filter **A** — pastikan HANYA ADA SATU baris `ichikara.co.id.`. Kalau ada 2 (satu lama `83.136.216.189`, satu baru `216.198.79.1`) — hapus yang lama, sisakan satu saja
3. Situs tetap bisa diakses via `https://www.ichikara.co.id` sementara root belum valid — tidak darurat

## 4. Referensi Vercel

- Vercel dashboard project: `secretiveploters-projects/kode`
- Domain ditambahkan di: Project → Settings → Domains
- Setelah DNS benar, status berubah dari "Invalid Configuration" → terverifikasi otomatis (SSL diterbitkan otomatis oleh Vercel)

---

*Dicatat oleh Claude Code, {{tanggal diisi otomatis oleh git saat commit}} — lihat CHANGELOG.md untuk histori perubahan kode website.*
