/* Supabase auth + explicit, version-aware personal data sync. No service-role key. */
(function () {
  'use strict';
  var cfg = window.LINGO_SUPABASE_CONFIG || {};
  var ready = !!(cfg.url && cfg.anonKey && !/YOUR_SUPABASE/.test(cfg.url + cfg.anonKey));
  var client = null;
  var TABLE = 'lingo_user_state';
  var EXCLUDE = /pomodoro|import.*draft|draft.*import|supabase|auth-token/i;
  function el(id) { return document.getElementById(id); }
  function status(message, kind) {
    var n = el('authNotice'); if (n) { n.hidden = !message; n.textContent = message || ''; n.dataset.kind = kind || 'info'; }
    var s = el('syncStatusValue'); if (s && message) s.textContent = message;
  }
  function localPayload() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || EXCLUDE.test(key)) continue;
      if (/^(lingo-studio\.|__lingo)/.test(key)) {
        try { out[key] = JSON.parse(localStorage.getItem(key)); }
        catch (_) { out[key] = localStorage.getItem(key); }
      }
    }
    return out;
  }
  function applyPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Некорректный формат облачных данных.');
    Object.keys(payload).forEach(function (key) {
      if (!/^(lingo-studio\.|__lingo)/.test(key) || EXCLUDE.test(key)) return;
      var value = payload[key];
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    });
  }
  function updateAccount(user) {
    var signedOut = document.querySelector('[data-auth-view="signed-out"]');
    var signedIn = document.querySelector('[data-auth-view="signed-in"]');
    if (signedOut) signedOut.hidden = !!user;
    if (signedIn) signedIn.hidden = !user;
    var panel = el('authPanel'); if (panel) panel.dataset.authState = user ? 'signed-in' : 'signed-out';
    if (user) {
      if (el('authAccountEmail')) el('authAccountEmail').textContent = user.email || '';
      if (el('authAccountAvatar')) el('authAccountAvatar').textContent = (user.email || 'L').slice(0,1).toUpperCase();
      if (el('authStatusPill')) el('authStatusPill').textContent = 'Подключено';
      if (el('syncStatusValue')) el('syncStatusValue').textContent = 'Аккаунт подключён';
    } else if (el('authStatusPill')) el('authStatusPill').textContent = ready ? 'Не выполнен вход' : 'Локальный режим';
  }
  async function sync() {
    if (!client) throw new Error('Сначала настрой Supabase URL и anon key.');
    var auth = await client.auth.getUser();
    if (!auth.data.user) throw new Error('Войди в личный аккаунт перед синхронизацией.');
    var user = auth.data.user;
    var remote = await client.from(TABLE).select('payload, updated_at').eq('user_id', user.id).maybeSingle();
    if (remote.error) throw remote.error;
    var localStamp = Number(localStorage.getItem('lingo-studio.lastCloudSync') || 0);
    var remoteStamp = remote.data ? Date.parse(remote.data.updated_at || 0) : 0;
    if (remote.data && remoteStamp > localStamp && !confirm('В облаке есть более свежая копия. Загрузить её на это устройство? Локальные данные приложения будут заменены соответствующими облачными данными.')) return;
    if (remote.data && remoteStamp > localStamp) applyPayload(remote.data.payload);
    else {
      var saved = await client.from(TABLE).upsert({ user_id: user.id, payload: localPayload(), updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (saved.error) throw saved.error;
    }
    localStorage.setItem('lingo-studio.lastCloudSync', String(Date.now()));
    if (el('syncLastSyncValue')) el('syncLastSyncValue').textContent = new Date().toLocaleString();
    status('Синхронизация завершена', 'success');
    if (el('syncLessonsValue')) el('syncLessonsValue').textContent = String(Object.keys(localPayload()).length);
  }
  function init() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('/sw.js').catch(function (e) { console.warn('PWA worker:', e); });
    if (!ready || !window.supabase) { updateAccount(null); status('Локальный режим — добавь ключи Supabase для подключения.', 'warning'); return; }
    client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    client.auth.getSession().then(function (r) { updateAccount(r.data.session && r.data.session.user); });
    client.auth.onAuthStateChange(function (_event, session) { updateAccount(session && session.user); });
    document.querySelectorAll('[data-auth-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('[data-auth-tab]').forEach(function (item) {
          var active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        var passwordField = document.querySelector('[data-auth-field="password"]');
        if (passwordField) passwordField.hidden = tab.dataset.authTab === 'reset';
        if (el('authSubmitBtn')) el('authSubmitBtn').textContent = tab.dataset.authTab === 'signup' ? 'Создать аккаунт' : tab.dataset.authTab === 'reset' ? 'Отправить ссылку' : 'Войти';
      });
    });
    var form = el('authForm');
    if (form) form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = el('authEmail') && el('authEmail').value.trim();
      var password = el('authPassword') && el('authPassword').value;
      var mode = document.querySelector('[data-auth-tab].is-active');
      var action = mode ? mode.dataset.authTab : 'signin';
      try {
        status('Подключаем аккаунт…');
        var result;
        if (action === 'signup') result = await client.auth.signUp({ email: email, password: password });
        else if (action === 'reset') result = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
        else result = await client.auth.signInWithPassword({ email: email, password: password });
        if (result.error) throw result.error;
        status(action === 'reset' ? 'Письмо для сброса пароля отправлено.' : action === 'signup' ? 'Проверь почту для подтверждения аккаунта.' : 'Вход выполнен.', 'success');
        if (result.data && result.data.user) updateAccount(result.data.user);
      } catch (err) { status(err.message || 'Ошибка авторизации.', 'error'); }
    });
    if (el('authSignOutBtn')) el('authSignOutBtn').addEventListener('click', async function () { var r = await client.auth.signOut(); if (r.error) status(r.error.message, 'error'); else updateAccount(null); });
    if (el('syncNowBtn')) el('syncNowBtn').addEventListener('click', function () { sync().catch(function (e) { status(e.message || 'Ошибка синхронизации.', 'error'); }); });
    var clear = el('syncClearBtn'); if (clear) clear.addEventListener('click', function () { status('Очистка локальных данных отключена для защиты твоих материалов. Экспортируй резервную копию перед любыми ручными действиями.', 'warning'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.LingoCloud = { isConfigured: ready, sync: sync };
})();
