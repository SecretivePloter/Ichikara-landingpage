const fs = require('fs/promises');
const path = require('path');
const {
  AlignmentType, BorderStyle, Document, Header, ImageRun, Packer, Paragraph,
  Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType
} = require('docx');

const BORDER = { style: BorderStyle.SINGLE, size: 8, color: '111111' };
const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: '111111' };
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

function text(value, options) {
  return new TextRun(Object.assign({ text: String(value || ''), font: 'Times New Roman', size: 20 }, options || {}));
}
function paragraph(children, options) {
  return new Paragraph(Object.assign({ children: Array.isArray(children) ? children : (children && typeof children === 'object' ? [children] : [text(children)]) }, options || {}));
}
function cell(children, width, options) {
  const config = options || {};
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: { size: width, type: WidthType.DXA },
    verticalAlign: config.verticalAlign || VerticalAlign.CENTER,
    margins: config.margins || { top: 70, bottom: 70, left: 100, right: 100 },
    borders: config.borders || { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER }
  });
}
function infoLabel(label, value) {
  return cell([
    paragraph([text(label, { bold: true, size: 18 })], { spacing: { after: 35 } }),
    paragraph(text(value, { size: 20 }))
  ], 3500);
}
function dateLabel(date) {
  if (!date) return { year: '', month: '' };
  return { year: date.slice(0, 4), month: date.slice(5, 7) };
}
function historyTable(title, rows, minimumRows) {
  const header = new TableRow({ children: [
    cell(paragraph(text('Tahun', { bold: true, size: 18 })), 800, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: THIN_BORDER } }),
    cell(paragraph(text('Bulan', { bold: true, size: 18 })), 650, { borders: { top: BORDER, bottom: BORDER, left: THIN_BORDER, right: BORDER } }),
    cell(paragraph(text('Keterangan', { bold: true, size: 18 })), 8150, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER } })
  ] });
  const section = new TableRow({ children: [
    cell(paragraph(''), 800, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: THIN_BORDER } }),
    cell(paragraph(''), 650, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: BORDER } }),
    cell(paragraph(text(title, { bold: true, size: 22 })), 8150, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: BORDER } })
  ] });
  const items = rows.concat(Array(Math.max(0, minimumRows - rows.length)).fill({ year: '', month: '', detail: '' }));
  const body = items.map(function (row) {
    return new TableRow({ cantSplit: true, children: [
      cell(paragraph(text(row.year, { size: 20 })), 800, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: THIN_BORDER } }),
      cell(paragraph(text(row.month, { size: 20 })), 650, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: BORDER } }),
      cell(paragraph(text(row.detail, { size: 20 })), 8150, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: BORDER } })
    ] });
  });
  return new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [800, 650, 8150], rows: [header, section].concat(body) });
}
function qualificationTable(rows) {
  const body = rows.length ? rows : [{ date: '', detail: '' }];
  return new Table({
    width: { size: 9600, type: WidthType.DXA }, columnWidths: [800, 650, 8150],
    rows: [new TableRow({ children: [
      cell(paragraph(text('Tahun', { bold: true, size: 18 })), 800, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: THIN_BORDER } }),
      cell(paragraph(text('Bulan', { bold: true, size: 18 })), 650, { borders: { top: BORDER, bottom: BORDER, left: THIN_BORDER, right: BORDER } }),
      cell(paragraph(text('Sertifikat dan kualifikasi', { bold: true, size: 18 })), 8150, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER } })
    ] })].concat(body.map(function (row) {
      const date = dateLabel(row.date);
      return new TableRow({ cantSplit: true, children: [
        cell(paragraph(text(date.year, { size: 20 })), 800, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: THIN_BORDER } }),
        cell(paragraph(text(date.month, { size: 20 })), 650, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: BORDER } }),
        cell(paragraph(text(row.detail, { size: 20 })), 8150, { borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: BORDER, right: BORDER } })
      ] });
    }))
  });
}
async function header() {
  const logo = await fs.readFile(path.join(process.cwd(), 'images', 'logo.png'));
  return new Header({ children: [
    new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [4200, 5400], rows: [new TableRow({ children: [
      cell(paragraph([new ImageRun({ data: logo, type: 'png', transformation: { width: 118, height: 61 } })]), 4200, { borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, margins: { top: 0, bottom: 0, left: 0, right: 0 } }),
      cell([
        paragraph(text('PT. ICHIKARA', { bold: true, size: 24 }), { alignment: AlignmentType.RIGHT }),
        paragraph(text('Ruko Melawai Blok A No.31', { size: 18 }), { alignment: AlignmentType.RIGHT }),
        paragraph(text('Lembah Hijau, Lippo Cikarang, Bekasi 17550', { size: 18 }), { alignment: AlignmentType.RIGHT }),
        paragraph(text('Telp. 021-8990 6912', { size: 18 }), { alignment: AlignmentType.RIGHT }),
        paragraph(text('www.ichikara.co.id', { size: 18 }), { alignment: AlignmentType.RIGHT })
      ], 5400, { borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }, margins: { top: 0, bottom: 0, left: 0, right: 0 } })
    ] })] }),
    paragraph('', { border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: '555555', space: 8 } }, spacing: { after: 35 } }),
    paragraph('', { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '555555' } }, spacing: { after: 120 } })
  ] });
}
async function buildCvDocument(fields, education, experience, qualifications, photo) {
  const today = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const birth = new Date(fields.birthDate);
  const age = Number.isNaN(birth.getTime()) ? '' : Math.max(0, new Date().getUTCFullYear() - birth.getUTCFullYear() - ((new Date().getUTCMonth() < birth.getUTCMonth() || (new Date().getUTCMonth() === birth.getUTCMonth() && new Date().getUTCDate() < birth.getUTCDate())) ? 1 : 0));
  const personalTable = new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [7600, 2000], rows: [new TableRow({ children: [
    cell([
      new Table({ width: { size: 7400, type: WidthType.DXA }, columnWidths: [3700, 3700], rows: [
        new TableRow({ children: [cell([paragraph(text('Nama', { bold: true, size: 18 })), paragraph(text(fields.fullName, { size: 22 }))], 7400, { borders: { top: NO_BORDER, bottom: THIN_BORDER, left: NO_BORDER, right: NO_BORDER } })] }),
        new TableRow({ children: [infoLabel('Tanggal lahir', fields.birthDate + (age ? ' (' + age + ' tahun)' : '')), infoLabel('Jenis kelamin', fields.gender)] }),
        new TableRow({ children: [infoLabel('Nomor telepon', fields.phone), infoLabel('Email', fields.email)] }),
        new TableRow({ children: [cell([paragraph(text('Alamat', { bold: true, size: 18 })), paragraph(text(fields.address, { size: 20 }))], 7400, { borders: { top: THIN_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER } })] })
      ] })
    ], 7600, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }, margins: { top: 30, bottom: 30, left: 30, right: 30 } }),
    cell(paragraph([new ImageRun({ data: photo, type: 'png', transformation: { width: 132, height: 176 } })], { alignment: AlignmentType.CENTER }), 2000, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }, margins: { top: 55, bottom: 55, left: 55, right: 55 } })
  ] })] });
  const document = new Document({ sections: [{
    properties: { page: { margin: { top: 760, right: 760, bottom: 720, left: 760 } } },
    headers: { default: await header() },
    children: [
      paragraph(text('Curriculum Vitae', { bold: true, size: 34 }), { spacing: { after: 40 } }),
      paragraph(text('Tanggal dibuat: ' + today, { size: 18 }), { alignment: AlignmentType.RIGHT, spacing: { after: 100 } }),
      personalTable,
      paragraph('', { spacing: { after: 100 } }),
      historyTable('Pendidikan', education, 4),
      paragraph('', { pageBreakBefore: true, spacing: { after: 100 } }),
      historyTable('Pengalaman kerja', experience, Math.min(8, Math.max(4, experience.length))),
      paragraph('', { pageBreakBefore: true, spacing: { after: 100 } }),
      qualificationTable(qualifications),
      paragraph('', { spacing: { after: 100 } }),
      new Table({ width: { size: 9600, type: WidthType.DXA }, rows: [new TableRow({ children: [cell([
        paragraph(text('Keahlian khusus', { bold: true, size: 20 })),
        paragraph(text(fields.skills || '-', { size: 20 }))
      ], 9600, { borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER } })] })] })
    ]
  }] });
  return Packer.toBuffer(document);
}

module.exports = { buildCvDocument };
