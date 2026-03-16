(function () {
  'use strict';
  var SIZE = 4;
  var LEVELS = ['Enerji', 'Lumo', 'Vigo', 'Zest', 'Puls', 'Aura', "Dahi's One"];
  var grid = [], score = 0, winShown = false;
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
    grid[cell[0]][cell[1]] = Math.random() < 0.9 ? 0 : 1;
    return true;
  }
  function initGrid() {
    grid = [];
    for (var r = 0; r < SIZE; r++) { grid[r] = []; for (var c = 0; c < SIZE; c++) grid[r][c] = 0; }
    score = 0;
    spawn();
    spawn();
    render();
  }

  function mergeLine(line) {
    var arr = line.filter(function (v) { return v > 0; });
    var out = [], i = 0;
    while (i < arr.length) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1] && arr[i] < 6) {
        out.push(arr[i] + 1);
        score += (arr[i] + 1) * 10;
        if (arr[i] + 1 === 6) winShown = true;
        i += 2;
      } else { out.push(arr[i]); i++; }
    }
    while (out.length < SIZE) out.push(0);
    return out.slice(0, SIZE);
  }
  function move(dir) {
    var moved = false;
    if (dir === 'left' || dir === 'right') {
      for (var r = 0; r < SIZE; r++) {
        var line = dir === 'left' ? grid[r].slice() : grid[r].slice().reverse();
        var merged = mergeLine(line);
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
        var merged = mergeLine(line);
        if (dir === 'down') merged.reverse();
        for (var r = 0; r < SIZE; r++) {
          if (grid[r][c] !== merged[r]) moved = true;
          grid[r][c] = merged[r];
        }
      }
    }
    if (moved) { spawn(); render(); if (winShown) setTimeout(showWin, 400); }
    else if (emptyCells().length === 0) setTimeout(showGameOver, 100);
  }

  function showWin() {
    var o = document.createElement('div');
    o.className = 'crystal-overlay';
    o.innerHTML = '<div class="crystal-overlay-box"><h2 data-i18n="crystal.win_title">Dahi\'s One!</h2><p data-i18n="crystal.win_msg">Kristalleri birleştirdin. Skor: ' + score + '</p><button id="crystalWinBtn" data-i18n="crystal.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
    o.querySelector('#crystalWinBtn').onclick = function () { o.remove(); winShown = false; initGrid(); };
  }
  function showGameOver() {
    var o = document.createElement('div');
    o.className = 'crystal-overlay';
    o.innerHTML = '<div class="crystal-overlay-box"><h2 data-i18n="crystal.gameover">Oyun bitti</h2><p>Skor: ' + score + '</p><button id="crystalOverBtn" data-i18n="crystal.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
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
