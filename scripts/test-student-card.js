const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');
const PizZip = require('pizzip');
const sharp = require('sharp');
const { buildStudentCardWorkbook, formatBirth } = require('../api/student-card');
const submit = require('../api/student-card-submit');

async function run() {
  const photo = await sharp({ create: { width: 1200, height: 1600, channels: 4, background: '#335577' } }).png().toBuffer();
  const output = await buildStudentCardWorkbook({ fullName: 'Nadia & Putri', placeOfBirth: 'Semarang', birthDate: '2004-02-03', address: 'Jl. Melati <10>', phone: '0812-1234-5678', schoolOrCompany: 'SMK Contoh', aspiration: 'Menjadi penerjemah' }, photo);
  const file = path.join(process.cwd(), '.tmp-student-card.xlsx');
  await fs.writeFile(file, output);
  const zip = new PizZip(output), sheet = zip.file('xl/worksheets/sheet1.xml').asText();
  assert.match(sheet, /Nadia &amp; Putri/);
  assert.match(sheet, /Semarang, 3 Februari 2004/);
  assert.match(sheet, /Cita-cita/);
  assert.doesNotMatch(sheet, /\[1\]DATA SISWA|\[2\]form|>NIM</);
  assert.strictEqual(zip.file('xl/externalLinks/externalLink1.xml'), null);
  assert.strictEqual(zip.file('xl/externalLinks/externalLink2.xml'), null);
  assert.strictEqual(zip.file('xl/media/image7.png').asNodeBuffer().equals(photo), true);
  assert.strictEqual(formatBirth('Bandung', '2000-01-01'), 'Bandung, 1 Januari 2000');
  const messages = [];
  const resend = { emails: { send: async function (message) { messages.push(message); return { data: { id: 'message-' + messages.length } }; } } };
  const routed = await submit._internals.sendStudentCardEmails(resend, { from: 'PT. Ichikara <marketing@ichikara.co.id>', recipients: ['marketing@ichikara.co.id'], student: { fullName: 'Nadia', email: 'nadia@example.com', phone: '0812', schoolOrCompany: 'SMK Contoh' }, link: 'https://www.ichikara.co.id/student-card-access.html?token=example' });
  assert.strictEqual(messages.length, 2);
  assert.strictEqual(messages[0].to, 'nadia@example.com');
  assert.deepStrictEqual(messages[1].to, ['marketing@ichikara.co.id']);
  assert.match(messages[1].subject, /Pendaftaran siswa baru/);
  assert.deepStrictEqual(routed, { candidateEmailId: 'message-1', adminEmailId: 'message-2' });
  console.log('PASS student-card template generation');
}

run().catch(function (error) { console.error(error); process.exit(1); });
