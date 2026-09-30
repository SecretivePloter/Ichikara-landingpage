const crypto = require('crypto');
const formidable = require('formidable');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { buildStudentCardWorkbook, prepareStudentPhoto } = require('./student-card');

const config = { api: { bodyParser: false } };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCESS_DAYS = 30;
const DEFAULT_ADMIN_RECIPIENT = 'marketing@ichikara.co.id';

function first(value) { return Array.isArray(value) ? value[0] : value; }
function text(value, max) { return String(first(value) || '').trim().slice(0, max); }
function escapeHtml(value) { return String(value || '').replace(/[<>&"]/g, function (character) { return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[character]; }); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function adminRecipients(value) {
  const supplied = String(value || '').trim();
  const recipients = (supplied ? supplied.split(',') : [DEFAULT_ADMIN_RECIPIENT]).map(function (item) { return item.trim().toLowerCase(); }).filter(Boolean);
  const unique = Array.from(new Set(recipients));
  if (!unique.length || unique.length > 10 || unique.some(function (email) { return !validEmail(email); })) throw new Error('CAREER_ADMIN_EMAILS tidak valid.');
  return unique;
}
function configOrThrow() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'CAREER_FROM_EMAIL', 'CAREER_SITE_URL'];
  if (required.some(function (key) { return !process.env[key]; })) throw new Error('Sistem pendaftaran belum dikonfigurasi.');
}

async function sendStudentCardEmails(resend, details) {
  const candidate = await resend.emails.send({
    from: details.from, to: details.student.email, subject: 'Kartu Data Siswa Anda | PT. Ichikara',
    html: '<p>Halo ' + escapeHtml(details.student.fullName) + ',</p><p>Kartu data siswa Anda sudah dibuat. Simpan tautan privat berikut untuk mengunduh file Excel:</p><p><a href="' + details.link + '">Unduh kartu data siswa</a></p><p>Tautan berlaku 30 hari. Jangan teruskan tautan ini kepada orang lain.</p><p>PT. Ichikara</p>'
  });
  const admin = await resend.emails.send({
    from: details.from, to: details.recipients, replyTo: details.student.email, subject: 'Pendaftaran siswa baru: ' + details.student.fullName,
    html: '<p>Ada pendaftaran siswa baru untuk kursus bahasa Jepang.</p><table><tr><td>Nama</td><td>' + escapeHtml(details.student.fullName) + '</td></tr><tr><td>Email</td><td>' + escapeHtml(details.student.email) + '</td></tr><tr><td>Telepon</td><td>' + escapeHtml(details.student.phone) + '</td></tr><tr><td>Sekolah / Perusahaan</td><td>' + escapeHtml(details.student.schoolOrCompany) + '</td></tr></table><p><a href="' + details.link + '">Buka kartu data siswa</a></p><p>Balas email ini untuk menghubungi calon siswa.</p>'
  });
  if (candidate.error) throw candidate.error;
  if (admin.error) throw admin.error;
  return { candidateEmailId: candidate.data && candidate.data.id, adminEmailId: admin.data && admin.data.id };
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  try {
    configOrThrow();
    const form = formidable.formidable({ multiples: false, maxFiles: 1, maxFileSize: MAX_IMAGE_BYTES, filter: function (part) { return part.name !== 'photo' || ['image/jpeg', 'image/png'].includes(part.mimetype); } });
    const parsed = await form.parse(req), fields = parsed[0], files = parsed[1];
    if (text(fields.website, 40)) return res.status(200).json({ ok: true, email: text(fields.email, 120) });
    const student = { fullName: text(fields.fullName, 100), placeOfBirth: text(fields.placeOfBirth, 80), birthDate: text(fields.birthDate, 10), address: text(fields.address, 500), phone: text(fields.phone, 30), email: text(fields.email, 120).toLowerCase(), schoolOrCompany: text(fields.schoolOrCompany, 160), aspiration: text(fields.aspiration, 300) };
    const photoFile = first(files.photo);
    if (!student.fullName || !student.placeOfBirth || !student.birthDate || !student.address || !student.phone || !student.email || !student.schoolOrCompany || !student.aspiration || !photoFile) return res.status(400).json({ error: 'Lengkapi seluruh data wajib dan foto siswa.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(student.birthDate) || Number.isNaN(new Date(student.birthDate + 'T00:00:00').getTime())) return res.status(400).json({ error: 'Tanggal lahir belum valid.' });
    if (!validEmail(student.email)) return res.status(400).json({ error: 'Format email belum benar.' });
    const photo = await prepareStudentPhoto(photoFile.filepath);
    const xlsx = await buildStudentCardWorkbook(student, photo);
    const id = crypto.randomUUID(), token = crypto.randomBytes(32).toString('base64url'), tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const photoPath = 'student-cards/' + id + '/photo.png', xlsxPath = 'student-cards/' + id + '/kartu-data-siswa.xlsx';
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const bucket = 'ichikara-web-recruitment';
    let uploaded = await sb.storage.from(bucket).upload(photoPath, photo, { contentType: 'image/png', upsert: false }); if (uploaded.error) throw uploaded.error;
    uploaded = await sb.storage.from(bucket).upload(xlsxPath, xlsx, { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', upsert: false }); if (uploaded.error) throw uploaded.error;
    const expires = new Date(Date.now() + ACCESS_DAYS * 86400000).toISOString();
    const inserted = await sb.from('ichikara_web_course_enrollments').insert({ id: id, full_name: student.fullName, email: student.email, phone: student.phone, place_of_birth: student.placeOfBirth, birth_date: student.birthDate, address: student.address, school_or_company: student.schoolOrCompany, aspiration: student.aspiration, photo_path: photoPath, card_xlsx_path: xlsxPath, access_token_hash: tokenHash, access_expires_at: expires }).select('id').single();
    if (inserted.error) throw inserted.error;
    const site = process.env.CAREER_SITE_URL.replace(/\/$/, ''), link = site + '/student-card-access.html?token=' + encodeURIComponent(token);
    const sent = await sendStudentCardEmails(new Resend(process.env.RESEND_API_KEY), { from: process.env.CAREER_FROM_EMAIL, recipients: adminRecipients(process.env.CAREER_ADMIN_EMAILS), student: student, link: link });
    console.info('student-card-submit emails accepted', { enrollmentId: id, candidateEmailId: sent.candidateEmailId, adminEmailId: sent.adminEmailId });
    return res.status(201).json({ ok: true, email: student.email });
  } catch (error) {
    console.error('student-card-submit', error);
    return res.status(500).json({ error: error && error.message === 'Sistem pendaftaran belum dikonfigurasi.' ? error.message : 'Pendaftaran belum dapat diproses. Silakan coba lagi atau hubungi PT. Ichikara.' });
  }
}

module.exports = handler;
module.exports.config = config;
module.exports._internals = { adminRecipients, sendStudentCardEmails };
