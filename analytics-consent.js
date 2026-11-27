(() => {
  'use strict';

  window.ortopiaAnalyticsPreferences = function (onConsentChanged) {
    const key = 'ortopia.ga4.consent.v1';
    const zh = document.documentElement.lang.startsWith('zh');
    const heading = zh ? '访问统计' : 'Site analytics';
    const message = zh
      ? '经你同意，ORtopia 会使用 Google Analytics 4 和统计 Cookie，了解访客的大致地区和浏览的页面。'
      : 'With your permission, ORtopia uses Google Analytics 4 and analytics cookies to measure visits by approximate location and page.';
    const panel = document.createElement('section');
    panel.id = 'ortopia-analytics-consent';
    panel.setAttribute('aria-label', heading);
    panel.innerHTML = `
      <div class="analytics-copy"><strong>${heading}</strong>
        <p>${message} <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">${zh ? 'Google 如何使用数据' : 'How Google uses data'}</a></p>
      </div>
      <div class="analytics-actions">
        <button type="button" data-choice="allow">${zh ? '允许' : 'Allow'}</button>
        <button type="button" data-choice="decline">${zh ? '拒绝' : 'Decline'}</button>
      </div>`;

    const main = document.querySelector('main');
    const end = document.createElement('div');
    end.className = 'analytics-end';
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.textContent = zh ? '访问统计设置' : 'Analytics settings';
    settings.setAttribute('aria-controls', panel.id);
    end.append(settings);
    document.body.append(end);
    main.before(panel);
    const buttons = [...panel.querySelectorAll('button')];

    let choice = null;
    try { choice = localStorage.getItem(key); } catch { /* Use this page's choice when storage is unavailable. */ }
    function render(value) {
      choice = value === 'allow' || value === 'decline' ? value : null;
      panel.hidden = choice !== null;
      settings.setAttribute('aria-expanded', String(!panel.hidden));
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === choice)));
      onConsentChanged(choice === 'allow');
    }
    for (const button of buttons) {
      button.addEventListener('click', () => {
        const value = button.dataset.choice;
        try { localStorage.setItem(key, value); } catch { /* The selection still applies in this document. */ }
        render(value);
        if (panel.parentNode === end) settings.focus();
        else {
          if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
          main.focus({ preventScroll: true });
        }
      });
    }
    settings.addEventListener('click', () => {
      const opening = panel.hidden || panel.parentNode !== end;
      end.prepend(panel);
      panel.hidden = !opening;
      settings.setAttribute('aria-expanded', String(opening));
      if (opening) (buttons.find(button => button.dataset.choice === choice) || buttons[0]).focus();
    });
    window.addEventListener('storage', event => {
      if (event.key === key || event.key === null) render(event.newValue);
    });
    render(choice);
  };
})();
