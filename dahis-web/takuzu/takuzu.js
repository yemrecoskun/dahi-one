(function () {
  'use strict';

  var SIZE = 6;
  var SYM1 = 1;  /* turuncu daire ● */
  var SYM2 = 2;  /* mavi ay ☽ */

  function createPuzzle() {
    var solution = [
      [1, 1, 2, 2, 1, 2],
      [2, 2, 1, 1, 2, 1],
      [1, 2, 1, 2, 2, 1],
      [2, 1, 2, 1, 1, 2],
      [1, 2, 2, 1, 2, 1],
      [2, 1, 1, 2, 1, 2]
    ];
    var hEdges = [], vEdges = [], hVisible = [], vVisible = [];
    for (var r = 0; r < SIZE; r++) {
      hEdges[r] = []; hVisible[r] = [];
      for (var c = 0; c < SIZE - 1; c++) {
        hEdges[r][c] = solution[r][c] === solution[r][c + 1] ? '=' : 'X';
        hVisible[r][c] = Math.random() < 0.45;
      }
    }
    for (var r = 0; r < SIZE - 1; r++) {
      vEdges[r] = []; vVisible[r] = [];
      for (var c = 0; c < SIZE; c++) {
        vEdges[r][c] = solution[r][c] === solution[r + 1][c] ? '=' : 'X';
        vVisible[r][c] = Math.random() < 0.45;
      }
    }
    var mask = [
      [1, 1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0],
      [0, 0, 0, 1, 2, 0],
      [1, 0, 0, 0, 0, 0],
      [0, 2, 2, 0, 1, 1]
    ];
    var grid = [];
    var fixed = [];
    for (var r = 0; r < SIZE; r++) {
      grid[r] = [];
      fixed[r] = [];
      for (var c = 0; c < SIZE; c++) {
        grid[r][c] = mask[r][c] ? solution[r][c] : 0;
        fixed[r][c] = !!mask[r][c];
      }
    }
    return { grid: grid, fixed: fixed, solution: solution, hEdges: hEdges, vEdges: vEdges, hVisible: hVisible, vVisible: vVisible };
  }

  var state = createPuzzle();
  var grid = state.grid;
  var fixed = state.fixed;
  var solution = state.solution;
  var hEdges = state.hEdges;
  var vEdges = state.vEdges;
  var hVisible = state.hVisible;
  var vVisible = state.vVisible;
  var selected = null;
  var history = [];

  var gridEl = document.getElementById('tkzGrid');
  var btnSym1 = document.getElementById('btnSym1');
  var btnSym2 = document.getElementById('btnSym2');
  var btnUndo = document.getElementById('btnUndo');
  var btnHint = document.getElementById('btnHint');

  function pushHistory() {
    var copy = [];
    for (var r = 0; r < SIZE; r++) copy[r] = grid[r].slice();
    history.push(copy);
  }

  function setCell(r, c, val) {
    if (fixed[r][c]) return;
    pushHistory();
    grid[r][c] = val;
    render();
    checkWin();
  }

  function undo() {
    if (history.length === 0) return;
    var prev = history.pop();
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (!fixed[r][c]) grid[r][c] = prev[r][c];
    render();
  }

  function countRow(r, val) {
    var n = 0;
    for (var c = 0; c < SIZE; c++) if (grid[r][c] === val) n++;
    return n;
  }
  function countCol(c, val) {
    var n = 0;
    for (var r = 0; r < SIZE; r++) if (grid[r][c] === val) n++;
    return n;
  }
  function maxConsecutive(arr) {
    var max = 0, cur = 0, prev = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === 0) { cur = 0; prev = 0; continue; }
      if (arr[i] === prev) cur++; else cur = 1;
      prev = arr[i];
      if (cur > max) max = cur;
    }
    return max;
  }
  function checkWin() {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) return;
    for (var r = 0; r < SIZE; r++) {
      if (countRow(r, SYM1) !== 3 || countRow(r, SYM2) !== 3) return;
      var row = [];
      for (var c = 0; c < SIZE; c++) row.push(grid[r][c]);
      if (maxConsecutive(row) > 2) return;
    }
    for (var c = 0; c < SIZE; c++) {
      if (countCol(c, SYM1) !== 3 || countCol(c, SYM2) !== 3) return;
      var col = [];
      for (var rr = 0; rr < SIZE; rr++) col.push(grid[rr][c]);
      if (maxConsecutive(col) > 2) return;
    }
    for (r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE - 1; c++) {
        var a = grid[r][c], b = grid[r][c + 1];
        if (a && b && hEdges[r][c] === '=' && a !== b) return;
        if (a && b && hEdges[r][c] === 'X' && a === b) return;
      }
    for (r = 0; r < SIZE - 1; r++)
      for (c = 0; c < SIZE; c++) {
        a = grid[r][c]; b = grid[r + 1][c];
        if (a && b && vEdges[r][c] === '=' && a !== b) return;
        if (a && b && vEdges[r][c] === 'X' && a === b) return;
      }
    showWin();
  }

  function findEmpty() {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) return { r: r, c: c };
    return null;
  }

  function hint() {
    var cell = findEmpty();
    if (!cell) return;
    setCell(cell.r, cell.c, solution[cell.r][cell.c]);
    var el = gridEl.querySelector('.tkz-cell[data-r="' + cell.r + '"][data-c="' + cell.c + '"]');
    if (el) {
      el.classList.add('tkz-cell-hint');
      setTimeout(function () { el.classList.remove('tkz-cell-hint'); }, 600);
    }
  }

  var winEl = null;
  function showWin() {
    if (winEl) return;
    winEl = document.createElement('div');
    winEl.className = 'tkz-win';
    winEl.innerHTML = '<div class="tkz-win-box">' +
      '<h2 class="tkz-win-title" data-i18n="tkz.win_title">Tebrikler!</h2>' +
      '<p class="tkz-win-msg" data-i18n="tkz.win_msg">Bulmacayı tamamladın.</p>' +
      '<button type="button" class="tkz-win-btn" id="tkzWinAgain" data-i18n="tkz.play_again">Tekrar Oyna</button>' +
      '</div>';
    document.body.appendChild(winEl);
    setTimeout(function () { winEl.classList.add('is-visible'); }, 100);
    winEl.querySelector('#tkzWinAgain').addEventListener('click', function () {
      winEl.classList.remove('is-visible');
      setTimeout(function () {
        state = createPuzzle();
        grid = state.grid;
        fixed = state.fixed;
        solution = state.solution;
        hEdges = state.hEdges;
        vEdges = state.vEdges;
        hVisible = state.hVisible;
        vVisible = state.vVisible;
        history = [];
        selected = null;
        render();
        if (winEl.parentNode) winEl.parentNode.removeChild(winEl);
        winEl = null;
      }, 300);
    });
  }

  function render() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(11, 1fr)';
    gridEl.style.gridTemplateRows = 'repeat(11, 1fr)';

    for (var row = 0; row < 11; row++) {
      for (var col = 0; col < 11; col++) {
        var evenRow = (row % 2 === 0);
        var evenCol = (col % 2 === 0);
        var r = evenRow ? row / 2 : (row - 1) / 2;
        var c = evenCol ? col / 2 : (col - 1) / 2;

        if (evenRow && evenCol && r < SIZE && c < SIZE) {
          var cell = document.createElement('div');
          cell.className = 'tkz-cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.style.gridColumn = col + 1;
          cell.style.gridRow = row + 1;
          if (fixed[r][c]) cell.classList.add('fixed');
          if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
          if (grid[r][c] === SYM1) {
            var s1 = document.createElement('span');
            s1.className = 'tkz-sym tkz-sym-1';
            s1.textContent = '●';
            cell.appendChild(s1);
          } else if (grid[r][c] === SYM2) {
            var s2 = document.createElement('span');
            s2.className = 'tkz-sym tkz-sym-2';
            s2.textContent = '☽';
            cell.appendChild(s2);
          }
          cell.addEventListener('click', function () {
            var rr = parseInt(this.dataset.r, 10);
            var cc = parseInt(this.dataset.c, 10);
            selected = { r: rr, c: cc };
            render();
          });
          gridEl.appendChild(cell);
        } else if (evenRow && !evenCol && c < SIZE - 1) {
          var he = document.createElement('div');
          he.className = 'tkz-edge ' + (hEdges[r][c] === '=' ? 'eq' : 'x');
          he.style.gridColumn = col + 1;
          he.style.gridRow = row + 1;
          he.textContent = hVisible[r][c] ? hEdges[r][c] : '';
          gridEl.appendChild(he);
        } else if (!evenRow && evenCol && r < SIZE - 1) {
          var ve = document.createElement('div');
          ve.className = 'tkz-edge ' + (vEdges[r][c] === '=' ? 'eq' : 'x');
          ve.style.gridColumn = col + 1;
          ve.style.gridRow = row + 1;
          ve.textContent = vVisible[r][c] ? vEdges[r][c] : '';
          gridEl.appendChild(ve);
        } else {
          var corner = document.createElement('div');
          corner.className = 'tkz-corner';
          corner.style.gridColumn = col + 1;
          corner.style.gridRow = row + 1;
          gridEl.appendChild(corner);
        }
      }
    }

    btnUndo.disabled = history.length === 0;
  }

  btnSym1.addEventListener('click', function () {
    if (selected) setCell(selected.r, selected.c, SYM1);
  });
  btnSym2.addEventListener('click', function () {
    if (selected) setCell(selected.r, selected.c, SYM2);
  });
  btnUndo.addEventListener('click', undo);
  btnHint.addEventListener('click', hint);

  render();
})();
