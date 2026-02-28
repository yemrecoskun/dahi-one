/**
 * Sadece nav ve footer HTML'ini yükler (site nav/footer ile aynı).
 * Oyun kendi i18n ve stilini kullanır; theme/translations yüklenmez.
 * #nav-placeholder ve #footer-placeholder gerekli.
 */
(function () {
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
  Promise.all([
    inject('nav-placeholder', '/includes/nav.html'),
    inject('footer-placeholder', '/includes/footer.html')
  ]).then(function () {
    if (window.applyTheme) window.applyTheme();
    if (window.applyI18n) window.applyI18n();
  });
})();
