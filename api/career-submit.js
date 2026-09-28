const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const formidable = require('formidable');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const config = { api: { bodyParser: false } };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCESS_DAYS = 30;

function first(value) { return Array.isArray(value) ? value[0] : value; }
function text(value, max) { return String(first(value) || '').trim().slice(0, max); }
function json(value, fallback) { try { return JSON.parse(text(value, 50000)); } catch (_) { return fallback; } }
function cleanTimeline(value, limit) {
  return (Array.isArray(value) ? value : []).slice(0, limit).map(function (item) {
    return { year: String(item.year || '').replace(/\D/g, '').slice(0, 4), month: String(item.month || '').replace(/\D/g, '').slice(0, 2), detail: String(item.detail || '').trim().slice(0, 180) };
  }).filter(function (item) { return item.year && item.month && item.detail; });
}
function templateData(fields, education, experience) {
  const now = new Date();
  const birth = new Date(fields.birthDate);
  const age = Number.isNaN(birth.getTime()) ? '' : Math.max(0, now.getUTCFullYear() - birth.getUTCFullYear() - ((now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) ? 1 : 0));
  const data = {
    asOfDate: new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now),
    fullName: fields.fullName, nameKatakana: fields.nameKatakana, birthDate: fields.birthDate, age: age, gender: fields.gender,
    phone: fields.phone, email: fields.email, address: fields.address, qualificationYear: fields.jlptYear,
    jlptLevel: fields.jlptLevel, certificates: fields.certificates, skills: fields.skills
  };
  for (let i = 1; i <= 8; i += 1) { const row = education[i - 1] || {}; data['education' + i + 'Year'] = row.year || ''; data['education' + i + 'Month'] = row.month || ''; data['education' + i + 'Detail'] = row.detail || ''; }
  for (let i = 1; i <= 30; i += 1) { const row = experience[i - 1] || {}; data['experience' + i + 'Year'] = row.year || ''; data['experience' + i + 'Month'] = row.month || ''; data['experience' + i + 'Detail'] = row.detail || ''; }
  return data;
}
async function renderPhoto(filePath, adjustment) {
  const zoom = Math.min(3, Math.max(1, Number(adjustment.zoom) || 1));
  const rotate = Math.min(15, Math.max(-15, Number(adjustment.rotate) || 0));
  const positionX = Math.min(50, Math.max(-50, Number(adjustment.x) || 0));
  const positionY = Math.min(50, Math.max(-50, Number(adjustment.y) || 0));
  const width = Math.round(600 * zoom), height = Math.round(800 * zoom);
  const left = Math.round(((width - 600) / 2) * (1 + positionX / 50));
  const top = Math.round(((height - 800) / 2) * (1 + positionY / 50));
  return sharp(filePath).rotate(rotate).resize(width, height, { fit: 'cover' }).extract({ left, top, width: 600, height: 800 }).png().toBuffer();
}
async function renderCv(fields, education, experience, photo) {
  const templatePath = path.join(process.cwd(), 'templates', 'cv-ichikara-template.docx');
  const template = await fs.readFile(templatePath);
  const doc = new Docxtemplater(new PizZip(template), { paragraphLoop: true, linebreaks: true, nullGetter: function () { return ''; } });
  doc.render(templateData(fields, education, experience));
  const output = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  const withPhoto = new PizZip(output);
  withPhoto.file('word/media/image1.png', photo);
  return withPhoto.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}
function configOrThrow() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'CAREER_FROM_EMAIL', 'CAREER_SITE_URL'];
  const missing = required.filter(function (key) { return !process.env[key]; });
  if (missing.length) throw new Error('Sistem Career belum dikonfigurasi.');
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  try {
    configOrThrow();
    const form = formidable.formidable({ multiples: false, maxFiles: 1, maxFileSize: MAX_IMAGE_BYTES, filter: function (part) { return part.name !== 'photo' || ['image/jpeg', 'image/png'].includes(part.mimetype); } });
    const parsed = await form.parse(req);
    const fields = parsed[0], files = parsed[1];
    if (text(fields.website, 40)) return res.status(200).json({ ok: true, email: text(fields.email, 120) });
    const candidate = {
      fullName: text(fields.fullName, 80), nameKatakana: text(fields.nameKatakana, 80), birthDate: text(fields.birthDate, 10), gender: text(fields.gender, 40),
      phone: text(fields.phone, 30), email: text(fields.email, 120).toLowerCase(), address: text(fields.address, 400),
      jlptLevel: text(fields.jlptLevel, 4), jlptYear: text(fields.jlptYear, 4), certificates: text(fields.certificates, 600), skills: text(fields.skills, 600)
    };
    const photoFile = first(files.photo);
    if (!candidate.fullName || !candidate.email || !candidate.phone || !candidate.birthDate || !candidate.address || !photoFile) return res.status(400).json({ error: 'Lengkapi seluruh data wajib dan foto kandidat.' });
    if (!['N1', 'N2'].includes(candidate.jlptLevel)) return res.status(400).json({ error: 'Minimal kualifikasi untuk posisi ini adalah JLPT N2.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) return res.status(400).json({ error: 'Format email belum benar.' });
    const education = cleanTimeline(json(fields.education, []), 8), experience = cleanTimeline(json(fields.experience, []), 30);
    if (!education.length || !experience.length) return res.status(400).json({ error: 'Isi minimal satu riwayat pendidikan dan pengalaman kerja.' });
    const adjustment = json(fields.photoAdjustment, {});
    const processedPhoto = await renderPhoto(photoFile.filepath, adjustment);
    const cvDocx = await renderCv(candidate, education, experience, processedPhoto);
    const applicationId = crypto.randomUUID(), accessToken = crypto.randomBytes(32).toString('base64url');
    const accessHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const photoPath = 'applications/' + applicationId + '/photo.png', cvPath = 'applications/' + applicationId + '/cv-ichikara.docx';
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const bucket = 'ichikara-web-recruitment';
    let upload = await sb.storage.from(bucket).upload(photoPath, processedPhoto, { contentType: 'image/png', upsert: false }); if (upload.error) throw upload.error;
    upload = await sb.storage.from(bucket).upload(cvPath, cvDocx, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: false }); if (upload.error) throw upload.error;
    const expires = new Date(Date.now() + ACCESS_DAYS * 86400000).toISOString();
    const payload = { candidate: candidate, education: education, experience: experience, photoAdjustment: adjustment, version: 1 };
    const inserted = await sb.from('ichikara_web_applications').insert({ id: applicationId, job_code: 'japanese-interpreter', full_name: candidate.fullName, email: candidate.email, phone: candidate.phone, payload: payload, photo_path: photoPath, cv_docx_path: cvPath, access_token_hash: accessHash, access_expires_at: expires }).select('id').single();
    if (inserted.error) throw inserted.error;
    const site = process.env.CAREER_SITE_URL.replace(/\/$/, ''), link = site + '/career-access.html?token=' + encodeURIComponent(accessToken);
    const email = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.CAREER_FROM_EMAIL, to: candidate.email, subject: 'CV Japanese Interpreter Anda | PT. Ichikara', html: '<p>Halo ' + candidate.fullName.replace(/[<>&]/g, '') + ',</p><p>CV format PT. Ichikara Anda sudah dibuat. Gunakan tautan privat ini untuk melihat dan mengunduhnya:</p><p><a href="' + link + '">Buka CV saya</a></p><p>Tautan berlaku 30 hari. Jangan teruskan email ini kepada orang lain.</p><p>PT. Ichikara</p>' });
    if (email.error) throw email.error;
    return res.status(201).json({ ok: true, email: candidate.email });
  } catch (error) {
    console.error('career-submit', error);
    return res.status(500).json({ error: error && error.message === 'Sistem Career belum dikonfigurasi.' ? error.message : 'Aplikasi belum dapat diproses. Silakan coba lagi atau hubungi PT. Ichikara.' });
  }
}

module.exports = handler;
module.exports.config = config;
