'use strict';

/* ===== Pist Çiz & Yarış – Game Logic ===== */

// --- DOM References ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const drawUI = document.getElementById('drawUI');
const raceUI = document.getElementById('raceUI');
const controlsHint = document.getElementById('controlsHint');
const startRaceBtn = document.getElementById('startRaceBtn');
const resetBtn = document.getElementById('resetBtn');
const redrawBtn = document.getElementById('redrawBtn');
const lapCountEl = document.getElementById('lapCount');
const bestLapEl = document.getElementById('bestLap');
const lastLapEl = document.getElementById('lastLap');
const currentTimeEl = document.getElementById('currentTime');
const speedBarEl = document.getElementById('speedBar');
const speedNumEl = document.getElementById('speedNum');

// --- Constants ---
const ROAD_WIDTH = 64;          // pixels – visual road width
const CAR_W = 14;               // car width
const CAR_H = 22;               // car length (height in local coords)
const TRAIL_LEN = 50;           // max trail points
const BASE_SPEED = 2.8;         // px/frame on track
const OFF_TRACK_SPEED = 1.1;    // px/frame off track
const TURN_RATE = 0.036;        // radians/frame
const SPEED_LERP = 0.07;        // how fast speed adjusts
const MIN_RAW_POINTS = 40;      // minimum drawing points to enable start
const START_LINE_COOLDOWN = 150; // frames to skip after crossing start line

// --- Game State ---
let gameState = 'draw'; // 'draw' | 'race'

// Drawing
let rawPoints = [];
let isPointerDown = false;

// Smoothed track (computed once when race starts)
let smoothPoints = [];

// Start/finish line data
let startLine = null;

// Car
const car = {
  x: 0,
  y: 0,
  angle: 0,
  speed: 0,
  onTrack: true,
  trail: [],
};

// Input
const keys = { left: false, right: false };
let touchSide = null; // 'left' | 'right' | null

// Race stats
let lapCount = 0;
let bestLap = Infinity;
let lapStartTime = 0;
let slCooldown = 0;    // start-line crossing cooldown frames
let rafId = null;

// --- Canvas Sizing ---
function resizeCanvas() {
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  if (gameState === 'draw') renderDraw();
}
window.addEventListener('resize', resizeCanvas);

// --- Pointer helpers ---
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width / r.width;
  const scaleY = canvas.height / r.height;
  return {
    x: (e.clientX - r.left) * scaleX,
    y: (e.clientY - r.top) * scaleY,
  };
}

// =====================
//   DRAW PHASE EVENTS
// =====================
canvas.addEventListener('mousedown', onPtrDown);
canvas.addEventListener('mousemove', onPtrMove);
canvas.addEventListener('mouseup', onPtrUp);
canvas.addEventListener('mouseleave', onPtrUp);
canvas.addEventListener('touchstart', onTouchStartHandler, { passive: false });
canvas.addEventListener('touchmove', onTouchMoveHandler, { passive: false });
canvas.addEventListener('touchend', onTouchEndHandler, { passive: false });

function onTouchStartHandler(e) {
  e.preventDefault();
  if (gameState === 'draw') {
    onPtrDown(e.touches[0]);
  } else {
    // Race steering – left half / right half
    const r = canvas.getBoundingClientRect();
    touchSide = e.touches[0].clientX < r.left + r.width / 2 ? 'left' : 'right';
  }
}

function onTouchMoveHandler(e) {
  e.preventDefault();
  if (gameState === 'draw') {
    onPtrMove(e.touches[0]);
  } else if (e.touches.length > 0) {
    const r = canvas.getBoundingClientRect();
    touchSide = e.touches[0].clientX < r.left + r.width / 2 ? 'left' : 'right';
  }
}

function onTouchEndHandler(e) {
  e.preventDefault();
  if (gameState === 'draw') {
    onPtrUp();
  } else {
    touchSide = null;
  }
}

function onPtrDown(e) {
  if (gameState !== 'draw') return;
  isPointerDown = true;
  rawPoints = [];
  startRaceBtn.disabled = true;
  const p = canvasPos(e);
  rawPoints.push(p);
  renderDraw();
}

function onPtrMove(e) {
  if (gameState !== 'draw' || !isPointerDown) return;
  const p = canvasPos(e);
  const last = rawPoints[rawPoints.length - 1];
  if (Math.hypot(p.x - last.x, p.y - last.y) > 5) {
    rawPoints.push(p);
    if (rawPoints.length >= MIN_RAW_POINTS) {
      startRaceBtn.disabled = false;
    }
    renderDraw();
  }
}

function onPtrUp() {
  if (gameState !== 'draw') return;
  isPointerDown = false;
  renderDraw();
}

// =====================
//   KEYBOARD
// =====================
document.addEventListener('keydown', e => {
  if (gameState !== 'race') return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// =====================
//   DRAW RENDERING
// =====================
function renderDraw() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Grass background
  ctx.fillStyle = '#1b4a1b';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  if (rawPoints.length < 2) {
    // Guide text
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '16px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Buraya pist çiz ✏️', W / 2, H / 2);
    ctx.textAlign = 'left';
    return;
  }

  // Road fill (thick grey stroke)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#454545';
  ctx.lineWidth = ROAD_WIDTH;
  ctx.beginPath();
  ctx.moveTo(rawPoints[0].x, rawPoints[0].y);
  for (let i = 1; i < rawPoints.length; i++) {
    ctx.lineTo(rawPoints[i].x, rawPoints[i].y);
  }
  ctx.stroke();

  // Road edge lines (white dashed)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(rawPoints[0].x, rawPoints[0].y);
  for (let i = 1; i < rawPoints.length; i++) {
    ctx.lineTo(rawPoints[i].x, rawPoints[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Start dot (green)
  ctx.beginPath();
  ctx.arc(rawPoints[0].x, rawPoints[0].y, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#22ee44';
  ctx.fill();

  // End dot (red) if more than 1 pt
  if (rawPoints.length > 1) {
    const lp = rawPoints[rawPoints.length - 1];
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
  }
}

// =====================
//   TRACK PROCESSING
// =====================

// Decimate so Catmull-Rom gets evenly spaced inputs
function decimatePoints(pts, minDist) {
  if (pts.length < 2) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const last = out[out.length - 1];
    if (Math.hypot(pts[i].x - last.x, pts[i].y - last.y) >= minDist) {
      out.push(pts[i]);
    }
  }
  return out;
}

// Catmull-Rom spline (closed loop)
function catmullRomClosed(pts, steps) {
  const n = pts.length;
  if (n < 3) return pts.slice();
  const out = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  return out;
}

// Distance from point to segment
function distToSegSq(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
}

function isOnTrack(x, y) {
  const n = smoothPoints.length;
  const threshold = (ROAD_WIDTH / 2 - 2) ** 2;
  for (let i = 0; i < n; i++) {
    const a = smoothPoints[i];
    const b = smoothPoints[(i + 1) % n];
    if (distToSegSq(x, y, a.x, a.y, b.x, b.y) < threshold) return true;
  }
  return false;
}

// Signed cross product (for line crossing test)
function cross2D(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = cross2D(cx, cy, dx, dy, ax, ay);
  const d2 = cross2D(cx, cy, dx, dy, bx, by);
  const d3 = cross2D(ax, ay, bx, by, cx, cy);
  const d4 = cross2D(ax, ay, bx, by, dx, dy);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

// Build start-line perpendicular to track at first point
function buildStartLine(pts) {
  const p0 = pts[0];
  const p1 = pts[Math.min(4, pts.length - 1)];
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  // Unit perpendicular
  const nx = -dy / len;
  const ny = dx / len;
  const hw = ROAD_WIDTH / 2 + 8;
  return {
    x1: p0.x + nx * hw, y1: p0.y + ny * hw,
    x2: p0.x - nx * hw, y2: p0.y - ny * hw,
    // track forward direction (for angle calc)
    fwdX: dx / len, fwdY: dy / len,
    cx: p0.x, cy: p0.y,
  };
}

// =====================
//   RACE START
// =====================
function startRace() {
  // Process drawn track
  const dec = decimatePoints(rawPoints, 8);
  if (dec.length < 4) return;
  smoothPoints = catmullRomClosed(dec, 6);

  // Build start line
  startLine = buildStartLine(smoothPoints);

  // Position car at start, aimed along track
  const p0 = smoothPoints[0];
  const p1 = smoothPoints[Math.min(5, smoothPoints.length - 1)];
  car.x = p0.x;
  car.y = p0.y;
  car.angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) + Math.PI / 2;
  car.speed = 0;
  car.onTrack = true;
  car.trail = [];

  // Reset stats
  lapCount = 0;
  bestLap = Infinity;
  lapStartTime = Date.now();
  slCooldown = START_LINE_COOLDOWN;

  // UI swap
  gameState = 'race';
  drawUI.classList.add('hidden');
  raceUI.classList.remove('hidden');
  controlsHint.classList.remove('hidden');
  canvas.style.cursor = 'none';

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

// =====================
//   GAME LOOP
// =====================
function gameLoop() {
  update();
  renderRace();
  rafId = requestAnimationFrame(gameLoop);
}

let prevX = 0, prevY = 0;

function update() {
  prevX = car.x;
  prevY = car.y;

  // Steering
  const steerL = keys.left || touchSide === 'left';
  const steerR = keys.right || touchSide === 'right';
  if (steerL) car.angle -= TURN_RATE;
  if (steerR) car.angle += TURN_RATE;

  // Speed
  car.onTrack = isOnTrack(car.x, car.y);
  const target = car.onTrack ? BASE_SPEED : OFF_TRACK_SPEED;
  car.speed += (target - car.speed) * SPEED_LERP;

  // Move forward (angle 0 = pointing up; subtract PI/2 converts to math angle)
  car.x += Math.cos(car.angle - Math.PI / 2) * car.speed;
  car.y += Math.sin(car.angle - Math.PI / 2) * car.speed;

  // Trail
  car.trail.push({ x: car.x, y: car.y });
  if (car.trail.length > TRAIL_LEN) car.trail.shift();

  // Start-line crossing (lap detection)
  if (slCooldown > 0) {
    slCooldown--;
  } else if (startLine) {
    const sl = startLine;
    if (segmentsIntersect(prevX, prevY, car.x, car.y, sl.x1, sl.y1, sl.x2, sl.y2)) {
      const lapTime = (Date.now() - lapStartTime) / 1000;
      lapCount++;
      if (lapTime < bestLap) bestLap = lapTime;
      lapStartTime = Date.now();
      slCooldown = START_LINE_COOLDOWN;
      updateLapHUD(lapTime);
    }
  }

  // Live lap timer
  if (lapStartTime) {
    const elapsed = (Date.now() - lapStartTime) / 1000;
    currentTimeEl.textContent = elapsed.toFixed(1) + 's';
  }

  // Speed HUD
  const pct = Math.min(car.speed / BASE_SPEED, 1) * 100;
  speedBarEl.style.width = pct + '%';
  speedNumEl.textContent = Math.round(pct * 2);
}

function updateLapHUD(lapTime) {
  lapCountEl.textContent = lapCount;
  lastLapEl.textContent = lapTime.toFixed(2) + 's';
  if (bestLap < Infinity) bestLapEl.textContent = bestLap.toFixed(2) + 's';
}

// =====================
//   RACE RENDERING
// =====================
function renderRace() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Grass
  ctx.fillStyle = '#1b4a1b';
  ctx.fillRect(0, 0, W, H);

  const n = smoothPoints.length;

  // Road (thick grey)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = '#444';
  ctx.lineWidth = ROAD_WIDTH;
  ctx.beginPath();
  ctx.moveTo(smoothPoints[0].x, smoothPoints[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(smoothPoints[i].x, smoothPoints[i].y);
  ctx.closePath();
  ctx.stroke();

  // Center dashed line (yellow)
  ctx.strokeStyle = 'rgba(255, 210, 0, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 16]);
  ctx.beginPath();
  ctx.moveTo(smoothPoints[0].x, smoothPoints[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(smoothPoints[i].x, smoothPoints[i].y);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();

  // Start/finish line
  if (startLine) drawStartLine();

  // Trail
  ctx.save();
  const tl = car.trail;
  for (let i = 0; i < tl.length; i++) {
    const alpha = (i / tl.length) * 0.45;
    const r = 1 + (i / tl.length) * 3;
    ctx.beginPath();
    ctx.arc(tl[i].x, tl[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,200,255,${alpha})`;
    ctx.fill();
  }
  ctx.restore();

  // Car
  drawCar();
}

function drawStartLine() {
  const sl = startLine;
  const hw = ROAD_WIDTH / 2 + 6;
  // Perpendicular vector (already computed from fwdX/fwdY)
  const px = -sl.fwdY * hw;  // perpendicular scaled
  const py = sl.fwdX * hw;
  // Draw alternating black/white squares along the perpendicular
  const strips = 7;
  for (let i = 0; i < strips; i++) {
    const t0 = -1 + (2 * i) / strips;
    const t1 = -1 + (2 * (i + 1)) / strips;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
    ctx.beginPath();
    ctx.moveTo(sl.cx + px * t0, sl.cy + py * t0);
    ctx.lineTo(sl.cx + px * t1, sl.cy + py * t1);
    // Give the strip some thickness along the track direction
    const fw = 6;
    ctx.lineTo(sl.cx + px * t1 + sl.fwdX * fw, sl.cy + py * t1 + sl.fwdY * fw);
    ctx.lineTo(sl.cx + px * t0 + sl.fwdX * fw, sl.cy + py * t0 + sl.fwdY * fw);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? '#000000' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(sl.cx + px * t0, sl.cy + py * t0);
    ctx.lineTo(sl.cx + px * t1, sl.cy + py * t1);
    ctx.lineTo(sl.cx + px * t1 - sl.fwdX * fw, sl.cy + py * t1 - sl.fwdY * fw);
    ctx.lineTo(sl.cx + px * t0 - sl.fwdX * fw, sl.cy + py * t0 - sl.fwdY * fw);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCar() {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);

  const w = CAR_W, h = CAR_H;

  // Neon glow
  ctx.shadowColor = car.onTrack ? '#00ccff' : '#ff8800';
  ctx.shadowBlur = 12;

  // Car body
  ctx.fillStyle = car.onTrack ? '#00ccff' : '#ff8800';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-w / 2, -h / 2, w, h, 3);
  } else {
    ctx.rect(-w / 2, -h / 2, w, h);
  }
  ctx.fill();

  // Windshield
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w - 4, Math.floor(h * 0.35));

  // Wheels
  ctx.fillStyle = '#111';
  const wy = 4;
  ctx.fillRect(-w / 2 - 3, -h / 2 + wy, 3, 7);     // FL
  ctx.fillRect(w / 2, -h / 2 + wy, 3, 7);           // FR
  ctx.fillRect(-w / 2 - 3, h / 2 - wy - 7, 3, 7);  // RL
  ctx.fillRect(w / 2, h / 2 - wy - 7, 3, 7);        // RR

  ctx.restore();
}

// =====================
//   BUTTON HANDLERS
// =====================
startRaceBtn.addEventListener('click', startRace);
resetBtn.addEventListener('click', resetDraw);
redrawBtn.addEventListener('click', resetDraw);

function resetDraw() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  keys.left = false;
  keys.right = false;
  touchSide = null;
  gameState = 'draw';
  rawPoints = [];
  smoothPoints = [];
  startLine = null;
  car.trail = [];
  lapCount = 0;
  bestLap = Infinity;

  drawUI.classList.remove('hidden');
  raceUI.classList.add('hidden');
  controlsHint.classList.add('hidden');
  startRaceBtn.disabled = true;
  canvas.style.cursor = 'crosshair';

  // Reset HUD values
  lapCountEl.textContent = '0';
  bestLapEl.textContent = '–';
  lastLapEl.textContent = '–';
  currentTimeEl.textContent = '0.0s';
  speedBarEl.style.width = '0%';
  speedNumEl.textContent = '0';

  resizeCanvas();
}

// =====================
//   INIT
// =====================
resizeCanvas();
