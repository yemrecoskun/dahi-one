(function () {
  'use strict';

  var ROWS = 8;
  var COLS = 8;

  /* Neon renkler – Dahis temasına uygun */
  var COLORS = [
    '#f5576c', /* kırmızı  */
    '#fa709a', /* pembe    */
    '#ff8c00', /* turuncu  */
    '#ffd700', /* sarı     */
    '#43e97b', /* yeşil    */
    '#4facfe', /* mavi     */
    '#a18cd1', /* mor      */
    '#f093fb', /* leylak   */
    '#00f2fe', /* camgöbeği */
    '#43cfca'  /* teal     */
  ];

  /* Her şekil: [satır, sütun] offsetleri */
  var SHAPES = [
    /* 1×1 */
    [[0,0]],
    /* 1×2 */
    [[0,0],[0,1]],
    /* 2×1 */
    [[0,0],[1,0]],
    /* 1×3 */
    [[0,0],[0,1],[0,2]],
    /* 3×1 */
    [[0,0],[1,0],[2,0]],
    /* 2×2 kare */
    [[0,0],[0,1],[1,0],[1,1]],
    /* L şekli */
    [[0,0],[1,0],[2,0],[2,1]],
    /* J şekli */
    [[0,1],[1,1],[2,1],[2,0]],
    /* T şekli */
    [[0,0],[0,1],[0,2],[1,1]],
    /* S şekli */
    [[0,1],[0,2],[1,0],[1,1]],
    /* Z şekli */
    [[0,0],[0,1],[1,1],[1,2]],
    /* 1×4 */
    [[0,0],[0,1],[0,2],[0,3]],
    /* 4×1 */
    [[0,0],[1,0],[2,0],[3,0]],
    /* 2×3 */
    [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],
    /* köşe */
    [[0,0],[0,1],[1,0]]
  ];

  /* Oyun durumu */
  var board = [];           /* 0 = boş, renk = dolu */
  var pieces = [];          /* { shape, color, used } */
  var selectedIdx = -1;
  var score = 0;
  var history = [];         /* undo yığını */

  /* DOM */
  var boardEl = document.getElementById('blokBoard');
  var piecesEl = document.getElementById('blokPieces');
  var scoreEl = document.getElementById('scoreVal');
  var btnUndo = document.getElementById('btnUndo');
  var btnNew = document.getElementById('btnNew');

  /* ------------------------------------------------------------------ */
  /* Yardımcı fonksiyonlar                                               */
  /* ------------------------------------------------------------------ */

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(a, b) { /* [a,b] */
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  /* Tahtayı sıfırla */
  function initBoard() {
    board = [];
    for (var r = 0; r < ROWS; r++) {
      board[r] = [];
      for (var c = 0; c < COLS; c++) {
        board[r][c] = 0;
      }
    }
  }

  /* 3 yeni parça üret */
  function generatePieces() {
    pieces = [];
    var usedColors = [];
    for (var i = 0; i < 3; i++) {
      var shape = randomChoice(SHAPES);
      var color;
      do { color = randomChoice(COLORS); } while (usedColors.indexOf(color) !== -1);
      usedColors.push(color);
      pieces.push({ shape: shape, color: color, used: false });
    }
  }

  /* Belirli bir noktaya parça yerleştirilebilir mi? */
  function canPlace(shape, r, c) {
    for (var i = 0; i < shape.length; i++) {
      var nr = r + shape[i][0];
      var nc = c + shape[i][1];
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (board[nr][nc] !== 0) return false;
    }
    return true;
  }

  /* Herhangi bir kullanılmamış parça tahtaya yerleştirilebilir mi? */
  function anyPieceCanFit() {
    for (var p = 0; p < pieces.length; p++) {
      if (pieces[p].used) continue;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (canPlace(pieces[p].shape, r, c)) return true;
        }
      }
    }
    return false;
  }

  /* Satır/sütun temizle, puan ekle */
  function clearLines() {
    var toClear = { rows: [], cols: [] };

    for (var r = 0; r < ROWS; r++) {
      var full = true;
      for (var c = 0; c < COLS; c++) {
        if (!board[r][c]) { full = false; break; }
      }
      if (full) toClear.rows.push(r);
    }
    for (var c2 = 0; c2 < COLS; c2++) {
      var full2 = true;
      for (var r2 = 0; r2 < ROWS; r2++) {
        if (!board[r2][c2]) { full2 = false; break; }
      }
      if (full2) toClear.cols.push(c2);
    }

    if (!toClear.rows.length && !toClear.cols.length) return 0;

    /* Animasyon */
    for (var ri = 0; ri < toClear.rows.length; ri++) {
      for (var ci = 0; ci < COLS; ci++) {
        var el = getCellEl(toClear.rows[ri], ci);
        if (el) el.classList.add('line-clear');
      }
    }
    for (var ci2 = 0; ci2 < toClear.cols.length; ci2++) {
      for (var ri2 = 0; ri2 < ROWS; ri2++) {
        var el2 = getCellEl(ri2, toClear.cols[ci2]);
        if (el2) el2.classList.add('line-clear');
      }
    }

    setTimeout(function () {
      for (var ri = 0; ri < toClear.rows.length; ri++) {
        for (var ci = 0; ci < COLS; ci++) {
          board[toClear.rows[ri]][ci] = 0;
        }
      }
      for (var ci2 = 0; ci2 < toClear.cols.length; ci2++) {
        for (var ri2 = 0; ri2 < ROWS; ri2++) {
          board[ri2][toClear.cols[ci2]] = 0;
        }
      }
      renderBoard();
    }, 380);

    var cleared = toClear.rows.length + toClear.cols.length;
    /* Bonus: birden fazla satır/sütun */
    var points = cleared * 10 + (cleared > 1 ? (cleared - 1) * 5 : 0);
    return points;
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  function getCellEl(r, c) {
    return boardEl.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
  }

  function renderBoard() {
    var cells = boardEl.querySelectorAll('.blok-cell');
    for (var i = 0; i < cells.length; i++) {
      var el = cells[i];
      var r = parseInt(el.dataset.r, 10);
      var c = parseInt(el.dataset.c, 10);
      el.classList.remove('filled', 'preview', 'preview-invalid', 'line-clear');
      el.style.background = '';
      el.style.boxShadow = '';
      if (board[r][c]) {
        el.classList.add('filled');
        el.style.background = board[r][c];
        el.style.boxShadow = '0 0 8px ' + board[r][c];
      }
    }
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var cell = document.createElement('div');
        cell.className = 'blok-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.addEventListener('mouseenter', onCellHover);
        cell.addEventListener('mouseleave', onCellLeave);
        cell.addEventListener('click', onCellClick);
        /* Dokunma desteği */
        cell.addEventListener('touchstart', onCellTouch, { passive: true });
        boardEl.appendChild(cell);
      }
    }
  }

  function shapeSize(shape) {
    var maxR = 0, maxC = 0;
    for (var i = 0; i < shape.length; i++) {
      if (shape[i][0] > maxR) maxR = shape[i][0];
      if (shape[i][1] > maxC) maxC = shape[i][1];
    }
    return { rows: maxR + 1, cols: maxC + 1 };
  }

  function renderPieces() {
    piecesEl.innerHTML = '';
    for (var i = 0; i < pieces.length; i++) {
      (function (idx) {
        var p = pieces[idx];
        var card = document.createElement('div');
        card.className = 'blok-piece-card' + (p.used ? ' used' : '') + (selectedIdx === idx ? ' selected' : '');
        card.style.setProperty('--piece-color', p.color);

        var sz = shapeSize(p.shape);
        var grid = document.createElement('div');
        grid.className = 'blok-piece-grid';
        grid.style.gridTemplateColumns = 'repeat(' + sz.cols + ', 12px)';
        grid.style.gridTemplateRows = 'repeat(' + sz.rows + ', 12px)';

        /* Doldurulacak hücreler seti */
        var set = {};
        for (var j = 0; j < p.shape.length; j++) {
          set[p.shape[j][0] + ',' + p.shape[j][1]] = true;
        }

        for (var r = 0; r < sz.rows; r++) {
          for (var c2 = 0; c2 < sz.cols; c2++) {
            var pc = document.createElement('div');
            pc.className = 'blok-piece-cell';
            pc.style.background = set[r + ',' + c2] ? p.color : 'transparent';
            if (set[r + ',' + c2]) {
              pc.style.boxShadow = '0 0 6px ' + p.color;
            }
            grid.appendChild(pc);
          }
        }

        card.appendChild(grid);
        if (!p.used) {
          card.addEventListener('click', function () { selectPiece(idx); });
          card.addEventListener('touchstart', function (e) {
            e.preventDefault();
            selectPiece(idx);
          }, { passive: false });
        }
        piecesEl.appendChild(card);
      })(i);
    }
  }

  function renderScore() {
    scoreEl.textContent = score;
  }

  /* ------------------------------------------------------------------ */
  /* Etkileşim                                                           */
  /* ------------------------------------------------------------------ */

  function selectPiece(idx) {
    if (pieces[idx].used) return;
    selectedIdx = (selectedIdx === idx) ? -1 : idx;
    clearPreview();
    renderPieces();
  }

  function onCellHover(e) {
    if (selectedIdx === -1) return;
    var r = parseInt(e.target.dataset.r, 10);
    var c = parseInt(e.target.dataset.c, 10);
    showPreview(r, c);
  }

  function onCellLeave() {
    clearPreview();
  }

  function onCellClick(e) {
    if (selectedIdx === -1) return;
    var r = parseInt(e.target.dataset.r, 10);
    var c = parseInt(e.target.dataset.c, 10);
    placePiece(r, c);
  }

  function onCellTouch(e) {
    if (selectedIdx === -1) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el || !el.dataset.r) return;
    var r = parseInt(el.dataset.r, 10);
    var c = parseInt(el.dataset.c, 10);
    placePiece(r, c);
  }

  function showPreview(r, c) {
    clearPreview();
    if (selectedIdx === -1) return;
    var shape = pieces[selectedIdx].shape;
    var color = pieces[selectedIdx].color;
    var valid = canPlace(shape, r, c);
    for (var i = 0; i < shape.length; i++) {
      var nr = r + shape[i][0];
      var nc = c + shape[i][1];
      var el = getCellEl(nr, nc);
      if (!el) continue;
      el.classList.add('preview');
      if (valid) {
        el.style.background = color;
        el.style.boxShadow = '0 0 8px ' + color;
      } else {
        el.classList.add('preview-invalid');
      }
    }
  }

  function clearPreview() {
    var cells = boardEl.querySelectorAll('.blok-cell.preview');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('preview', 'preview-invalid');
      var r = parseInt(cells[i].dataset.r, 10);
      var c = parseInt(cells[i].dataset.c, 10);
      if (board[r][c]) {
        cells[i].style.background = board[r][c];
        cells[i].style.boxShadow = '0 0 8px ' + board[r][c];
      } else {
        cells[i].style.background = '';
        cells[i].style.boxShadow = '';
      }
    }
  }

  function placePiece(r, c) {
    if (selectedIdx === -1) return;
    var p = pieces[selectedIdx];
    if (!canPlace(p.shape, r, c)) return;

    /* Geri al için durum kaydet */
    var boardSnap = board.map(function (row) { return row.slice(); });
    var piecesSnap = pieces.map(function (pi) { return { shape: pi.shape, color: pi.color, used: pi.used }; });
    history.push({ board: boardSnap, pieces: piecesSnap, score: score, selectedIdx: selectedIdx });
    btnUndo.disabled = false;

    /* Yerleştir */
    for (var i = 0; i < p.shape.length; i++) {
      board[r + p.shape[i][0]][c + p.shape[i][1]] = p.color;
    }
    score += p.shape.length;
    pieces[selectedIdx].used = true;
    selectedIdx = -1;

    renderBoard();
    renderPieces();

    /* Satır/sütun temizle */
    var pts = clearLines();
    score += pts;
    renderScore();

    /* Tüm parçalar kullanıldıysa yeni set */
    var allUsed = pieces.every(function (pi) { return pi.used; });
    if (allUsed) {
      score += 15; /* bonus */
      renderScore();
      generatePieces();
      renderPieces();
    }

    /* Oyun bitti mi? */
    if (!anyPieceCanFit()) {
      setTimeout(showGameOver, 400);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Geri al                                                             */
  /* ------------------------------------------------------------------ */

  function undo() {
    if (!history.length) return;
    var snap = history.pop();
    board = snap.board;
    pieces = snap.pieces;
    score = snap.score;
    selectedIdx = snap.selectedIdx;
    btnUndo.disabled = !history.length;
    renderBoard();
    renderPieces();
    renderScore();
  }

  /* ------------------------------------------------------------------ */
  /* Oyun bitti ekranı                                                   */
  /* ------------------------------------------------------------------ */

  var overEl = null;

  function showGameOver() {
    if (overEl) return;
    overEl = document.createElement('div');
    overEl.className = 'blok-over';

    var box = document.createElement('div');
    box.className = 'blok-over-box';

    var title = document.createElement('h2');
    title.className = 'blok-over-title';
    title.setAttribute('data-i18n', 'blok.over_title');
    title.textContent = 'Oyun Bitti!';

    var msg = document.createElement('p');
    msg.className = 'blok-over-score';
    msg.textContent = 'Puan: ' + score;

    var btn = document.createElement('button');
    btn.className = 'blok-over-btn';
    btn.setAttribute('data-i18n', 'blok.play_again');
    btn.textContent = 'Tekrar Oyna';
    btn.addEventListener('click', function () {
      document.body.removeChild(overEl);
      overEl = null;
      newGame();
    });

    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(btn);
    overEl.appendChild(box);
    document.body.appendChild(overEl);
    requestAnimationFrame(function () { overEl.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------ */
  /* Yeni oyun                                                           */
  /* ------------------------------------------------------------------ */

  function newGame() {
    initBoard();
    generatePieces();
    selectedIdx = -1;
    score = 0;
    history = [];
    btnUndo.disabled = true;
    buildBoard();
    renderPieces();
    renderScore();
  }

  /* ------------------------------------------------------------------ */
  /* Başlat                                                              */
  /* ------------------------------------------------------------------ */

  btnUndo.addEventListener('click', undo);
  btnNew.addEventListener('click', function () {
    if (overEl) { document.body.removeChild(overEl); overEl = null; }
    newGame();
  });

  newGame();
})();
