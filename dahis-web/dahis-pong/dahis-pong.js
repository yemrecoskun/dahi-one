(() => {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const WINNING_SCORE = 10;
  const PADDLE_H_RATIO = 0.18;   // paddle height as fraction of canvas height
  const PADDLE_W = 12;
  const PADDLE_MARGIN = 18;
  const BALL_RADIUS_RATIO = 0.022;
  const BALL_SPEED_INIT = 5;
  const BALL_SPEED_MAX = 14;
  const BALL_SPEED_INC = 0.35;   // speed added each hit
  const AI_SPEED_RATIO = 0.055;  // fraction of canvas height per frame
  const CENTER_LINE_SEGS = 12;

  // ── State ──────────────────────────────────────────────────────────────────
  let mode = null; // 'ai' or 'two'
  let running = false;
  let animId = null;

  let canvasW, canvasH;
  let paddleH, ballR;

  let scoreL = 0, scoreR = 0;

  // Paddles: y = top-left corner
  let paddleL = {}, paddleR = {};
  let ball = {};

  // Mouse / touch tracking for player paddle
  let mousePaddleY = null; // desired center-y for left paddle (player 1)
  let mousePaddleR = null; // desired center-y for right paddle (player 2, two-player mode)

  // Keyboard state
  const keys = {};

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const modeScreen = document.getElementById('pongModeScreen');
  const gameWrap = document.getElementById('pongGameWrap');
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('pongOverlay');
  const overlayTitle = document.getElementById('pongOverlayTitle');
  const overlayMsg = document.getElementById('pongOverlayMsg');
  const overlayBtn = document.getElementById('pongOverlayBtn');
  const btnRestart = document.getElementById('btnPongRestart');
  const btnMode = document.getElementById('btnPongMode');
  const scoreNumL = document.getElementById('pongScoreL');
  const scoreNumR = document.getElementById('pongScoreR');

  // ── Mode buttons ───────────────────────────────────────────────────────────
  document.getElementById('btnModeAI').addEventListener('click', () => startGame('ai'));
  document.getElementById('btnModeTwo').addEventListener('click', () => startGame('two'));
  overlayBtn.addEventListener('click', restartGame);
  btnRestart.addEventListener('click', restartGame);
  btnMode.addEventListener('click', returnToMenu);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => { keys[e.code] = true; });
  document.addEventListener('keyup', e => { keys[e.code] = false; });

  // ── Mouse ──────────────────────────────────────────────────────────────────
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvasH / rect.height;
    const cy = (e.clientY - rect.top) * scaleY;
    if (mode === 'two') {
      // Left half → left paddle, right half → right paddle
      const cx = (e.clientX - rect.left) * (canvasW / rect.width);
      if (cx < canvasW / 2) mousePaddleY = cy;
      else mousePaddleR = cy;
    } else {
      mousePaddleY = cy;
    }
  });

  // ── Touch ──────────────────────────────────────────────────────────────────
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvasH / rect.height;
    const scaleX = canvasW / rect.width;
    for (const t of e.changedTouches) {
      const cx = (t.clientX - rect.left) * scaleX;
      const cy = (t.clientY - rect.top) * scaleY;
      if (mode === 'two') {
        if (cx < canvasW / 2) mousePaddleY = cy;
        else mousePaddleR = cy;
      } else {
        mousePaddleY = cy;
      }
    }
  }, { passive: false });

  // ── Init game ──────────────────────────────────────────────────────────────
  function startGame(m) {
    mode = m;
    modeScreen.classList.add('hidden');
    gameWrap.classList.remove('hidden');
    // Update P2 label
    const t = (k) => (window.getI18n ? window.getI18n(k) : k);
    const p2Label = document.getElementById('pongP2Label');
    if (p2Label) {
      p2Label.textContent = mode === 'ai' ? t('pong.player2_ai') : t('pong.player2');
    }
    resetGame();
  }

  function returnToMenu() {
    cancelAnimationFrame(animId);
    running = false;
    gameWrap.classList.add('hidden');
    modeScreen.classList.remove('hidden');
    overlay.classList.add('hidden');
  }

  function resetGame() {
    scoreL = 0;
    scoreR = 0;
    updateScore();
    overlay.classList.add('hidden');
    setupCanvas();
    resetBall(0);
    running = true;
    cancelAnimationFrame(animId);
    loop();
  }

  function restartGame() {
    resetGame();
  }

  function setupCanvas() {
    // Responsive sizing
    const maxW = Math.min(gameWrap.clientWidth - 32, 640);
    canvasW = maxW;
    canvasH = Math.round(canvasW * 0.5625); // 16:9
    canvas.width = canvasW;
    canvas.height = canvasH;

    paddleH = Math.round(canvasH * PADDLE_H_RATIO);
    ballR = Math.round(canvasW * BALL_RADIUS_RATIO);

    // Center paddles
    paddleL = { x: PADDLE_MARGIN, y: (canvasH - paddleH) / 2 };
    paddleR = { x: canvasW - PADDLE_MARGIN - PADDLE_W, y: (canvasH - paddleH) / 2 };

    mousePaddleY = canvasH / 2;
    mousePaddleR = canvasH / 2;
  }

  function resetBall(dir) {
    // dir: 1 = toward right, -1 = toward left, 0 = random
    ball = {
      x: canvasW / 2,
      y: canvasH / 2,
      speed: BALL_SPEED_INIT,
      vx: 0,
      vy: 0,
    };
    const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
    const xDir = dir === 0 ? (Math.random() < 0.5 ? 1 : -1) : dir;
    ball.vx = xDir * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  // ── Update paddles ─────────────────────────────────────────────────────────
  function updatePaddles() {
    const spd = canvasH * 0.018;

    // ── Left paddle (Player 1): W/S or ↑/↓, or mouse/touch ──────────────────
    let targetL = null;
    if (keys['KeyW'] || keys['ArrowUp']) {
      paddleL.y = Math.max(0, paddleL.y - spd);
    } else if (keys['KeyS'] || keys['ArrowDown']) {
      paddleL.y = Math.min(canvasH - paddleH, paddleL.y + spd);
    } else if (mousePaddleY !== null) {
      targetL = mousePaddleY - paddleH / 2;
    }
    if (targetL !== null) {
      const diff = targetL - paddleL.y;
      paddleL.y += Math.sign(diff) * Math.min(Math.abs(diff), spd * 1.5);
      paddleL.y = Math.max(0, Math.min(canvasH - paddleH, paddleL.y));
    }

    // ── Right paddle (Player 2 / AI) ──────────────────────────────────────────
    if (mode === 'two') {
      let targetR = null;
      if (keys['Digit8'] || keys['Numpad8']) {
        paddleR.y = Math.max(0, paddleR.y - spd);
      } else if (keys['Digit2'] || keys['Numpad2']) {
        paddleR.y = Math.min(canvasH - paddleH, paddleR.y + spd);
      } else if (mousePaddleR !== null) {
        targetR = mousePaddleR - paddleH / 2;
      }
      if (targetR !== null) {
        const diff = targetR - paddleR.y;
        paddleR.y += Math.sign(diff) * Math.min(Math.abs(diff), spd * 1.5);
        paddleR.y = Math.max(0, Math.min(canvasH - paddleH, paddleR.y));
      }
    } else {
      // AI: track ball with slight delay / speed cap
      const aiSpeed = canvasH * AI_SPEED_RATIO;
      const paddleCenterR = paddleR.y + paddleH / 2;
      const diff = ball.y - paddleCenterR;
      const move = Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);
      paddleR.y = Math.max(0, Math.min(canvasH - paddleH, paddleR.y + move));
    }
  }

  // ── Ball physics ───────────────────────────────────────────────────────────
  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top / bottom walls
    if (ball.y - ballR <= 0) {
      ball.y = ballR;
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y + ballR >= canvasH) {
      ball.y = canvasH - ballR;
      ball.vy = -Math.abs(ball.vy);
    }

    // Left paddle collision
    if (
      ball.vx < 0 &&
      ball.x - ballR <= paddleL.x + PADDLE_W &&
      ball.x - ballR >= paddleL.x &&
      ball.y >= paddleL.y &&
      ball.y <= paddleL.y + paddleH
    ) {
      reflectOffPaddle(paddleL, 1);
    }

    // Right paddle collision
    if (
      ball.vx > 0 &&
      ball.x + ballR >= paddleR.x &&
      ball.x + ballR <= paddleR.x + PADDLE_W &&
      ball.y >= paddleR.y &&
      ball.y <= paddleR.y + paddleH
    ) {
      reflectOffPaddle(paddleR, -1);
    }

    // Scoring
    if (ball.x + ballR < 0) {
      scoreR++;
      updateScore();
      if (scoreR >= WINNING_SCORE) { endGame('right'); return; }
      resetBall(1);
    } else if (ball.x - ballR > canvasW) {
      scoreL++;
      updateScore();
      if (scoreL >= WINNING_SCORE) { endGame('left'); return; }
      resetBall(-1);
    }
  }

  function reflectOffPaddle(paddle, xDir) {
    const paddleCenter = paddle.y + paddleH / 2;
    const hitPos = (ball.y - paddleCenter) / (paddleH / 2); // -1 to 1
    const maxAngle = 65 * (Math.PI / 180);
    const angle = hitPos * maxAngle;

    ball.speed = Math.min(ball.speed + BALL_SPEED_INC, BALL_SPEED_MAX);
    ball.vx = xDir * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);

    // Prevent sticking
    if (xDir === 1) ball.x = paddle.x + PADDLE_W + ballR + 1;
    else ball.x = paddle.x - ballR - 1;
  }

  // ── Scoring ────────────────────────────────────────────────────────────────
  function updateScore() {
    scoreNumL.textContent = scoreL;
    scoreNumR.textContent = scoreR;
  }

  function endGame(winner) {
    running = false;
    const isLeftWin = winner === 'left';
    const t = (k) => (window.getI18n ? window.getI18n(k) : k);
    if (isLeftWin) {
      overlayTitle.textContent = mode === 'ai' ? t('pong.you_win') : t('pong.p1_win');
      overlayMsg.textContent = `${scoreL} – ${scoreR}`;
    } else {
      overlayTitle.textContent = mode === 'ai' ? t('pong.ai_win') : t('pong.p2_win');
      overlayMsg.textContent = `${scoreL} – ${scoreR}`;
    }
    overlayBtn.textContent = t('pong.play_again');
    overlay.classList.remove('hidden');
  }

  // ── Drawing ────────────────────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Background
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Center dashed line
    ctx.setLineDash([canvasH / (CENTER_LINE_SEGS * 2), canvasH / (CENTER_LINE_SEGS * 2)]);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvasW / 2, 0);
    ctx.lineTo(canvasW / 2, canvasH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left paddle (neon blue)
    drawPaddle(paddleL, '#4facfe', 'rgba(79,172,254,0.4)');

    // Right paddle (neon pink)
    drawPaddle(paddleR, '#f093fb', 'rgba(240,147,251,0.4)');

    // Ball (white + glow)
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPaddle(p, color, glowColor) {
    const r = Math.min(6, PADDLE_W / 2);
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, PADDLE_W, paddleH, r);
    ctx.fill();
    ctx.restore();
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  function loop() {
    if (!running) return;
    updatePaddles();
    updateBall();
    draw();
    animId = requestAnimationFrame(loop);
  }

  // ── Resize ─────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (!mode || gameWrap.classList.contains('hidden')) return;
    const prevH = canvasH || 1;
    const prevW = canvasW || 1;
    setupCanvas();
    paddleL.y = Math.max(0, Math.min(canvasH - paddleH, paddleL.y * canvasH / prevH));
    paddleR.y = Math.max(0, Math.min(canvasH - paddleH, paddleR.y * canvasH / prevH));
    ball.x *= canvasW / prevW;
    ball.y *= canvasH / prevH;
  });

  // Initially hide game area
  if (gameWrap) gameWrap.classList.add('hidden');
  if (modeScreen) modeScreen.classList.remove('hidden');
})();
