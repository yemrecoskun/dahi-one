(function () {
  'use strict';

  var SIZE = 8;
  var EMPTY = 0;
  var X = 1;
  var CROWN = 2;

  // 8 bölge: 4x2 blok grid (her blok 2 satır x 4 sütun = 8 hücre)
  function getRegion(r, c) {
    return Math.floor(r / 2) * 2 + Math.floor(c / 4);
  }

  // Geçerli çözüm: her satır, sütun ve bölgede tam bir taç; hiçbir iki taç yan yana/çapraz değil
  var SOLUTION = [
    [0, 0], [1, 4], [2, 2], [3, 6], [4, 1], [5, 5], [6, 3], [7, 7]
  ];

  var grid = [];
  var history = [];

  for (var r = 0; r < SIZE; r++) {
    grid[r] = [];
    for (var c = 0; c < SIZE; c++) grid[r][c] = EMPTY;
  }

  var gridEl = document.getElementById('crownGrid');
  var btnUndo = document.getElementById('btnUndo');
  var btnHint = document.getElementById('btnHint');

  function pushHistory() {
    var copy = [];
    for (var r = 0; r < SIZE; r++) copy[r] = grid[r].slice();
    history.push(copy);
  }

  function cycleCell(r, c) {
    pushHistory();
    var v = grid[r][c];
    if (v === EMPTY) grid[r][c] = X;
    else if (v === X) grid[r][c] = CROWN;
    else grid[r][c] = EMPTY;
    render();
    checkWin();
  }

  function undo() {
    if (history.length === 0) return;
    var prev = history.pop();
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++) grid[r][c] = prev[r][c];
    render();
  }

  function getCrowns() {
    var list = [];
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === CROWN) list.push([r, c]);
    return list;
  }

  function crownsTouching() {
    var list = getCrowns();
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var r1 = list[i][0], c1 = list[i][1];
        var r2 = list[j][0], c2 = list[j][1];
        if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) return true;
      }
    }
    return false;
  }

  function countCrownsRow(r) {
    var n = 0;
    for (var c = 0; c < SIZE; c++) if (grid[r][c] === CROWN) n++;
    return n;
  }
  function countCrownsCol(c) {
    var n = 0;
    for (var r = 0; r < SIZE; r++) if (grid[r][c] === CROWN) n++;
    return n;
  }
  function countCrownsRegion(reg) {
    var n = 0;
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (getRegion(r, c) === reg && grid[r][c] === CROWN) n++;
    return n;
  }

  function checkWin() {
    var list = getCrowns();
    if (list.length !== 8) return;
    if (crownsTouching()) return;
    for (var r = 0; r < SIZE; r++) if (countCrownsRow(r) !== 1) return;
    for (var c = 0; c < SIZE; c++) if (countCrownsCol(c) !== 1) return;
    for (var reg = 0; reg < 8; reg++) if (countCrownsRegion(reg) !== 1) return;
    showWin();
  }

  function findEmptyForHint() {
    for (var i = 0; i < SOLUTION.length; i++) {
      var rc = SOLUTION[i];
      if (grid[rc[0]][rc[1]] !== CROWN) return rc;
    }
    return null;
  }

  function hint() {
    var rc = findEmptyForHint();
    if (!rc) return;
    var r = rc[0], c = rc[1];
    pushHistory();
    grid[r][c] = CROWN;
    render();
    var el = gridEl.querySelector('.crown-cell[data-r="' + r + '"][data-c="' + c + '"]');
    if (el) {
      el.classList.add('crown-cell-hint');
      setTimeout(function () { el.classList.remove('crown-cell-hint'); }, 600);
    }
  }

  var winEl = null;
  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'crown-win';
    winEl.innerHTML = '<div class="crown-win-box">' +
      '<h2 class="crown-win-title" data-i18n="crown.win_title">Tebrikler!</h2>' +
      '<p class="crown-win-msg" data-i18n="crown.win_msg">Tüm taçları doğru yerleştirdin.</p>' +
      '<button type="button" class="crown-win-btn" id="crownWinAgain" data-i18n="crown.play_again">Tekrar Oyna</button>' +
      '</div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#crownWinAgain').addEventListener('click', function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () {
        for (var r = 0; r < SIZE; r++)
          for (var c = 0; c < SIZE; c++) grid[r][c] = EMPTY;
        history = [];
        render();
        if (winEl.parentNode) winEl.parentNode.removeChild(winEl);
        winEl = null;
      }, 300);
    });
  }

  function render() {
    gridEl.innerHTML = '';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement('div');
        cell.className = 'crown-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.dataset.region = getRegion(r, c);
        cell.setAttribute('role', 'gridcell');
        if (grid[r][c] === X) {
          cell.classList.add('crown-x');
          cell.textContent = '✕';
        } else if (grid[r][c] === CROWN) {
          cell.classList.add('crown-w');
        }
        cell.addEventListener('click', function () {
          var rr = parseInt(this.dataset.r, 10);
          var cc = parseInt(this.dataset.c, 10);
          cycleCell(rr, cc);
        });
        gridEl.appendChild(cell);
      }
    }
    btnUndo.disabled = history.length === 0;
  }

  btnUndo.addEventListener('click', undo);
  btnHint.addEventListener('click', hint);

  render();
})();
