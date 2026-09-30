const fs = require('fs/promises');
const path = require('path');
const PizZip = require('pizzip');
const sharp = require('sharp');

const TEMPLATE_PATH = path.join(process.cwd(), 'templates', 'master-kartu-siswa.xlsx');

function escapeXml(value) {
  return String(value || '').replace(/[<>&'"]/g, function (character) {
    return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character];
  });
}

function replaceCell(xml, reference, value) {
  const pattern = new RegExp('<c\\s+([^>]*?\\br="' + reference + '"[^>]*?)(?=\\/?>)(?:\\/>|>[\\s\\S]*?<\\/c>)');
  const match = xml.match(pattern);
  if (!match) throw new Error('Sel ' + reference + ' tidak ditemukan pada master kartu siswa.');
  const attributes = match[1].replace(/\s+t="[^"]*"/g, '');
  const text = escapeXml(value);
  const replacement = text ? '<c ' + attributes + ' t="inlineStr"><is><t xml:space="preserve">' + text + '</t></is></c>' : '<c ' + attributes + '/>';
  return xml.replace(pattern, replacement);
}

function stripExternalLinks(zip, sheetXml) {
  ['xl/externalLinks/externalLink1.xml', 'xl/externalLinks/externalLink2.xml', 'xl/externalLinks/_rels/externalLink1.xml.rels', 'xl/externalLinks/_rels/externalLink2.xml.rels', 'xl/calcChain.xml'].forEach(function (file) { zip.remove(file); });
  const workbook = zip.file('xl/workbook.xml').asText().replace(/<externalReferences[\s\S]*?<\/externalReferences>/, '');
  const relationships = zip.file('xl/_rels/workbook.xml.rels').asText().replace(/<Relationship\b[^>]*Type="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships\/externalLink"[^>]*\/>/g, '');
  zip.file('xl/workbook.xml', workbook);
  zip.file('xl/_rels/workbook.xml.rels', relationships);
  return sheetXml;
}

function formatBirth(placeOfBirth, birthDate) {
  const date = new Date(birthDate + 'T00:00:00');
  const dateLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  return placeOfBirth + ', ' + dateLabel;
}

async function prepareStudentPhoto(filePath) {
  return sharp(filePath).rotate().resize(1200, 1600, { fit: 'cover', position: 'attention' }).png().toBuffer();
}

async function buildStudentCardWorkbook(fields, photo) {
  const template = await fs.readFile(TEMPLATE_PATH);
  const zip = new PizZip(template);
  let sheetXml = zip.file('xl/worksheets/sheet1.xml').asText();
  const values = {
    H10: 'Nama', J10: fields.fullName,
    H12: 'Tempat, tgl Lahir', J12: formatBirth(fields.placeOfBirth, fields.birthDate),
    H14: 'Alamat', J14: fields.address,
    H18: 'No. Telp', J18: fields.phone,
    H20: 'Nama Sekolah / Perusahaan', J20: fields.schoolOrCompany,
    H23: '', I23: '', J23: '',
    H25: 'Cita-cita', J25: fields.aspiration,
    H36: 'Nama kelas', H37: 'Level', H38: '', H39: fields.fullName, H40: ''
  };
  Object.keys(values).forEach(function (reference) { sheetXml = replaceCell(sheetXml, reference, values[reference]); });
  sheetXml = stripExternalLinks(zip, sheetXml);
  zip.file('xl/worksheets/sheet1.xml', sheetXml);
  zip.file('xl/media/image7.png', photo);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

module.exports = { buildStudentCardWorkbook, formatBirth, prepareStudentPhoto, replaceCell };
