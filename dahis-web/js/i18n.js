/**
 * TR/EN dil desteği. localStorage key: "lang" (tr | en).
 * Çeviriler js/translations.js içinde (window.__TRANSLATIONS__).
 */
(function () {
    var KEY = 'lang';
    var T = window.__TRANSLATIONS__ || { tr: {}, en: {} };

    function getLang() {
        try {
            var s = localStorage.getItem(KEY);
            if (s === 'tr' || s === 'en') return s;
        } catch (e) {}
        var nav = typeof navigator !== 'undefined' && navigator.language ? navigator.language.toLowerCase() : '';
        if (nav.startsWith('tr')) return 'tr';
        return 'en';
    }

    window.getI18n = function (key) {
        var map = T[getLang()] || T.en;
        return map[key] != null ? map[key] : key;
    };

    function setLang(lang) {
        if (lang !== 'tr' && lang !== 'en') return;
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        document.documentElement.setAttribute('lang', lang);
        apply();
        updateLangButtons();
    }

    function apply() {
        var lang = getLang();
        document.documentElement.setAttribute('lang', lang);
        var map = T[lang] || T.en;
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (map[key] != null) el.textContent = map[key];
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-attr');
            var attr = el.getAttribute('data-i18n-attr-name') || 'aria-label';
            if (map[key] != null) el.setAttribute(attr, map[key]);
        });
    }

    function updateLangButtons() {
        var lang = getLang();
        document.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
        if (window.updateThemeButton) window.updateThemeButton();
    }

    function init() {
        setLang(getLang());
        document.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang'));
            });
        });
    }

    window.applyI18n = function () {
        apply();
        updateLangButtons();
        document.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.nav-lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang'));
            });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
