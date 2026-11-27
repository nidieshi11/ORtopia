(() => {
  'use strict';
  const key = 'ortopia.appearance';
  const root = document.documentElement;
  const chromeColor = document.querySelector('meta[name="theme-color"]');
  const chinese = root.lang.startsWith('zh');
  let button;
  let label;

  function apply(theme) {
    const dark = theme === 'ink';
    root.dataset.theme = dark ? 'ink' : 'warm';
    if (chromeColor) chromeColor.content = dark ? '#302d29' : '#f5f0e6';
    if (!button) return;
    const next = chinese ? (dark ? '浅色模式' : '深色模式') : (dark ? 'Light mode' : 'Dark mode');
    label.textContent = next;
    button.title = chinese ? '切换到' + next : 'Switch to ' + next.toLowerCase();
    button.setAttribute('aria-label', button.title);
  }

  function restore() {
    try { apply(localStorage.getItem(key)); }
    catch { apply(root.dataset.theme); }
  }

  restore();
  document.addEventListener('DOMContentLoaded', () => {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'appearance-button';
    const icon = document.createElement('span');
    icon.className = 'tone';
    icon.setAttribute('aria-hidden', 'true');
    label = document.createElement('span');
    label.className = 'tone-label';
    button.append(icon, label);
    apply(root.dataset.theme);
    button.addEventListener('click', () => {
      apply(root.dataset.theme === 'warm' ? 'ink' : 'warm');
      try { localStorage.setItem(key, root.dataset.theme); }
      catch { /* The theme still applies to this page when storage is unavailable. */ }
    });
    const mast = document.querySelector('.mast-inner');
    if (mast) mast.append(button);
    else document.querySelector('main').prepend(button);
  });
  window.addEventListener('pageshow', e => { if (e.persisted) restore(); });
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) restore(); });
})();
