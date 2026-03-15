// ===== KINETIC GRID CLOCK — Humans Since 1982 style =====
// 84 mini-clocks: 6 rows × 14 cols
// Each clock: 2 equal hands pivoting from centre (half-diameter each).
//   Overlap (same angle)  → single half-line
//   180° apart            → full diameter line  ─ or │
//   90° apart             → corner shape         ┌ ┐ └ ┘
// Cycle: 2 s ease-out → 21 s patterns → 2 s ease-in → 5 s display (HH:MM or MM:SS) → repeat
(function () {
  'use strict';

  // ── Default config (override via /clock-controls.html + localStorage) ──────
  const DEFAULTS = {
    mode:          'clock',     // 'clock' | 'countdown'
    hours:         0,           // UTC offset for clock mode (e.g. +1 = UTC+1)
    countdownTime: '00:30',     // initial countdown time MM:SS
  };

  // DEBUG: set to [d0,d1,d2,d3] to freeze display on specific digits; null = live
  const DEBUG_DIGITS = null;

  // ── Config: read from localStorage, fall back to DEFAULTS ─────────────────
  function loadConfig() {
    const ls = k => localStorage.getItem(k);
    return {
      mode:         ls('clk_mode')           || DEFAULTS.mode,
      hours:        +(ls('clk_hours')        ?? DEFAULTS.hours),
      countdownTime:ls('clk_countdown_time') || DEFAULTS.countdownTime,
      countdownEnd: +(ls('clk_countdown_end')|| 0),
    };
  }

  let cfg = loadConfig();

  // Auto-start countdown on first load if no end time is stored
  if (cfg.mode === 'countdown' && !cfg.countdownEnd) {
    const [mm, ss] = DEFAULTS.countdownTime.split(':').map(Number);
    cfg.countdownEnd = Date.now() + (mm * 60 + ss) * 1000;
    localStorage.setItem('clk_countdown_end', cfg.countdownEnd);
  }

  window.addEventListener('storage', () => { cfg = loadConfig(); });

  // ── Timing ────────────────────────────────────────────────────────────────
  const ROWS = 6, COLS = 14, N = 84;
  const CYCLE = 30000, TIME_SHOW = 5000, TRANS_DUR = 2000;
  const PATTERN_END = CYCLE - TIME_SHOW;       // 25 000 ms
  const TRANS_START = PATTERN_END - TRANS_DUR; // 23 000 ms

  // ── Hand-angle pairs [h1°, h2°]  (0=up 90=right 180=down 270=left) ──
  // Clock-face key: H:M → [H×30°, M×6°]
  // e.g. 6:15=[180,90]=TL  9:30=[270,180]=TR  12:15=[0,90]=BL  12:45=[0,270]=BR
  const H   = [90, 270];  // 3:45  — horizontal ─
  const V   = [0, 180];   // 12:30 — vertical   │
  const TL  = [90, 180];  // 6:15 / 3:30  — top-left corner     ┌
  const TR  = [270, 180]; // 9:30 / 6:45  — top-right corner    ┐
  const BL  = [90, 0];    // 12:15 / 3:00 — bottom-left corner  └
  const BR  = [270, 0];   // 12:45 / 9:00 — bottom-right corner ┘
  const I_D = [180, 180]; // 6:30  — interior top    (both down)
  const I_U = [0, 0];     // 12:00 — interior bottom (both up)
  const OFF = [45, 45];   // neutral — used in colon blank rows
  const NE  = [45, 45];   // 1:7.5   — diagonal top-right  ╱
  const NW  = [315, 315]; // 10:52.5 — diagonal top-left   ╲
  const SE  = [135, 135]; // 4:22.5  — diagonal bot-right  ╲
  const SW  = [225, 225]; // 7:37.5  — diagonal bot-left   ╱

  // ── Digit angle tables — 18 hand-pairs each, 6 rows × 3 cols, row-major ──
  // Columns A–C, rows 0–5 top to bottom.
  // Digit 5 = digit 2 mirrored horizontally. Digit 6 = digit 9 mirrored vertically + horizontally.
  const DIGIT_ANGLES = [
    // 0 — full rectangle
    [ TL,H,TR,  V,I_D,V,  V,V,V,  V,V,V,  V,I_U,V,  BL,H,BR ],
    // 1 — serif top; SW fills empty left cells
    [ TL,H,TR,  BL,TR,V,  SW,V,V,  SW,V,V,  SW,V,V,  SW,BL,BR ],
    // 2
    [ TL,H,TR,  BL,TR,V,  TL,BR,V,  V,TL,BR,  V,BL,TR,  BL,H,BR ],
    // 3
    [ TL,H,TR,  BL,TR,V,  TL,BR,V,  BL,TR,V,  TL,BR,V,  BL,H,BR ],
    // 4
    [ TL,TR,TR,  V,V,V,  V,I_U,V,  BL,TR,V,  SW,V,V,  SW,BL,BR ],
    // 5 — 2 mirrored horizontally
    [ TL,H,TR,  V,TL,BR,  V,BL,TR,  BL,TR,V,  TL,BR,V,  BL,H,BR ],
    // 6 — 9 mirrored vertically + horizontally
    [ TL,H,TR,  V,TL,BR,  V,BL,TR,  V,I_D,V,  V,I_U,V,  BL,H,BR ],
    // 7 — diagonal descender (SE on right col rows 3–5)
    [ TL,H,TR,  BL,NE,V,  NW,NE,SW,  NE,NE,SE,  V,V,SE,  BL,BR,SE ],
    // 8
    [ TL,H,TR,  V,I_D,V,  SE,I_U,SW,  NE,I_D,NW,  V,I_U,V,  BL,H,BR ],
    // 9
    [ TL,H,TR,  V,I_D,V,  V,I_U,V,  BL,TR,V,  TL,BR,V,  BL,H,BR ],
  ];

  // Colon sub-grid: 6 rows × 2 cols — two 2×2 square dots at rows 1–2 and 3–4
  const COLON = [
    [OFF, OFF], // row 0 — blank
    [TL,  TR],  // row 1 — top of upper dot
    [BL,  BR],  // row 2 — bottom of upper dot
    [TL,  TR],  // row 3 — top of lower dot
    [BL,  BR],  // row 4 — bottom of lower dot
    [OFF, OFF], // row 5 — blank
  ];

  // ── DOM: reference pre-rendered 84 mini-clock cells ──────────────────────
  const allHands = document.querySelectorAll('#grid .hand');
  const hands = [];
  for (let i = 0; i < N; i++) {
    hands.push({ h1: allHands[i * 2], h2: allHands[i * 2 + 1] });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const norm = a => ((a % 360) + 360) % 360;
  const ease = x => x < 0.5 ? 2*x*x : 1 - (-2*x + 2)**2 / 2;

  function lerpA(from, to, p) {
    const d = norm(to - from);
    return from + (d > 180 ? d - 360 : d) * p;
  }

  // Cache of last-written angles (flat: even = h1, odd = h2).
  // Skipping DOM writes for unchanged values avoids unnecessary style
  // invalidations and reduces GC pressure from template literal allocation.
  const _lastAngles = new Float64Array(N * 2).fill(NaN);

  function apply(angles) {
    for (let i = 0; i < N; i++) {
      // Round to 2 dp — sub-hundredth-degree precision is invisible but
      // generates unique strings each frame, increasing GC load.
      const a1 = Math.round(angles[i][0] * 100) / 100;
      const a2 = Math.round(angles[i][1] * 100) / 100;
      const j  = i * 2;
      if (a1 !== _lastAngles[j]) {
        _lastAngles[j] = a1;
        hands[i].h1.style.transform = `rotate(${a1}deg)`;
      }
      if (a2 !== _lastAngles[j + 1]) {
        _lastAngles[j + 1] = a2;
        hands[i].h2.style.transform = `rotate(${a2}deg)`;
      }
    }
  }

  // Pre-allocated output buffer for timeAngles()
  const _bufTime = Array.from({length: N}, () => [0, 0]);

  // ── Time / Countdown display ───────────────────────────────────────────────
  function timeAngles() {
    let d0, d1, d2, d3, isZero = false;

    if (DEBUG_DIGITS) {
      [d0, d1, d2, d3] = DEBUG_DIGITS;

    } else if (cfg.mode === 'countdown') {
      const remaining = Math.max(0, cfg.countdownEnd - Date.now());
      isZero = cfg.countdownEnd > 0 && remaining === 0;
      const totalSec = Math.ceil(remaining / 1000);
      const mins = Math.min(99, Math.floor(totalSec / 60));
      const secs = totalSec % 60;
      d0 = Math.floor(mins / 10); d1 = mins % 10;
      d2 = Math.floor(secs / 10); d3 = secs % 10;

    } else {
      const d   = new Date();
      const utcH = d.getUTCHours() + cfg.hours;
      const hh  = (((utcH % 24) + 24) % 24).toString().padStart(2, '0');
      const mm  = d.getUTCMinutes().toString().padStart(2, '0');
      d0 = +hh[0]; d1 = +hh[1]; d2 = +mm[0]; d3 = +mm[1];
    }

    document.body.classList.toggle('countdown-zero', isZero);

    const d0a = DIGIT_ANGLES[d0], d1a = DIGIT_ANGLES[d1];
    const d2a = DIGIT_ANGLES[d2], d3a = DIGIT_ANGLES[d3];
    // Column layout: [0-2]=d0 [3-5]=d1 [6-7]=colon [8-10]=d2 [11-13]=d3
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let pair;
        if      (c <= 2)  pair = d0a[r * 3 + c];
        else if (c <= 5)  pair = d1a[r * 3 + c - 3];
        else if (c <= 7)  pair = COLON[r][c - 6];
        else if (c <= 10) pair = d2a[r * 3 + c - 8];
        else              pair = d3a[r * 3 + c - 11];
        _bufTime[i][0] = pair[0]; _bufTime[i][1] = pair[1]; i++;
      }
    }
    return _bufTime;
  }

  // Pre-allocated reusable angle buffers — avoids creating 84+ new [h1,h2]
  // sub-arrays every frame (252+ allocations/frame during blend windows).
  // Each buffer is an Array of N 2-element arrays, mutated in place.
  const _bufOut    = Array.from({length: N}, () => [0, 0]);
  const _bufFrom   = Array.from({length: N}, () => [0, 0]);
  const _bufTo     = Array.from({length: N}, () => [0, 0]);
  const _bufInterp = Array.from({length: N}, () => [0, 0]); // ease-in/out phase

  // Inlined version of clockAngles — writes directly into buf[i] to avoid
  // creating a temporary [a, b] array for each of the 84 cells per call.
  function patternAngles(t, pidx, buf) {
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      const dr = r - 2.5;
      for (let c = 0; c < COLS; c++) {
        const dc = c - 6.5;
        let base, spread;
        switch (pidx) {
          case 0: base = Math.atan2(dr * 2.2, dc) * (180 / Math.PI) + 90 + t * 14; spread = 44; break;
          case 1: base = t * 26 + dc * 9 + dr * 4; spread = 0; break;
          case 2: base = Math.atan2(dr, dc) * (180 / Math.PI) + t * 20; spread = 72 + Math.sin(t * 0.65) * 24; break;
          default: {
            const dist = Math.sqrt(dr * dr + dc * dc * 0.3) + 0.1;
            base = Math.atan2(dr, dc) * (180 / Math.PI) + t * 28 + dist * 18;
            spread = 55 + Math.sin(t * 0.4 + dist) * 20;
          }
        }
        buf[i][0] = spread ? base - spread / 2 : base;
        buf[i][1] = spread ? base + spread / 2 : base + 180;
        i++;
      }
    }
    return buf;
  }

  // ── Blended pattern angles — crossfades between adjacent patterns ─────────
  // Each pattern occupies TRANS_START/4 ms. During the last BLEND_MS of each
  // pattern slot the hands smoothly interpolate into the next pattern.
  const PATTERN_DUR = TRANS_START / 4;   // 5 750 ms per pattern
  const BLEND_MS    = 1200;              // crossfade window

  function blendedPatternAngles(t, pos) {
    const rawIdx    = pos / PATTERN_DUR;
    const pidx      = Math.min(Math.floor(rawIdx), 3);
    const phase     = rawIdx - pidx;           // 0..1 within this slot
    const blendFrac = 1 - BLEND_MS / PATTERN_DUR;

    if (pidx >= 3 || phase < blendFrac) {
      return patternAngles(t, pidx, _bufOut);
    }

    const p = ease((phase - blendFrac) / (1 - blendFrac));
    patternAngles(t, pidx,     _bufFrom);
    patternAngles(t, pidx + 1, _bufTo);
    for (let i = 0; i < N; i++) {
      const f1 = norm(_bufFrom[i][0]), f2 = norm(_bufFrom[i][1]);
      const t1 = norm(_bufTo[i][0]),   t2 = norm(_bufTo[i][1]);
      _bufOut[i][0] = lerpA(f1, t1, p);
      _bufOut[i][1] = lerpA(f2, t2, p);
    }
    return _bufOut;
  }

  // ── Main loop ─────────────────────────────────────────────────────────────
  // Full cycle (30 s):
  //   0 → TRANS_DUR          reverse ease: time display → pattern
  //   TRANS_DUR → TRANS_START blended patterns
  //   TRANS_START → PATTERN_END forward ease: pattern → time display
  //   PATTERN_END → CYCLE     static time display
  const t0 = Date.now();
  let transFrom  = null;  // pattern snapshot for pattern→time ease
  let timeSnap   = null;  // time snapshot for time→pattern reverse ease
  let lastSec    = -1;    // throttle static display to once per second
  let lastFrame  = 0;     // throttle pattern phase to ~30 fps
  let rafId      = null;

  const PATTERN_FRAME_MS = 33; // ~30 fps for the trig-heavy pattern phase

  function tick(now) {
    rafId = requestAnimationFrame(tick);

    const wallNow       = Date.now();
    const countdownDone = cfg.mode === 'countdown' && cfg.countdownEnd > 0 && wallNow >= cfg.countdownEnd;
    const pos           = (DEBUG_DIGITS || countdownDone) ? PATTERN_END : (wallNow - t0) % CYCLE;
    const t             = (wallNow - t0) / 1000;

    if (pos < TRANS_DUR) {
      // Reverse ease: time display → live pattern (60 fps — short 2 s window)
      if (!timeSnap) {
        // Deep copy _bufTime so it isn't clobbered by future timeAngles() calls
        const src = timeAngles();
        if (!timeSnap) timeSnap = Array.from({length: N}, (_, i) => [norm(src[i][0]), norm(src[i][1])]);
      }
      transFrom = null;
      const p      = ease(pos / TRANS_DUR);
      const target = blendedPatternAngles(t, pos);
      for (let i = 0; i < N; i++) {
        _bufInterp[i][0] = lerpA(timeSnap[i][0], target[i][0], p);
        _bufInterp[i][1] = lerpA(timeSnap[i][1], target[i][1], p);
      }
      apply(_bufInterp);

    } else if (pos < TRANS_START) {
      // Pure pattern display — throttle to ~30 fps (trig per cell is expensive)
      if (now - lastFrame < PATTERN_FRAME_MS) return;
      lastFrame = now;
      timeSnap  = null;
      transFrom = null;
      apply(blendedPatternAngles(t, pos));

    } else if (pos < PATTERN_END) {
      // Forward ease: pattern → time display (60 fps — short 2 s window)
      timeSnap = null;
      if (!transFrom) {
        // Deep copy _bufOut so it isn't clobbered by future pattern calls
        const src = blendedPatternAngles(t, TRANS_START - 1);
        transFrom = Array.from({length: N}, (_, i) => [norm(src[i][0]), norm(src[i][1])]);
      }
      const p      = ease((pos - TRANS_START) / TRANS_DUR);
      const target = timeAngles();
      for (let i = 0; i < N; i++) {
        _bufInterp[i][0] = lerpA(transFrom[i][0], target[i][0], p);
        _bufInterp[i][1] = lerpA(transFrom[i][1], target[i][1], p);
      }
      apply(_bufInterp);

    } else {
      // Static time display — re-render once per second only
      timeSnap  = null;
      transFrom = null;
      const sec = Math.floor(wallNow / 1000);
      if (sec !== lastSec) { lastSec = sec; apply(timeAngles()); }
    }
  }

  // Pause rAF when tab is hidden; resume when visible again
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
})();
