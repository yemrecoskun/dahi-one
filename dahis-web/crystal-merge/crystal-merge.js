(function () {
  'use strict';
  var SIZE = 4;
  // LEVELS[0] is placeholder; grid values 1..7 map to level names.
  // 0 in the grid means "empty cell", so spawn writes 1 (Enerji) or 2 (Lumo).
  var LEVELS = ['', 'Enerji', 'Lumo', 'Vigo', 'Zest', 'Puls', 'Aura', "Dahi's One"];
  var MAX_LEVEL = 7; // Dahi's One
  var grid = [], score = 0, winReached = false, overlayOpen = false;
  var gridEl, scoreEl;

  function emptyCells() {
    var out = [];
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) if (!grid[r][c]) out.push([r, c]);
    return out;
  }
  function spawn() {
    var cells = emptyCells();
    if (cells.length === 0) return false;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    grid[cell[0]][cell[1]] = Math.random() < 0.9 ? 1 : 2;
    return true;
  }
  function initGrid() {
    grid = [];
    for (var r = 0; r < SIZE; r++) { grid[r] = []; for (var c = 0; c < SIZE; c++) grid[r][c] = 0; }
    score = 0;
    winReached = false;
    overlayOpen = false;
    spawn();
    spawn();
    render();
  }

  function mergeLine(line) {
    var arr = line.filter(function (v) { return v > 0; });
    var out = [], i = 0, reachedWin = false;
    while (i < arr.length) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1] && arr[i] < MAX_LEVEL) {
        out.push(arr[i] + 1);
        score += (arr[i] + 1) * 10;
        if (arr[i] + 1 === MAX_LEVEL) reachedWin = true;
        i += 2;
      } else { out.push(arr[i]); i++; }
    }
    while (out.length < SIZE) out.push(0);
    return { line: out.slice(0, SIZE), win: reachedWin };
  }
  function move(dir) {
    if (overlayOpen) return;
    var moved = false, justWon = false;
    if (dir === 'left' || dir === 'right') {
      for (var r = 0; r < SIZE; r++) {
        var line = dir === 'left' ? grid[r].slice() : grid[r].slice().reverse();
        var res = mergeLine(line);
        var merged = res.line;
        if (res.win) justWon = true;
        if (dir === 'right') merged.reverse();
        for (var c = 0; c < SIZE; c++) {
          if (grid[r][c] !== merged[c]) moved = true;
          grid[r][c] = merged[c];
        }
      }
    } else {
      for (var c = 0; c < SIZE; c++) {
        var line = [];
        for (var r = 0; r < SIZE; r++) line.push(grid[r][c]);
        if (dir === 'down') line.reverse();
        var res = mergeLine(line);
        var merged = res.line;
        if (res.win) justWon = true;
        if (dir === 'down') merged.reverse();
        for (var r = 0; r < SIZE; r++) {
          if (grid[r][c] !== merged[r]) moved = true;
          grid[r][c] = merged[r];
        }
      }
    }
    if (moved) {
      spawn();
      render();
      if (justWon && !winReached) { winReached = true; setTimeout(showWin, 400); }
      else if (!canMove()) setTimeout(showGameOver, 200);
    }
  }

  function canMove() {
    for (var r = 0; r < SIZE; r++) for (var c = 0; c < SIZE; c++) {
      var v = grid[r][c];
      if (v === 0) return true;
      if (v >= MAX_LEVEL) continue;
      if (c + 1 < SIZE && grid[r][c + 1] === v) return true;
      if (r + 1 < SIZE && grid[r + 1][c] === v) return true;
    }
    return false;
  }

  function showWin() {
    if (overlayOpen) return;
    overlayOpen = true;
    var winMsg = (window.getI18n && window.getI18n('crystal.win_msg')) || 'Kristalleri birleştirdin.';
    var scoreLbl = (window.getI18n && window.getI18n('crystal.score_label')) || 'Skor';
    var o = document.createElement('div');
    o.className = 'crystal-overlay';
    o.innerHTML = '<div class="crystal-overlay-box"><h2 data-i18n="crystal.win_title">Dahi\'s One!</h2><p>' + winMsg + '<br><strong>' + scoreLbl + ': ' + score + '</strong></p><button id="crystalWinBtn" data-i18n="crystal.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
    if (window.applyI18n) window.applyI18n();
    o.querySelector('#crystalWinBtn').onclick = function () { o.remove(); initGrid(); };
  }
  function showGameOver() {
    if (overlayOpen) return;
    overlayOpen = true;
    var scoreLbl = (window.getI18n && window.getI18n('crystal.score_label')) || 'Skor';
    var o = document.createElement('div');
    o.className = 'crystal-overlay';
    o.innerHTML = '<div class="crystal-overlay-box"><h2 data-i18n="crystal.gameover">Oyun bitti</h2><p><strong>' + scoreLbl + ': ' + score + '</strong></p><button id="crystalOverBtn" data-i18n="crystal.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
    if (window.applyI18n) window.applyI18n();
    o.querySelector('#crystalOverBtn').onclick = function () { o.remove(); initGrid(); };
  }

  function render() {
    gridEl.innerHTML = '';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement('div');
        cell.className = 'crystal-cell';
        if (grid[r][c] !== 0) { cell.classList.add('l' + grid[r][c]); cell.textContent = LEVELS[grid[r][c]]; }
        gridEl.appendChild(cell);
      }
    }
    if (scoreEl) scoreEl.textContent = score;
  }

  function attachListeners() {
    document.addEventListener('keydown', function (e) {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0) { e.preventDefault(); move(e.key.replace('Arrow','').toLowerCase()); }
    });
    var touchStart = null;
    if (gridEl) {
      gridEl.setAttribute('tabindex', '0');
      gridEl.addEventListener('touchstart', function (e) { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
      gridEl.addEventListener('touchend', function (e) {
        if (!touchStart) return;
        var dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
        else move(dy > 0 ? 'down' : 'up');
        touchStart = null;
      }, { passive: true });
    }
  }

  function run() {
    gridEl = document.getElementById('grid');
    scoreEl = document.getElementById('score');
    if (!gridEl) return;
    attachListeners();
    initGrid();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
