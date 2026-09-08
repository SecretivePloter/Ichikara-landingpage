// =============================================================================
// PT. Ichikara — Header & Footer Loader
// =============================================================================
// Injects the shared <header> and <footer> into every page from one place.
// To update the header or footer SITE-WIDE, edit ONLY this file.
//
// DESIGN: "Japanese Premium Minimal".
//   - Header is FIXED and transparent over the hero, turning into a warm-white
//     bar once the user scrolls (class "scrolled" toggled here; styled in
//     css/style.css). Logo + links are white on top, ink once scrolled.
//   - Footer is a minimal solid-black band with a white logo and small type.
//   - This file also wires the scroll-triggered fade-in animation for any
//     element carrying the .fade-in class.
//
// HOW TO USE ON EACH PAGE:
//   1. Place <div id="site-header"></div> before <main>
//   2. Place <div id="site-footer"></div> after </main>
//   3. Add <script src="js/header-loader.js"></script> as the LAST script in <body>
//   4. Add data-site-root="" on <body> for root-level pages,
//      or data-site-root="../" for pages inside a subdirectory (e.g. jasa-penerjemah/)
//
// HOW TO EDIT THE NAVIGATION:
//   - Nav links are in the HEADER_HTML template below (search "Desktop Navigation")
//   - Mobile nav links are in the same template (search "Mobile navigation")
//   - To add a new nav item: add an <a> tag to BOTH sections and add an entry to navMap below
//
// LOGO SIZE:
//   - Find class="hdr-logo h-10 w-auto" on the logo <img> and change h-10 (h-8=32px h-12=48px)
//
// WHATSAPP NUMBER:
//   - Search for "wa.me/6288291469464" and replace with the real number
//   - Format: https://wa.me/628XXXXXXXXX (country code, no + or spaces)
// =============================================================================

(function () {
    'use strict';

    // Resolve base path from body[data-site-root].
    //   Root pages (beranda.html, etc.): data-site-root=""
    //   Subdirectory pages (jasa-penerjemah/*.html): data-site-root="../"
    var BASE = document.body.dataset.siteRoot || '';

    // =========================================================================
    // HEADER TEMPLATE
    // Transparent over the hero; turns solid (.scrolled) once the page scrolls.
    // =========================================================================
    var HEADER_HTML = '\
<header id="main-header" class="fixed top-0 left-0 right-0 z-50" role="banner">\
  <div class="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-20">\
\
    <!-- Logo — .hdr-logo inverts to white over the hero, full color when scrolled -->\
    <a href="' + BASE + 'beranda.html" class="flex items-center gap-3 flex-shrink-0" aria-label="PT. Ichikara - Halaman Beranda">\
      <img src="' + BASE + 'images/logo.png"\
           alt="Logo PT. Ichikara"\
           class="hdr-logo h-10 w-auto"\
           onerror="this.style.display=\'none\'; document.getElementById(\'logo-fallback\').style.display=\'flex\';">\
      <span id="logo-fallback"\
            class="hidden hdr-link items-center font-noto font-bold text-xl"\
            aria-hidden="true">PT. Ichikara</span>\
    </a>\
\
    <!-- Desktop Navigation -->\
    <nav class="hidden md:flex items-center gap-9" aria-label="Navigasi utama">\
\
      <a id="nav-beranda" href="' + BASE + 'beranda.html"\
         class="hdr-link text-sm font-medium tracking-wide">Beranda</a>\
\
      <!-- Layanan dropdown -->\
      <div id="nav-layanan" class="relative group">\
        <button class="hdr-link flex items-center gap-0.5 text-sm font-medium tracking-wide cursor-pointer select-none" type="button">\
          Layanan\
          <span class="material-symbols-outlined text-base leading-none transition-transform duration-200 group-hover:rotate-180" aria-hidden="true">expand_more</span>\
        </button>\
        <!-- Dropdown panel (always light, ink text) -->\
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white rounded-xl border border-border-light shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">\
          <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-border-light rotate-45"></div>\
          <div class="py-2 relative">\
            <a href="' + BASE + 'jasa-penerjemah.html"\
               class="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container hover:text-secondary transition-colors">\
              <span class="material-symbols-outlined text-base text-secondary flex-shrink-0" aria-hidden="true">translate</span>Jasa Penerjemah</a>\
            <div class="ma-divider mx-3 my-1.5"></div>\
            <a href="' + BASE + 'jasa-interpreter.html"\
               class="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container hover:text-secondary transition-colors">\
              <span class="material-symbols-outlined text-base text-secondary flex-shrink-0" aria-hidden="true">record_voice_over</span>Jasa Interpreter</a>\
            <div class="ma-divider mx-3 my-1.5"></div>\
            <a href="' + BASE + 'tokutei-ginou.html"\
               class="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container hover:text-secondary transition-colors">\
              <span class="material-symbols-outlined text-base text-secondary flex-shrink-0" aria-hidden="true">badge</span>Program Tokutei Ginou</a>\
            <a href="' + BASE + 'kursus-bahasa.html"\
               class="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-container hover:text-secondary transition-colors">\
              <span class="material-symbols-outlined text-base text-secondary flex-shrink-0" aria-hidden="true">menu_book</span>Kursus Bahasa Jepang</a>\
          </div>\
        </div>\
      </div>\
\
      <a id="nav-tentang" href="' + BASE + 'tentang-kami.html"\
         class="hdr-link text-sm font-medium tracking-wide">Tentang Kami</a>\
      <a id="nav-kontak" href="' + BASE + 'beranda.html#kontak"\
         class="hdr-link text-sm font-medium tracking-wide">Kontak</a>\
      <a id="nav-kisah" href="' + BASE + 'success-story.html"\
         class="hdr-link text-sm font-medium tracking-wide">Kisah Sukses</a>\
    </nav>\
\
    <!-- Right side: language toggle + CTA button + mobile hamburger -->\
    <div class="flex items-center gap-3">\
\
      <!-- Primary CTA — pill — update WhatsApp number below -->\
      <a href="https://wa.me/6288291469464"\
         class="bg-secondary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-red-hover transition-colors"\
         aria-label="Hubungi kami via WhatsApp"\
         rel="noopener noreferrer"\
         target="_blank">Hubungi Kami</a>\
\
      <!-- Hamburger button (mobile only) -->\
      <button id="hamburger-btn"\
              class="hdr-icon md:hidden p-2 rounded-full"\
              aria-label="Buka menu navigasi"\
              aria-expanded="false"\
              aria-controls="mobile-menu">\
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>\
      </button>\
    </div>\
  </div>\
\
  <!-- Mobile Menu (hidden by default; solid light panel) -->\
  <div id="mobile-menu"\
       class="hidden md:hidden bg-white border-t border-border-light"\
       role="dialog"\
       aria-label="Menu navigasi mobile"\
       aria-hidden="true">\
    <nav class="flex flex-col px-6 py-4 gap-1" aria-label="Navigasi mobile">\
\
      <a href="' + BASE + 'beranda.html"\
         class="text-sm font-medium text-on-surface py-3 border-b border-border-light hover:text-secondary transition-colors">Beranda</a>\
\
      <!-- Layanan expandable section (mobile) -->\
      <div>\
        <button id="mobile-layanan-btn"\
                type="button"\
                class="w-full flex items-center justify-between text-sm font-medium text-on-surface py-3 border-b border-border-light hover:text-secondary transition-colors">\
          Layanan\
          <span class="material-symbols-outlined text-base transition-transform duration-200" id="mobile-layanan-icon" aria-hidden="true">expand_more</span>\
        </button>\
        <div id="mobile-layanan-sub" class="hidden flex-col pl-2 py-2 border-b border-border-light">\
          <a href="' + BASE + 'jasa-penerjemah.html"\
             class="text-sm text-on-surface px-2 py-2 rounded hover:bg-surface-container hover:text-secondary transition-colors">Jasa Penerjemah</a>\
          <div class="ma-divider my-1.5 mx-2"></div>\
          <a href="' + BASE + 'jasa-interpreter.html"\
             class="text-sm text-on-surface px-2 py-2 rounded hover:bg-surface-container hover:text-secondary transition-colors">Jasa Interpreter</a>\
          <div class="ma-divider my-1.5 mx-2"></div>\
          <a href="' + BASE + 'tokutei-ginou.html"\
             class="text-sm text-on-surface px-2 py-2 rounded hover:bg-surface-container hover:text-secondary transition-colors">Program Tokutei Ginou</a>\
          <a href="' + BASE + 'kursus-bahasa.html"\
             class="text-sm text-on-surface px-2 py-2 rounded hover:bg-surface-container hover:text-secondary transition-colors">Kursus Bahasa Jepang</a>\
        </div>\
      </div>\
\
      <a href="' + BASE + 'tentang-kami.html"\
         class="text-sm font-medium text-on-surface py-3 border-b border-border-light hover:text-secondary transition-colors">Tentang Kami</a>\
      <a href="' + BASE + 'beranda.html#kontak"\
         class="text-sm font-medium text-on-surface py-3 border-b border-border-light hover:text-secondary transition-colors">Kontak</a>\
      <a href="' + BASE + 'success-story.html"\
         class="text-sm font-medium text-on-surface py-3 hover:text-secondary transition-colors">Kisah Sukses</a>\
\
    </nav>\
  </div>\
</header>';

    // =========================================================================
    // FOOTER TEMPLATE — minimal solid black band, white logo, small type.
    // =========================================================================
    var FOOTER_HTML = '\
<footer class="bg-footer-dark text-white pt-20 pb-10" role="contentinfo">\
  <div class="max-w-[1200px] mx-auto px-6">\
\
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">\
\
      <!-- Brand column -->\
      <div class="lg:col-span-1">\
        <a href="' + BASE + 'beranda.html" class="flex items-center gap-3 mb-5" aria-label="PT. Ichikara - Halaman Beranda">\
          <img src="' + BASE + 'images/logo.png"\
               alt="Logo PT. Ichikara"\
               class="h-8 w-auto brightness-0 invert"\
               onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">\
          <span class="hidden font-noto font-bold text-lg" aria-hidden="true">PT. Ichikara</span>\
        </a>\
        <p class="text-outline-variant text-sm leading-relaxed mb-6 max-w-xs">\
          Penyedia layanan bahasa Jepang komprehensif di Indonesia. Berkomitmen pada akurasi, profesionalisme, dan pengembangan kompetensi global.\
        </p>\
        <div class="flex gap-3">\
          <a href="#" class="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/50 transition-all" aria-label="LinkedIn">\
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">link</span>\
          </a>\
          <a href="#" class="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/50 transition-all" aria-label="Instagram">\
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">photo_camera</span>\
          </a>\
        </div>\
      </div>\
\
      <!-- Layanan column -->\
      <div>\
        <h4 class="text-[11px] font-bold uppercase tracking-label mb-5 text-white/90">Layanan</h4>\
        <ul class="space-y-3">\
          <li><a href="' + BASE + 'jasa-penerjemah.html"  class="text-outline-variant text-sm hover:text-white transition-colors">Jasa Penerjemah</a></li>\
          <li><a href="' + BASE + 'jasa-interpreter.html" class="text-outline-variant text-sm hover:text-white transition-colors">Jasa Interpreter</a></li>\
          <li><a href="' + BASE + 'kursus-bahasa.html"    class="text-outline-variant text-sm hover:text-white transition-colors">Kursus Bahasa Jepang</a></li>\
          <li><a href="' + BASE + 'tokutei-ginou.html"    class="text-outline-variant text-sm hover:text-white transition-colors">Tokutei Ginou / SSW</a></li>\
        </ul>\
      </div>\
\
      <!-- Perusahaan column -->\
      <div>\
        <h4 class="text-[11px] font-bold uppercase tracking-label mb-5 text-white/90">Perusahaan</h4>\
        <ul class="space-y-3">\
          <li><a href="' + BASE + 'tentang-kami.html"   class="text-outline-variant text-sm hover:text-white transition-colors">Tentang Kami</a></li>\
          <li><a href="' + BASE + 'success-story.html"  class="text-outline-variant text-sm hover:text-white transition-colors">Kisah Sukses</a></li>\
          <li><a href="#"                               class="text-outline-variant text-sm hover:text-white transition-colors">Karir</a></li>\
          <li><a href="' + BASE + 'beranda.html#kontak" class="text-outline-variant text-sm hover:text-white transition-colors">Kontak</a></li>\
        </ul>\
      </div>\
\
      <!-- Kontak column -->\
      <div>\
        <h4 class="text-[11px] font-bold uppercase tracking-label mb-5 text-white/90">Kontak Kami</h4>\
        <ul class="space-y-3">\
          <li class="flex gap-3 items-start">\
            <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0" aria-hidden="true">location_on</span>\
            <span class="text-outline-variant text-sm">Komplek Ruko Melawai Blok A No.31, Lembah Hijau – Lippo Cikarang, Bekasi, Jawa Barat 17550</span>\
          </li>\
          <li class="flex gap-3 items-start">\
            <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0" aria-hidden="true">call</span>\
            <a href="tel:+622189906912" class="text-outline-variant text-sm hover:text-white transition-colors">021-8990 6912</a>\
          </li>\
          <li class="flex gap-3 items-start">\
            <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0" aria-hidden="true">mail</span>\
            <a href="mailto:info@ichikara.co.id" class="text-outline-variant text-sm hover:text-white transition-colors">info@ichikara.co.id</a>\
          </li>\
          <li class="flex gap-3 items-start">\
            <span class="material-symbols-outlined text-secondary text-[18px] mt-0.5 flex-shrink-0" aria-hidden="true">chat</span>\
            <a href="https://wa.me/6288291469464" class="text-outline-variant text-sm hover:text-white transition-colors" rel="noopener noreferrer" target="_blank">WhatsApp</a>\
          </li>\
        </ul>\
      </div>\
    </div>\
\
    <!-- Bottom bar -->\
    <div class="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">\
      <p class="text-outline-variant text-xs">\
        &copy; <span id="footer-year"></span> PT. Ichikara Indonesia. All rights reserved.\
      </p>\
      <div class="flex gap-6">\
        <a href="#" class="text-outline-variant text-xs hover:text-white transition-colors">Syarat &amp; Ketentuan</a>\
        <a href="#" class="text-outline-variant text-xs hover:text-white transition-colors">Kebijakan Privasi</a>\
      </div>\
    </div>\
  </div>\
</footer>';

    // =========================================================================
    // Inject header
    // =========================================================================
    var headerContainer = document.getElementById('site-header');
    if (headerContainer) {
        headerContainer.innerHTML = HEADER_HTML;
        initHamburger();
        initMobileDropdown();
        highlightActiveNav();
        initHeaderScroll();
    }

    // =========================================================================
    // Inject footer
    // =========================================================================
    var footerContainer = document.getElementById('site-footer');
    if (footerContainer) {
        footerContainer.innerHTML = FOOTER_HTML;
        // Auto-update copyright year — no manual update needed
        var yearEl = document.getElementById('footer-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    
 
    // Wire scroll-triggered fade-in animations across the page.
    initFadeIn();

    // =========================================================================
    // Real-time image overrides (Supabase)
    // Applies admin-uploaded images (table `ichikara_web_content`, section
    // 'media') to EVERY <img> on the page — hero, logo, thumbnails — as soon
    // as the admin saves; no deploy needed. No-op when there are no overrides.
    // header-loader.js is the shared script loaded last on ALL pages, so this
    // gives site-wide real-time image updates without editing each page.
    // =========================================================================
    (function applyMediaOverrides() {
        if (!window.IchikaraSite || !window.IchikaraSite.ready) return;
        try {
            window.IchikaraSite.onContent(function (content) {
                window.IchikaraSite.applyMediaOverrides(content);
            });
        } catch (e) { /* non-fatal */ }
    })();

    function initHeaderScroll() {
        var header = document.getElementById('main-header');
        if (!header) return;

        function onScroll() {
            header.classList.toggle('scrolled', window.scrollY > 20);
        }
        onScroll(); // set correct state on load (e.g. when refreshed mid-page)
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // =========================================================================
    // Scroll-triggered fade-in (Intersection Observer)
    // Any element with class "fade-in" gets "visible" when it enters the viewport.
    // =========================================================================
    function initFadeIn() {
        var els = document.querySelectorAll('.fade-in');
        if (!els.length) return;

        // Graceful fallback if IntersectionObserver is unavailable.
        if (!('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        els.forEach(function (el) { observer.observe(el); });
    }

    // =========================================================================
    // Mobile hamburger menu toggle
    // =========================================================================
    function initHamburger() {
        var btn  = document.getElementById('hamburger-btn');
        var menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', function () {
            var isOpen = !menu.classList.contains('hidden');
            menu.classList.toggle('hidden', isOpen);
            menu.setAttribute('aria-hidden', String(isOpen));
            btn.setAttribute('aria-expanded', String(!isOpen));
            btn.setAttribute('aria-label', isOpen ? 'Buka menu navigasi' : 'Tutup menu navigasi');
            btn.querySelector('.material-symbols-outlined').textContent = isOpen ? 'menu' : 'close';
        });

        // Close mobile menu when a nav link is clicked
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.add('hidden');
                menu.setAttribute('aria-hidden', 'true');
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-label', 'Buka menu navigasi');
                btn.querySelector('.material-symbols-outlined').textContent = 'menu';
            });
        });
    }

    // =========================================================================
    // Mobile Layanan dropdown toggle
    // =========================================================================
    function initMobileDropdown() {
        var btn  = document.getElementById('mobile-layanan-btn');
        var sub  = document.getElementById('mobile-layanan-sub');
        var icon = document.getElementById('mobile-layanan-icon');
        if (!btn || !sub) return;

        btn.addEventListener('click', function () {
            var isOpen = !sub.classList.contains('hidden');
            sub.classList.toggle('hidden', isOpen);
            if (icon) icon.style.transform = isOpen ? '' : 'rotate(180deg)';
        });
    }

    // =========================================================================
    // Highlight the active nav link based on the current page filename.
    // To add a new page: add an entry to navMap below.
    // =========================================================================
    function highlightActiveNav() {
        var path     = window.location.pathname;
        var filename = path.split('/').pop() || 'beranda.html';

        // Maps page filename → nav element ID to highlight
        var navMap = {
            'beranda.html':             'nav-beranda',
            'jasa-penerjemah.html':     'nav-layanan',
            'jasa-interpreter.html':    'nav-layanan',
            'kursus-bahasa.html':       'nav-layanan',
            'tokutei-ginou.html':       'nav-layanan',
            'dokumen-translation.html': 'nav-layanan',
            'e-learning.html':          'nav-layanan',
            'video-translation.html':   'nav-layanan',
            'website-translation.html': 'nav-layanan',
            'tentang-kami.html':        'nav-tentang',
            'success-story.html':       'nav-kisah',
        };

        var activeId = navMap[filename];
        if (!activeId) return;

        var el = document.getElementById(activeId);
        if (!el) return;

        // For the Layanan dropdown (a <div>), highlight the inner <button>
        var target = el.tagName === 'DIV' ? (el.querySelector('button') || el) : el;
        target.classList.add('nav-active');
    }

}());
