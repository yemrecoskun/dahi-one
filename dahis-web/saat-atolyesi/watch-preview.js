/** Canlı önizlemede yalnızca LCD alanını renklendirir; kasa ve kordon aynı kalır. */
(function () {
    const ns = 'http://www.w3.org/2000/svg';
    const { models, films, assets } = window.WATCH_CATALOG;

    function element(tag, attributes = {}) {
        const node = document.createElementNS(ns, tag);
        Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
        return node;
    }

    function channels(hex) {
        return hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255);
    }

    window.renderWatchPreview = function (svg, modelId, film, mode) {
        const model = models[modelId];
        const character = films[film];
        const isOne = modelId === 'one';
        const source = isOne ? character.image : assets + modelId + '-green-normal.webp';
        const label = `${model.brand} ${model.name}, ${character.character}, ${character.name.toLocaleLowerCase('tr')} film, ${mode === 'normal' ? 'normal' : 'negatif'} ekran`;
        svg.setAttribute('viewBox', `0 0 ${model.width} ${model.height}`);
        svg.setAttribute('aria-label', label);
        svg.dataset.model = modelId;
        svg.dataset.film = film;
        svg.dataset.mode = mode;
        const title = element('title');
        title.textContent = label;
        const imageAttributes = { href: source, width: model.width, height: model.height };
        svg.replaceChildren(title, element('image', imageAttributes));

        // Karakterin mevcut görünümünde projedeki özgün görseli doğrudan göster.
        if (isOne && mode === character.defaultMode) return;

        const clipId = svg.id + '-screen';
        const filterId = svg.id + '-film';
        const defs = element('defs');
        const clip = element('clipPath', { id: clipId });
        model.screen.forEach(({ tag, ...attributes }) => clip.append(element(tag, attributes)));
        const filter = element('filter', { id: filterId, 'color-interpolation-filters': 'sRGB' });
        filter.append(element('feColorMatrix', { type: 'saturate', values: 0 }));
        const transfer = element('feComponentTransfer');
        const dark = channels('#131921');
        const light = channels(film === 'black' ? '#c1c9d5' : character.swatch);
        const sourceNegative = isOne && character.defaultMode === 'negative';
        const reverse = (mode === 'negative') !== sourceNegative;
        for (let i = 0; i < 3; i++) {
            const from = reverse ? light[i] : dark[i];
            const to = reverse ? dark[i] : light[i];
            const slope = (to - from) / 0.6;
            transfer.append(element('feFunc' + 'RGB'[i], {
                type: 'linear', slope, intercept: from - 0.08 * slope
            }));
        }
        filter.append(transfer);
        defs.append(clip, filter);
        svg.append(defs, element('image', {
            ...imageAttributes, 'clip-path': `url(#${clipId})`, filter: `url(#${filterId})`
        }));
    };
})();
