// ── 簡易ログイン管理（レポート用紙風システム共通） ──
(function () {
  'use strict';

  var KEY = 'researchIdeaLogin';
  var LOGIN_PAGE = 'login.html';

  // 保存済みログイン情報を返す（未ログインなら null）
  function getLogin() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && data.user ? data : null;
    } catch (e) {
      return null;
    }
  }

  // ログイン情報を保存する
  function saveLogin(obj) {
    try {
      var prev = getLogin() || {};
      var data = {
        user: (obj && obj.user) || prev.user || '',
        affiliation: (obj && obj.affiliation) || prev.affiliation || '',
        loggedAt: new Date().toISOString()
      };
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* ストレージ利用不可の場合は無視 */ }
  }

  // ログアウトして表紙へ戻る
  function logout() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    window.location.href = LOGIN_PAGE;
  }

  // 未ログイン時は login.html へ遷移する（loginページ自身では何もしない）
  function requireLogin() {
    if (getLogin()) return true;
    var current = (window.location.pathname || '').split('/').pop() || '';
    if (current !== LOGIN_PAGE) {
      window.location.replace(LOGIN_PAGE);
    }
    return false;
  }

  // ヘッダー等の user-chip 要素へ利用者名を反映する
  function renderUserChip() {
    var fill = function () {
      var el = document.getElementById('paperUser');
      if (!el) return;
      var data = getLogin();
      if (data) {
        el.textContent = data.user + (data.affiliation ? ' ／ ' + data.affiliation : '');
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', fill);
    } else {
      fill();
    }
  }

  window.ResearchAuth = {
    getLogin: getLogin,
    saveLogin: saveLogin,
    logout: logout,
    requireLogin: requireLogin,
    renderUserChip: renderUserChip,
    isLoggedIn: function () { return !!getLogin(); }
  };

  renderUserChip();
})();