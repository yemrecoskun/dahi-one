(function () {
  'use strict';
  var SIZE = 4;
  var EMPTY = -1;
  var START = 0;
  var GOAL = 1;
  var tiles = [];
  var emptyPos = { r: SIZE - 1, c: SIZE - 1 };
  var history = [];
  var gridEl = document.getElementById('grid');
  var btnUndo = document.getElementById('btnUndo');

  function init() {
    tiles = [];
    var k = 0;
    for (var r = 0; r < SIZE; r++) {
      tiles[r] = [];
      for (var c = 0; c < SIZE; c++) {
        if (r === 0 && c === 0) tiles[r][c] = START;
        else if (r === SIZE - 1 && c === SIZE - 1) tiles[r][c] = EMPTY;
        else tiles[r][c] = 2 + k++;
      }
    }
    emptyPos = { r: SIZE - 1, c: SIZE - 1 };
    history = [];
    shuffle();
    render();
  }
  function shuffle() {
    var n = 80 + Math.floor(Math.random() * 60);
    for (var i = 0; i < n; i++) {
      var neighbors = [];
      if (emptyPos.r > 0) neighbors.push({ r: emptyPos.r - 1, c: emptyPos.c });
      if (emptyPos.r < SIZE - 1) neighbors.push({ r: emptyPos.r + 1, c: emptyPos.c });
      if (emptyPos.c > 0) neighbors.push({ r: emptyPos.r, c: emptyPos.c - 1 });
      if (emptyPos.c < SIZE - 1) neighbors.push({ r: emptyPos.r, c: emptyPos.c + 1 });
      var next = neighbors[Math.floor(Math.random() * neighbors.length)];
      swap(emptyPos.r, emptyPos.c, next.r, next.c);
      emptyPos = next;
    }
  }
  function swap(r1, c1, r2, c2) {
    var t = tiles[r1][c1];
    tiles[r1][c1] = tiles[r2][c2];
    tiles[r2][c2] = t;
  }
  function move(r, c) {
    if (tiles[r][c] === EMPTY) return;
    var dr = Math.abs(r - emptyPos.r), dc = Math.abs(c - emptyPos.c);
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
      history.push({ er: emptyPos.r, ec: emptyPos.c, tr: r, tc: c });
      swap(r, c, emptyPos.r, emptyPos.c);
      emptyPos = { r: r, c: c };
      render();
      checkWin();
    }
  }
  function checkWin() {
    if (tiles[SIZE - 1][SIZE - 1] === START) showWin();
  }
  function showWin() {
    var w = document.createElement('div');
    w.className = 'dahispath-win';
    w.innerHTML = '<div class="dahispath-win-box"><h2 data-i18n="dahispath.win_title">Portal açıldı!</h2><p data-i18n="dahispath.win_msg">Karakter enerji portaline ulaştı.</p><button id="dahispathAgain" data-i18n="dahispath.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(w);
    w.querySelector('#dahispathAgain').onclick = function () { w.remove(); init(); };
  }
  function undo() {
    if (history.length === 0) return;
    var h = history.pop();
    swap(h.er, h.ec, h.tr, h.tc);
    emptyPos = { r: h.tr, c: h.tc };
    render();
  }

  function render() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + SIZE + ', 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(' + SIZE + ', 1fr)';
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
      var cell = document.createElement('div');
      cell.className = 'dahispath-cell';
      var v = tiles[r][c];
      if (v === EMPTY) cell.classList.add('empty');
      else if (v === START) cell.classList.add('start'), cell.textContent = '⚡';
      else cell.textContent = '▣';
      if (r === SIZE - 1 && c === SIZE - 1) cell.classList.add('goal-cell');
      if (v !== EMPTY) {
        cell.onclick = (function (rr, cc) { return function () { move(rr, cc); }; })(r, c);
      }
      gridEl.appendChild(cell);
    }
    btnUndo.disabled = history.length === 0;
  }

  btnUndo.addEventListener('click', undo);
  init();
})();
