(function () {
  'use strict';
  var form = document.getElementById('student-form'), preview = document.getElementById('photo-preview'), input = document.getElementById('photo'), error = document.getElementById('form-error'), stage = document.getElementById('crop-stage'), placeholder = document.getElementById('crop-placeholder'), controls = document.getElementById('crop-controls'), zoomInput = document.getElementById('photo-zoom'), zoomValue = document.getElementById('photo-zoom-value'), xValue = document.getElementById('photo-x'), yValue = document.getElementById('photo-y'), reset = document.getElementById('reset-photo'), previewUrl = '', isJapanese = document.documentElement.lang === 'ja';
  var state = { zoom: 1, x: .5, y: .5, ratio: .75, dragging: false, startClientX: 0, startClientY: 0, startX: .5, startY: .5 };
  var frameRatio = .75;

  function message(id, text) { return isJapanese ? id : text; }
  function clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); }
  function dimensions() {
    var width = state.ratio > frameRatio ? state.ratio / frameRatio * 100 : 100;
    var height = state.ratio > frameRatio ? 100 : frameRatio / state.ratio * 100;
    return { width: width * state.zoom, height: height * state.zoom };
  }
  function bounds(size) { return { minimum: 50 / size, maximum: 1 - 50 / size }; }
  function applyCrop() {
    if (!previewUrl) return;
    var size = dimensions(), xBounds = bounds(size.width), yBounds = bounds(size.height);
    state.x = clamp(state.x, xBounds.minimum, xBounds.maximum);
    state.y = clamp(state.y, yBounds.minimum, yBounds.maximum);
    preview.style.width = size.width + '%';
    preview.style.height = size.height + '%';
    preview.style.left = (50 - state.x * size.width) + '%';
    preview.style.top = (50 - state.y * size.height) + '%';
    zoomValue.value = state.zoom.toFixed(2);
    xValue.value = state.x.toFixed(4);
    yValue.value = state.y.toFixed(4);
  }
  function resetCrop() { state.zoom = 1; state.x = .5; state.y = .5; zoomInput.value = '1'; applyCrop(); }
  function loadPhoto(file) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    var image = new Image();
    image.onload = function () {
      state.ratio = image.naturalWidth / image.naturalHeight || frameRatio;
      preview.src = previewUrl;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      controls.classList.remove('hidden');
      resetCrop();
    };
    image.src = previewUrl;
  }
  function showError(value) { error.textContent = value; error.classList.remove('hidden'); }

  input.addEventListener('change', function () {
    var file = input.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { input.value = ''; showError(message('写真の容量は最大5MBです。', 'Ukuran foto maksimal 5 MB.')); return; }
    error.classList.add('hidden');
    loadPhoto(file);
  });
  zoomInput.addEventListener('input', function () { state.zoom = Number(zoomInput.value); applyCrop(); });
  reset.addEventListener('click', resetCrop);
  stage.addEventListener('pointerdown', function (event) {
    if (!previewUrl) return;
    stage.setPointerCapture(event.pointerId);
    state.dragging = true; stage.classList.add('dragging');
    state.startClientX = event.clientX; state.startClientY = event.clientY; state.startX = state.x; state.startY = state.y;
  });
  stage.addEventListener('pointermove', function (event) {
    if (!state.dragging) return;
    var rect = stage.getBoundingClientRect(), size = dimensions();
    state.x = state.startX - (event.clientX - state.startClientX) / (rect.width * size.width / 100);
    state.y = state.startY - (event.clientY - state.startClientY) / (rect.height * size.height / 100);
    applyCrop();
  });
  function endDrag() { state.dragging = false; stage.classList.remove('dragging'); }
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

  form.addEventListener('submit', async function (event) {
    event.preventDefault(); error.classList.add('hidden');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var button = document.getElementById('submit'), data = new FormData(form);
    button.disabled = true; button.textContent = message('カードを作成しています...', 'Membuat kartu...');
    try {
      var response = await fetch('/api/student-card-submit', { method: 'POST', body: data }), output = await response.json();
      if (!response.ok) throw new Error(output.error || message('お申し込みを処理できませんでした。', 'Pendaftaran belum dapat diproses.'));
      form.innerHTML = '<div class="py-12 text-center"><span class="material-symbols-outlined text-5xl text-secondary">mark_email_read</span><h2 class="mt-5 font-noto text-3xl font-bold text-primary">' + message('カードをメールでお送りしています', 'Kartu data sedang dikirim') + '</h2><p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">' + (isJapanese ? '生徒カードの専用リンクを <strong>' + escapeHtml(output.email) + '</strong> にお送りしました。リンクは30日間有効です。' : 'Kami telah mengirim tautan privat kartu data siswa ke <strong>' + escapeHtml(output.email) + '</strong>. Tautan berlaku selama 30 hari.') + '</p></div>';
    } catch (err) {
      showError(err.message || message('お申し込みを処理できませんでした。', 'Pendaftaran belum dapat diproses.'));
      button.disabled = false; button.textContent = message('送信して生徒カードを作成', 'Kirim dan buat kartu siswa');
    }
  });
  function escapeHtml(value) { var element = document.createElement('div'); element.textContent = value || ''; return element.innerHTML; }
}());