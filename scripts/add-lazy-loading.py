# -*- coding: utf-8 -*-
"""Tambah loading="lazy" ke <img> non-hero di halaman publik (sekali jalankan)."""
import re, io, os

ROOT = os.path.dirname(os.path.abspath(__file__))  # scripts/
ROOT_DIR = os.path.dirname(ROOT)
PAGES = [
    'beranda.html', 'success-story.html', 'jasa-penerjemah.html',
    'jasa-interpreter.html', 'kursus-bahasa.html', 'tokutei-ginou.html',
    'tentang-kami.html',
]
SUBDIR = os.path.join(ROOT_DIR, 'jasa-penerjemah')
SKIP_IF = ['hero-', 'kantor-ichikara', 'cta-tokutei', 'logo.png', 'loading=']

def process(path):
    with io.open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    count = 0
    def repl(m):
        nonlocal count
        tag = m.group(0)
        if any(skip in tag for skip in SKIP_IF):
            return tag
        count += 1
        # sisip sebelum '>' terakhir
        return tag[:-1] + ' loading="lazy">'
    html2 = re.sub(r'<img\b(?:(?!\bloading=)[^>])*>', repl, html, flags=re.DOTALL)
    if count:
        with io.open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(html2)
    print(f'{os.path.relpath(path, ROOT_DIR)}: {count} img di-lazy')

for p in PAGES:
    process(os.path.join(ROOT_DIR, p))

if os.path.isdir(SUBDIR):
    for f in sorted(os.listdir(SUBDIR)):
        if f.endswith('.html'):
            process(os.path.join(SUBDIR, f))