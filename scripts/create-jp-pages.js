const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pages = ['404.html','beranda.html','tentang-kami.html','jasa-interpreter.html','jasa-penerjemah.html','kursus-bahasa.html','rental-mobil.html','sewa-alat-interpreter.html','success-story.html','berita-detail.html','career.html','career-apply.html','career-access.html','jasa-penerjemah/dokumen-translation.html','jasa-penerjemah/e-learning.html','jasa-penerjemah/video-translation.html','jasa-penerjemah/website-translation.html'];
function localeUrl(page) { return 'https://www.ichikara.co.id/jp/' + page; }
function originalUrl(page) { return 'https://www.ichikara.co.id/' + page; }
function assetPrefix(page) { return page.includes('/') ? '../../' : '../'; }
for (const page of pages) {
  const prefix = assetPrefix(page);
  let html = fs.readFileSync(path.join(root, page), 'utf8');
  html = html.replace(/<html\b([^>]*)\blang=["']id["']([^>]*)>/i, '<html$1lang="ja"$2>');
  html = html.replace(/\s*<link\s+rel=["']alternate["']\s+hreflang=["'](?:id|ja)["'][^>]*>/gi, '');
  html = html.replace(/<link\s+(?:id=["']article-canonical["']\s+)?rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>(?![\s\S]*hreflang)/i, '<link rel="canonical" href="' + localeUrl(page) + '">\n  <link rel="alternate" hreflang="id" href="' + originalUrl(page) + '">\n  <link rel="alternate" hreflang="ja" href="' + localeUrl(page) + '">');
  html = html.replace(/(<body\b[^>]*\bdata-site-root=["'])[^"']*(["'])/i, '$1' + prefix + '$2');
  html = html.replace(/(src|href)="(?:\.\.\/)?(js|css|images)\//g, '$1="' + prefix + '$2/');
  html = html.replace(/js\/header-loader\.js([^"']*)/g, 'js/jp-header-loader.js$1');
  if (page === 'beranda.html') {
    html = html.replace('function applyStories(allStories, featuredIds) {', 'function applyStories(allStories, featuredIds) {\n      allStories = window.IchikaraJapanese ? window.IchikaraJapanese.stories(allStories) : allStories;');
  }
  if (page === 'success-story.html') {
    html = html.replace('function renderStories(stories) {', 'function renderStories(stories) {\n        stories = window.IchikaraJapanese ? window.IchikaraJapanese.stories(stories) : stories;');
  }
  if (page === 'berita-detail.html') {
    html = html.replace('function renderArticle(stories) {', 'function renderArticle(stories) {\n      if (!window.IchikaraJapanese || !window.IchikaraJapanese.stories) { setTimeout(function () { renderArticle(stories); }, 0); return; }\n      stories = window.IchikaraJapanese.stories(stories);');
  }
  const staticLoader = '<script src="' + prefix + 'js/jp-static-copy.js"></script>';
  html = html.replace(/(<script\s+src="[^"]*js\/jp-header-loader\.js[^>]*><\/script>)/i, staticLoader + '\n  $1');
  if (page === 'berita-detail.html') {
    html = html.replace(/(<script\s+src="[^"]*js\/jp-header-loader\.js[^>]*><\/script>)/i, '$1\n  <script src="' + prefix + 'js/jp-news-renderer.js"></script>');
  }
  const destination = path.join(root, 'jp', page);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html);
}
console.log('Generated ' + pages.length + ' Japanese route files.');
