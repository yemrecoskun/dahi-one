/**
 * Ortak navbar ve footer'ı yükler.
 * Sayfada #nav-placeholder ve #footer-placeholder id'li elementler olmalı.
 */
(function () {
    function inject(id, url) {
        var el = document.getElementById(id);
        if (!el) return;
        fetch(url)
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
    inject('nav-placeholder', '/includes/nav.html');
    inject('footer-placeholder', '/includes/footer.html');
})();
