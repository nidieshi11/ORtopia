(() => {
  'use strict';

  const script = document.currentScript;
  const stream = script.dataset.measurementId;
  const root = new URL('.', script.src);
  if (!/^G-[A-Z0-9]+$/.test(stream || '') || root.href !== 'https://nidieshi11.github.io/ORtopia/'
      || location.origin !== root.origin || window.top !== window
      || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;

  // siteRoot is the site's directory URL, including the trailing slash.
  function analyticsPage(href, siteRoot, data = window) {
    const url = new URL(href);
    const root = new URL(siteRoot);
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return null;
    const path = url.pathname.slice(root.pathname.length);
    if (path === '' || path === 'index.html') return url.hash ? null : root.href;

    const entry = /^(en\/)?(dataset|simulation)\/(|index\.html|replay\.html)$/.exec(path);
    if (!entry) return null;
    const [, language = '', section, file] = entry;
    const chinese = url.searchParams.get('lang') === 'zh';
    if (chinese !== (language === '')) return null; // The language gate redirects this visit.
    const directory = new URL(language + section + '/', root);
    if (chinese) directory.search = '?lang=zh';
    const fragment = url.hash.slice(1);
    const topics = data.ORTOPIA_SCENE_TOPICS || {};
    const sharedDomains = data.ORTOPIA_SUBDOMAINS || {};

    function domainPage(key, encodedTopic) {
      const known = Object.hasOwn(topics, key);
      const legacy = section === 'dataset' && Object.hasOwn(sharedDomains, key);
      if (!known && !legacy) return null;
      let topic = '';
      if (encodedTopic !== undefined) {
        try { topic = decodeURIComponent(encodedTopic); } catch { return null; }
        if (legacy) {
          const child = sharedDomains[key].find(group => group.key === topic);
          if (!child) return null;
          key = child.key;
          topic = '';
        } else if (!topics[key].some(group => group.label === topic)) {
          return null;
        }
      }
      directory.hash = (section === 'dataset' ? '/domain/' : 'scene/') + key
        + (topic ? '/' + encodeURIComponent(topic) : '');
      return directory.href;
    }

    if (section === 'dataset') {
      if (file === 'replay.html') return null;
      if (/^(?:\/?|\/?domains)$/.test(fragment)) return directory.href;
      if (/^\/?library$/.test(fragment)) directory.hash = '/library';
      else {
        const domain = /^\/?domain\/([^/]+)(?:\/([^/]+))?$/.exec(fragment);
        if (domain) return domainPage(domain[1], domain[2]);
        const problem = /^\/?case\/(P\d{4})$/.exec(fragment);
        if (!problem || !data.BENCHMARK_CATALOG?.problems.some(p => p.id === problem[1])) return null;
        directory.hash = '/case/' + problem[1];
      }
      return directory.href;
    }
    if (fragment === '' || fragment === '/') return directory.href;
    if (['lab20', 'world20', 'remaining'].includes(fragment)) {
      directory.hash = fragment;
      return directory.href;
    }
    const scene = /^scene\/([^/]+)(?:\/([^/]+))?$/.exec(fragment);
    if (scene) return domainPage(scene[1], scene[2]);
    const replay = /^(?:\/problem\/)?(P\d{4})(?:\/[1-9]\d*)?$/.exec(fragment);
    if (!replay || !data.ORTOPIA_REPLAY_IDS?.includes(replay[1])) return null;
    directory.pathname += 'replay.html';
    directory.hash = replay[1];
    return directory.href;
  }

  let allowed = false;
  let initialized = false;
  let previousPage = '';
  const disableFlag = 'ga-disable-' + stream;
  const cookiePrefix = 'ortopia';

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function pageView() {
    if (!allowed) return;
    const page = analyticsPage(location.href, root);
    if (!page || page === previousPage) return;

    const url = new URL(page);
    const problem = /(?:^#|^#\/case\/)(P\d{4})$/.exec(url.hash);
    const section = url.pathname.includes('/simulation/') ? 'Simulation' : 'Dataset';
    const gaPage = {
      page_location: page,
      page_title: problem ? section + ' · ' + problem[1] : document.title,
      page_referrer: previousPage || referralOrigin()
    };
    // Set page context for subsequent engagement events as well as this view.
    gtag('set', gaPage);
    gtag('event', 'page_view', { ...gaPage, send_to: stream });
    previousPage = page;
  }

  function referralOrigin() {
    try { return new URL(document.referrer).origin; } catch { return ''; }
  }

  function setConsent(next) {
    if (allowed === next) return;
    allowed = next;
    window[disableFlag] = !allowed;
    if (!allowed) {
      previousPage = '';
      if (initialized) gtag('consent', 'update', { analytics_storage: 'denied' });
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith(cookiePrefix + '_ga')) {
          document.cookie = name + '=; Max-Age=0; Path=' + root.pathname + '; Secure; SameSite=Lax';
        }
      }
      return;
    }

    if (!initialized) {
      initialized = true;
      window.dataLayer = window.dataLayer || [];
      // The linked Google tag can initialize its destination before our config runs.
      // Set the shared defaults first so only the router sends page views.
      const tagSettings = {
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_prefix: cookiePrefix, cookie_domain: 'none', cookie_path: root.pathname,
        page_location: analyticsPage(location.href, root) || root.href, page_referrer: referralOrigin()
      };
      gtag('set', tagSettings);
      gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      gtag('consent', 'update', { analytics_storage: 'granted' });
      gtag('js', new Date());
      gtag('config', stream, tagSettings);
      const tag = document.createElement('script');
      tag.async = true;
      tag.referrerPolicy = 'strict-origin';
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + stream;
      document.head.append(tag);
      window.addEventListener('hashchange', pageView);
    } else {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    pageView();
  }

  function start() {
    if (!analyticsPage(location.href, root)) {
      window.addEventListener('hashchange', start);
      return;
    }
    window.removeEventListener('hashchange', start);
    window.ortopiaAnalyticsPreferences(setConsent);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
