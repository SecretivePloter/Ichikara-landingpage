(function () {
  'use strict';
  if (!window.IchikaraSite || !window.IchikaraJapanese) return;
  var id = new URLSearchParams(location.search).get('id');
  if (!id) return;
  function esc(value) { var div = document.createElement('div'); div.textContent = value || ''; return div.innerHTML; }
  function text(value) { var div = document.createElement('div'); div.innerHTML = value || ''; return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim(); }
  function paragraphs(value) { return String(value || '').split(/\n\s*\n/).map(function (part) { return part.trim(); }).filter(Boolean); }
  function href(story, index) { return 'berita-detail.html?id=' + encodeURIComponent(story.id || 'story-' + index); }
  function render(raw) {
    var stories = window.IchikaraJapanese.stories(raw).filter(function (story) { return String(story.id || '') !== 's3'; });
    var story = stories.find(function (item) { return String(item.id || '') === String(id); });
    if (!story) return;
    var title = story.title || 'ニュース';
    var lead = text(story.excerpt);
    var body = paragraphs(story.content || lead);
    document.title = title + ' | PT. Ichikara';
    document.getElementById('article-description').setAttribute('content', lead || 'PT. Ichikaraのニュース。');
    document.getElementById('article-category').textContent = ({ achievement: '実績', activity: '活動', 'client-story': 'お客様の事例' })[story.category] || 'ニュース';
    document.getElementById('article-date').textContent = story.date || '';
    document.getElementById('article-title').textContent = title;
    document.getElementById('article-lead').textContent = lead;
    document.getElementById('article-body').innerHTML = (body.length ? body : ['記事内容は準備中です。']).map(function (part) { return '<p>' + esc(part) + '</p>'; }).join('');
    var image = window.IchikaraSite.imgSrc(story.image);
    document.getElementById('article-figure').innerHTML = image ? '<img src="' + esc(image) + '" alt="' + esc(story.imageAlt || title) + '" class="w-full max-h-[560px] object-cover rounded-2xl border border-border-light" loading="eager"><figcaption class="text-sm text-on-surface-variant mt-3">PT. Ichikaraの記録</figcaption>' : '';
    var latest = stories.filter(function (item) { return item.id !== story.id; }).slice(0, 4);
    document.getElementById('latest-news').innerHTML = latest.length ? latest.map(function (item, index) { return '<a href="' + href(item, index) + '" class="block py-5 group"><span class="text-xs text-on-surface-variant">' + esc(item.date || '') + '</span><h3 class="font-noto font-bold text-primary leading-snug mt-1 group-hover:text-secondary transition-colors">' + esc(item.title) + '</h3></a>'; }).join('') : '<p class="text-sm text-on-surface-variant py-5">ほかのニュースはありません。</p>';
    document.getElementById('article-loading').classList.add('hidden');
    document.getElementById('article-not-found').classList.add('hidden');
    document.getElementById('article-layout').classList.remove('hidden');
  }
  window.IchikaraSite.loadContent().then(function (content) { render(content.stories || []); });
}());
