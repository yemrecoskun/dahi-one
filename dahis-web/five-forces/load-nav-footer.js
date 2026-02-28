/**
 * Nav ve footer HTML'ini yükler; site çevirileri (nav/footer) ve tema ile uyumlu.
 * Dil: five-forces I18n.getLang() ile senkron.
 * #nav-placeholder ve #footer-placeholder gerekli.
 */
(function () {
  var NAV_FOOTER_STRINGS = {
    tr: {
      'nav.home': 'Ana Sayfa', 'nav.characters': 'Onelar', 'nav.seasons': 'Sezonlar', 'nav.fun': 'Eğlence', 'nav.dahios': 'dahiOS', 'nav.store': 'Mağaza',
      'nav.app_download': "dahi's Uygulamayı indir",
      'footer.copyright': "© 2025 dahi's One - Harmonya'nın Kahramanları", 'footer.privacy': 'Gizlilik Politikası', 'footer.cookie': 'Çerez Politikası', 'footer.about': 'Hakkımızda', 'footer.contact': 'İletişim', 'footer.kvkk': 'Aydınlatma Metni', 'footer.top': 'En popüler', 'footer.smartest': 'En zeki', 'footer.dangerous': 'En tehlikeli', 'footer.powerful': 'En güçlü', 'footer.creative': 'En yaratıcı', 'footer.funniest': 'En komik', 'footer.strategic': 'En stratejik', 'footer.fiveforces': 'Five Forces',
      'theme.dark': 'Koyu mod', 'theme.light': 'Açık mod'
    },
    en: {
      'nav.home': 'Home', 'nav.characters': 'Characters', 'nav.seasons': 'Seasons', 'nav.fun': 'Fun', 'nav.dahios': 'dahiOS', 'nav.store': 'Store',
      'nav.app_download': "Download dahi's App",
      'footer.copyright': "© 2025 dahi's One - Heroes of Harmonya", 'footer.privacy': 'Privacy Policy', 'footer.cookie': 'Cookie Policy', 'footer.about': 'About', 'footer.contact': 'Contact', 'footer.kvkk': 'Legal Notice', 'footer.top': 'Top characters', 'footer.smartest': 'Smartest', 'footer.dangerous': 'Most dangerous', 'footer.powerful': 'Most powerful', 'footer.creative': 'Most creative', 'footer.funniest': 'Funniest', 'footer.strategic': 'Best strategic', 'footer.fiveforces': 'Five Forces',
      'theme.dark': 'Dark mode', 'theme.light': 'Light mode'
    }
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function inject(id, url) {
    var el = document.getElementById(id);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        el.innerHTML = html;
        if (id === 'nav-placeholder') {
          var wrap = document.createElement('nav');
          wrap.className = 'navbar';
          if (el.firstElementChild) {
            wrap.appendChild(el.firstElementChild);
            el.innerHTML = '';
            el.appendChild(wrap);
          }
        } else if (id === 'footer-placeholder') {
          var footer = document.createElement('footer');
          footer.className = 'footer';
          if (el.firstElementChild) {
            footer.appendChild(el.firstElementChild);
            el.innerHTML = '';
            el.appendChild(footer);
          }
        }
      })
      .catch(function () { if (el) el.innerHTML = ''; });
  }

  function getSiteLang() {
    if (window.I18n && typeof I18n.getLang === 'function') return I18n.getLang();
    try {
      var s = localStorage.getItem('lang');
      if (s === 'tr' || s === 'en') return s;
    } catch (e) {}
    return 'tr';
  }

  function applyNavFooterI18n() {
    var T = window.__TRANSLATIONS__ || NAV_FOOTER_STRINGS;
    var lang = getSiteLang();
    var map = (T[lang] || T.en || T.tr) || {};
    var roots = [];
    var nav = document.getElementById('nav-placeholder');
    var footer = document.getElementById('footer-placeholder');
    if (nav) roots.push(nav);
    if (footer) roots.push(footer);
    roots.forEach(function (root) {
      root.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (map[key] != null) el.textContent = map[key];
      });
      root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-attr');
        var attr = el.getAttribute('data-i18n-attr-name') || 'aria-label';
        if (map[key] != null) el.setAttribute(attr, map[key]);
      });
    });
    var navEl = document.getElementById('nav-placeholder');
    if (navEl) {
      navEl.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    }
  }

  window.applyNavFooterI18n = applyNavFooterI18n;

  function wireNavLang() {
    document.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (lang !== 'tr' && lang !== 'en') return;
        try { localStorage.setItem('lang', lang); } catch (e) {}
        if (window.I18n && typeof I18n.setLang === 'function') I18n.setLang(lang);
        applyNavFooterI18n();
      });
    });
  }

  function run() {
    if (!window.getI18n) {
      window.getI18n = function (key) {
        var T = window.__TRANSLATIONS__ || NAV_FOOTER_STRINGS;
        var lang = getSiteLang();
        var map = (T && T[lang]) || (T && T.en) || {};
        return map[key] != null ? map[key] : key;
      };
    }
    if (window.applyTheme) window.applyTheme();
    applyNavFooterI18n();
    wireNavLang();
    document.addEventListener('langchange', function () { applyNavFooterI18n(); });
    setTimeout(applyNavFooterI18n, 0);
  }

  loadScript('/js/translations.js')
    .then(function () { return loadScript('/js/theme.js'); })
    .then(function () {
      return Promise.all([
        inject('nav-placeholder', '/includes/nav.html'),
        inject('footer-placeholder', '/includes/footer.html')
      ]);
    })
    .then(run)
    .catch(function () {
      Promise.all([
        inject('nav-placeholder', '/includes/nav.html'),
        inject('footer-placeholder', '/includes/footer.html')
      ]).then(function () {
        if (window.applyTheme) window.applyTheme();
        applyNavFooterI18n();
        wireNavLang();
        document.addEventListener('langchange', function () { applyNavFooterI18n(); });
      });
    });
})();
