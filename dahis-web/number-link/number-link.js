(function () {
  'use strict';

  var ROWS = 5;
  var COLS = 5;

  // Engel: merkez haç (orta hücre + üst, alt, sol, sağ)
  var BLOCKED = [[1, 2], [2, 1], [2, 2], [2, 3], [3, 2]];

  // Çözülebilir bulmaca: önce tüm boş hücreleri dolaşan bir yol, sonra bu yola 1-12 numaraları yerleştir
  function buildPuzzle() {
    var g = [];
    for (var r = 0; r < ROWS; r++) {
      g[r] = [];
      for (var c = 0; c < COLS; c++) {
        var isBlocked = BLOCKED.some(function (b) { return b[0] === r && b[1] === c; });
        g[r][c] = isBlocked ? -1 : 0;
      }
    }
    // Merkez haç dışında kalan 20 hücrede bir yol (sırayla ziyaret)
    var pathOrder = [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 4], [1, 3], [1, 1], [1, 0],
      [2, 0], [2, 4], [3, 0], [3, 1], [3, 3], [3, 4],
      [4, 4], [4, 3], [4, 2], [4, 1], [4, 0]
    ];
    // 12 noktayı bu yol üzerinde yerleştir
    var numIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 19, 1];
    numIndices.sort(function (a, b) { return a - b; });
    for (var i = 0; i < numIndices.length; i++) {
      var p = pathOrder[numIndices[i]];
      g[p[0]][p[1]] = i + 1;
    }
    return { grid: g, maxNum: 12 };
  }

  var puzzle = buildPuzzle();
  var grid = puzzle.grid;
  var maxNum = puzzle.maxNum;

  var path = [];
  var nextToReach = 1;
  var pathHistory = [];

  var gridEl = document.getElementById('grid');
  var btnUndo = document.getElementById('btnUndo');
  var btnHint = document.getElementById('btnHint');

  function getCell(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return grid[r][c];
  }

  function isBlocked(r, c) {
    return getCell(r, c) === -1;
  }

  function isInPath(r, c) {
    return path.some(function (p) { return p[0] === r && p[1] === c; });
  }

  function getPathEnd() {
    return path.length ? path[path.length - 1] : null;
  }

  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  function totalCells() {
    var n = 0;
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++)
        if (!isBlocked(r, c)) n++;
    return n;
  }

  function render() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 44px)';
    gridEl.style.gridTemplateRows = 'repeat(' + ROWS + ', 44px)';

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'nl-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');

        if (isBlocked(r, c)) {
          cell.classList.add('nl-cell-blocked');
          gridEl.appendChild(cell);
          continue;
        }

        var val = getCell(r, c);
        var inPath = isInPath(r, c);
        var end = getPathEnd();
        var isCurrent = end && end[0] === r && end[1] === c;

        if (inPath) cell.classList.add('nl-cell-path');
        if (isCurrent) cell.classList.add('nl-cell-current');

        if (typeof val === 'number' && val >= 1 && val <= maxNum) {
          var numSpan = document.createElement('span');
          numSpan.className = 'nl-cell-number';
          if (val === nextToReach - 1 && inPath) numSpan.classList.add('nl-cell-number-current');
          else if (val === nextToReach && isCurrent) numSpan.classList.add('nl-cell-number-current');
          numSpan.textContent = val;
          cell.appendChild(numSpan);
        }

        cell.addEventListener('click', function (ev) {
          var row = parseInt(this.dataset.row, 10);
          var col = parseInt(this.dataset.col, 10);
          onCellClick(row, col);
        });

        gridEl.appendChild(cell);
      }
    }

    btnUndo.disabled = path.length === 0;
  }

  function onCellClick(r, c) {
    if (isBlocked(r, c)) return;

    var end = getPathEnd();
    var val = getCell(r, c);

    if (path.length === 0) {
      if (val !== 1) return;
      path.push([r, c]);
      nextToReach = 2;
      pathHistory.push({ path: path.map(function (p) { return p.slice(); }), next: nextToReach });
      render();
      checkWin();
      return;
    }

    if (!isAdjacent(end[0], end[1], r, c)) return;
    if (isInPath(r, c)) return;

    if (val === 0 || val === nextToReach) {
      path.push([r, c]);
      if (val === nextToReach) nextToReach++;
      pathHistory.push({ path: path.map(function (p) { return p.slice(); }), next: nextToReach });
      render();
      checkWin();
    }
  }

  function checkWin() {
    var total = totalCells();
    if (path.length === total && nextToReach > maxNum) {
      showWin();
    }
  }

  function undo() {
    if (pathHistory.length === 0) return;
    pathHistory.pop();
    if (pathHistory.length > 0) {
      var prev = pathHistory[pathHistory.length - 1];
      path = prev.path.map(function (p) { return p.slice(); });
      nextToReach = prev.next;
    } else {
      path = [];
      nextToReach = 1;
    }
    render();
  }

  function hint() {
    var end = getPathEnd();
    if (!end) {
      var r1 = -1, c1 = -1;
      for (var r = 0; r < ROWS && r1 < 0; r++)
        for (var c = 0; c < COLS; c++)
          if (getCell(r, c) === 1) { r1 = r; c1 = c; break; }
      highlightCell(r1, c1);
      return;
    }

    var targetNum = nextToReach;
    if (targetNum > maxNum) return;

    var tr = -1, tc = -1;
    for (var rr = 0; rr < ROWS; rr++)
      for (var cc = 0; cc < COLS; cc++)
        if (getCell(rr, cc) === targetNum) { tr = rr; tc = cc; break; }
    if (tr >= 0) highlightCell(tr, tc);
  }

  function highlightCell(r, c) {
    var cell = gridEl.querySelector('.nl-cell[data-row="' + r + '"][data-col="' + c + '"]');
    if (cell && !cell.classList.contains('nl-cell-blocked')) {
      cell.classList.add('nl-cell-hint');
      setTimeout(function () { cell.classList.remove('nl-cell-hint'); }, 1600);
    }
  }

  var winEl = null;

  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'nl-win';
    winEl.innerHTML = '<div class="nl-win-box">' +
      '<h2 class="nl-win-title" data-i18n="nl.win_title">Tebrikler!</h2>' +
      '<p class="nl-win-msg" data-i18n="nl.win_msg">Tüm noktaları birleştirdin.</p>' +
      '<button type="button" class="nl-win-btn" id="nlWinAgain" data-i18n="nl.play_again">Tekrar Oyna</button>' +
      '</div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#nlWinAgain').addEventListener('click', function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () {
        path = [];
        nextToReach = 1;
        pathHistory = [];
        render();
        if (winEl.parentNode) winEl.parentNode.removeChild(winEl);
        winEl = null;
      }, 300);
    });
  }

  btnUndo.addEventListener('click', undo);
  btnHint.addEventListener('click', hint);

  render();
})();
