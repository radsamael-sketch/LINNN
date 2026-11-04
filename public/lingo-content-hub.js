/* Lingo Studio: supplemental content hub (Reading, Extra Practice, Checkpoints).
   Keeps legacy lesson importer untouched; new material types use a shared parser/storage. */
(function () {
  'use strict';
  var KEY = 'lingo-studio.contentItems.v1';
  var RESULTS = 'lingo-studio.contentResults.v1';
  var currentImage = null;
  var selectedFile = null;
  var labels = { reading: 'Reading', practice: 'Extra Practice', checkpoint: 'Tests & Checkpoints' };
  function $(s, root) { return (root || document).querySelector(s); }
  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (_) { return fallback; } }
  function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }
  function items() { return read(KEY, []); }
  function id() { return 'mat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function parseFields(line) { var m = line.match(/^\[([A-Z_]+):\s*(.*?)\s*\]$/i); return m ? { key: m[1].toUpperCase(), value: m[2] } : null; }
  function parseDocument(raw, type) {
    var lines = String(raw || '').replace(/\r/g, '').split('\n'), meta = { title: '', level: 'A1+', description: '', topic: '' }, body = [], exercises = [], inText = false, active = null, errors = [];
    lines.forEach(function (line, index) {
      var t = line.trim(), f = parseFields(t), upper = t.toUpperCase();
      if (f && ['TITLE','LEVEL','DESCRIPTION','TOPIC'].indexOf(f.key) >= 0 && !active && !inText) { meta[f.key.toLowerCase()] = f.value; return; }
      if (upper === '[TEXT]' || upper === '[PASSAGE]') { inText = true; return; }
      if (upper === '[END_TEXT]' || upper === '[/TEXT]' || upper === '[END_PASSAGE]') { inText = false; return; }
      var start = t.match(/^\[(EXERCISE|QUESTION_BLOCK)(?::\s*([A-Z_]+))?\]$/i);
      if (start) { if (active) errors.push('Строка ' + (index + 1) + ': предыдущий блок задания не закрыт.'); active = { type: (start[2] || 'multiple_choice').toLowerCase(), question: '', options: [], answer: '', explanation: '' }; return; }
      if (upper === '[END_EXERCISE]' || upper === '[END_QUESTION_BLOCK]') { if (active) { exercises.push(active); active = null; } else errors.push('Строка ' + (index + 1) + ': найдено закрытие без начала задания.'); return; }
      if (active && f) { if (f.key === 'QUESTION') active.question = f.value; else if (f.key === 'OPTION') active.options.push(f.value); else if (f.key === 'ANSWER') active.answer = f.value; else if (f.key === 'EXPLANATION') active.explanation = f.value; return; }
      if (inText) body.push(line);
      else if (t && !/^\[(READING|PRACTICE|TEST|CHECKPOINT|END_READING|END_PRACTICE|END_TEST|END_CHECKPOINT)\]$/i.test(t)) body.push(line);
    });
    if (active) errors.push('Последний блок задания не закрыт тегом [END_EXERCISE].');
    if (!meta.title.trim()) errors.push('Не указано название: добавь [TITLE: Название].');
    if (type === 'reading' && !body.join('\n').trim()) errors.push('Не найден текст для чтения. Используй [TEXT] и [END_TEXT].');
    if (type !== 'reading' && !exercises.length) errors.push('Не найдено ни одного задания [EXERCISE].');
    exercises.forEach(function (e, i) { if (!e.question) errors.push('Задание ' + (i + 1) + ': нет вопроса.'); if (e.options.length && e.answer && !e.options.some(function (o) { return o.toLowerCase() === e.answer.toLowerCase(); })) errors.push('Задание ' + (i + 1) + ': ответ отсутствует среди вариантов.'); });
    return { meta: meta, text: body.join('\n').trim(), exercises: exercises, errors: errors };
  }
  function inject() {
    var importView = $('#view-import'), library = $('#view-library'), tests = $('#view-tests');
    if (importView && !$('#contentHubImport')) {
      var panel = document.createElement('section'); panel.id = 'contentHubImport'; panel.className = 'ch-panel';
      panel.innerHTML = '<div class="ch-panel__intro"><span class="ch-kicker">ЕДИНЫЙ ИМПОРТЁР · ДОПОЛНИТЕЛЬНЫЕ МАТЕРИАЛЫ</span><h2>Добавить Reading, практику или контрольную</h2><p>Существующий импортёр уроков остаётся без изменений. Здесь загружаются дополнительные материалы.</p></div><div class="ch-form"><label>Тип материала<select id="chType"><option value="reading">Reading & Materials</option><option value="practice">Extra Practice</option><option value="checkpoint">Tests & Checkpoints</option></select></label><label>TXT-файл<input id="chFile" type="file" accept=".txt,text/plain"></label><label>Иллюстрация для Reading <span class="ch-muted">необязательно</span><input id="chImage" type="file" accept="image/*"></label><div class="ch-actions"><button class="ch-btn ch-btn--primary" id="chPreview" type="button">Проверить и показать предпросмотр</button><span id="chStatus" role="status" aria-live="polite"></span></div></div><div id="chPreviewBox" class="ch-preview" hidden></div>';
      var drafts = $('#view-import .import-drafts'); importView.querySelector('.view__inner').insertBefore(panel, drafts || null);
    }
    if (library && !$('#chLibrary')) {
      var sec = document.createElement('section'); sec.id = 'chLibrary'; sec.className = 'ch-library'; sec.innerHTML = '<div class="ch-section-head"><div><span class="ch-kicker">ТВОЯ БИБЛИОТЕКА</span><h2>Мои дополнительные материалы</h2><p>Чтение, тренировка и контрольные — всё в одном месте.</p></div><a class="ch-btn ch-btn--primary" href="#import" data-lingo-open-view="import">＋ Добавить материал</a></div><div class="ch-filter" id="chFilters"><button type="button" class="is-active" data-filter="all">Все</button><button type="button" data-filter="reading">Reading</button><button type="button" data-filter="practice">Extra Practice</button><button type="button" data-filter="checkpoint">Контрольные</button></div><div id="chItems" class="ch-items"></div>';
      library.querySelector('.view__inner').appendChild(sec);
    }
    if (tests && !$('#chTestShelf')) {
      var shelf = document.createElement('section'); shelf.id = 'chTestShelf'; shelf.className = 'ch-test-shelf'; shelf.innerHTML = '<div class="ch-section-head"><div><span class="ch-kicker">ТВОИ ПРОВЕРКИ</span><h2>Контрольные и checkpoints</h2><p>Промежуточные проверки по темам и модулям.</p></div><a class="ch-btn" href="#import" data-lingo-open-view="import">Добавить контрольную</a></div><div id="chTests"></div>';
      tests.querySelector('.view__inner').appendChild(shelf);
    }
    var progress = $('#view-progress');
    if (progress && !$('#chProgressResults')) {
      var resultPanel = document.createElement('section'); resultPanel.id = 'chProgressResults'; resultPanel.className = 'ch-test-shelf'; resultPanel.innerHTML = '<div class="ch-section-head"><div><span class="ch-kicker">ДОПОЛНИТЕЛЬНОЕ ОБУЧЕНИЕ</span><h2>Результаты практики и контрольных</h2><p>Попытки из Reading, Extra Practice и Checkpoints.</p></div></div><div id="chResultList"></div>';
      progress.querySelector('.view__inner').appendChild(resultPanel);
    }
    var lesson = $('#view-lesson .view__inner');
    if (lesson && !$('#chLessonShortcuts')) {
      var shortcuts = document.createElement('nav'); shortcuts.id = 'chLessonShortcuts'; shortcuts.className = 'ch-lesson-shortcuts'; shortcuts.setAttribute('aria-label','Дополнительные материалы к уроку');
      shortcuts.innerHTML = '<span>Продолжить тему:</span><a href="#library" data-lingo-open-view="library">Чтение и материалы</a><a href="#library" data-lingo-open-view="library" data-filter-practice="true">Дополнительная практика</a><a href="#tests" data-lingo-open-view="tests">Проверить знания</a>';
      lesson.insertBefore(shortcuts, lesson.firstChild);
    }
  }
  function preview() {
    var file = $('#chFile') && $('#chFile').files[0], type = $('#chType').value, status = $('#chStatus'), box = $('#chPreviewBox');
    if (!file) { status.textContent = 'Сначала выбери TXT-файл.'; return; }
    if (file.size > 2 * 1024 * 1024) { status.textContent = 'Файл слишком большой. Максимум — 2 МБ.'; return; }
    selectedFile = file; var reader = new FileReader();
    reader.onload = function () {
      var parsed = parseDocument(reader.result, type); window.__chPending = { type: type, parsed: parsed, name: file.name };
      status.textContent = parsed.errors.length ? 'Найдены ошибки — исправь файл перед импортом.' : 'Структура выглядит корректно.';
      box.hidden = false;
      box.innerHTML = '<div class="ch-preview__head"><div><span class="ch-kicker">ПРЕДПРОСМОТР</span><h3>' + esc(parsed.meta.title || file.name) + '</h3><p>' + esc(labels[type]) + ' · ' + esc(parsed.meta.level) + '</p></div><span class="ch-status ' + (parsed.errors.length ? 'is-error' : 'is-ok') + '">' + (parsed.errors.length ? 'Нужны исправления' : 'Готово к импорту') + '</span></div>' + (parsed.text ? '<div class="ch-reading-text">' + esc(parsed.text).replace(/\n/g, '<br>') + '</div>' : '') + (parsed.exercises.length ? '<div class="ch-exercises">' + parsed.exercises.map(function (e, i) { return '<article><b>' + (i + 1) + '. ' + esc(e.question) + '</b><p>' + esc(e.options.join(' · ')) + '</p></article>'; }).join('') + '</div>' : '') + (parsed.errors.length ? '<ul class="ch-errors">' + parsed.errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '<button type="button" class="ch-btn ch-btn--primary" id="chConfirm">Импортировать материал</button>');
      var confirmBtn = $('#chConfirm'); if (confirmBtn) confirmBtn.addEventListener('click', confirmImport);
    };
    reader.onerror = function () { status.textContent = 'Не удалось прочитать файл.'; };
    reader.readAsText(file, 'UTF-8');
  }
  function confirmImport() {
    var p = window.__chPending; if (!p || p.parsed.errors.length) return;
    var image = currentImage;
    var record = { id: id(), type: p.type, title: p.parsed.meta.title, level: p.parsed.meta.level, topic: p.parsed.meta.topic, description: p.parsed.meta.description, text: p.parsed.text, exercises: p.parsed.exercises, image: image, createdAt: Date.now(), source: p.name };
    var all = items(); all.unshift(record); save(KEY, all); window.__chPending = null; $('#chStatus').textContent = 'Материал добавлен в библиотеку.'; $('#chPreviewBox').hidden = true; $('#chFile').value = ''; currentImage = null; render();
  }
  function render() {
    var all = items(), target = $('#chItems'), tests = $('#chTests');
    if (target) target.innerHTML = all.length ? all.map(function (r) { return '<article class="ch-item"><div class="ch-item__top"><span class="ch-type ch-type--' + r.type + '">' + esc(labels[r.type]) + '</span><span>' + esc(r.level) + '</span></div><h3>' + esc(r.title) + '</h3><p>' + esc(r.description || r.topic || (r.text || '').slice(0, 120)) + '</p><div class="ch-item__actions"><button type="button" data-open="' + esc(r.id) + '">Открыть</button><button type="button" data-delete="' + esc(r.id) + '" aria-label="Удалить ' + esc(r.title) + '">Удалить</button></div></article>'; }).join('') : '<p class="ch-empty">Пока нет дополнительных материалов. Добавь первый TXT через единый импортёр.</p>';
    if (tests) { var checks = all.filter(function (r) { return r.type === 'checkpoint'; }); tests.innerHTML = checks.length ? checks.map(function (r) { return '<article class="ch-test-row"><div><b>' + esc(r.title) + '</b><span>' + esc(r.level) + ' · ' + r.exercises.length + ' заданий</span></div><button type="button" data-open="' + esc(r.id) + '">Пройти</button></article>'; }).join('') : '<p class="ch-empty">Контрольных пока нет — их можно добавить через импортёр.</p>'; }
    var resultTarget = $('#chResultList'); if (resultTarget) { var results = read(RESULTS, []); resultTarget.innerHTML = results.length ? results.slice(0,12).map(function (r) { return '<div class="ch-test-row"><div><b>' + esc(r.title) + '</b><span>' + esc(labels[r.type] || r.type) + ' · ' + new Date(r.at).toLocaleDateString() + '</span></div><strong>' + (r.total ? r.correct + '/' + r.total + ' · ' + r.percent + '%' : 'Открытые ответы') + '</strong></div>'; }).join('') : '<p class="ch-empty">Результаты появятся после первой попытки.</p>'; }
    if (window.lucide) window.lucide.createIcons();
  }
  function openMaterial(key) {
    var r = items().find(function (x) { return x.id === key; }); if (!r) return;
    var old = $('#chReader'); if (old) old.remove();
    var modal = document.createElement('div'); modal.id = 'chReader'; modal.className = 'ch-reader'; modal.innerHTML = '<div class="ch-reader__dialog" role="dialog" aria-modal="true" aria-labelledby="chReaderTitle"><button type="button" class="ch-reader__close" id="chClose" aria-label="Закрыть">×</button><span class="ch-kicker">' + esc(labels[r.type]) + ' · ' + esc(r.level) + '</span><h2 id="chReaderTitle">' + esc(r.title) + '</h2>' + (r.image ? '<img class="ch-reader__image" src="' + esc(r.image) + '" alt="Иллюстрация к материалу">' : '') + (r.description ? '<p class="ch-reader__desc">' + esc(r.description) + '</p>' : '') + (r.text ? '<div class="ch-reader__text">' + esc(r.text).replace(/\n/g, '<br>') + '</div>' : '') + '<div id="chReaderQuestions">' + r.exercises.map(function (e, i) { return '<fieldset class="ch-question" data-q="' + i + '"><legend>' + (i + 1) + '. ' + esc(e.question) + '</legend>' + e.options.map(function (o) { return '<label><input type="radio" name="chq' + i + '" value="' + esc(o) + '"> ' + esc(o) + '</label>'; }).join('') + (e.options.length ? '' : '<input class="ch-answer" type="text" aria-label="Ответ">') + '<p class="ch-feedback" hidden></p></fieldset>'; }).join('') + '</div>' + (r.exercises.length ? '<button type="button" class="ch-btn ch-btn--primary" id="chCheck">Проверить ответы</button><p id="chScore" role="status"></p>' : '') + '</div>';
    document.body.appendChild(modal); $('#chClose').addEventListener('click', function () { modal.remove(); }); modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    var check = $('#chCheck'); if (check) check.addEventListener('click', function () { var correct = 0, graded = 0, result = read(RESULTS, []); r.exercises.forEach(function (q, i) { var field = $('.ch-question[data-q="' + i + '"]', modal), chosen = $('input[type="radio"]:checked', field), typed = $('.ch-answer', field), answer = chosen ? chosen.value : typed ? typed.value.trim() : '', fb = $('.ch-feedback', field); fb.hidden = false; if (!q.answer) { fb.textContent = 'Ответ для самостоятельной проверки.' + (q.explanation ? ' ' + q.explanation : ''); return; } graded++; var ok = answer.toLowerCase() === q.answer.toLowerCase(); if (ok) correct++; fb.textContent = (ok ? 'Верно. ' : 'Правильный ответ: ' + q.answer + '. ') + (q.explanation || ''); }); var percent = graded ? Math.round(correct / graded * 100) : 0; $('#chScore').textContent = graded ? 'Результат: ' + correct + ' из ' + graded + ' проверяемых заданий (' + percent + '%). Остальные ответы проверь самостоятельно.' : 'В этом материале нет заданий с автоматической проверкой.'; result.unshift({ id: id(), materialId: r.id, title: r.title, type: r.type, correct: correct, total: graded, percent: percent, at: Date.now() }); save(RESULTS, result); render(); });
  }
  document.addEventListener('click', function (e) { var open = e.target.closest('[data-open]'), del = e.target.closest('[data-delete]'), filter = e.target.closest('[data-filter]'); if (open) openMaterial(open.dataset.open); if (del) { if (confirm('Удалить этот материал? История результатов останется.')) { save(KEY, items().filter(function (r) { return r.id !== del.dataset.delete; })); render(); } } if (filter) { $('#chFilters').querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-active', b === filter); }); var f = filter.dataset.filter; $$('.ch-item', $('#chItems')).forEach(function (el) { el.hidden = f !== 'all' && !el.querySelector('.ch-type--' + f); }); } });
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function init() {
    inject(); render();
    var previewBtn = $('#chPreview'); if (previewBtn) previewBtn.addEventListener('click', preview);
    var img = $('#chImage'); if (img) img.addEventListener('change', function () { var file = img.files[0]; if (!file) { currentImage = null; return; } if (!/^image\//.test(file.type) || file.size > 1024 * 1024) { $('#chStatus').textContent = 'Изображение должно быть до 1 МБ.'; img.value = ''; return; } var reader = new FileReader(); reader.onload = function () { currentImage = reader.result; }; reader.readAsDataURL(file); });
    document.querySelectorAll('[data-lingo-open-view="import"]').forEach(function (a) { a.addEventListener('click', function () { setTimeout(inject, 0); }); });
    var nav = $('#view-library'); if (nav) { var observer = new MutationObserver(render); observer.observe(nav, { attributes: true, attributeFilter: ['hidden', 'class'] }); }
  }
  window.LingoStudio = window.LingoStudio || {}; window.LingoStudio.contentHub = { key: KEY, resultsKey: RESULTS, list: items, parse: parseDocument, render: render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
