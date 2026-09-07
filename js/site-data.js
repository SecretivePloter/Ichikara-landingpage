// =============================================================================
// PT. Ichikara — Site Content Loader (Supabase)
// =============================================================================
// Mengambil konten dinamis (stories, jumlah logo klien, pengaturan beranda,
// override gambar) dari tabel Supabase `ichikara_web_content`, lalu
// memperbaruinya secara real-time.
//
// MODEL:
//   - loadContent()  -> satu request, di-cache (one-shot promise)
//   - onContent(cb)  -> cb(content) dipanggil saat konten pertama kali siap
//                        DAN setiap ada perubahan real-time.
//   - imgSrc(path)   -> resolve URL gambar (hormati override Supabase)
//   - applyMediaOverrides(content) -> terapkan override ke SEMUA <img> di halaman
//
// Halaman publik HANYA MEMBACA (RLS: anonymous = select only). Penulisan
// dilakukan oleh admin/index.html yang terautentikasi.
//
// Cara pakai di halaman publik:
//   1. Muat di <head> (SEBELUM css/style.css):
//        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//        <script src="js/site-data.js"></script>   (atau ../js/site-data.js di subfolder)
//   2. header-loader.js (di-muat terakhir) otomatis menerapkan override gambar
//      ke seluruh halaman via onContent(). Halaman yang merender konten dinamis
//      (beranda, success-story) cukup panggil window.IchikaraSite.onContent().
//
// Jika Supabase tidak terjangkau, window.IchikaraSite tetap ada dengan
// loadContent() yang reject — pemanggil cukup fallback ke localStorage/statis.
// =============================================================================
(function () {
  'use strict';

  var SUPA_URL = 'https://pfvlxlfykdabrwijqqxa.supabase.co';
  var SUPA_KEY = 'sb_publishable_C8EWE-TOsXBqzbH2aIjzcg_30Jx8Ove';
  var TABLE = 'ichikara_web_content';

  // Prefix path aset di repo (dari body[data-site-root]): '' root, '../' subfolder.
  // HARUS lazy: file ini dimuat di <head>, saat itu document.body masih null.
  function repoBase() {
    var b = document.body ? document.body.getAttribute('data-site-root') : null;
    return b === null ? '' : b;
  }

  if (!window.supabase) {
    // CDN Supabase belum termuat: sediakan API kosong agar halaman bisa fallback.
    window.IchikaraSite = {
      ready: false,
      imgSrc: function (p) { return p && /^https?:\/\//i.test(p) ? p : (repoBase() + 'images/' + p); },
      loadContent: function () { return Promise.reject(new Error('Supabase belum termuat')); },
      onContent: function () { return function () {}; },
      applyMediaOverrides: function () {}
    };
    return;
  }

  var client = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  // Peta override gambar: 'images/<file>' -> URL publik Supabase.
  var mediaOverrides = {};
  var _contentPromise = null;   // one-shot
  var _contentCache   = null;   // konten terakhir
  var _subscribed     = false;
  var _listeners      = [];

  function emptyContent() {
    return { stories: [], clients: { count: 8 }, beranda: { featuredIds: [] }, media: { overrides: {} }, teachers: [] };
  }

  // Ambil semua section dalam satu request (di-cache).
  function loadContent() {
    if (_contentPromise) return _contentPromise;
    _contentPromise = client.from(TABLE).select('section,data').then(function (res) {
      if (res.error) throw res.error;
      var out = emptyContent();
      mediaOverrides = {};
      (res.data || []).forEach(function (row) {
        if (row.section === 'stories') out.stories = Array.isArray(row.data) ? row.data : [];
        else if (row.section === 'clients') out.clients = row.data || out.clients;
        else if (row.section === 'beranda') out.beranda = row.data || out.beranda;
        else if (row.section === 'teachers') out.teachers = Array.isArray(row.data) ? row.data : [];
        else if (row.section === 'media') {
          out.media = row.data || out.media;
          mediaOverrides = out.media.overrides || {};
        }
      });
      _contentCache = out;
      return out;
    }).catch(function (err) {
      _contentPromise = null; // izin retry berikutnya
      throw err;
    });
    return _contentPromise;
  }

  // Terapkan override ke SEMUA <img> di halaman (statis + yang diinjeksi).
  function applyMediaOverrides(content) {
    var ov = (content && content.media && content.media.overrides) || mediaOverrides;
    if (!ov) return;
    document.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src');
      if (!src) return;
      var key = repoKey(src);
      if (key && ov[key]) img.setAttribute('src', ov[key]);
    });
  }

  // Ubah src relatif menjadi kunci repo 'images/...' (untuk referensi override).
  function repoKey(src) {
    var s = String(src || '').replace(/^https?:\/\/[^/]+/, '');
    s = s.replace(/^\/?(?:\.\.\/|\.\/)+/, '').replace(/^\//, '');
    return s; // mis. 'images/hero-beranda.jpg'
  }

  // Resolve path gambar -> URL yang bisa dirender.
  function imgSrc(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;          // upload Supabase
    var key = path.indexOf('images/') === 0 ? path : 'images/' + path;
    if (mediaOverrides[key]) return mediaOverrides[key];  // override
    return repoBase() + key;                              // bawaan repo
  }

  // Daftarkan listener konten (fire saat siap + tiap perubahan real-time).
  // Mengembalikan unsubscribe().
  function onContent(cb) {
    _listeners.push(cb);
    (function fire() {
      loadContent()
        .then(function (c) { cb(c); })
        .catch(function () { /* offline — pemanggil fallback sendiri */ });
    })();
    ensureSubscription();
    return function () {
      _listeners = _listeners.filter(function (l) { return l !== cb; });
    };
  }

  function ensureSubscription() {
    if (_subscribed) return;
    _subscribed = true;
    try {
      client.channel('ichikara_web_content_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, function () {
          // Re-fetch lalu beri tahu semua listener (debounce ringan)
          clearTimeout(ensureSubscription._t);
          ensureSubscription._t = setTimeout(function () {
            loadContent()
              .then(function (c) { _listeners.forEach(function (cb) { try { cb(c); } catch (e) {} }); })
              .catch(function () {});
          }, 250);
        })
        .subscribe();
    } catch (e) { /* Realtime opsional */ }
  }

  window.IchikaraSite = {
    ready: true,
    client: client,
    imgSrc: imgSrc,
    repoKey: repoKey,
    loadContent: loadContent,
    onContent: onContent,
    applyMediaOverrides: applyMediaOverrides
  };
})();
