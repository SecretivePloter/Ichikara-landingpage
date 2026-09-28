const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const formidable = require('formidable');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const sharp = require('sharp');
const { buildCvDocument } = require('./cv-document');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const config = { api: { bodyParser: false } };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCESS_DAYS = 30;

function first(value) { return Array.isArray(value) ? value[0] : value; }
function text(value, max) { return String(first(value) || '').trim().slice(0, max); }
function json(value, fallback) { try { return JSON.parse(text(value, 50000)); } catch (_) { return fallback; } }
function monthValue(value) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || '')) ? String(value) : ''; }
function cleanTimeline(value, limit) {
  return (Array.isArray(value) ? value : []).slice(0, limit).map(function (item) {
    const legacyStart = String(item.year || '').match(/^\d{4}$/) && String(item.month || '').match(/^\d{1,2}$/) ? String(item.year) + '-' + String(item.month).padStart(2, '0') : '';
    const startDate = monthValue(item.startDate || legacyStart), endDate = monthValue(item.endDate);
    const detail = String(item.detail || '').trim().slice(0, 180);
    return { startDate: startDate, endDate: endDate, year: startDate.slice(0, 4), month: startDate.slice(5, 7), detail: detail };
  }).filter(function (item) { return item.detail; });
}
function cleanQualifications(value, limit) {
  return (Array.isArray(value) ? value : []).slice(0, limit).map(function (item) {
    return { date: monthValue(item.date), detail: String(item.detail || '').trim().slice(0, 180) };
  }).filter(function (item) { return item.detail; });
}
function datedRows(rows, limit) {
  const entries = [];
  rows.forEach(function (row, index) {
    if (row.startDate && row.endDate && row.startDate === row.endDate) {
      entries.push({ date: row.startDate, detail: row.detail + ' (Mulai dan selesai)', index: index });
    } else {
      if (row.endDate) entries.push({ date: row.endDate, detail: row.detail + ' (Selesai)', index: index });
      if (row.startDate) entries.push({ date: row.startDate, detail: row.detail + ' (Mulai)', index: index });
      if (!row.startDate && !row.endDate) entries.push({ date: '', detail: row.detail, index: index });
    }
  });
  return entries.sort(function (a, b) {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.index - b.index;
  }).slice(0, limit).map(function (row) {
    return { year: row.date.slice(0, 4), month: row.date.slice(5, 7), detail: row.detail };
  });
}
function qualificationRows(fields, certificates) {
  const rows = [];
  if (fields.jlptLevel) rows.push({ date: fields.jlptDate, detail: 'JLPT ' + fields.jlptLevel + ' (Lulus)' });
  certificates.forEach(function (row) { rows.push(row); });
  return rows.sort(function (a, b) {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}
function templateData(fields, education, experience, certificates) {
  const now = new Date();
  const birth = new Date(fields.birthDate);
  const age = Number.isNaN(birth.getTime()) ? '' : Math.max(0, now.getUTCFullYear() - birth.getUTCFullYear() - ((now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) ? 1 : 0));
  const data = {
    asOfDate: new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now),
    fullName: fields.fullName, nameKatakana: fields.nameKatakana, birthDate: fields.birthDate, age: age, gender: fields.gender,
    phone: fields.phone, email: fields.email, address: fields.address, skills: fields.skills
  };
  const educationEvents = datedRows(education, 8), experienceEvents = datedRows(experience, 30), qualificationEvents = qualificationRows(fields, certificates);
  for (let i = 1; i <= 8; i += 1) { const row = educationEvents[i - 1] || {}; data['education' + i + 'Year'] = row.year || ''; data['education' + i + 'Month'] = row.month || ''; data['education' + i + 'Detail'] = row.detail || ''; }
  for (let i = 1; i <= 30; i += 1) { const row = experienceEvents[i - 1] || {}; data['experience' + i + 'Year'] = row.year || ''; data['experience' + i + 'Month'] = row.month || ''; data['experience' + i + 'Detail'] = row.detail || ''; }
  data.qualificationYear = qualificationEvents.map(function (row) { return row.date.slice(0, 4); }).join('\n');
  data.qualificationMonth = qualificationEvents.map(function (row) { return row.date.slice(5, 7); }).join('\n');
  data.qualificationDetail = qualificationEvents.map(function (row) { return row.detail; }).join('\n');
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
function photoFillXml(drawingPrefix, relationshipPrefix) {
  return '<' + drawingPrefix + ':blipFill><' + drawingPrefix + ':blip ' + relationshipPrefix + ':embed="rIdCandidatePhoto"/><' + drawingPrefix + ':stretch><' + drawingPrefix + ':fillRect/></' + drawingPrefix + ':stretch></' + drawingPrefix + ':blipFill>';
}
function prepareTemplateForGenerator(template) {
  const zip = new PizZip(template);
  let documentXml = zip.file('word/document.xml').asText();
  const yearIndex = documentXml.indexOf('{qualificationYear}');
  if (yearIndex < 0) throw new Error('Kolom tanggal sertifikat CV tidak ditemukan pada template.');
  const firstCellEnd = documentXml.indexOf('</w:tc>', yearIndex);
  const secondCellStart = documentXml.indexOf('<w:tc', firstCellEnd + 7);
  const secondCellEnd = documentXml.indexOf('</w:tc>', secondCellStart);
  if (firstCellEnd < 0 || secondCellStart < 0 || secondCellEnd < 0) throw new Error('Struktur kolom sertifikat CV tidak valid.');
  const secondCell = documentXml.slice(secondCellStart, secondCellEnd + 7);
  if (!secondCell.includes('{qualificationMonth}')) {
    const paragraphEnd = secondCell.lastIndexOf('</w:p>');
    if (paragraphEnd < 0) throw new Error('Kolom bulan sertifikat CV tidak valid.');
    const withMonth = secondCell.slice(0, paragraphEnd) + '<w:r><w:t>{qualificationMonth}</w:t></w:r>' + secondCell.slice(paragraphEnd);
    documentXml = documentXml.slice(0, secondCellStart) + withMonth + documentXml.slice(secondCellEnd + 7);
  }
  const qualificationText = /[^<>]*\{jlptLevel\}[^<>]*\{certificates\}/;
  if (!qualificationText.test(documentXml)) throw new Error('Kolom keterangan sertifikat CV tidak ditemukan pada template.');
  documentXml = documentXml.replace(qualificationText, '{qualificationDetail}');
  zip.file('word/document.xml', documentXml);
  return zip;
}
function insertCandidatePhoto(zip, photo) {
  const relationshipId = 'rIdCandidatePhoto';
  let documentXml = zip.file('word/document.xml').asText();
  const relationshipPrefix = (documentXml.match(/xmlns:([^=]+)="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships"/) || [])[1];
  const anchorPattern = /<([A-Za-z0-9_]+):anchor\b[\s\S]*?<\1:docPr\b[^>]*\bname="Rectangle 6"[^>]*\/>[\s\S]*?<\/\1:anchor>/;
  const anchorMatch = documentXml.match(anchorPattern);
  if (!anchorMatch || !relationshipPrefix) throw new Error('Bingkai foto CV tidak ditemukan pada template.');
  const anchorXml = anchorMatch[0];
  const graphicMatch = anchorXml.match(/<([A-Za-z0-9_]+):graphic\b[\s\S]*?<\/\1:graphic>/);
  if (!graphicMatch) throw new Error('Struktur bingkai foto CV tidak valid.');
  const drawingPrefix = graphicMatch[1];
  const firstNoFill = new RegExp('<' + drawingPrefix + ':noFill\\s*/>');
  if (!firstNoFill.test(anchorXml)) throw new Error('Area foto CV tidak dapat diisi.');
  documentXml = documentXml.replace(anchorXml, anchorXml.replace(firstNoFill, photoFillXml(drawingPrefix, relationshipPrefix)));
  const vmlPhotoPattern = /<([A-Za-z0-9_]+):rect\b([^>]*\bid="Rectangle 6"[^>]*)\/>/;
  const vmlPhotoMatch = documentXml.match(vmlPhotoPattern);
  if (!vmlPhotoMatch) throw new Error('Bingkai foto kompatibilitas CV tidak ditemukan pada template.');
  const vmlAttributes = /\bfilled="[^"]*"/.test(vmlPhotoMatch[2]) ? vmlPhotoMatch[2].replace(/\bfilled="[^"]*"/, 'filled="t"') : vmlPhotoMatch[2] + ' filled="t"';
  documentXml = documentXml.replace(vmlPhotoPattern, '<' + vmlPhotoMatch[1] + ':rect' + vmlAttributes + '><' + vmlPhotoMatch[1] + ':imagedata ' + relationshipPrefix + ':id="' + relationshipId + '"/></' + vmlPhotoMatch[1] + ':rect>');
  const labelPattern = /<([A-Za-z0-9_]+):AlternateContent>(?:(?!<\/\1:AlternateContent>)[\s\S])*?<\1:Choice\b(?:(?!<\/\1:AlternateContent>)[\s\S])*?<([A-Za-z0-9_]+):docPr\b[^>]*\bname="Rectangle 7"[^>]*\/>((?:(?!<\/\1:AlternateContent>)[\s\S])*?)<\/\1:AlternateContent>/;
  if (!labelPattern.test(documentXml)) throw new Error('Label bingkai foto CV tidak ditemukan pada template.');
  documentXml = documentXml.replace(labelPattern, '');
  let relationships = zip.file('word/_rels/document.xml.rels').asText();
  if (!relationships.includes('Id="' + relationshipId + '"')) relationships = relationships.replace('</Relationships>', '<Relationship Id="' + relationshipId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/candidate-photo.png"/></Relationships>');
  zip.file('word/document.xml', documentXml);
  zip.file('word/_rels/document.xml.rels', relationships);
  zip.file('word/media/candidate-photo.png', photo);
}
async function renderCv(fields, education, experience, certificates, photo) {
  return buildCvDocument(fields, datedRows(education, 8), datedRows(experience, 30), qualificationRows(fields, certificates), photo);
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
      jlptLevel: text(fields.jlptLevel, 4), jlptDate: monthValue(text(fields.jlptDate, 7)), skills: text(fields.skills, 600)
    };
    if (!candidate.jlptDate && /^\d{4}$/.test(text(fields.jlptYear, 4))) candidate.jlptDate = text(fields.jlptYear, 4) + '-01';
    const photoFile = first(files.photo);
    if (!candidate.fullName || !candidate.email || !candidate.phone || !candidate.birthDate || !candidate.address || !photoFile) return res.status(400).json({ error: 'Lengkapi seluruh data wajib dan foto kandidat.' });
    if (!['N1', 'N2'].includes(candidate.jlptLevel)) return res.status(400).json({ error: 'Minimal kualifikasi untuk posisi ini adalah JLPT N2.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) return res.status(400).json({ error: 'Format email belum benar.' });
    const education = cleanTimeline(json(fields.education, []), 4), experience = cleanTimeline(json(fields.experience, []), 15), certificates = cleanQualifications(json(fields.certificates, []), 7);
    if (!education.length || !experience.length) return res.status(400).json({ error: 'Isi minimal satu riwayat pendidikan dan pengalaman kerja.' });
    const adjustment = json(fields.photoAdjustment, {});
    const processedPhoto = await renderPhoto(photoFile.filepath, adjustment);
    const cvDocx = await renderCv(candidate, education, experience, certificates, processedPhoto);
    const applicationId = crypto.randomUUID(), accessToken = crypto.randomBytes(32).toString('base64url');
    const accessHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const photoPath = 'applications/' + applicationId + '/photo.png', cvPath = 'applications/' + applicationId + '/cv-ichikara.docx';
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const bucket = 'ichikara-web-recruitment';
    let upload = await sb.storage.from(bucket).upload(photoPath, processedPhoto, { contentType: 'image/png', upsert: false }); if (upload.error) throw upload.error;
    upload = await sb.storage.from(bucket).upload(cvPath, cvDocx, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: false }); if (upload.error) throw upload.error;
    const expires = new Date(Date.now() + ACCESS_DAYS * 86400000).toISOString();
    const payload = { candidate: candidate, education: education, experience: experience, certificates: certificates, photoAdjustment: adjustment, version: 2 };
    const inserted = await sb.from('ichikara_web_applications').insert({ id: applicationId, job_code: 'japanese-interpreter', full_name: candidate.fullName, email: candidate.email, phone: candidate.phone, payload: payload, photo_path: photoPath, cv_docx_path: cvPath, access_token_hash: accessHash, access_expires_at: expires }).select('id').single();
    if (inserted.error) throw inserted.error;
    const site = process.env.CAREER_SITE_URL.replace(/\/$/, ''), link = site + '/career-access.html?token=' + encodeURIComponent(accessToken);
    const email = await new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.CAREER_FROM_EMAIL, to: candidate.email, bcc: 'marketing@ichikara.co.id', subject: 'CV Japanese Interpreter Anda | PT. Ichikara', html: '<p>Halo ' + candidate.fullName.replace(/[<>&]/g, '') + ',</p><p>CV format PT. Ichikara Anda sudah dibuat. Gunakan tautan privat ini untuk melihat dan mengunduhnya:</p><p><a href="' + link + '">Buka CV saya</a></p><p>Tautan berlaku 30 hari. Jangan teruskan email ini kepada orang lain.</p><p>PT. Ichikara</p>' });
    if (email.error) throw email.error;
    return res.status(201).json({ ok: true, email: candidate.email });
  } catch (error) {
    console.error('career-submit', error);
    return res.status(500).json({ error: error && error.message === 'Sistem Career belum dikonfigurasi.' ? error.message : 'Aplikasi belum dapat diproses. Silakan coba lagi atau hubungi PT. Ichikara.' });
  }
}

module.exports = handler;
module.exports.config = config;
module.exports._internals = { cleanTimeline, cleanQualifications, datedRows, qualificationRows, renderCv, insertCandidatePhoto, templateData, prepareTemplateForGenerator };
