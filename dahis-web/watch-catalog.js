/** Ortak saat kataloğu. character-data.js dosyasından sonra yüklenir. */
(function () {
    const assets = '/saat-atolyesi/assets/';
    const characterFilms = {
        puls: 'red', zest: 'orange', lumo: 'yellow',
        vigo: 'green', aura: 'blue', nox: 'black'
    };
    const films = Object.fromEntries(Object.entries(window.CHARACTER_DATA).map(([id, character]) => [
        characterFilms[id], {
            characterId: id,
            character: character.name,
            name: character.color,
            swatch: character.colorCode,
            glow: character.colorCode + '38',
            image: '/' + character.image,
            defaultMode: id === 'nox' ? 'negative' : 'normal'
        }
    ]));

    const models = {
        one: {
            name: 'One', brand: "dahi's", thumbnail: '/yesil.png',
            width: 526, height: 401,
            screen: [{ tag: 'rect', x: 135, y: 142, width: 260, height: 129, rx: 10 }]
        },
        f91w: {
            name: 'F-91W', brand: 'Casio', thumbnail: assets + 'f91w-thumb.webp',
            width: 500, height: 730,
            screen: [{ tag: 'rect', x: 143, y: 294, width: 204, height: 101, rx: 9 }]
        },
        ae1200: {
            name: 'AE-1200', brand: 'Casio', thumbnail: assets + 'ae1200-thumb.webp',
            width: 500, height: 730,
            screen: [
                { tag: 'ellipse', cx: 174, cy: 294, rx: 46, ry: 47 },
                { tag: 'rect', x: 255, y: 239, width: 109, height: 24, rx: 7 },
                { tag: 'rect', x: 254, y: 279, width: 110, height: 60, rx: 7 },
                { tag: 'path', d: 'M245 353 H355 Q365 353 365 365 V445 Q365 454 355 454 H132 Q123 454 123 445 V395 Q123 386 133 386 H218 Q227 386 232 375 Z' }
            ]
        },
        a168: {
            name: 'A168', brand: 'Casio', thumbnail: assets + 'a168-thumb.webp',
            width: 500, height: 730,
            screen: [{ tag: 'rect', x: 149, y: 246, width: 200, height: 97, rx: 8 }]
        }
    };

    function designUrl(model, film = 'green', mode = films[film].defaultMode) {
        return '/saat-atolyesi/?' + new URLSearchParams({ model, film, mode });
    }

    const casio = Object.entries(models).filter(([id]) => id !== 'one').map(([id, model]) => ({
        id, name: model.brand + ' ' + model.name,
        image: assets + id + '-green-normal.webp',
        url: designUrl(id)
    }));
    const characters = Object.entries(films).map(([film, details]) => ({
        id: details.characterId, name: details.character,
        image: details.image, color: details.name, swatch: details.swatch,
        film, url: designUrl('one', film)
    }));

    window.WATCH_CATALOG = { assets, models, films, casio, characters, designUrl };
})();
