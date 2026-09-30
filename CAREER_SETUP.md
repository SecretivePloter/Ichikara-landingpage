# Setup Career Ichikara

Fitur Career memakai halaman publik, endpoint Vercel, Supabase private storage, dan Resend.

## 1. Database

Untuk setup baru, jalankan `supabase/career-schema.sql` di Supabase SQL Editor. Script membuat objek dengan prefix `ichikara_web_` dan bucket `ichikara-web-recruitment`.

Jika fitur Career sudah aktif sebelumnya, jalankan **hanya** `supabase/student-card-schema.sql`. File ini menambahkan tabel pendaftaran siswa kursus bahasa Jepang tanpa menyentuh tabel lamaran interpreter atau bucket yang sudah ada.

## 2. Vercel Environment Variables

Tambahkan variabel berikut di Vercel untuk Production dan Preview:

| Nama | Kegunaan |
|---|---|
| `SUPABASE_URL` | URL project Supabase Ichikara |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, hanya dipakai endpoint server |
| `RESEND_API_KEY` | API key Resend |
| `CAREER_FROM_EMAIL` | Pengirim terverifikasi, contoh `PT. Ichikara <marketing@ichikara.co.id>` |
| `CAREER_ADMIN_EMAILS` | Penerima notifikasi lamaran. Pisahkan beberapa email dengan koma, contoh `marketing@ichikara.co.id,hr@ichikara.co.id` |
| `CAREER_SITE_URL` | URL publik, `https://www.ichikara.co.id` |
| `CAREER_TURNSTILE_SECRET` | Opsional, aktifkan setelah Cloudflare Turnstile dipasang |

Jangan pernah memasukkan service-role key atau Resend API key ke HTML atau JavaScript browser.

## 3. Resend

1. Tambahkan domain `ichikara.co.id` di Resend.
2. Tambahkan record DNS yang diminta Resend.
3. Setelah status domain verified, gunakan pengirim `marketing@ichikara.co.id`.
4. Periksa menu **Emails** di Resend setelah uji kirim. Endpoint menyimpan ID pesan kandidat dan admin pada Vercel Runtime Logs, sehingga status Delivered, Bounced, atau Failed bisa ditelusuri tanpa mengandalkan folder Inbox.

## 4. Template CV dan kartu siswa

`templates/cv-ichikara-template.docx` adalah turunan dari template CV perusahaan. File ini memakai slot tetap agar tata letak CV tidak bergeser. Jangan menghapus atau mengganti file tersebut tanpa menjalankan ulang `scripts/create-cv-template.py` dari template sumber yang disetujui.

`templates/master-kartu-siswa.xlsx` adalah master kartu siswa. Foto contoh pada master otomatis diganti dengan foto siswa saat form dikirim, sementara kolom NIM dikosongkan sesuai alur pendaftaran kursus.

## 5. Uji aman

Gunakan email internal terlebih dahulu. Pastikan email berisi tautan privat, file CV hanya dapat diakses dengan token, foto kandidat tidak terbuka secara publik, dan aplikasi bisa dibaca dari `admin/career.html`.
