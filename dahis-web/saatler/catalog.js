(function () {
    const catalog = window.WATCH_CATALOG;

    function addCard(container, item, isCharacter) {
        const card = document.createElement('a');
        card.className = 'catalog-card' + (isCharacter ? ' catalog-card-character' : '');
        card.href = item.url;
        if (item.swatch) card.style.setProperty('--watch-color', item.swatch);

        const visual = document.createElement('div');
        visual.className = 'catalog-visual';
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.name;
        image.loading = 'lazy';
        image.width = isCharacter ? 526 : 500;
        image.height = isCharacter ? 401 : 730;
        visual.append(image);

        const title = document.createElement('h3');
        title.textContent = item.name;
        card.append(visual, title);
        if (isCharacter) {
            const color = document.createElement('p');
            color.dataset.i18n = 'watches.color_' + item.film;
            color.textContent = item.color;
            card.append(color);
        }
        const action = document.createElement('span');
        action.className = 'catalog-card-action';
        action.dataset.i18n = 'watches.design';
        action.textContent = 'Atölyede tasarla';
        card.append(action);
        container.append(card);
    }

    catalog.casio.forEach(item => addCard(document.getElementById('casio-models'), item, false));
    catalog.characters.forEach(item => addCard(document.getElementById('character-watches'), item, true));
    if (window.applyI18n) window.applyI18n();
})();
