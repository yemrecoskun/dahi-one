(function () {
    'use strict';

    /* ── Puzzles ──────────────────────────────────────────────────
       Each solution grid maps every cell to a piece ID (1-based).
       Pieces are extracted automatically from the solution.
    ─────────────────────────────────────────────────────────────── */
    var PUZZLES = [
        {
            rows: 4,
            cols: 4,
            /*
             * 1 1 2 2
             * 1 3 3 2
             * 4 3 5 2
             * 4 4 5 5
             */
            solution: [
                [1, 1, 2, 2],
                [1, 3, 3, 2],
                [4, 3, 5, 2],
                [4, 4, 5, 5]
            ]
        },
        {
            rows: 5,
            cols: 5,
            /*
             * 1 2 2 3 3
             * 1 2 4 4 3
             * 1 5 4 6 6
             * 7 5 5 6 8
             * 7 7 8 8 8
             */
            solution: [
                [1, 2, 2, 3, 3],
                [1, 2, 4, 4, 3],
                [1, 5, 4, 6, 6],
                [7, 5, 5, 6, 8],
                [7, 7, 8, 8, 8]
            ]
        },
        {
            rows: 6,
            cols: 6,
            /*
             *  1  1  2  3  3  4
             *  1  2  2  3  4  4
             *  5  6  6  7  7  8
             *  5  5  6  7  8  8
             *  9 10 10 11 12 12
             *  9  9 10 11 11 12
             */
            solution: [
                [ 1,  1,  2,  3,  3,  4],
                [ 1,  2,  2,  3,  4,  4],
                [ 5,  6,  6,  7,  7,  8],
                [ 5,  5,  6,  7,  8,  8],
                [ 9, 10, 10, 11, 12, 12],
                [ 9,  9, 10, 11, 11, 12]
            ]
        }
    ];

    /* ── Neon colour palette (matches Dahis character colours) ─── */
    var COLORS = [
        '#ff4444',  /* Puls – red        */
        '#4488ff',  /* Aura – blue       */
        '#ffdd44',  /* Lumo – yellow     */
        '#44dd88',  /* Vigo – green      */
        '#ff8844',  /* Zest – orange     */
        '#f093fb',  /* pink              */
        '#00f2fe',  /* cyan              */
        '#fa709a',  /* rose              */
        '#43e97b',  /* mint              */
        '#667eea',  /* purple            */
        '#ffd700',  /* gold              */
        '#f5576c'   /* crimson           */
    ];

    /* ── State ─────────────────────────────────────────────────── */
    var currentPuzzleIndex = 0;
    var puzzle = null;
    var grid = [];      /* 2-D array; 0 = empty, otherwise piece id */
    var pieces = [];
    var selectedId = null;
    var history = [];   /* [{pieceId, r, c}] */
    var hoverR = -1;
    var hoverC = -1;

    /* ── DOM references ─────────────────────────────────────────── */
    var gridEl      = document.getElementById('bpGrid');
    var trayEl      = document.getElementById('bpTray');
    var btnUndo     = document.getElementById('btnUndo');
    var btnReset    = document.getElementById('btnReset');
    var winModal    = document.getElementById('winModal');
    var btnPlayAgain = document.getElementById('btnPlayAgain');
    var levelBtns   = document.querySelectorAll('.bp-level-btn');

    /* ── Piece extraction ───────────────────────────────────────── */
    function extractPieces(puz) {
        var map = {};
        var r, c, id;
        for (r = 0; r < puz.rows; r++) {
            for (c = 0; c < puz.cols; c++) {
                id = puz.solution[r][c];
                if (!map[id]) { map[id] = []; }
                map[id].push([r, c]);
            }
        }
        var ids = Object.keys(map).map(Number).sort(function (a, b) { return a - b; });
        return ids.map(function (pid) {
            var cells = map[pid];
            var minR = cells.reduce(function (m, cell) { return Math.min(m, cell[0]); }, Infinity);
            var minC = cells.reduce(function (m, cell) { return Math.min(m, cell[1]); }, Infinity);
            var normalized = cells.map(function (cell) { return [cell[0] - minR, cell[1] - minC]; });
            return {
                id: pid,
                cells: normalized,
                color: COLORS[(pid - 1) % COLORS.length],
                placed: false
            };
        });
    }

    /* ── Helpers ────────────────────────────────────────────────── */
    function getPiece(id) {
        var i;
        for (i = 0; i < pieces.length; i++) {
            if (pieces[i].id === id) { return pieces[i]; }
        }
        return null;
    }

    function canPlace(piece, ar, ac) {
        var i, r, c;
        for (i = 0; i < piece.cells.length; i++) {
            r = ar + piece.cells[i][0];
            c = ac + piece.cells[i][1];
            if (r < 0 || r >= puzzle.rows || c < 0 || c >= puzzle.cols) { return false; }
            if (grid[r][c] !== 0) { return false; }
        }
        return true;
    }

    /* ── Initialise ─────────────────────────────────────────────── */
    function init(puzzleIndex) {
        var r, c;
        currentPuzzleIndex = puzzleIndex;
        puzzle = PUZZLES[puzzleIndex];

        grid = [];
        for (r = 0; r < puzzle.rows; r++) {
            grid[r] = [];
            for (c = 0; c < puzzle.cols; c++) {
                grid[r][c] = 0;
            }
        }

        pieces = extractPieces(puzzle);
        selectedId = null;
        history = [];
        hoverR = -1;
        hoverC = -1;

        renderGrid();
        renderTray();
        btnUndo.disabled = true;
    }

    /* ── Grid rendering ─────────────────────────────────────────── */
    function renderGrid() {
        var r, c, cell, pieceId, p, key;
        var selPiece = selectedId ? getPiece(selectedId) : null;
        var previewSet = {};
        var validPreview = false;

        if (selPiece && hoverR >= 0) {
            validPreview = canPlace(selPiece, hoverR, hoverC);
            for (var pi = 0; pi < selPiece.cells.length; pi++) {
                key = (hoverR + selPiece.cells[pi][0]) + ',' + (hoverC + selPiece.cells[pi][1]);
                previewSet[key] = true;
            }
        }

        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = 'repeat(' + puzzle.cols + ', 1fr)';

        for (r = 0; r < puzzle.rows; r++) {
            for (c = 0; c < puzzle.cols; c++) {
                cell = document.createElement('div');
                cell.className = 'bp-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;

                pieceId = grid[r][c];
                if (pieceId) {
                    p = getPiece(pieceId);
                    cell.classList.add('bp-cell-filled');
                    cell.style.background = p.color;
                    cell.style.boxShadow = '0 0 8px ' + p.color + '99, inset 0 1px 0 rgba(255,255,255,0.22)';
                } else if (previewSet[r + ',' + c]) {
                    if (validPreview && selPiece) {
                        cell.classList.add('bp-cell-preview');
                        cell.style.background = selPiece.color + '44';
                        cell.style.boxShadow = '0 0 6px ' + selPiece.color + '88';
                        cell.style.borderColor = selPiece.color + 'aa';
                    } else {
                        cell.classList.add('bp-cell-invalid');
                    }
                }

                cell.addEventListener('mouseenter', onCellEnter);
                cell.addEventListener('mouseleave', onCellLeave);
                cell.addEventListener('click', onCellClick);

                gridEl.appendChild(cell);
            }
        }
    }

    function onCellEnter() {
        hoverR = parseInt(this.dataset.r, 10);
        hoverC = parseInt(this.dataset.c, 10);
        if (selectedId) { renderGrid(); }
    }

    function onCellLeave() {
        hoverR = -1;
        hoverC = -1;
        if (selectedId) { renderGrid(); }
    }

    function onCellClick() {
        if (!selectedId) { return; }
        var piece = getPiece(selectedId);
        var r = parseInt(this.dataset.r, 10);
        var c = parseInt(this.dataset.c, 10);
        if (!canPlace(piece, r, c)) { return; }

        /* Save undo snapshot */
        history.push({ pieceId: piece.id, r: r, c: c });

        /* Place on grid */
        var i;
        for (i = 0; i < piece.cells.length; i++) {
            grid[r + piece.cells[i][0]][c + piece.cells[i][1]] = piece.id;
        }
        piece.placed = true;
        selectedId = null;

        btnUndo.disabled = false;
        renderGrid();
        renderTray();
        checkWin();
    }

    /* ── Tray rendering ─────────────────────────────────────────── */
    function renderTray() {
        var i, unplaced = [];
        for (i = 0; i < pieces.length; i++) {
            if (!pieces[i].placed) { unplaced.push(pieces[i]); }
        }
        trayEl.innerHTML = '';
        for (i = 0; i < unplaced.length; i++) {
            trayEl.appendChild(makePieceEl(unplaced[i]));
        }
    }

    function makePieceEl(piece) {
        var i, r, c, cell;
        var maxR = 0, maxC = 0;
        for (i = 0; i < piece.cells.length; i++) {
            if (piece.cells[i][0] > maxR) { maxR = piece.cells[i][0]; }
            if (piece.cells[i][1] > maxC) { maxC = piece.cells[i][1]; }
        }

        var cellSet = {};
        for (i = 0; i < piece.cells.length; i++) {
            cellSet[piece.cells[i][0] + ',' + piece.cells[i][1]] = true;
        }

        var wrap = document.createElement('div');
        wrap.className = 'bp-piece-preview' + (selectedId === piece.id ? ' bp-piece-selected' : '');
        wrap.dataset.id = piece.id;
        wrap.style.setProperty('--piece-color', piece.color);
        wrap.title = 'Blok ' + piece.id;

        var mini = document.createElement('div');
        mini.className = 'bp-mini-grid';
        mini.style.gridTemplateColumns = 'repeat(' + (maxC + 1) + ', 18px)';
        mini.style.gridTemplateRows = 'repeat(' + (maxR + 1) + ', 18px)';

        for (r = 0; r <= maxR; r++) {
            for (c = 0; c <= maxC; c++) {
                cell = document.createElement('div');
                if (cellSet[r + ',' + c]) {
                    cell.className = 'bp-mini-cell bp-mini-filled';
                    cell.style.background = piece.color;
                    cell.style.boxShadow = '0 0 5px ' + piece.color;
                } else {
                    cell.className = 'bp-mini-cell bp-mini-empty';
                }
                mini.appendChild(cell);
            }
        }

        wrap.appendChild(mini);

        wrap.addEventListener('click', function () {
            var id = parseInt(this.dataset.id, 10);
            selectedId = (selectedId === id) ? null : id;
            hoverR = -1;
            hoverC = -1;
            renderGrid();
            renderTray();
        });

        return wrap;
    }

    /* ── Undo ───────────────────────────────────────────────────── */
    function undo() {
        if (!history.length) { return; }
        var last = history.pop();
        var piece = getPiece(last.pieceId);
        var i;
        for (i = 0; i < piece.cells.length; i++) {
            grid[last.r + piece.cells[i][0]][last.c + piece.cells[i][1]] = 0;
        }
        piece.placed = false;
        selectedId = null;
        hoverR = -1;
        hoverC = -1;
        btnUndo.disabled = history.length === 0;
        renderGrid();
        renderTray();
    }

    /* ── Win check ──────────────────────────────────────────────── */
    function checkWin() {
        var r, c;
        for (r = 0; r < puzzle.rows; r++) {
            for (c = 0; c < puzzle.cols; c++) {
                if (!grid[r][c]) { return; }
            }
        }
        setTimeout(function () {
            winModal.classList.add('bp-modal-visible');
            winModal.setAttribute('aria-hidden', 'false');
        }, 300);
    }

    /* ── Level buttons ──────────────────────────────────────────── */
    var i;
    for (i = 0; i < levelBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.dataset.level, 10);
                var j;
                for (j = 0; j < levelBtns.length; j++) {
                    levelBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                winModal.classList.remove('bp-modal-visible');
                winModal.setAttribute('aria-hidden', 'true');
                init(idx);
            });
        }(levelBtns[i]));
    }

    /* ── Action buttons ─────────────────────────────────────────── */
    btnUndo.addEventListener('click', undo);

    btnReset.addEventListener('click', function () {
        winModal.classList.remove('bp-modal-visible');
        winModal.setAttribute('aria-hidden', 'true');
        init(currentPuzzleIndex);
    });

    btnPlayAgain.addEventListener('click', function () {
        winModal.classList.remove('bp-modal-visible');
        winModal.setAttribute('aria-hidden', 'true');
        init(currentPuzzleIndex);
    });

    /* ── Start ──────────────────────────────────────────────────── */
    init(0);

}());
