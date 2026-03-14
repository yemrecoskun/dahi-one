(function () {
  'use strict';
  var ROWS = 9, COLS = 9, MINES = 10;
  var mines = [], revealed = [], flagged = [], gridEl = document.getElementById('grid');
  var mineCountEl = document.getElementById('mineCount');
  var flagCountEl = document.getElementById('flagCount');

  function placeMines(firstR, firstC) {
    mines = [];
    for (var r = 0; r < ROWS; r++) { mines[r] = []; for (var c = 0; c < COLS; c++) mines[r][c] = false; }
    var count = 0;
    while (count < MINES) {
      var r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
      if (mines[r][c] || (r === firstR && c === firstC)) continue;
      mines[r][c] = true;
      count++;
    }
  }
  function countAdjacentMines(r, c) {
    var n = 0;
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      var nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && mines[nr][nc]) n++;
    }
    return n;
  }
  function init(firstR, firstC) {
    placeMines(firstR, firstC);
    revealed = []; flagged = [];
    for (var r = 0; r < ROWS; r++) { revealed[r] = []; flagged[r] = []; for (var c = 0; c < COLS; c++) { revealed[r][c] = false; flagged[r][c] = false; } }
    render();
  }
  var gameStarted = false;
  function startGame(r, c) { if (!gameStarted) { gameStarted = true; init(r, c); } }

  function reveal(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (revealed[r][c] || flagged[r][c]) return;
    if (!gameStarted) startGame(r, c);
    revealed[r][c] = true;
    if (mines[r][c]) { render(); document.body.classList.add('glitch-gameover'); setTimeout(showGameOver, 400); return; }
    if (countAdjacentMines(r, c) === 0) {
      for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc);
    }
    render();
    checkWin();
  }
  function toggleFlag(r, c) {
    if (!gameStarted) return;
    if (revealed[r][c]) return;
    flagged[r][c] = !flagged[r][c];
    render();
  }
  function checkWin() {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (!mines[r][c] && !revealed[r][c]) return;
    document.querySelector('.glitch-game-wrap').classList.add('glitch-win');
    setTimeout(showWin, 300);
  }
  function showGameOver() {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) revealed[r][c] = true;
    render();
    var o = document.createElement('div');
    o.className = 'glitch-overlay';
    o.innerHTML = '<div class="glitch-overlay-box"><h2 data-i18n="glitch.gameover">Virüs!</h2><p data-i18n="glitch.gameover_msg">Veri tabanı bozuldu. Tekrar dene.</p><button id="glitchOverBtn" data-i18n="glitch.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
    o.querySelector('#glitchOverBtn').onclick = function () { o.remove(); document.body.classList.remove('glitch-gameover'); gameStarted = false; render(); };
  }
  function showWin() {
    var o = document.createElement('div');
    o.className = 'glitch-overlay';
    o.innerHTML = '<div class="glitch-overlay-box"><h2 data-i18n="glitch.win_title">Temizlendi!</h2><p data-i18n="glitch.win_msg">Tüm virüslü hücreleri işaretledin. Saatin ekranı parladı.</p><button id="glitchWinBtn" data-i18n="glitch.play_again">Tekrar oyna</button></div>';
    document.body.appendChild(o);
    o.querySelector('#glitchWinBtn').onclick = function () { o.remove(); document.querySelector('.glitch-game-wrap').classList.remove('glitch-win'); gameStarted = false; render(); };
  }

  function render() {
    if (!gameStarted) {
      gridEl.innerHTML = '';
      gridEl.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
      gridEl.style.gridTemplateRows = 'repeat(' + ROWS + ', 1fr)';
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'glitch-cell';
        cell.dataset.r = r; cell.dataset.c = c;
        cell.textContent = '';
        cell.onclick = function () { reveal(parseInt(this.dataset.r,10), parseInt(this.dataset.c,10)); };
        cell.oncontextmenu = function (e) { e.preventDefault(); toggleFlag(parseInt(this.dataset.r,10), parseInt(this.dataset.c,10)); };
        gridEl.appendChild(cell);
      }
      if (mineCountEl) mineCountEl.textContent = MINES;
      if (flagCountEl) flagCountEl.textContent = '0';
      return;
    }
    var flags = 0;
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var cell = gridEl.querySelector('.glitch-cell[data-r="' + r + '"][data-c="' + c + '"]');
      if (!cell) continue;
          cell.className = 'glitch-cell';
          if (flagged[r][c]) { cell.classList.add('flagged'); cell.textContent = '◆'; flags++; }
          else if (revealed[r][c]) {
            cell.classList.add('revealed');
            if (mines[r][c]) cell.classList.add('mine'), cell.textContent = '✕';
            else { var n = countAdjacentMines(r, c); if (n > 0) cell.classList.add('n' + n), cell.textContent = n; else cell.textContent = ''; }
          } else cell.textContent = '';
    }
    if (flagCountEl) flagCountEl.textContent = flags;
  }

  render();
})();
