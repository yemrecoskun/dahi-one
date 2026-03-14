(function () {
  'use strict';

  var SIZE = 3;
  var TOTAL = SIZE * SIZE;
  var EMPTY = 0;

  var CHARACTERS = [
    { name: 'Puls', image: '/kirmizi.png' },
    { name: 'Zest', image: '/turuncu.png' },
    { name: 'Lumo', image: '/sari.png' },
    { name: 'Vigo', image: '/yesil.png' },
    { name: 'Aura', image: '/mavi.png' }
  ];

  var tiles = [];
  var emptyIndex = TOTAL - 1;
  var history = [];
  var currentCharIndex = 0;
  var charNameEl = document.getElementById('charName');
  var boardEl = document.getElementById('yapbozBoard');
  var btnUndo = document.getElementById('btnUndo');
  var btnShuffle = document.getElementById('btnShuffle');

  function getNeighbors(i) {
    var r = Math.floor(i / SIZE), c = i % SIZE;
    var out = [];
    if (r > 0) out.push(i - SIZE);
    if (r < SIZE - 1) out.push(i + SIZE);
    if (c > 0) out.push(i - 1);
    if (c < SIZE - 1) out.push(i + 1);
    return out;
  }

  function isSolved() {
    for (var i = 0; i < TOTAL - 1; i++) if (tiles[i] !== i + 1) return false;
    return tiles[TOTAL - 1] === EMPTY;
  }

  function shuffle() {
    tiles = [];
    for (var i = 0; i < TOTAL; i++) tiles[i] = i === TOTAL - 1 ? EMPTY : i + 1;
    emptyIndex = TOTAL - 1;
    var n = 80 + Math.floor(Math.random() * 60);
    for (var k = 0; k < n; k++) {
      var neighbors = getNeighbors(emptyIndex);
      var j = neighbors[Math.floor(Math.random() * neighbors.length)];
      tiles[emptyIndex] = tiles[j];
      tiles[j] = EMPTY;
      emptyIndex = j;
    }
    history = [];
    currentCharIndex = Math.floor(Math.random() * CHARACTERS.length);
    render();
  }

  function pushHistory() {
    history.push(tiles.slice());
  }

  function move(index) {
    if (tiles[index] === EMPTY) return;
    var neighbors = getNeighbors(emptyIndex);
    if (neighbors.indexOf(index) === -1) return;
    pushHistory();
    tiles[emptyIndex] = tiles[index];
    tiles[index] = EMPTY;
    emptyIndex = index;
    render();
    if (isSolved()) showWin();
  }

  function undo() {
    if (history.length === 0) return;
    var prev = history.pop();
    for (var i = 0; i < TOTAL; i++) {
      tiles[i] = prev[i];
      if (prev[i] === EMPTY) emptyIndex = i;
    }
    render();
  }

  var winEl = null;
  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'yapboz-win';
    winEl.innerHTML = '<div class="yapboz-win-box">' +
      '<h2 class="yapboz-win-title" data-i18n="yapboz.win_title">Tebrikler!</h2>' +
      '<p class="yapboz-win-msg" data-i18n="yapboz.win_msg">Yapbozu tamamladın.</p>' +
      '<button type="button" class="yapboz-win-btn" id="yapbozWinAgain" data-i18n="yapboz.play_again">Tekrar Oyna</button>' +
      '</div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#yapbozWinAgain').addEventListener('click', function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () {
        shuffle();
        if (winEl.parentNode) winEl.parentNode.removeChild(winEl);
        winEl = null;
      }, 300);
    });
  }

  function render() {
    var ch = CHARACTERS[currentCharIndex];
    var imgUrl = ch.image;
    boardEl.innerHTML = '';
    for (var i = 0; i < TOTAL; i++) {
      var tile = document.createElement('div');
      tile.className = 'yapboz-tile';
      tile.dataset.index = i;
      if (tiles[i] === EMPTY) {
        tile.classList.add('yapboz-empty');
      } else {
        var val = tiles[i] - 1;
        var row = Math.floor(val / SIZE), col = val % SIZE;
        var x = (col * 100) / (SIZE - 1);
        var y = (row * 100) / (SIZE - 1);
        tile.style.backgroundImage = 'url(' + imgUrl + ')';
        tile.style.backgroundPosition = x + '% ' + y + '%';
        tile.style.backgroundSize = (SIZE * 100) + '% ' + (SIZE * 100) + '%';
        tile.addEventListener('click', function () {
          move(parseInt(this.dataset.index, 10));
        });
      }
      boardEl.appendChild(tile);
    }
    if (charNameEl) charNameEl.textContent = ch.name;
    btnUndo.disabled = history.length === 0;
  }

  btnUndo.addEventListener('click', undo);
  btnShuffle.addEventListener('click', shuffle);

  shuffle();
})();
