(function () {
  'use strict';

  var SIZE = 4;
  var TARGET = 2048;
  var grid = [];
  var score = 0;
  var won = false;
  var gridEl;
  var scoreEl;

  function emptyCells() {
    var out = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (!grid[r][c]) out.push([r, c]);
      }
    }
    return out;
  }

  function spawn() {
    var cells = emptyCells();
    if (!cells.length) return false;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    grid[cell[0]][cell[1]] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  function setupBoard() {
    grid = [];
    score = 0;
    won = false;
    for (var r = 0; r < SIZE; r++) {
      grid[r] = [];
      for (var c = 0; c < SIZE; c++) grid[r][c] = 0;
    }
    spawn();
    spawn();
    render();
  }

  function mergeLine(line) {
    var arr = line.filter(function (v) { return v > 0; });
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
        var merged = arr[i] * 2;
        out.push(merged);
        score += merged;
        if (merged >= TARGET) won = true;
        i++;
      } else {
        out.push(arr[i]);
      }
    }
    while (out.length < SIZE) out.push(0);
    return out;
  }

  function cloneBoard(board) {
    return board.map(function (row) { return row.slice(); });
  }

  function applyMove(board, dir) {
    var moved = false;
    var next = cloneBoard(board);

    if (dir === 'left' || dir === 'right') {
      for (var r = 0; r < SIZE; r++) {
        var line = dir === 'left' ? board[r].slice() : board[r].slice().reverse();
        var merged = mergeLine(line);
        if (dir === 'right') merged.reverse();
        for (var c = 0; c < SIZE; c++) {
          if (next[r][c] !== merged[c]) moved = true;
          next[r][c] = merged[c];
        }
      }
    } else {
      for (var c2 = 0; c2 < SIZE; c2++) {
        var col = [];
        for (var r2 = 0; r2 < SIZE; r2++) col.push(board[r2][c2]);
        if (dir === 'down') col.reverse();
        var mergedCol = mergeLine(col);
        if (dir === 'down') mergedCol.reverse();
        for (var r3 = 0; r3 < SIZE; r3++) {
          if (next[r3][c2] !== mergedCol[r3]) moved = true;
          next[r3][c2] = mergedCol[r3];
        }
      }
    }

    return { moved: moved, board: next };
  }

  function hasAnyMove() {
    if (emptyCells().length) return true;
    var dirs = ['left', 'right', 'up', 'down'];
    var scoreBefore = score;
    var wonBefore = won;
    for (var i = 0; i < dirs.length; i++) {
      var snapshot = cloneBoard(grid);
      var result = applyMove(snapshot, dirs[i]);
      score = scoreBefore;
      won = wonBefore;
      if (result.moved) return true;
    }
    return false;
  }

  function showOverlay(titleKey, messageText) {
    var overlay = document.createElement('div');
    overlay.className = 'g2048-overlay';
    overlay.innerHTML = '<div class="g2048-overlay-box">'
      + '<h2 data-i18n="' + titleKey + '"></h2>'
      + '<p>' + messageText + '</p>'
      + '<button id="g2048Again" data-i18n="g2048.play_again">Tekrar oyna</button>'
      + '</div>';
    document.body.appendChild(overlay);
    if (window.applyI18n) window.applyI18n();
    overlay.querySelector('#g2048Again').onclick = function () {
      overlay.remove();
      setupBoard();
    };
  }

  function move(dir) {
    var state = applyMove(grid, dir);
    if (!state.moved) {
      if (!hasAnyMove()) showOverlay('g2048.gameover', 'Skor: ' + score);
      return;
    }

    grid = state.board;
    spawn();
    render();

    if (won) {
      won = false;
      showOverlay('g2048.win_title', '2048! Skor: ' + score);
      return;
    }

    if (!hasAnyMove()) showOverlay('g2048.gameover', 'Skor: ' + score);
  }

  function render() {
    gridEl.innerHTML = '';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement('div');
        var value = grid[r][c];
        cell.className = 'g2048-cell';
        if (value) {
          cell.classList.add('v' + value);
          cell.textContent = value;
        }
        gridEl.appendChild(cell);
      }
    }
    if (scoreEl) scoreEl.textContent = score;
  }

  function attachListeners() {
    document.addEventListener('keydown', function (e) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) >= 0) {
        e.preventDefault();
        move(e.key.replace('Arrow', '').toLowerCase());
      }
    });

    var touchStart = null;
    gridEl.addEventListener('touchstart', function (e) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    gridEl.addEventListener('touchend', function (e) {
      if (!touchStart) return;
      var dx = e.changedTouches[0].clientX - touchStart.x;
      var dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) {
        touchStart = null;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
      touchStart = null;
    }, { passive: true });

    var restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', setupBoard);
  }

  function run() {
    gridEl = document.getElementById('grid');
    scoreEl = document.getElementById('score');
    if (!gridEl) return;
    attachListeners();
    setupBoard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
