const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan.' });
  const token = String(req.query.token || '');
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(400).json({ error: 'Tautan tidak valid.' });
  try {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const query = await sb.from('ichikara_web_applications').select('full_name,job_code,cv_docx_path,access_expires_at').eq('access_token_hash', hash).maybeSingle();
    if (query.error) throw query.error;
    if (!query.data || new Date(query.data.access_expires_at).getTime() < Date.now()) return res.status(410).json({ error: 'Tautan ini sudah kedaluwarsa.' });
    const signed = await sb.storage.from('ichikara-web-recruitment').createSignedUrl(query.data.cv_docx_path, 300, { download: 'CV-Ichikara.docx' });
    if (signed.error) throw signed.error;
    return res.status(200).json({ fullName: query.data.full_name, jobCode: query.data.job_code, downloadUrl: signed.data.signedUrl, expiresAt: query.data.access_expires_at });
  } catch (error) { console.error('career-access', error); return res.status(500).json({ error: 'CV belum dapat diakses saat ini.' }); }
}

module.exports = handler;
