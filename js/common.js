/**
 * Joe's Window Tinting — Shared helpers (inspired by ThankQTattoo common.js)
 * Keeps things simple and easy to understand.
 */

(function (window) {
  const JOWT = {};

  // ---------- Storage (localStorage) ----------
  JOWT.saveToStorage = function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  };

  JOWT.loadFromStorage = function (key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // ---------- Toast notifications ----------
  JOWT.showToast = function (message, type = 'success') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
      // Basic inline styles if no CSS
      Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: '#18181b', color: '#f4f4f5', padding: '10px 18px', borderRadius: '9999px',
        fontSize: '13px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', zIndex: '9999',
        display: 'none', alignItems: 'center', gap: '8px'
      });
    }

    const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✓';
    toast.innerHTML = `<span style="margin-right:6px">${icon}</span> ${message}`;
    toast.style.display = 'flex';

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2600);
  };

  // ---------- Simple escape for safety ----------
  JOWT.escapeHtml = function (str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  };

  JOWT.escapeAttr = function (str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
  };

  // ---------- Format helpers ----------
  JOWT.formatDate = function (dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Expose
  window.JoWT = JOWT;
  window.ThankQ = window.ThankQ || {}; // small compat alias if someone copies patterns
  window.ThankQ.showToast = JOWT.showToast;
  window.ThankQ.loadFromStorage = JOWT.loadFromStorage;
  window.ThankQ.saveToStorage = JOWT.saveToStorage;

})(window);
