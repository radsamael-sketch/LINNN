/* Lingo Studio redesign layer: dashboard widgets, vocabulary flashcards,
   lesson checks overview and real progress. Uses only existing local data. */
(function () {
  'use strict';

  var K = {
    pomo: 'lingo-studio.pomodoro',
    review: 'lingo-studio.vocabReview',
    userVocab: 'lingo-studio.userVocab',
    activity: 'lingo-studio.activityLog',
    lessons: 'lingo-studio.lessonProgress'
  };
  function read(k, f) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? f : v; } catch (e) { return f; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function lang() { return window.__lingoGetLang ? window.__lingoGetLang() : 'ru'; }
  function icons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  /* ---------------- i18n ---------------- */
  var T = {
    ru: {
      'dash.today': 'Твоя студия сегодня', 'dash.hello': 'Привет', 'dash.sub': 'Немного практики каждый день — и английский становится частью жизни.',
      'dash.editName': 'Изменить имя', 'common.save': 'Сохранить', 'common.cancel': 'Отмена',
      'dash.continue': 'Продолжить обучение', 'dash.continueCta': 'Продолжить', 'dash.startCta': 'Начать',
      'dash.noLesson': 'Начни с первого урока', 'dash.lessonPct': '{p}% урока', 'dash.notStarted': 'Ещё не начат',
      'pomo.title': 'Помодоро', 'pomo.start': 'Старт', 'pomo.pause': 'Пауза', 'pomo.reset': 'Сброс',
      'pomo.ready': 'готов', 'pomo.running': 'идёт', 'pomo.paused': 'пауза', 'pomo.done': 'готово!',
      'clock.title': 'Местное время', 'word.title': 'Слово дня', 'word.empty': 'В словаре пока нет слов. Они появятся из уроков или когда ты добавишь своё.',
      'dash.progressEyebrow': 'Траектория', 'dash.progressTitle': 'Прогресс обучения',
      'st.lessons': 'уроков пройдено', 'st.total': 'всего уроков', 'st.words': 'слов выучено', 'st.vocab': 'слов в словаре',
      'plan.eyebrow': 'Сегодня', 'plan.title': 'План на день', 'plan.count': '{d} из {t}',
      'plan.lesson': 'Урок: {t}', 'plan.lessonMeta': '{m} · {d}', 'plan.lessonDone': 'Урок пройден сегодня',
      'plan.words': 'Повторить слова на карточках', 'plan.wordsMeta': '{n} на повторении', 'plan.wordsNone': 'Нет слов для повторения',
      'plan.check': 'Улучшить результат: {t}', 'plan.checkMeta': 'Сейчас {p}%', 'plan.empty': 'Всё сделано — отличная работа!',
      'quote.next': 'Другая фраза',
      'v.deck': 'Карточки', 'v.all': 'Все', 'v.learning': 'Повторить', 'v.new': 'Новые', 'v.shuffle': 'Перемешать',
      'v.flip': 'Нажми, чтобы перевернуть', 'v.know': 'Знаю', 'v.again': 'Ещё раз', 'v.prev': 'Назад', 'v.next': 'Дальше',
      'v.words': 'Все слова', 'v.search': 'Поиск слова или перевода…', 'v.add': 'Добавить слово',
      'v.f.word': 'Слово (англ.)', 'v.f.tr': 'Перевод', 'v.f.pron': 'Произношение (необяз.)', 'v.f.ex': 'Пример (необяз.)',
      'v.f.err': 'Укажи слово и перевод', 'v.empty': 'Слов пока нет. Добавь своё или пройди урок со словарём.',
      'v.noMatch': 'Ничего не найдено', 'v.deckEmpty': 'В этой подборке нет карточек.', 'v.s.known': 'знаю', 'v.s.learning': 'учу',
      'v.mine': 'Моё слово', 'v.del': 'Удалить',
      't.title': 'Проверочные задания уроков', 't.sub': 'Упражнения из уроков с автоматической проверкой. Результат сохраняется в прогрессе.',
      't.ex': '{n} упражн.', 't.open': 'Открыть', 't.retry': 'Пройти снова', 't.none': 'Пока нет уроков с упражнениями.', 't.nores': '—',
      'prog.title': 'Твой путь в цифрах', 'prog.sub': 'Только реальные данные из твоих занятий на этом устройстве.',
      'p.overall': 'общий прогресс', 'p.lessons': 'уроков пройдено', 'p.avg': 'средний результат', 'p.words': 'слов выучено',
      'p.levels': 'По уровням', 'p.week': 'Активность за 7 дней', 'p.history': 'История занятий', 'p.noHistory': 'История появится после первых занятий.',
      'p.done': 'пройден', 'p.open': 'открыт', 'p.weekEmpty': 'Пока нет активности на этой неделе.'
    },
    en: {
      'dash.today': 'Your studio today', 'dash.hello': 'Hi', 'dash.sub': 'A little practice every day, and English becomes part of your life.',
      'dash.editName': 'Edit name', 'common.save': 'Save', 'common.cancel': 'Cancel',
      'dash.continue': 'Continue learning', 'dash.continueCta': 'Continue', 'dash.startCta': 'Start',
      'dash.noLesson': 'Start with the first lesson', 'dash.lessonPct': '{p}% of lesson', 'dash.notStarted': 'Not started yet',
      'pomo.title': 'Pomodoro', 'pomo.start': 'Start', 'pomo.pause': 'Pause', 'pomo.reset': 'Reset',
      'pomo.ready': 'ready', 'pomo.running': 'running', 'pomo.paused': 'paused', 'pomo.done': 'done!',
      'clock.title': 'Local time', 'word.title': 'Word of the day', 'word.empty': 'No words in your vocabulary yet. They appear from lessons or when you add your own.',
      'dash.progressEyebrow': 'Trajectory', 'dash.progressTitle': 'Learning progress',
      'st.lessons': 'lessons completed', 'st.total': 'lessons total', 'st.words': 'words learned', 'st.vocab': 'words in vocabulary',
      'plan.eyebrow': 'Today', 'plan.title': "Today's plan", 'plan.count': '{d} of {t}',
      'plan.lesson': 'Lesson: {t}', 'plan.lessonMeta': '{m} · {d}', 'plan.lessonDone': 'Lesson completed today',
      'plan.words': 'Review words with flashcards', 'plan.wordsMeta': '{n} to review', 'plan.wordsNone': 'No words to review',
      'plan.check': 'Improve your score: {t}', 'plan.checkMeta': 'Currently {p}%', 'plan.empty': 'All done — great work!',
      'quote.next': 'Another phrase',
      'v.deck': 'Flashcards', 'v.all': 'All', 'v.learning': 'Review', 'v.new': 'New', 'v.shuffle': 'Shuffle',
      'v.flip': 'Click to flip', 'v.know': 'I know it', 'v.again': 'Again', 'v.prev': 'Back', 'v.next': 'Next',
      'v.words': 'All words', 'v.search': 'Search a word or translation…', 'v.add': 'Add word',
      'v.f.word': 'Word (English)', 'v.f.tr': 'Translation', 'v.f.pron': 'Pronunciation (optional)', 'v.f.ex': 'Example (optional)',
      'v.f.err': 'Enter a word and translation', 'v.empty': 'No words yet. Add your own or complete a lesson with vocabulary.',
      'v.noMatch': 'Nothing found', 'v.deckEmpty': 'No cards in this selection.', 'v.s.known': 'known', 'v.s.learning': 'learning',
      'v.mine': 'My word', 'v.del': 'Delete',
      't.title': 'Lesson checks', 't.sub': 'Exercises from your lessons with automatic checking. Results are saved to your progress.',
      't.ex': '{n} exercises', 't.open': 'Open', 't.retry': 'Try again', 't.none': 'No lessons with exercises yet.', 't.nores': '—',
      'prog.title': 'Your journey in numbers', 'prog.sub': 'Only real data from your own study sessions on this device.',
      'p.overall': 'overall progress', 'p.lessons': 'lessons completed', 'p.avg': 'average score', 'p.words': 'words learned',
      'p.levels': 'By level', 'p.week': 'Activity, last 7 days', 'p.history': 'Study history', 'p.noHistory': 'History appears after your first sessions.',
      'p.done': 'completed', 'p.open': 'opened', 'p.weekEmpty': 'No activity this week yet.'
    }
  };
  function L(key, params) {
    var v = (T[lang()] || T.ru)[key]; if (v == null) v = T.en[key] || key;
    if (params) Object.keys(params).forEach(function (p) { v = v.split('{' + p + '}').join(params[p]); });
    return v;
  }
  function applyLr(root) { (root || document).querySelectorAll('[data-lr]').forEach(function (el) { el.textContent = L(el.getAttribute('data-lr')); }); }

  var QUOTES = {
    ru: [['Маленькие шаги каждый день дают большие результаты.', ''], ['Язык — это дорожная карта культуры.', 'Рита Мэй Браун'], ['Ошибки — доказательство того, что ты пробуешь.', ''], ['Пределы моего языка означают пределы моего мира.', 'Людвиг Витгенштейн'], ['Не бойся медленного движения, бойся стоять на месте.', 'Китайская пословица'], ['Учиться никогда не поздно.', ''], ['Начни там, где ты есть. Используй то, что имеешь.', 'Артур Эш']],
    en: [['Small steps every day add up to big results.', ''], ['Language is the road map of a culture.', 'Rita Mae Brown'], ['Mistakes are proof that you are trying.', ''], ['The limits of my language mean the limits of my world.', 'Ludwig Wittgenstein'], ['Be not afraid of growing slowly, be afraid only of standing still.', 'Chinese proverb'], ["It's never too late to learn.", ''], ['Start where you are. Use what you have.', 'Arthur Ashe']]
  };
  var quoteOffset = 0;

  /* ---------------- data ---------------- */
  function program() { return window.__PROGRAM_DATA || []; }
  function allLessons() {
    var out = [];
    program().forEach(function (lv) { (lv.modules || []).forEach(function (m) { (m.lessons || []).forEach(function (l) { out.push({ level: lv, module: m, lesson: l }); }); }); });
    return out;
  }
  function lessonProg() { return read(K.lessons, {}) || {}; }
  function contentOf(id) {
    var imp = window.__IMPORTED_LESSON_CONTENT || {}; if (imp[id]) return imp[id];
    var lc = window.__LESSON_CONTENT || {}; return lc[id] || null;
  }
  function logActivity(type, id) {
    var log = read(K.activity, []); log.push({ t: Date.now(), type: type, id: id || '' });
    if (log.length > 500) log = log.slice(-500); write(K.activity, log);
  }

  function parseRight(right) {
    var parts = String(right || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    var r = { translation: parts.shift() || '', pron: '', example: '' };
    parts.forEach(function (p) { if (!r.pron && /^[\/\[]/.test(p)) r.pron = p; else if (!r.example) r.example = p; });
    return r;
  }
  function vocabulary() {
    var seen = {}, out = [];
    function add(w, src) {
      if (!w.word || !w.translation) return;
      var key = w.word.toLowerCase().trim(); if (seen[key]) return; seen[key] = 1;
      w.key = key; w.src = src; out.push(w);
    }
    allLessons().forEach(function (x) {
      var c = contentOf(x.lesson.id); if (!c || !Array.isArray(c.blocks)) return;
      c.blocks.forEach(function (b) {
        if (b.type !== 'vocabulary') return;
        (b.items || []).forEach(function (it) { if (it && it.word) add({ word: String(it.word), translation: String(it.translation || ''), pron: it.pronunciation || it.ipa || '', example: it.example || '' }, x.lesson.title); });
        (b.rows || []).forEach(function (r) { if (r && r.left) { var p = parseRight(r.right); add({ word: String(r.left), translation: p.translation, pron: p.pron, example: p.example }, x.lesson.title); } });
      });
    });
    (read(K.userVocab, []) || []).forEach(function (w) { add({ word: w.word, translation: w.translation, pron: w.pron || '', example: w.example || '', mine: true }, ''); });
    return out;
  }
  function reviewState() { return read(K.review, {}) || {}; }
  function statusOf(key) { var s = reviewState()[key]; return s ? s.status : 'new'; }

  function stats() {
    var lp = lessonProg(), list = allLessons(), done = 0, scores = [];
    list.forEach(function (x) { var p = lp[x.lesson.id]; if (p && p.completed) done++; if (p && typeof p.percent === 'number' && p.updated) scores.push(p.percent); });
    var vocab = vocabulary(), rs = reviewState(), known = 0;
    vocab.forEach(function (w) { if (rs[w.key] && rs[w.key].status === 'known') known++; });
    return {
      total: list.length, done: done, pct: list.length ? Math.round(done / list.length * 100) : 0,
      avg: scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : null,
      vocab: vocab.length, known: known
    };
  }

  function nextLesson() {
    var lp = lessonProg(), last = null;
    Object.keys(lp).forEach(function (id) { var p = lp[id]; if (p && p.updated && (!last || p.updated > last.updated)) last = { id: id, updated: p.updated, percent: p.percent || 0, completed: p.completed }; });
    var list = allLessons(), found = null;
    if (last) list.forEach(function (x) { if (x.lesson.id === last.id) found = x; });
    if (found && !last.completed) return { item: found, pct: last.percent || 0, started: true };
    var start = found ? list.indexOf(found) + 1 : 0;
    for (var i = start; i < list.length; i++) {
      var x = list[i], p = lp[x.lesson.id];
      if ((p && p.completed) || x.lesson.status === 'locked') continue;
      return { item: x, pct: p ? p.percent || 0 : 0, started: !!p };
    }
    return found ? { item: found, pct: 100, started: true } : null;
  }

  function openLesson(id) {
    if (typeof window.__openLesson === 'function') window.__openLesson(id);
    else location.hash = 'lesson/' + encodeURIComponent(id);
  }
  function goSection(s) {
    var link = document.querySelector('.sidebar__link[data-section="' + s + '"]');
    if (link) link.click(); else if (window.__lingoSetActiveSection) window.__lingoSetActiveSection(s);
  }

  /* ---------------- dashboard ---------------- */
  function renderContinue() {
    var n = nextLesson(), title = $('#continue-title'), meta = $('#lrContinueMeta'), bar = $('#lrContinueBar'), btn = $('#continueBtn');
    if (!title) return;
    if (!n) { title.textContent = L('dash.noLesson'); meta.textContent = ''; bar.style.width = '0%'; return; }
    title.textContent = n.item.lesson.title;
    meta.textContent = n.item.level.code + ' · ' + n.item.module.title + ' · ' + (n.started ? L('dash.lessonPct', { p: n.pct }) : L('dash.notStarted'));
    bar.style.width = n.pct + '%';
    var span = btn && btn.querySelector('span'); if (span) span.textContent = L(n.started ? 'dash.continueCta' : 'dash.startCta');
  }

  function renderProgressCard() {
    var s = stats(), el = $('#lrDashStats'); if (!el) return;
    var ring = $('.lr-progress .progress-ring__value'); if (ring) ring.style.strokeDashoffset = String(326.72 * (1 - s.pct / 100));
    var num = $('.lr-progress .progress-ring__number'); if (num) num.textContent = s.pct + '%';
    el.innerHTML = [[s.done, 'st.lessons'], [s.total, 'st.total'], [s.known, 'st.words'], [s.vocab, 'st.vocab']].map(function (r) {
      return '<div><dt>' + esc(L(r[1])) + '</dt><dd>' + r[0] + '</dd></div>';
    }).join('');
  }

  function renderPlan() {
    var list = $('#lrPlanList'); if (!list) return;
    var items = [], lp = lessonProg(), today = dayKey(), n = nextLesson();
    var doneToday = Object.keys(lp).filter(function (id) { var p = lp[id]; return p && p.completed && p.updated && dayKey(new Date(p.updated)) === today; });
    if (n && n.pct < 100) items.push({ icon: 'book-open', tone: 'peach', title: L('plan.lesson', { t: n.item.lesson.title }), meta: L('plan.lessonMeta', { m: n.item.module.title, d: n.item.lesson.duration || n.item.level.code }), done: false, act: function () { openLesson(n.item.lesson.id); } });
    if (doneToday.length) items.push({ icon: 'check', tone: 'peach', title: L('plan.lessonDone'), meta: doneToday.length + '', done: true, act: function () { goSection('progress'); } });
    var vocab = vocabulary(), toReview = vocab.filter(function (w) { return statusOf(w.key) !== 'known'; }).length;
    var reviewedToday = (read(K.activity, []) || []).some(function (a) { return a.type === 'card' && dayKey(new Date(a.t)) === today; });
    if (vocab.length) items.push({ icon: 'layers', tone: 'sky', title: L('plan.words'), meta: toReview ? L('plan.wordsMeta', { n: toReview }) : L('plan.wordsNone'), done: reviewedToday || !toReview, act: function () { goSection('vocabulary'); } });
    var weak = null;
    allLessons().forEach(function (x) { var p = lp[x.lesson.id]; if (!weak && p && p.updated && typeof p.percent === 'number' && p.percent > 0 && p.percent < 100 && (!n || x.lesson.id !== n.item.lesson.id)) weak = { x: x, p: p.percent }; });
    if (weak) items.push({ icon: 'target', tone: 'lav', title: L('plan.check', { t: weak.x.lesson.title }), meta: L('plan.checkMeta', { p: weak.p }), done: false, act: function () { openLesson(weak.x.lesson.id); } });
    list.innerHTML = '';
    if (!items.length) { list.innerHTML = '<li class="lr-empty">' + esc(L('plan.empty')) + '</li>'; }
    items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = 'lr-plan__item' + (it.done ? ' is-done' : ''); li.tabIndex = 0;
      li.innerHTML = '<span class="lr-plan__check">' + (it.done ? '<i data-lucide="check"></i>' : '') + '</span>' +
        '<span class="lr-plan__icon lr-plan__icon--' + it.tone + '"><i data-lucide="' + it.icon + '"></i></span>' +
        '<span class="lr-plan__text"><span class="lr-plan__title">' + esc(it.title) + '</span><span class="lr-plan__meta">' + esc(it.meta) + '</span></span>';
      li.addEventListener('click', it.act);
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') it.act(); });
      list.appendChild(li);
    });
    var c = $('#lrPlanCount'); if (c) c.textContent = L('plan.count', { d: items.filter(function (i) { return i.done; }).length, t: items.length });
    icons();
  }

  function wordOfDay() {
    var v = vocabulary(); if (!v.length) return null;
    var d = new Date(), seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
    return v[seed % v.length];
  }
  function renderWord() {
    var body = $('#lrWordBody'); if (!body) return;
    var w = wordOfDay();
    if (!w) { body.innerHTML = '<p class="lr-empty">' + esc(L('word.empty')) + '</p>'; return; }
    body.innerHTML = '<div class="lr-word__term">' + esc(w.word) + '</div>' + (w.pron ? '<div class="lr-word__pron">' + esc(w.pron) + '</div>' : '') +
      '<div class="lr-word__tr">' + esc(w.translation) + '</div>' + (w.example ? '<div class="lr-word__ex">' + esc(w.example) + '</div>' : '');
  }

  function renderQuote() {
    var el = $('#lrQuoteText'); if (!el) return;
    var list = QUOTES[lang()] || QUOTES.ru, d = new Date();
    var idx = (Math.floor(d.getTime() / 864e5) + quoteOffset) % list.length;
    var q = list[idx]; el.innerHTML = esc(q[0]) + (q[1] ? '<cite>— ' + esc(q[1]) + '</cite>' : '');
  }

  /* Clock */
  function tickClock() {
    var t = $('#lrClockTime'); if (!t) return;
    var now = new Date(), loc = lang() === 'ru' ? 'ru-RU' : 'en-GB';
    t.textContent = now.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('#lrClockDate').textContent = now.toLocaleDateString(lang() === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    try { $('#lrClockTz').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
  }

  /* Pomodoro (state kept locally) */
  var POMO_LEN = 25 * 60 * 1000;
  function pomo() { return read(K.pomo, null) || { running: false, remaining: POMO_LEN, endAt: 0 }; }
  function pomoRemaining(p) { return p.running ? Math.max(0, p.endAt - Date.now()) : p.remaining; }
  function renderPomo() {
    var p = pomo(), rem = pomoRemaining(p), el = $('#lrPomoTime'); if (!el) return;
    if (p.running && rem <= 0) { p = { running: false, remaining: 0, endAt: 0, finished: true }; write(K.pomo, p); logActivity('pomodoro'); }
    var s = Math.ceil(rem / 1000); el.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    $('#lrPomoBar').style.width = ((1 - rem / POMO_LEN) * 100) + '%';
    var state = p.finished && rem <= 0 ? 'pomo.done' : p.running ? 'pomo.running' : rem < POMO_LEN ? 'pomo.paused' : 'pomo.ready';
    $('#lrPomoState').textContent = L(state);
    $('#lrPomoStart').disabled = p.running || rem <= 0; $('#lrPomoPause').disabled = !p.running; $('#lrPomoReset').disabled = !p.running && rem >= POMO_LEN;
  }
  function bindPomo() {
    $('#lrPomoStart').addEventListener('click', function () { var p = pomo(), rem = pomoRemaining(p); if (rem <= 0) return; write(K.pomo, { running: true, endAt: Date.now() + rem, remaining: rem }); renderPomo(); });
    $('#lrPomoPause').addEventListener('click', function () { var p = pomo(); write(K.pomo, { running: false, remaining: pomoRemaining(p), endAt: 0 }); renderPomo(); });
    $('#lrPomoReset').addEventListener('click', function () { write(K.pomo, { running: false, remaining: POMO_LEN, endAt: 0 }); renderPomo(); });
  }

  function renderDashboard() { renderContinue(); renderProgressCard(); renderPlan(); renderWord(); renderQuote(); tickClock(); renderPomo(); }

  /* ---------------- vocabulary ---------------- */
  var V = { mode: 'all', order: null, idx: 0, flipped: false, q: '', adding: false, focusKey: null };
  function deck() {
    var all = vocabulary();
    var list = all.filter(function (w) { var s = statusOf(w.key); return V.mode === 'all' || (V.mode === 'learning' && s !== 'known') || (V.mode === 'new' && s === 'new'); });
    if (V.order) { var pos = {}; V.order.forEach(function (k, i) { pos[k] = i; }); list.sort(function (a, b) { return (pos[a.key] == null ? 1e9 : pos[a.key]) - (pos[b.key] == null ? 1e9 : pos[b.key]); }); }
    return list;
  }
  function renderVocab() {
    var root = $('#lrVocab'); if (!root) return;
    var all = vocabulary(), d = deck();
    if (V.focusKey) { var fi = d.findIndex(function (w) { return w.key === V.focusKey; }); if (fi < 0) { V.mode = 'all'; d = deck(); fi = d.findIndex(function (w) { return w.key === V.focusKey; }); } if (fi >= 0) V.idx = fi; V.focusKey = null; V.flipped = false; }
    if (V.idx >= d.length) V.idx = Math.max(0, d.length - 1);
    var w = d[V.idx], st = w ? statusOf(w.key) : 'new';
    var modes = ['all', 'learning', 'new'].map(function (m) { return '<button type="button" class="lr-btn lr-btn--ghost lr-btn--sm' + (V.mode === m ? ' is-on' : '') + '" data-mode="' + m + '">' + esc(L('v.' + m)) + '</button>'; }).join('');
    var card = w ? '<button type="button" class="lr-flash' + (V.flipped ? ' is-flipped' : '') + '" id="lrFlash" aria-label="' + esc(L('v.flip')) + '"><div class="lr-flash__inner">' +
      '<div class="lr-flash__face lr-flash__face--front">' + (w.src || w.mine ? '<span class="lr-flash__src">' + esc(w.mine ? L('v.mine') : w.src) + '</span>' : '') + '<div class="lr-flash__word">' + esc(w.word) + '</div>' + (w.pron ? '<div class="lr-flash__pron">' + esc(w.pron) + '</div>' : '') + '<span class="lr-flash__hint">' + esc(L('v.flip')) + '</span></div>' +
      '<div class="lr-flash__face lr-flash__face--back"><div class="lr-flash__tr">' + esc(w.translation) + '</div>' + (w.example ? '<div class="lr-flash__ex">' + esc(w.example) + '</div>' : '') + (st !== 'new' ? '<span class="lr-chip lr-status--' + st + '">' + esc(L('v.s.' + st)) + '</span>' : '') + '</div>' +
      '</div></button>' : '<div class="lr-flash"><div class="lr-flash__face lr-flash__face--front" style="position:relative;height:100%"><p class="lr-empty">' + esc(all.length ? L('v.deckEmpty') : L('v.empty')) + '</p></div></div>';
    var q = V.q.toLowerCase();
    var filtered = all.filter(function (x) { return !q || x.word.toLowerCase().indexOf(q) >= 0 || x.translation.toLowerCase().indexOf(q) >= 0; });
    root.innerHTML =
      '<div class="lr-vocab">' +
      '<section class="lr-card lr-deck"><div class="lr-deck__head"><h2 class="lr-h2">' + esc(L('v.deck')) + '</h2><div class="lr-deck__modes">' + modes +
      '<button type="button" class="lr-btn lr-btn--ghost lr-btn--sm" id="lrShuffle"><i data-lucide="shuffle"></i>' + esc(L('v.shuffle')) + '</button></div></div>' + card +
      '<div class="lr-deck__rate"><button type="button" class="lr-btn lr-btn--again" id="lrAgain"' + (w ? '' : ' disabled') + '><i data-lucide="rotate-ccw"></i>' + esc(L('v.again')) + '</button>' +
      '<button type="button" class="lr-btn lr-btn--know" id="lrKnow"' + (w ? '' : ' disabled') + '><i data-lucide="check"></i>' + esc(L('v.know')) + '</button></div>' +
      '<div class="lr-deck__nav"><button type="button" class="lr-btn lr-btn--ghost lr-btn--sm" id="lrPrev"' + (V.idx > 0 ? '' : ' disabled') + '><i data-lucide="arrow-left"></i>' + esc(L('v.prev')) + '</button>' +
      '<span class="lr-deck__count">' + (d.length ? (V.idx + 1) + ' / ' + d.length : '0 / 0') + '</span>' +
      '<button type="button" class="lr-btn lr-btn--ghost lr-btn--sm" id="lrNext"' + (V.idx < d.length - 1 ? '' : ' disabled') + '>' + esc(L('v.next')) + '<i data-lucide="arrow-right"></i></button></div></section>' +
      '<section class="lr-card lr-words"><div class="lr-deck__head" style="margin-bottom:.8rem"><h2 class="lr-h2">' + esc(L('v.words')) + ' <span class="lr-chip">' + all.length + '</span></h2>' +
      '<button type="button" class="lr-btn lr-btn--accent lr-btn--sm" id="lrAddToggle"><i data-lucide="plus"></i>' + esc(L('v.add')) + '</button></div>' +
      (V.adding ? '<form class="lr-addform" id="lrAddForm" novalidate><input class="lr-input" name="word" placeholder="' + esc(L('v.f.word')) + '" maxlength="60"><input class="lr-input" name="translation" placeholder="' + esc(L('v.f.tr')) + '" maxlength="80"><input class="lr-input" name="pron" placeholder="' + esc(L('v.f.pron')) + '" maxlength="60"><input class="lr-input" name="example" placeholder="' + esc(L('v.f.ex')) + '" maxlength="160"><div class="lr-addform__actions"><span class="lr-addform__err" id="lrAddErr"></span><button type="button" class="lr-btn lr-btn--ghost lr-btn--sm" id="lrAddCancel">' + esc(L('common.cancel')) + '</button><button type="submit" class="lr-btn lr-btn--primary lr-btn--sm">' + esc(L('common.save')) + '</button></div></form>' : '') +
      '<div class="lr-words__tools"><input type="search" class="lr-input" id="lrVSearch" placeholder="' + esc(L('v.search')) + '" value="' + esc(V.q) + '"></div>' +
      '<ul class="lr-words__list">' + (filtered.length ? filtered.map(function (x) {
        var s = statusOf(x.key);
        return '<li class="lr-wordrow' + (w && w.key === x.key ? ' is-current' : '') + '" data-key="' + esc(x.key) + '"><span class="lr-wordrow__w">' + esc(x.word) + '</span>' +
          '<span class="lr-wordrow__s">' + (s !== 'new' ? '<span class="lr-chip lr-status--' + s + '">' + esc(L('v.s.' + s)) + '</span>' : '') + (x.mine ? ' <button type="button" class="lr-del" data-del="' + esc(x.key) + '" aria-label="' + esc(L('v.del')) + '"><i data-lucide="trash-2"></i></button>' : '') + '</span>' +
          '<span class="lr-wordrow__t">' + esc(x.translation) + '</span></li>';
      }).join('') : '<li class="lr-empty">' + esc(all.length ? L('v.noMatch') : L('v.empty')) + '</li>') + '</ul></section></div>';
    bindVocab(d);
    icons();
  }
  function rate(d, status) {
    var w = d[V.idx]; if (!w) return;
    var rs = reviewState(); rs[w.key] = { status: status, at: Date.now(), n: ((rs[w.key] && rs[w.key].n) || 0) + 1 }; write(K.review, rs);
    logActivity('card', w.key);
    var nd = deck();
    if (V.mode === 'all' || (V.mode === 'learning' && status !== 'known')) V.idx = Math.min(V.idx + 1, nd.length - 1);
    V.flipped = false; renderVocab();
  }
  function bindVocab(d) {
    var root = $('#lrVocab');
    var flash = $('#lrFlash'); if (flash) flash.addEventListener('click', function () { V.flipped = !V.flipped; flash.classList.toggle('is-flipped', V.flipped); });
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { V.mode = b.getAttribute('data-mode'); V.idx = 0; V.flipped = false; renderVocab(); }); });
    $('#lrShuffle').addEventListener('click', function () { var keys = vocabulary().map(function (w) { return w.key; }); for (var i = keys.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = keys[i]; keys[i] = keys[j]; keys[j] = t; } V.order = keys; V.idx = 0; V.flipped = false; renderVocab(); });
    $('#lrPrev').addEventListener('click', function () { V.idx--; V.flipped = false; renderVocab(); });
    $('#lrNext').addEventListener('click', function () { V.idx++; V.flipped = false; renderVocab(); });
    $('#lrKnow').addEventListener('click', function () { rate(d, 'known'); });
    $('#lrAgain').addEventListener('click', function () { rate(d, 'learning'); });
    $('#lrAddToggle').addEventListener('click', function () { V.adding = !V.adding; renderVocab(); if (V.adding) { var i = root.querySelector('#lrAddForm input'); if (i) i.focus(); } });
    var form = $('#lrAddForm');
    if (form) {
      $('#lrAddCancel').addEventListener('click', function () { V.adding = false; renderVocab(); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var f = {}; ['word', 'translation', 'pron', 'example'].forEach(function (n) { f[n] = form.elements[n].value.trim(); });
        if (!f.word || !f.translation) { $('#lrAddErr').textContent = L('v.f.err'); return; }
        var list = read(K.userVocab, []) || []; list = list.filter(function (x) { return x.word.toLowerCase() !== f.word.toLowerCase(); });
        f.createdAt = Date.now(); list.push(f); write(K.userVocab, list);
        V.adding = false; V.focusKey = f.word.toLowerCase(); renderVocab(); renderWord(); renderPlan();
      });
    }
    var s = $('#lrVSearch');
    s.addEventListener('input', function () { V.q = s.value; var pos = s.selectionStart; renderVocab(); var n = $('#lrVSearch'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} });
    root.querySelectorAll('.lr-wordrow').forEach(function (row) { row.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) { var k = del.getAttribute('data-del'); write(K.userVocab, (read(K.userVocab, []) || []).filter(function (x) { return x.word.toLowerCase() !== k; })); renderVocab(); renderWord(); return; }
      V.focusKey = row.getAttribute('data-key'); renderVocab();
    }); });
  }
  document.addEventListener('keydown', function (e) {
    var view = $('#view-vocabulary'); if (!view || view.hidden || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) return;
    if (e.key === 'ArrowRight') { var n = $('#lrNext'); if (n && !n.disabled) n.click(); }
    else if (e.key === 'ArrowLeft') { var p = $('#lrPrev'); if (p && !p.disabled) p.click(); }
    else if (e.key === ' ') { var f = $('#lrFlash'); if (f) { e.preventDefault(); f.click(); } }
  });

  /* ---------------- tests ---------------- */
  function renderTests() {
    var root = $('#lrTests'); if (!root) return;
    var lp = lessonProg();
    var rows = allLessons().filter(function (x) { var c = contentOf(x.lesson.id); return c && Array.isArray(c.exercises) && c.exercises.length; });
    root.innerHTML = '<div class="lr-tests__head"><div><h2 class="lr-h2">' + esc(L('t.title')) + '</h2><p class="text-muted" style="margin:.3rem 0 0">' + esc(L('t.sub')) + '</p></div></div><div class="lr-tests">' +
      (rows.length ? rows.map(function (x) {
        var p = lp[x.lesson.id], c = contentOf(x.lesson.id), has = p && p.updated && typeof p.percent === 'number';
        var cls = has ? (p.percent >= 80 ? 'lr-score--good' : 'lr-score--mid') : '';
        var locked = x.lesson.status === 'locked';
        return '<article class="lr-card lr-testrow"><span class="lr-testrow__badge">' + esc(x.level.code) + '</span><div><div class="lr-testrow__title">' + esc(x.lesson.title) + '</div><div class="lr-testrow__meta">' + esc(x.module.title) + ' · ' + esc(L('t.ex', { n: c.exercises.length })) + '</div></div>' +
          '<span class="lr-score ' + cls + '">' + (has ? p.percent + '%' : L('t.nores')) + '</span>' +
          '<button type="button" class="lr-btn lr-btn--ghost lr-btn--sm" data-open="' + esc(x.lesson.id) + '"' + (locked ? ' disabled' : '') + '>' + (locked ? '<i data-lucide="lock"></i>' : '') + esc(L(has ? 't.retry' : 't.open')) + '</button></article>';
      }).join('') : '<p class="lr-empty">' + esc(L('t.none')) + '</p>') + '</div>';
    root.querySelectorAll('[data-open]').forEach(function (b) { b.addEventListener('click', function () { openLesson(b.getAttribute('data-open')); }); });
    icons();
  }

  /* ---------------- progress ---------------- */
  function renderProgress() {
    var root = $('#lrProgress'); if (!root) return;
    var s = stats(), lp = lessonProg(), loc = lang() === 'ru' ? 'ru-RU' : 'en-US';
    var levels = program().map(function (lv) {
      var tot = 0, dn = 0; (lv.modules || []).forEach(function (m) { (m.lessons || []).forEach(function (l) { tot++; if (lp[l.id] && lp[l.id].completed) dn++; }); });
      var pc = tot ? Math.round(dn / tot * 100) : 0;
      return '<div><div class="lr-level__row"><span><b>' + esc(lv.code) + '</b> · ' + esc(lv.title) + '</span><span>' + dn + ' / ' + tot + '</span></div><div class="lr-bar"><span class="lr-bar__fill" style="width:' + pc + '%"></span></div></div>';
    }).join('');
    // events: lesson progress timestamps + local activity log
    var events = [];
    var titles = {}; allLessons().forEach(function (x) { titles[x.lesson.id] = x.lesson.title; });
    Object.keys(lp).forEach(function (id) { var p = lp[id]; if (p && p.updated) events.push({ t: p.updated, id: id, pct: p.percent, done: p.completed }); });
    var acts = read(K.activity, []) || [];
    var days = [], counts = [];
    for (var i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); days.push(d); counts.push(0); }
    events.concat(acts).forEach(function (e) { var k = dayKey(new Date(e.t)); days.forEach(function (d, j) { if (dayKey(d) === k) counts[j]++; }); });
    var max = Math.max.apply(null, counts.concat([1]));
    var week = counts.some(Boolean) ? '<div class="lr-week">' + days.map(function (d, j) {
      return '<div class="lr-week__col"><span class="lr-week__n">' + (counts[j] || '') + '</span><span class="lr-week__bar' + (j === 6 ? ' is-today' : '') + '" style="height:' + Math.round(counts[j] / max * 100) + '%"></span><span class="lr-week__d">' + esc(d.toLocaleDateString(loc, { weekday: 'short' })) + '</span></div>';
    }).join('') + '</div>' : '<p class="lr-empty" style="margin-top:1rem">' + esc(L('p.weekEmpty')) + '</p>';
    events.sort(function (a, b) { return b.t - a.t; });
    var hist = events.length ? '<ul class="lr-history">' + events.slice(0, 12).map(function (e) {
      return '<li><span>' + esc(titles[e.id] || e.id) + '</span><span class="lr-chip ' + (e.done ? 'lr-status--known' : 'lr-status--learning') + '">' + esc(e.done ? L('p.done') : L('p.open')) + (typeof e.pct === 'number' ? ' · ' + e.pct + '%' : '') + '</span><time>' + esc(new Date(e.t).toLocaleString(loc, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</time></li>';
    }).join('') + '</ul>' : '<p class="lr-empty" style="margin-top:1rem">' + esc(L('p.noHistory')) + '</p>';
    root.innerHTML = '<div class="lr-prog">' +
      '<div class="lr-card lr-kpi"><span class="lr-eyebrow">' + esc(L('p.overall')) + '</span><div class="lr-kpi__v">' + s.pct + '<small>%</small></div></div>' +
      '<div class="lr-card lr-kpi"><span class="lr-eyebrow">' + esc(L('p.lessons')) + '</span><div class="lr-kpi__v">' + s.done + '<small> / ' + s.total + '</small></div></div>' +
      '<div class="lr-card lr-kpi"><span class="lr-eyebrow">' + esc(L('p.avg')) + '</span><div class="lr-kpi__v">' + (s.avg == null ? '—' : s.avg + '<small>%</small>') + '</div></div>' +
      '<div class="lr-card lr-kpi"><span class="lr-eyebrow">' + esc(L('p.words')) + '</span><div class="lr-kpi__v">' + s.known + '<small> / ' + s.vocab + '</small></div></div>' +
      '<section class="lr-card lr-panel lr-panel--5"><h2 class="lr-h2">' + esc(L('p.levels')) + '</h2><div class="lr-levels">' + levels + '</div></section>' +
      '<section class="lr-card lr-panel lr-panel--7"><h2 class="lr-h2">' + esc(L('p.week')) + '</h2>' + week + '</section>' +
      '<section class="lr-card lr-panel lr-panel--12"><h2 class="lr-h2">' + esc(L('p.history')) + '</h2>' + hist + '</section></div>';
  }

  /* ---------------- wiring ---------------- */
  function renderAll() { applyLr(); renderDashboard(); renderVocab(); renderTests(); renderProgress(); }

  function init() {
    if (window.__lrInit) return; window.__lrInit = true;
    // Wrap language change hook (no reload).
    var prevLang = window.__lingoOnLangChange;
    // Language switch must keep the current page (legacy rerender jumped to Program).
    var viewBeforeLang = null;
    document.addEventListener('click', function (e) {
      if (e.target.closest('.lang-switcher__btn')) {
        var v = Array.prototype.find.call(document.querySelectorAll('.view'), function (x) { return !x.hidden; });
        viewBeforeLang = v ? v.id : null;
      }
    }, true);
    window.__lingoOnLangChange = function (l) {
      if (typeof prevLang === 'function') prevLang(l);
      renderAll();
      if (viewBeforeLang && ['view-program', 'view-lesson'].indexOf(viewBeforeLang) < 0 && window.__lingoShowView) window.__lingoShowView(viewBeforeLang);
      viewBeforeLang = null;
    };
    var prevProg = window.__lingoOnLessonProgress;
    window.__lingoOnLessonProgress = function (id, v) { if (typeof prevProg === 'function') prevProg(id, v); setTimeout(function () { renderDashboard(); renderTests(); renderProgress(); }, 0); };

    // Continue button must open the same lesson the card shows (legacy fallback jumped to a fixed lesson).
    var cb = $('#continueBtn');
    if (cb) {
      var fresh = cb.cloneNode(true); cb.parentNode.replaceChild(fresh, cb);
      fresh.addEventListener('click', function () { var n = nextLesson(); if (n) openLesson(n.item.lesson.id); else goSection('program'); });
    }
    bindPomo();
    $('#lrWord').addEventListener('click', function () { var w = wordOfDay(); if (w) V.focusKey = w.key; goSection('vocabulary'); });
    $('#lrQuoteNext').addEventListener('click', function () { quoteOffset++; renderQuote(); });
    // Refresh section content whenever a main section is opened.
    document.querySelectorAll('.sidebar__link').forEach(function (a) {
      a.addEventListener('click', function () {
        var s = a.getAttribute('data-section');
        setTimeout(function () {
          if (s === 'dashboard') renderDashboard(); else if (s === 'vocabulary') renderVocab(); else if (s === 'tests') renderTests(); else if (s === 'progress') renderProgress();
        }, 0);
      });
    });
    window.__vocabRender = renderVocab;
    setInterval(function () { tickClock(); renderPomo(); }, 1000);
    setInterval(renderQuote, 60 * 60 * 1000);

    renderAll();
    if (window.__lingoName) window.__lingoName.render(window.__lingoName.get());
    // Dashboard always opens first.
    if (window.__lingoSetActiveSection) window.__lingoSetActiveSection('dashboard');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    icons();
  }

  if (document.readyState === 'complete') setTimeout(init, 0);
  else window.addEventListener('load', function () { setTimeout(init, 0); });
})();
