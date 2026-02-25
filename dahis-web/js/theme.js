/**
 * Light/Dark theme toggle. Uses localStorage key "theme" (values: "light" | "dark").
 */
(function () {
    var KEY = 'theme';

    function getTheme() {
        try {
            var s = localStorage.getItem(KEY);
            if (s === 'light' || s === 'dark') return s;
        } catch (e) {}
        return 'dark';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(KEY, theme); } catch (e) {}
        updateToggleButton();
    }

    function updateToggleButton() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        var isLight = getTheme() === 'light';
        btn.textContent = isLight ? '🌙' : '☀️';
        var label = window.getI18n ? window.getI18n(isLight ? 'theme.dark' : 'theme.light') : (isLight ? 'Koyu mod' : 'Açık mod');
        btn.setAttribute('aria-label', label);
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    function init() {
        setTheme(getTheme());
        var btn = document.getElementById('theme-toggle');
        if (btn) btn.addEventListener('click', toggleTheme);
    }

    window.updateThemeButton = updateToggleButton;

    window.applyTheme = function () {
        setTheme(getTheme());
        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.removeEventListener('click', toggleTheme);
            btn.addEventListener('click', toggleTheme);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
