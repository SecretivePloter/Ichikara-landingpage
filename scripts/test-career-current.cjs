const assert=require('node:assert/strict'), fs=require('node:fs'), sharp=require('sharp'), Zip=require('pizzip');
const i=require('../api/career-submit')._internals;
(async()=>{
const rows=i.cleanTimeline([{startDate:'2026-05',endDate:'2026-10',current:true,detail:'PT Contoh Fiktif - Interpreter'}],15,true);
assert.equal(rows[0].endDate,'');
assert.match(i.datedRows(rows,30)[0].detail,/2026\/05 - present/);
assert.equal(i.cleanTimeline([{current:'false',detail:'Test',endDate:'2026-10'}],15,true)[0].current,false);
const candidate={fullName:'Kandidat Uji '+Math.floor(Math.random()*100000),email:'wingkocoli@gmail.com',birthDate:'1998-04-12',gender:'Laki-laki',phone:'080000000000',address:'Alamat fiktif pengujian',jlptLevel:'N2',jlptDate:'2024-07',skills:'Interpretasi manufaktur',workPreference:'harian-reguler',expectations:'HARAPAN_UJI <script>test</script>'};
const photo=await sharp({create:{width:600,height:800,channels:3,background:'#cccccc'}}).png().toBuffer();
const doc=await i.renderCv(candidate,[],rows,[],photo);
fs.mkdirSync('output/career-test',{recursive:true});fs.writeFileSync('output/career-test/cv-test.docx',doc);
const xml=new Zip(doc).file('word/document.xml').asText();
assert.match(xml,/2026\/05 - present/);assert.ok(!xml.includes('HARAPAN_UJI'));assert.ok(!xml.includes('2026\/10'));
const messages=[];await i.sendCareerEmails({emails:{send:async m=>{messages.push(m);return {data:{id:'mock'}};}}},{from:'test@example.com',recipients:['admin@example.com'],candidate,link:'https://example.com/test'});
for(const m of messages){assert.match(m.html,/Harian\/reguler/);assert.match(m.html,/HARAPAN_UJI &lt;script&gt;/);}
console.log('PASS: current overrides end date; DOCX generated; questionnaire excluded from DOCX and escaped in both emails');
})().catch(e=>{console.error(e);process.exit(1)});
