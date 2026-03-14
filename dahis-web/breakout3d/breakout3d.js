(() => {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const CANVAS_W = 640;
  const CANVAS_H = 520;

  // 3-D perspective constants
  const PERSP_DEPTH  = 60;   // pixels of depth for bricks/paddle
  const PERSP_ANGLE  = 0.5;  // radians — tilt angle for top face

  // Brick grid
  const BRICK_COLS   = 10;
  const BRICK_ROWS   = 5;
  const BRICK_PAD    = 4;
  const BRICK_TOP    = 60;   // y start of brick area (in 2-D canvas coords)
  const BRICK_H      = 24;   // front-face height
  const BRICK_W      = (CANVAS_W - BRICK_PAD * (BRICK_COLS + 1)) / BRICK_COLS;

  // Paddle
  const PADDLE_H     = 12;
  const PADDLE_MIN_W = 70;
  const PADDLE_INIT_W = 100;
  const PADDLE_MAX_W = 140;
  const PADDLE_Y     = CANVAS_H - 40;
  const PADDLE_SPEED = 7;

  // Ball
  const BALL_R       = 8;
  const BALL_SPEED_INIT = 5.5;
  const BALL_SPEED_MAX  = 10;

  // Power-up
  const PW_RADIUS    = 8;
  const PW_SPEED     = 2.8;
  const PW_DURATION  = 8000; // ms

  // Lives
  const MAX_LIVES    = 3;

  // Colours for brick HP levels: 1-hit, 2-hit, 3-hit
  const BRICK_COLORS = [
    null,              // index 0 unused
    '#f72585',         // HP 1
    '#7209b7',         // HP 2
    '#3a0ca3',         // HP 3
  ];

  // Power-up types
  const PW_TYPES = [
    { id: 'wide',     label: '⬛ Geniş Raket',   color: '#4cc9f0' },
    { id: 'slow',     label: '🐢 Yavaş Top',      color: '#90e0ef' },
    { id: 'multi',    label: '✨ Çoklu Top',       color: '#f8b500' },
    { id: 'life',     label: '❤️ Ekstra Can',      color: '#ff6b6b' },
    { id: 'narrow',   label: '🔺 Dar Raket',       color: '#e9c46a' },  // bad
  ];

  // ── DOM ────────────────────────────────────────────────────────────────────
  const canvas    = document.getElementById('bkoCanvas');
  const ctx       = canvas.getContext('2d');
  const elScore   = document.getElementById('bkoScore');
  const elLevel   = document.getElementById('bkoLevel');
  const elLives   = document.getElementById('bkoLives');
  const startOv   = document.getElementById('bkoStartOverlay');
  const gameOv    = document.getElementById('bkoOverlay');
  const ovTitle   = document.getElementById('bkoOverlayTitle');
  const ovDesc    = document.getElementById('bkoOverlayDesc');
  const ovBtn     = document.getElementById('bkoOverlayBtn');
  const restartBtn= document.getElementById('bkoRestartBtn');
  const pwBar     = document.getElementById('bkoPowerupBar');

  // ── Canvas size ────────────────────────────────────────────────────────────
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;

  // ── Game State ─────────────────────────────────────────────────────────────
  let score, lives, level;
  let paddle, balls, bricks, powerups, particles;
  let activePowerups; // { id: { expiry, tagEl } }
  let running, paused, gameOver;
  let animId;

  // Input
  const keys = {};
  let mouseX = null;

  // ── Init ───────────────────────────────────────────────────────────────────
  function initGame(keepLevel) {
    if (!keepLevel) level = 1;
    score    = keepLevel ? score : 0;
    lives    = MAX_LIVES;
    paused   = false;
    gameOver = false;
    activePowerups = {};

    paddle = {
      x: CANVAS_W / 2,
      y: PADDLE_Y,
      w: PADDLE_INIT_W,
    };

    balls = [makeBall()];
    bricks = makeBricks(level);
    powerups  = [];
    particles = [];

    clearPowerupBar();
    updateHUD();
  }

  function makeBall(onPaddle) {
    return {
      x: paddle ? paddle.x : CANVAS_W / 2,
      y: paddle ? PADDLE_Y - BALL_R - 2 : CANVAS_H / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED_INIT * 0.7,
      vy: -BALL_SPEED_INIT,
      onPaddle: onPaddle !== false,
      trail: [],
    };
  }

  function makeBricks(lvl) {
    const list = [];
    const rows = Math.min(BRICK_ROWS + Math.floor((lvl - 1) / 2), 8);
    const cols = BRICK_COLS;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Determine HP based on level and row
        const hpChance = Math.random();
        let hp = 1;
        if (lvl >= 3 && hpChance < 0.2) hp = 3;
        else if (lvl >= 2 && hpChance < 0.4) hp = 2;

        const x = BRICK_PAD + c * (BRICK_W + BRICK_PAD);
        const y = BRICK_TOP + r * (BRICK_H + BRICK_PAD + PERSP_ANGLE * PERSP_DEPTH / 2);

        // Skip some bricks for pattern variety in higher levels
        if (lvl >= 4 && Math.random() < 0.1) continue;

        list.push({ x, y, w: BRICK_W, h: BRICK_H, hp, maxHp: hp, alive: true, hit: 0 });
      }
    }
    return list;
  }

  // ── Drawing helpers ────────────────────────────────────────────────────────

  // Draw a 3D brick: front face + top face + right side
  function drawBrick(b) {
    if (!b.alive) return;

    const { x, y, w, h } = b;
    const baseColor = BRICK_COLORS[b.hp] || '#f72585';

    // flash on hit
    const flashFraction = b.hit > 0 ? Math.max(0, 1 - b.hit / 8) : 0;

    // Parse base color to slightly tint on hit
    const frontAlpha = 0.9 + flashFraction * 0.1;

    const depth = PERSP_DEPTH * 0.35;
    const dx    = depth * 0.6;   // horizontal shift for depth
    const dy    = -depth * 0.55; // vertical shift (up) for top face

    // Top face (lighter)
    ctx.beginPath();
    ctx.moveTo(x,         y);
    ctx.lineTo(x + w,     y);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.lineTo(x + dx,    y + dy);
    ctx.closePath();
    ctx.fillStyle = shiftColor(baseColor, 60);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Right side face (darker)
    ctx.beginPath();
    ctx.moveTo(x + w,      y);
    ctx.lineTo(x + w,      y + h);
    ctx.lineTo(x + w + dx, y + h + dy);
    ctx.lineTo(x + w + dx, y + dy);
    ctx.closePath();
    ctx.fillStyle = shiftColor(baseColor, -40);
    ctx.fill();
    ctx.stroke();

    // Front face
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = flashFraction > 0 ? mixColor(baseColor, '#ffffff', flashFraction * 0.5) : baseColor;
    ctx.fill();

    // Glossy highlight on front
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, 'rgba(255,255,255,0.25)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // HP dots
    if (b.maxHp > 1) {
      for (let i = 0; i < b.hp; i++) {
        ctx.beginPath();
        ctx.arc(x + w - 8 - i * 10, y + h - 6, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }
    }

    if (b.hit > 0) b.hit--;
  }

  // Draw 3D paddle
  function drawPaddle() {
    const { x, y, w } = paddle;
    const px = x - w / 2;
    const ph = PADDLE_H;
    const depth = 10;
    const dx = depth * 0.7, dy = -depth * 0.5;

    // Top face
    ctx.beginPath();
    ctx.moveTo(px,     y);
    ctx.lineTo(px + w, y);
    ctx.lineTo(px + w + dx, y + dy);
    ctx.lineTo(px + dx,     y + dy);
    ctx.closePath();
    ctx.fillStyle = '#4cc9f0';
    ctx.fill();

    // Right side
    ctx.beginPath();
    ctx.moveTo(px + w,      y);
    ctx.lineTo(px + w,      y + ph);
    ctx.lineTo(px + w + dx, y + ph + dy);
    ctx.lineTo(px + w + dx, y + dy);
    ctx.closePath();
    ctx.fillStyle = '#0096c7';
    ctx.fill();

    // Front face gradient
    const grad = ctx.createLinearGradient(px, y, px + w, y);
    grad.addColorStop(0, '#4cc9f0');
    grad.addColorStop(0.5, '#7ae7ff');
    grad.addColorStop(1, '#4cc9f0');
    ctx.beginPath();
    ctx.rect(px, y, w, ph);
    ctx.fillStyle = grad;
    ctx.fill();

    // Glow
    ctx.shadowColor = '#4cc9f0';
    ctx.shadowBlur  = 14;
    ctx.beginPath();
    ctx.rect(px, y, w, ph);
    ctx.fillStyle = 'rgba(76,201,240,0.15)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawBall(ball) {
    // Trail
    for (let i = 0; i < ball.trail.length; i++) {
      const t = ball.trail[i];
      const alpha = (i / ball.trail.length) * 0.4;
      ctx.beginPath();
      ctx.arc(t.x, t.y, BALL_R * (i / ball.trail.length), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(247,37,133,${alpha})`;
      ctx.fill();
    }

    // Ball gradient (3D sphere look)
    const grad = ctx.createRadialGradient(
      ball.x - BALL_R * 0.3, ball.y - BALL_R * 0.3, BALL_R * 0.1,
      ball.x, ball.y, BALL_R
    );
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.4, '#f72585');
    grad.addColorStop(1, '#7209b7');

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Glow
    ctx.shadowColor = '#f72585';
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(247,37,133,0.3)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawPowerup(p) {
    const color = PW_TYPES.find(t => t.id === p.id)?.color || '#f8b500';
    ctx.beginPath();
    ctx.arc(p.x, p.y, PW_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Letter icon
    ctx.fillStyle = '#000';
    ctx.font = `bold ${PW_RADIUS}px Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.id[0].toUpperCase(), p.x, p.y);
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawBackground() {
    ctx.fillStyle = '#08080f';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Subtle grid lines for depth
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    // Bottom danger zone
    const gz = ctx.createLinearGradient(0, CANVAS_H - 30, 0, CANVAS_H);
    gz.addColorStop(0, 'rgba(247,37,133,0)');
    gz.addColorStop(1, 'rgba(247,37,133,0.08)');
    ctx.fillStyle = gz;
    ctx.fillRect(0, CANVAS_H - 30, CANVAS_W, 30);
  }

  // ── Game loop ──────────────────────────────────────────────────────────────
  function gameLoop() {
    if (!running) return;

    update();
    render();
    animId = requestAnimationFrame(gameLoop);
  }

  function update() {
    if (paused || gameOver) return;

    // Move paddle
    movePaddle();

    // Move balls
    balls.forEach(ball => {
      if (ball.onPaddle) {
        ball.x = paddle.x;
        ball.y = PADDLE_Y - BALL_R - 2;
        return;
      }

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 12) ball.trail.shift();

      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collisions
      if (ball.x - BALL_R < 0) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
      }
      if (ball.x + BALL_R > CANVAS_W) {
        ball.x = CANVAS_W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
      }
      if (ball.y - BALL_R < 0) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
      }

      // Paddle collision
      const px = paddle.x - paddle.w / 2;
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= PADDLE_Y &&
        ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
        ball.x >= px - 4 &&
        ball.x <= px + paddle.w + 4
      ) {
        // Reflect with angle based on hit position
        const relX = (ball.x - paddle.x) / (paddle.w / 2); // -1..1
        const angle = relX * (Math.PI / 3); // max 60°
        const spd = Math.min(Math.hypot(ball.vx, ball.vy) + 0.1, BALL_SPEED_MAX);
        ball.vx = Math.sin(angle) * spd;
        ball.vy = -Math.cos(angle) * spd;
        ball.y  = PADDLE_Y - BALL_R - 1;
      }

      // Brick collisions
      for (const b of bricks) {
        if (!b.alive) continue;
        if (rectCircle(b.x, b.y, b.w, b.h, ball.x, ball.y, BALL_R)) {
          // Determine bounce axis
          const overlapLeft   = ball.x + BALL_R - b.x;
          const overlapRight  = b.x + b.w - (ball.x - BALL_R);
          const overlapTop    = ball.y + BALL_R - b.y;
          const overlapBottom = b.y + b.h - (ball.y - BALL_R);
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapLeft  || minOverlap === overlapRight) ball.vx *= -1;
          else ball.vy *= -1;

          b.hp--;
          b.hit = 8;

          if (b.hp <= 0) {
            b.alive = false;
            score += 10 * level;
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, BRICK_COLORS[b.maxHp] || '#f72585');
            maybePowerup(b);
            updateHUD();
          }
          break;
        }
      }

      // Ball lost
      if (ball.y - BALL_R > CANVAS_H) {
        ball._dead = true;
      }
    });

    // Remove dead balls
    balls = balls.filter(b => !b._dead);

    if (balls.length === 0) {
      lives--;
      updateHUD();
      if (lives <= 0) {
        endGame(false);
        return;
      }
      balls = [makeBall()];
    }

    // Move powerups
    powerups.forEach(p => {
      p.y += PW_SPEED;
      // Collect
      if (
        p.y + PW_RADIUS >= PADDLE_Y &&
        p.y - PW_RADIUS <= PADDLE_Y + PADDLE_H &&
        p.x >= paddle.x - paddle.w / 2 - PW_RADIUS &&
        p.x <= paddle.x + paddle.w / 2 + PW_RADIUS
      ) {
        applyPowerup(p.id);
        p._collected = true;
      }
      if (p.y > CANVAS_H + PW_RADIUS) p._dead = true;
    });
    powerups = powerups.filter(p => !p._dead && !p._collected);

    // Update active powerup timers
    const now = Date.now();
    for (const [id, info] of Object.entries(activePowerups)) {
      if (now >= info.expiry) {
        removePowerup(id);
        delete activePowerups[id];
      }
    }

    // Update particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);

    // Level complete?
    if (bricks.every(b => !b.alive)) {
      level++;
      bricks = makeBricks(level);
      balls.forEach(b => { b.onPaddle = true; });
      updateHUD();
      // brief pause message handled in render
    }
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawBackground();
    bricks.forEach(drawBrick);
    drawPaddle();
    balls.forEach(drawBall);
    powerups.forEach(drawPowerup);
    drawParticles();
  }

  // ── Paddle movement ────────────────────────────────────────────────────────
  function movePaddle() {
    const speed = PADDLE_SPEED;
    if (keys['ArrowLeft']  || keys['KeyA']) paddle.x -= speed;
    if (keys['ArrowRight'] || keys['KeyD']) paddle.x += speed;

    if (mouseX !== null) {
      const diff = mouseX - paddle.x;
      paddle.x += diff * 0.2;
    }

    paddle.x = clamp(paddle.x, paddle.w / 2, CANVAS_W - paddle.w / 2);
  }

  // ── Powerups ───────────────────────────────────────────────────────────────
  function maybePowerup(brick) {
    if (Math.random() > 0.22) return;
    const type = PW_TYPES[Math.floor(Math.random() * PW_TYPES.length)];
    powerups.push({ x: brick.x + brick.w / 2, y: brick.y, id: type.id });
  }

  function applyPowerup(id) {
    const expiry = Date.now() + PW_DURATION;

    if (activePowerups[id]) {
      activePowerups[id].expiry = expiry; // renew
      return;
    }

    switch (id) {
      case 'wide':
        paddle.w = Math.min(paddle.w + 40, PADDLE_MAX_W);
        break;
      case 'narrow':
        paddle.w = Math.max(paddle.w - 30, PADDLE_MIN_W);
        break;
      case 'slow':
        balls.forEach(b => {
          b.vx *= 0.65;
          b.vy *= 0.65;
        });
        break;
      case 'multi': {
        const newBalls = balls
          .filter(b => !b.onPaddle)
          .flatMap(b => [
            { ...b, vx: b.vx * 0.8 + 1.5, vy: b.vy, trail: [] },
            { ...b, vx: b.vx * 0.8 - 1.5, vy: b.vy, trail: [] },
          ]);
        balls.push(...newBalls);
        break;
      }
      case 'life':
        lives = Math.min(lives + 1, MAX_LIVES);
        updateHUD();
        break;
    }

    if (id !== 'life') {
      const info = PW_TYPES.find(t => t.id === id);
      const tag = document.createElement('span');
      tag.className = 'bko-powerup-tag';
      tag.style.borderColor = info.color;
      tag.style.color = info.color;
      tag.style.background = `${info.color}22`;
      tag.textContent = info.label;
      pwBar.appendChild(tag);
      activePowerups[id] = { expiry, tagEl: tag };
    }
  }

  function removePowerup(id) {
    switch (id) {
      case 'wide':   paddle.w = PADDLE_INIT_W; break;
      case 'narrow': paddle.w = PADDLE_INIT_W; break;
    }
    if (activePowerups[id]?.tagEl) {
      activePowerups[id].tagEl.remove();
    }
  }

  function clearPowerupBar() {
    pwBar.innerHTML = '';
    for (const [id, info] of Object.entries(activePowerups)) {
      removePowerup(id);
    }
    activePowerups = {};
  }

  // ── Particles ──────────────────────────────────────────────────────────────
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 1 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        r: 2 + Math.random() * 3,
        color,
        life: 30 + Math.floor(Math.random() * 20),
        maxLife: 50,
      });
    }
  }

  // ── End game ───────────────────────────────────────────────────────────────
  function endGame(won) {
    running  = false;
    gameOver = true;
    cancelAnimationFrame(animId);
    render(); // draw last frame

    const t = window.getI18n;
    ovTitle.textContent = won
      ? (t ? t('bko.win_title') : '🎉 Tebrikler!')
      : (t ? t('bko.lose_title') : '💀 Oyun Bitti!');
    ovDesc.textContent = won
      ? (t ? t('bko.win_desc') : `Skoru: ${score}`)
      : (t ? t('bko.lose_desc') : `Toplam puan: ${score}`);
    ovDesc.textContent = ovDesc.textContent.replace('{score}', score);
    gameOv.classList.remove('hidden');
  }

  // ── HUD ────────────────────────────────────────────────────────────────────
  function updateHUD() {
    elScore.textContent = score;
    elLevel.textContent = level;
    elLives.textContent = '❤️'.repeat(Math.max(lives, 0));
  }

  // ── Geometry helpers ───────────────────────────────────────────────────────
  function rectCircle(rx, ry, rw, rh, cx, cy, cr) {
    const nearX = clamp(cx, rx, rx + rw);
    const nearY = clamp(cy, ry, ry + rh);
    const dx = cx - nearX, dy = cy - nearY;
    return dx * dx + dy * dy <= cr * cr;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ── Colour helpers ─────────────────────────────────────────────────────────
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function shiftColor(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const clp = v => clamp(v, 0, 255);
    return `rgb(${clp(r + amount)},${clp(g + amount)},${clp(b + amount)})`;
  }

  function mixColor(hex1, hex2, t) {
    const a = hexToRgb(hex1), b = hexToRgb(hex2);
    const clp = v => clamp(Math.round(v), 0, 255);
    return `rgb(${clp(a.r + (b.r - a.r) * t)},${clp(a.g + (b.g - a.g) * t)},${clp(a.b + (b.b - a.b) * t)})`;
  }

  // ── Controls ───────────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    keys[e.code] = true;

    if (e.code === 'Space') {
      e.preventDefault();
      launchBalls();
    }
  });
  document.addEventListener('keyup', e => { delete keys[e.code]; });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  });
  canvas.addEventListener('mouseleave', () => { mouseX = null; });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) * (CANVAS_W / rect.width);
  }, { passive: false });

  canvas.addEventListener('click', launchBalls);
  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    launchBalls();
  });

  function launchBalls() {
    let launched = false;
    balls.forEach(b => {
      if (b.onPaddle) {
        b.onPaddle = false;
        b.vx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED_INIT * 0.7;
        b.vy = -BALL_SPEED_INIT;
        launched = true;
      }
    });
  }

  // ── Start / Restart ────────────────────────────────────────────────────────
  document.getElementById('bkoStartBtn').addEventListener('click', () => {
    startOv.classList.add('hidden');
    startNewGame();
  });

  ovBtn.addEventListener('click', () => {
    gameOv.classList.add('hidden');
    startNewGame();
  });

  restartBtn.addEventListener('click', () => {
    gameOv.classList.add('hidden');
    startNewGame();
  });

  function startNewGame() {
    cancelAnimationFrame(animId);
    initGame(false);
    running  = true;
    gameOver = false;
    gameLoop();
  }

  // Initial render (show background while overlay is visible)
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  initGame(false);
  render();
})();
