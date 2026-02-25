/**
 * Ortak navbar ve footer'ı yükler. Önce theme.js ve i18n.js yüklenir, sonra nav/footer.
 * Sayfada #nav-placeholder ve #footer-placeholder id'li elementler olmalı.
 */
(function () {
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
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
                    wrap.appendChild(el.firstElementChild);
                    el.innerHTML = '';
                    el.appendChild(wrap);
                } else if (id === 'footer-placeholder') {
                    var footer = document.createElement('footer');
                    footer.className = 'footer';
                    footer.appendChild(el.firstElementChild);
                    el.innerHTML = '';
                    el.appendChild(footer);
                }
            })
            .catch(function () { el.innerHTML = ''; });
    }
    function run() {
        Promise.all([
            inject('nav-placeholder', '/includes/nav.html'),
            inject('footer-placeholder', '/includes/footer.html')
        ]).then(function () {
            if (window.applyTheme) window.applyTheme();
            if (window.applyI18n) window.applyI18n();
        });
    }
    loadScript('/js/theme.js')
        .then(function () { return loadScript('/js/translations.js'); })
        .then(function () { return loadScript('/js/i18n.js'); })
        .then(run)
        .catch(run);
})();
