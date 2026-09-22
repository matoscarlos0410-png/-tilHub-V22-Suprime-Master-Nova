/* =========================================================
   ÚTILHUB V22 — NOVA FLOW GLOBAL
   SCRIPT.JS COMPLETO
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const STORAGE_KEY = "utilhub-v22";

const OLD_KEYS = [
  "utilhub-v21",
  "utilhub-v20",
  "utilhub-v19",
  "utilhub-v18",
  "utilhub-v17",
  "utilhub-v15-advanced"
];

const defaultState = {
  theme: "dark",
  motion: true,
  performance: "balanced",
  focus: false,

  novaMode: "cosmic",
  novaIntensity: 0.8,

  favorites: [],
  recent: [],

  notes: "",
  tasks: [],
  shopping: [],

  dictionaryRecent: [],

  stopwatch: {
    running: false,
    elapsed: 0,
    startedAt: 0
  },

  timer: {
    running: false,
    endAt: 0,
    remaining: 0
  },

  settings: {}
};


/* =========================================================
   UTILIDADES GENERALES
   ========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function mergeState(base, extra) {
  const result = cloneDefaultState();

  Object.assign(result, base || {});

  if (extra && typeof extra === "object") {
    Object.assign(result, extra);
  }

  return result;
}


/* =========================================================
   ESTADO
   ========================================================= */

let state = loadState();

function loadState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);

    if (current) {
      return mergeState(defaultState, JSON.parse(current));
    }

    for (const key of OLD_KEYS) {
      const oldData = localStorage.getItem(key);

      if (oldData) {
        const migrated = mergeState(
          defaultState,
          JSON.parse(oldData)
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(migrated)
        );

        return migrated;
      }
    }
  } catch (error) {
    console.warn("No se pudo cargar el estado:", error);
  }

  return cloneDefaultState();
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("No se pudo guardar el estado:", error);
  }
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   NOVA FLOW
   ========================================================= */

const canvas = $("#nova");

let ctx = null;

if (canvas) {
  ctx = canvas.getContext("2d", {
    alpha: true
  });
}

let width = window.innerWidth;
let height = window.innerHeight;

let dpr = Math.min(
  window.devicePixelRatio || 1,
  2
);

let animationFrame = 0;

let novaTime = 0;

let lastFrame = performance.now();

let fpsFrames = 0;
let fpsLast = performance.now();

let currentFPS = 60;

let mouseX = width / 2;
let mouseY = height / 2;

let targetMouseX = mouseX;
let targetMouseY = mouseY;

let novaParticles = [];

const MODE_NAMES = {
  cosmic: "Cosmic",
  aurora: "Aurora",
  pulse: "Pulse",
  matrix: "Matrix",
  nebula: "Nebula",
  waves: "Waves",
  starfield: "Starfield",
  vortex: "Vortex",
  firefly: "Firefly",
  rain: "Rain",
  grid: "Grid",
  spiral: "Spiral",
  orbit: "Orbit",
  plasma: "Plasma",
  dna: "DNA",
  snow: "Snow",
  lightning: "Lightning",
  galaxy: "Galaxy",
  comet: "Comet",
  quantum: "Quantum",
  solar: "Solar",
  meteor: "Meteor",
  bubbles: "Bubbles",
  hexgrid: "Hexgrid",
  ripples: "Ripples",
  sparks: "Sparks",
  petals: "Petals",
  constellation: "Constellation",
  tunnel: "Tunnel",
  rings: "Rings",
  glitch: "Glitch",
  spectrum: "Spectrum",
  fractal: "Fractal",
  satellites: "Satellites",
  electric: "Electric",
  chrono: "Chrono",
  particles: "Particles",
  mandala: "Mandala",
  eclipse: "Eclipse",
  crystal: "Crystal",

  prism: "Prism",
  ink: "Ink",
  lava: "Lava",
  ocean: "Ocean",
  desert: "Desert",
  forest: "Forest",
  ember: "Ember",
  smoke: "Smoke",
  vortex2: "Vortex II",
  magnetic: "Magnetic",
  kaleido: "Kaleido",
  clockwork: "Clockwork",
  circuit: "Circuit",
  radar: "Radar",
  sonar: "Sonar",
  topography: "Topography",
  blueprint: "Blueprint",
  binary: "Binary",
  rainbows: "Rainbows",
  aurora2: "Aurora II",
  cometstorm: "Comet Storm",
  firestorm: "Firestorm",
  snowstorm: "Snowstorm",
  sandstorm: "Sandstorm",
  leafstorm: "Leafstorm",
  swarm: "Swarm",
  flock: "Flock",
  wavegrid: "Wavegrid",
  moire: "Moire",
  hologram: "Hologram",
  neonlines: "Neon Lines",
  ribbon: "Ribbon",
  galaxy2: "Galaxy II",
  supernova: "Supernova",
  wormhole: "Wormhole",
  stardust: "Stardust",
  portal: "Portal",
  heartbeat: "Heartbeat",
  equalizer: "Equalizer",
  infinity: "Infinity"
};

const MODE_LIST = Object.keys(MODE_NAMES);


/* =========================================================
   CANVAS
   ========================================================= */

function resizeCanvas() {
  if (!canvas || !ctx) return;

  width = window.innerWidth;
  height = window.innerHeight;

  dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  createNovaParticles();
}

window.addEventListener(
  "resize",
  resizeCanvas,
  { passive: true }
);


/* =========================================================
   PARTICULAS
   ========================================================= */

function getParticleCount() {
  if (state.performance === "performance") {
    return Math.min(
      65,
      Math.max(25, Math.floor(width * height / 18000))
    );
  }

  if (state.performance === "high") {
    return Math.min(
      180,
      Math.max(70, Math.floor(width * height / 7000))
    );
  }

  return Math.min(
    120,
    Math.max(45, Math.floor(width * height / 11000))
  );
}

function createNovaParticles() {
  const count = getParticleCount();

  novaParticles = [];

  for (let i = 0; i < count; i++) {
    novaParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,

      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,

      size:
        Math.random() * 2.2 + .4,

      alpha:
        Math.random() * .65 + .2,

      phase:
        Math.random() * Math.PI * 2,

      speed:
        Math.random() * .8 + .2
    });
  }
}


/* =========================================================
   DIBUJO BASE
   ========================================================= */

function clearCanvas() {
  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );
}

function glowCircle(
  x,
  y,
  radius,
  alpha = .2
) {
  if (!ctx) return;

  const gradient = ctx.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    radius
  );

  gradient.addColorStop(
    0,
    `rgba(110,231,255,${alpha})`
  );

  gradient.addColorStop(
    .45,
    `rgba(139,92,246,${alpha * .4})`
  );

  gradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = gradient;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

function drawParticleField(
  colorA = "110,231,255",
  colorB = "139,92,246"
) {
  if (!ctx) return;

  const intensity =
    state.novaIntensity;

  for (const p of novaParticles) {
    if (state.motion) {
      p.x += p.vx * p.speed * intensity;
      p.y += p.vy * p.speed * intensity;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }

    const pulse =
      .5 +
      .5 *
      Math.sin(
        novaTime * .001 *
        p.speed +
        p.phase
      );

    ctx.fillStyle =
      `rgba(${pulse > .5 ? colorA : colorB},${p.alpha * intensity})`;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}

function drawCenterGlow() {
  const cx =
    width / 2 +
    (mouseX - width / 2) * .025;

  const cy =
    height / 2 +
    (mouseY - height / 2) * .025;

  glowCircle(
    cx,
    cy,
    Math.min(width, height) * .32,
    .055 * state.novaIntensity
  );
}


/* =========================================================
   MODOS NOVA — 1-10
   ========================================================= */

function modeCosmic() {
  drawCenterGlow();

  drawParticleField();

  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      90 + i * 80 +
      Math.sin(novaTime * .001 + i) * 15,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(110,231,255,${.08 - i * .012})`;

    ctx.stroke();
  }
}

function modeAurora() {
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();

    for (let x = 0; x <= width; x += 10) {
      const y =
        height * (.25 + i * .08) +
        Math.sin(
          x * .008 +
          novaTime * .001 +
          i
        ) * 50;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(${80 + i * 15},${210 - i * 8},255,.08)`;

    ctx.lineWidth = 18;

    ctx.stroke();
  }

  drawParticleField();
}

function modePulse() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 9; i++) {
    const wave =
      (novaTime * .09 +
        i * 65) %
      650;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      wave,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(110,231,255,${Math.max(0,.16-wave/4300)})`;

    ctx.lineWidth = 2;

    ctx.stroke();
  }
}

function modeMatrix() {
  ctx.font = "12px monospace";

  const columns =
    Math.ceil(width / 22);

  for (let i = 0; i < columns; i++) {
    const x = i * 22;

    const y =
      ((novaTime * (.08 + (i % 5) * .012)) +
        i * 70) %
      (height + 200) - 100;

    ctx.fillStyle =
      `rgba(52,211,153,${.15 + (i % 4) * .03})`;

    ctx.fillText(
      Math.random() > .5 ? "1" : "0",
      x,
      y
    );
  }
}

function modeNebula() {
  for (let i = 0; i < 7; i++) {
    const x =
      width * (.15 + i * .13) +
      Math.sin(novaTime * .0005 + i) * 80;

    const y =
      height * (.25 + (i % 3) * .25);

    glowCircle(
      x,
      y,
      180,
      .045
    );
  }

  drawParticleField(
    "196,181,253",
    "110,231,255"
  );
}

function modeWaves() {
  for (let row = 0; row < 9; row++) {
    ctx.beginPath();

    for (let x = 0; x <= width; x += 8) {
      const y =
        row * 90 +
        100 +
        Math.sin(
          x * .008 +
          novaTime * .0015 +
          row
        ) * 35;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle =
      `rgba(110,231,255,${.04 + row * .006})`;

    ctx.stroke();
  }
}

function modeStarfield() {
  drawParticleField(
    "255,255,255",
    "110,231,255"
  );
}

function modeVortex() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 160; i++) {
    const angle =
      i * .32 +
      novaTime * .0007;

    const radius =
      (i * 5 +
        novaTime * .025) %
      Math.min(width, height);

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius;

    ctx.fillStyle =
      `rgba(139,92,246,${.2 - radius / (height * 5)})`;

    ctx.fillRect(
      x,
      y,
      2,
      2
    );
  }
}

function modeFirefly() {
  drawParticleField(
    "251,191,36",
    "110,231,255"
  );
}

function modeRain() {
  ctx.lineWidth = 1;

  for (let i = 0; i < 110; i++) {
    const x =
      (i * 73) %
      width;

    const y =
      ((novaTime * (2 + i % 4)) +
        i * 83) %
      (height + 200) - 100;

    ctx.strokeStyle =
      "rgba(110,231,255,.10)";

    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.lineTo(
      x - 8,
      y + 35
    );

    ctx.stroke();
  }
}


/* =========================================================
   MODOS 11-20
   ========================================================= */

function modeGrid() {
  const size = 65;

  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);

    ctx.strokeStyle =
      "rgba(110,231,255,.045)";

    ctx.stroke();
  }

  for (let y = 0; y < height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);

    ctx.strokeStyle =
      "rgba(139,92,246,.045)";

    ctx.stroke();
  }
}

function modeSpiral() {
  const cx = width / 2;
  const cy = height / 2;

  ctx.beginPath();

  for (let i = 0; i < 1000; i++) {
    const angle =
      i * .045 +
      novaTime * .0005;

    const radius =
      i * .18;

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle =
    "rgba(110,231,255,.12)";

  ctx.stroke();
}

function modeOrbit() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 5; i++) {
    const radius =
      70 + i * 65;

    ctx.beginPath();

    ctx.ellipse(
      cx,
      cy,
      radius,
      radius * .42,
      i * .5,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(110,231,255,${.1 - i * .012})`;

    ctx.stroke();

    const a =
      novaTime * .001 +
      i;

    ctx.beginPath();

    ctx.arc(
      cx +
        Math.cos(a) * radius,
      cy +
        Math.sin(a) *
        radius *
        .42,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(255,255,255,.6)";

    ctx.fill();
  }
}

function modePlasma() {
  for (let x = 0; x < width; x += 14) {
    ctx.beginPath();

    for (let y = 0; y <= height; y += 14) {
      const wave =
        Math.sin(
          x * .015 +
          y * .012 +
          novaTime * .002
        );

      const xx =
        x +
        wave * 12;

      if (y === 0) {
        ctx.moveTo(xx, y);
      } else {
        ctx.lineTo(xx, y);
      }
    }

    ctx.strokeStyle =
      "rgba(139,92,246,.035)";

    ctx.stroke();
  }
}

function modeDNA() {
  const cx = width / 2;

  for (let i = 0; i < 90; i++) {
    const y =
      i * 10;

    const phase =
      novaTime * .002 +
      i * .12;

    const x1 =
      cx +
      Math.sin(phase) * 120;

    const x2 =
      cx -
      Math.sin(phase) * 120;

    ctx.fillStyle =
      "rgba(110,231,255,.35)";

    ctx.beginPath();

    ctx.arc(
      x1,
      y,
      2.5,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x2,
      y,
      2.5,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (i % 4 === 0) {
      ctx.beginPath();

      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);

      ctx.strokeStyle =
        "rgba(139,92,246,.08)";

      ctx.stroke();
    }
  }
}

function modeSnow() {
  for (let i = 0; i < 120; i++) {
    const x =
      (i * 53 +
        Math.sin(i) * 30) %
      width;

    const y =
      ((novaTime *
        (.04 + (i % 5) * .008)) +
        i * 53) %
      (height + 50);

    ctx.fillStyle =
      "rgba(255,255,255,.18)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1 + i % 3,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}

function modeLightning() {
  for (let n = 0; n < 3; n++) {
    ctx.beginPath();

    let x =
      width *
      (.25 + n * .25);

    let y = 0;

    ctx.moveTo(x, y);

    for (let i = 0; i < 12; i++) {
      x +=
        (Math.random() - .5) *
        50;

      y +=
        height / 12;

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle =
      "rgba(110,231,255,.12)";

    ctx.lineWidth = 2;

    ctx.stroke();
  }
}

function modeGalaxy() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 500; i++) {
    const angle =
      i * .19 +
      novaTime * .0002;

    const radius =
      Math.sqrt(i) * 12;

    const x =
      cx +
      Math.cos(angle) *
      radius;

    const y =
      cy +
      Math.sin(angle) *
      radius *
      .45;

    ctx.fillStyle =
      `rgba(196,181,253,${.18 - radius / 7000})`;

    ctx.fillRect(
      x,
      y,
      1.5,
      1.5
    );
  }
}

function modeComet() {
  const cx = width / 2;
  const cy = height / 2;

  const angle =
    novaTime * .0004;

  const x =
    cx +
    Math.cos(angle) *
    Math.min(width, height) *
    .4;

  const y =
    cy +
    Math.sin(angle) *
    Math.min(width, height) *
    .25;

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle =
      `rgba(110,231,255,${.12 - i * .002})`;

    ctx.beginPath();

    ctx.arc(
      x -
        Math.cos(angle) * i * 6,
      y -
        Math.sin(angle) * i * 4,
      Math.max(1, 5 - i / 10),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }
}

function modeQuantum() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 80; i++) {
    const angle =
      i * .71 +
      novaTime * .001;

    const radius =
      30 +
      Math.sin(
        novaTime * .002 +
        i
      ) * 130;

    ctx.fillStyle =
      "rgba(110,231,255,.12)";

    ctx.fillRect(
      cx +
        Math.cos(angle) *
        radius,
      cy +
        Math.sin(angle) *
        radius,
      2,
      2
    );
  }
}


/* =========================================================
   MODOS 21-40
   ========================================================= */

function modeSolar() {
  const cx = width / 2;
  const cy = height / 2;

  glowCircle(
    cx,
    cy,
    130,
    .08
  );

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    75 +
      Math.sin(novaTime * .002) * 4,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(251,191,36,.12)";

  ctx.fill();

  for (let i = 0; i < 18; i++) {
    const a =
      i *
      Math.PI /
      9 +
      novaTime * .0005;

    ctx.beginPath();

    ctx.moveTo(
      cx +
        Math.cos(a) * 95,
      cy +
        Math.sin(a) * 95
    );

    ctx.lineTo(
      cx +
        Math.cos(a) * 135,
      cy +
        Math.sin(a) * 135
    );

    ctx.strokeStyle =
      "rgba(251,191,36,.09)";

    ctx.stroke();
  }
}

function modeMeteor() {
  for (let i = 0; i < 14; i++) {
    const progress =
      ((novaTime * .00025 +
        i / 14) %
        1);

    const x =
      progress * width;

    const y =
      progress * height;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    ctx.lineTo(
      x - 80,
      y - 45
    );

    ctx.strokeStyle =
      "rgba(196,181,253,.10)";

    ctx.stroke();
  }
}

function modeBubbles() {
  for (let i = 0; i < 35; i++) {
    const x =
      (i * 97) %
      width;

    const y =
      height -
      ((novaTime * (.025 + i * .001) +
        i * 80) %
        (height + 100));

    const r =
      4 + (i % 8);

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      r,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "rgba(110,231,255,.08)";

    ctx.stroke();
  }
}

function modeHexgrid() {
  const size = 45;

  for (
    let y = -size;
    y < height + size;
    y += size * .86
  ) {
    for (
      let x = -size;
      x < width + size;
      x += size * 1.5
    ) {
      const offset =
        Math.floor(y / size) % 2
          ? size * .75
          : 0;

      drawHex(
        x + offset,
        y,
        size / 2
      );
    }
  }
}

function drawHex(x, y, r) {
  ctx.beginPath();

  for (let i = 0; i < 6; i++) {
    const a =
      Math.PI / 3 * i;

    const px =
      x + Math.cos(a) * r;

    const py =
      y + Math.sin(a) * r;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();

  ctx.strokeStyle =
    "rgba(110,231,255,.035)";

  ctx.stroke();
}

function modeRipples() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 12; i++) {
    const r =
      ((novaTime * .06 +
        i * 55) %
        700);

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(110,231,255,${Math.max(0,.1-r/7000)})`;

    ctx.stroke();
  }
}

function modeSparks() {
  for (let i = 0; i < 90; i++) {
    const x =
      width / 2 +
      Math.sin(i * 4.1 + novaTime * .002) *
      (50 + i * 3);

    const y =
      height / 2 +
      Math.cos(i * 3.7 + novaTime * .0015) *
      (50 + i * 2);

    ctx.fillStyle =
      "rgba(255,255,255,.12)";

    ctx.fillRect(
      x,
      y,
      2,
      2
    );
  }
}

function modePetals() {
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();

  ctx.translate(cx, cy);

  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);

    ctx.beginPath();

    ctx.ellipse(
      0,
      90,
      22,
      80,
      0,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "rgba(196,181,253,.08)";

    ctx.stroke();
  }

  ctx.restore();
}

function modeConstellation() {
  const points = novaParticles;

  for (let i = 0; i < points.length; i++) {
    for (
      let j = i + 1;
      j < points.length;
      j++
    ) {
      const a = points[i];
      const b = points[j];

      const dx =
        a.x - b.x;

      const dy =
        a.y - b.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (distance < 120) {
        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        ctx.lineTo(
          b.x,
          b.y
        );

        ctx.strokeStyle =
          `rgba(110,231,255,${.06 * (1-distance/120)})`;

        ctx.stroke();
      }
    }
  }

  drawParticleField();
}

function modeTunnel() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 18; i++) {
    const scale =
      ((novaTime * .0002 +
        i / 18) %
        1);

    const w =
      40 +
      scale *
      width;

    const h =
      25 +
      scale *
      height;

    ctx.strokeStyle =
      `rgba(139,92,246,${.1-scale*.08})`;

    ctx.strokeRect(
      cx - w / 2,
      cy - h / 2,
      w,
      h
    );
  }
}

function modeRings() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 14; i++) {
    const r =
      30 +
      i * 40 +
      Math.sin(
        novaTime * .001 +
        i
      ) * 8;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(110,231,255,${.07-i*.003})`;

    ctx.stroke();
  }
}

function modeGlitch() {
  for (let i = 0; i < 25; i++) {
    const x =
      Math.random() * width;

    const y =
      Math.random() * height;

    const w =
      5 +
      Math.random() * 100;

    ctx.fillStyle =
      Math.random() > .5
        ? "rgba(110,231,255,.045)"
        : "rgba(244,114,182,.035)";

    ctx.fillRect(
      x,
      y,
      w,
      2
    );
  }
}

function modeSpectrum() {
  for (let i = 0; i < 30; i++) {
    const x =
      i *
      width /
      30;

    const h =
      80 +
      Math.sin(
        novaTime * .003 +
        i * .4
      ) *
      60;

    ctx.fillStyle =
      `hsla(${i*12},90%,70%,.06)`;

    ctx.fillRect(
      x,
      height / 2 - h / 2,
      3,
      h
    );
  }
}

function modeFractal() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 9; i++) {
    const size =
      40 *
      Math.pow(1.7, i);

    if (size > Math.max(width,height)) {
      continue;
    }

    ctx.strokeStyle =
      `rgba(110,231,255,${.07-i*.006})`;

    ctx.strokeRect(
      cx - size / 2,
      cy - size / 2,
      size,
      size
    );
  }
}

function modeSatellites() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 7; i++) {
    const radius =
      70 + i * 55;

    const angle =
      novaTime * (.0004 + i*.00003) +
      i;

    const x =
      cx +
      Math.cos(angle) * radius;

    const y =
      cy +
      Math.sin(angle) * radius * .5;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(110,231,255,.3)";

    ctx.fill();
  }
}

function modeElectric() {
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();

    let x =
      Math.random() * width;

    let y = 0;

    ctx.moveTo(x, y);

    for (let j = 0; j < 8; j++) {
      x +=
        (Math.random()-.5)*70;

      y +=
        height / 8;

      ctx.lineTo(
        x,
        y
      );
    }

    ctx.strokeStyle =
      "rgba(110,231,255,.045)";

    ctx.stroke();
  }
}

function modeChrono() {
  const cx = width / 2;
  const cy = height / 2;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    110,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(110,231,255,.1)";

  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a =
      i *
      Math.PI /
      6;

    ctx.beginPath();

    ctx.moveTo(
      cx +
        Math.cos(a) *
        90,
      cy +
        Math.sin(a) *
        90
    );

    ctx.lineTo(
      cx +
        Math.cos(a) *
        105,
      cy +
        Math.sin(a) *
        105
    );

    ctx.stroke();
  }
}

function modeParticles() {
  drawParticleField(
    "110,231,255",
    "255,255,255"
  );
}

function modeMandala() {
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();

  ctx.translate(
    cx,
    cy
  );

  for (let layer = 0; layer < 5; layer++) {
    for (let i = 0; i < 16; i++) {
      ctx.rotate(
        Math.PI / 8
      );

      ctx.beginPath();

      ctx.arc(
        0,
        45 + layer * 30,
        10 + layer * 2,
        0,
        Math.PI * 2
      );

      ctx.strokeStyle =
        "rgba(196,181,253,.06)";

      ctx.stroke();
    }
  }

  ctx.restore();
}

function modeEclipse() {
  const cx = width / 2;
  const cy = height / 2;

  glowCircle(
    cx,
    cy,
    160,
    .07
  );

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    90,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "rgba(0,0,0,.5)";

  ctx.fill();

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    105,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(251,191,36,.12)";

  ctx.stroke();
}

function modeCrystal() {
  const cx = width / 2;
  const cy = height / 2;

  for (let i = 0; i < 9; i++) {
    const size =
      35 + i * 35;

    ctx.save();

    ctx.translate(
      cx,
      cy
    );

    ctx.rotate(
      i * .25 +
      novaTime * .0001
    );

    ctx.beginPath();

    ctx.moveTo(
      0,
      -size
    );

    ctx.lineTo(
      size * .6,
      0
    );

    ctx.lineTo(
      0,
      size
    );

    ctx.lineTo(
      -size * .6,
      0
    );

    ctx.closePath();

    ctx.strokeStyle =
      `rgba(110,231,255,${.09-i*.006})`;

    ctx.stroke();

    ctx.restore();
  }
}


/* =========================================================
   MODOS 41-60 — V22
   ========================================================= */

function modePrism() {
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();

    ctx.moveTo(
      width * .1,
      height * (.2 + i*.1)
    );

    ctx.lineTo(
      width * .9,
      height * (.8 - i*.1)
    );

    ctx.strokeStyle =
      `hsla(${i*45},90%,70%,.05)`;

    ctx.stroke();
  }
}

function modeInk() {
  for (let i = 0; i < 20; i++) {
    const x =
      width / 2 +
      Math.sin(
        novaTime * .0005 + i
      ) * 250;

    const y =
      height / 2 +
      Math.cos(
        novaTime * .0007 + i
      ) * 180;

    glowCircle(
      x,
      y,
      70 + i * 4,
      .025
    );
  }
}

function modeLava() {
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 12
    ) {
      const y =
        height * .5 +
        i * 45 +
        Math.sin(
          x*.009 +
          novaTime*.001 +
          i
        ) * 50;

      if (x === 0) {
        ctx.moveTo(x,y);
      } else {
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle =
      `rgba(251,113,36,${.025+i*.004})`;

    ctx.lineWidth = 15;

    ctx.stroke();
  }
}

function modeOcean() {
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();

    for (
      let x = 0;
      x <= width;
      x += 10
    ) {
      const y =
        height*.45 +
        i*40 +
        Math.sin(
          x*.012 +
          novaTime*.0015 +
          i
        )*25;

      if (x === 0) {
        ctx.moveTo(x,y);
      } else {
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle =
      `rgba(34,211,238,${.03+i*.003})`;

    ctx.stroke();
  }
}

function modeDesert() {
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();

    ctx.moveTo(
      0,
      height*.5+i*30
    );

    for (
      let x = 0;
      x <= width;
      x += 15
    ) {
      const y =
        height*.5 +
        i*30 +
        Math.sin(
          x*.004+i+
          novaTime*.0003
        )*35;

      ctx.lineTo(
        x,
        y
      );
    }

    ctx.strokeStyle =
      "rgba(251,191,36,.035)";

    ctx.stroke();
  }
}

function modeForest() {
  for (let i = 0; i < 50; i++) {
    const x =
      i * 37 % width;

    const h =
      80 +
      (i * 29) % 180;

    ctx.beginPath();

    ctx.moveTo(
      x,
      height
    );

    ctx.lineTo(
      x + 20,
      height-h
    );

    ctx.lineTo(
      x + 40,
      height
    );

    ctx.strokeStyle =
      "rgba(52,211,153,.045)";

    ctx.stroke();
  }
}

function modeEmber() {
  for (let i = 0; i < 80; i++) {
    const x =
      (i*97) % width;

    const y =
      height -
      ((novaTime*.04+i*61) %
      (height+100));

    ctx.fillStyle =
      "rgba(251,113,36,.12)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1+i%3,
      0,
      Math.PI*2
    );

    ctx.fill();
  }
}

function modeSmoke() {
  for (let i = 0; i < 25; i++) {
    const x =
      width*.5 +
      Math.sin(
        novaTime*.0004+i
      )*200;

    const y =
      height -
      ((novaTime*.02+i*60) %
      (height+200));

    glowCircle(
      x,
      y,
      50+i*3,
      .02
    );
  }
}

function modeVortex2() {
  const cx = width/2;
  const cy = height/2;

  for (let i=0;i<260;i++) {
    const a =
      i*.13 +
      novaTime*.001;

    const r =
      20 +
      (i*4)%500;

    ctx.fillStyle =
      "rgba(196,181,253,.06)";

    ctx.fillRect(
      cx+Math.cos(a)*r,
      cy+Math.sin(a)*r*.6,
      2,
      2
    );
  }
}

function modeMagnetic() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<14;i++){
    ctx.beginPath();

    for(let a=-1.2;a<=1.2;a+=.05){
      const r=80+i*32;
      const x=
        cx+
        Math.cos(a)*
        r;

      const y=
        cy+
        Math.sin(a)*
        r*
        .55;

      if(a===-1.2){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle=
      "rgba(110,231,255,.05)";

    ctx.stroke();
  }
}

function modeKaleido() {
  const cx=width/2;
  const cy=height/2;

  ctx.save();

  ctx.translate(cx,cy);

  for(let i=0;i<8;i++){
    ctx.rotate(Math.PI/4);

    ctx.beginPath();

    ctx.moveTo(0,0);
    ctx.lineTo(150,30);
    ctx.lineTo(220,0);

    ctx.strokeStyle=
      "rgba(196,181,253,.07)";

    ctx.stroke();
  }

  ctx.restore();
}

function modeClockwork() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<8;i++){
    const r=35+i*38;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      "rgba(110,231,255,.055)";

    ctx.stroke();

    for(let j=0;j<8;j++){
      const a=
        j*Math.PI/4+
        i*.1;

      ctx.fillStyle=
        "rgba(255,255,255,.08)";

      ctx.fillRect(
        cx+
        Math.cos(a)*r-2,
        cy+
        Math.sin(a)*r-2,
        4,
        4
      );
    }
  }
}

function modeCircuit() {
  for(let i=0;i<18;i++){
    let x=
      Math.random()*width;

    let y=
      Math.random()*height;

    ctx.beginPath();
    ctx.moveTo(x,y);

    for(let j=0;j<5;j++){
      if(j%2===0){
        x+=
          (Math.random()>.5?1:-1)*
          60;
      }else{
        y+=
          (Math.random()>.5?1:-1)*
          40;
      }

      ctx.lineTo(x,y);
    }

    ctx.strokeStyle=
      "rgba(110,231,255,.045)";

    ctx.stroke();
  }
}

function modeRadar() {
  const cx=width/2;
  const cy=height/2;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    180,
    0,
    Math.PI*2
  );

  ctx.strokeStyle=
    "rgba(52,211,153,.08)";

  ctx.stroke();

  const a=
    novaTime*.001;

  ctx.beginPath();

  ctx.moveTo(cx,cy);

  ctx.lineTo(
    cx+Math.cos(a)*180,
    cy+Math.sin(a)*180
  );

  ctx.strokeStyle=
    "rgba(52,211,153,.18)";

  ctx.stroke();
}

function modeSonar() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<8;i++){
    const r=
      (novaTime*.08+i*70)%500;

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      r,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      `rgba(34,211,238,${Math.max(0,.1-r/6000)})`;

    ctx.stroke();
  }
}

function modeTopography() {
  for(let i=0;i<18;i++){
    ctx.beginPath();

    for(let x=0;x<=width;x+=12){
      const y=
        height*.5+
        i*28+
        Math.sin(
          x*.006+
          i*.4+
          novaTime*.0002
        )*45;

      if(x===0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle=
      "rgba(110,231,255,.035)";

    ctx.stroke();
  }
}

function modeBlueprint() {
  const size=55;

  for(let x=0;x<width;x+=size){
    ctx.beginPath();

    ctx.moveTo(x,0);
    ctx.lineTo(x,height);

    ctx.strokeStyle=
      "rgba(110,231,255,.035)";

    ctx.stroke();
  }

  for(let y=0;y<height;y+=size){
    ctx.beginPath();

    ctx.moveTo(0,y);
    ctx.lineTo(width,y);

    ctx.strokeStyle=
      "rgba(110,231,255,.035)";

    ctx.stroke();
  }
}

function modeBinary() {
  ctx.font=
    "11px monospace";

  for(let i=0;i<120;i++){
    const x=
      (i*47)%width;

    const y=
      ((novaTime*.05+i*39)%
      height);

    ctx.fillStyle=
      "rgba(110,231,255,.08)";

    ctx.fillText(
      i%2 ? "1":"0",
      x,
      y
    );
  }
}

function modeRainbows() {
  for(let i=0;i<20;i++){
    ctx.beginPath();

    ctx.arc(
      width/2,
      height/2,
      70+i*28,
      Math.PI,
      Math.PI*2
    );

    ctx.strokeStyle=
      `hsla(${i*18},90%,70%,.05)`;

    ctx.stroke();
  }
}


/* =========================================================
   MODOS 61-80 — V22
   ========================================================= */

function modeAurora2() {
  for(let i=0;i<16;i++){
    ctx.beginPath();

    for(let x=0;x<=width;x+=10){
      const y=
        height*.25+
        i*45+
        Math.sin(
          x*.006+
          novaTime*.001+
          i
        )*55;

      if(x===0){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle=
      `hsla(${170+i*8},90%,70%,.035)`;

    ctx.lineWidth=8;

    ctx.stroke();
  }
}

function modeCometstorm() {
  for(let i=0;i<22;i++){
    const p=
      (novaTime*.0003+i/22)%1;

    const x=p*width;

    const y=
      (i*97)%height+
      p*150;

    ctx.beginPath();

    ctx.moveTo(x,y);

    ctx.lineTo(
      x-70,
      y-35
    );

    ctx.strokeStyle=
      "rgba(196,181,253,.08)";

    ctx.stroke();
  }
}

function modeFirestorm() {
  for(let i=0;i<70;i++){
    const x=
      (i*73)%width;

    const y=
      height-
      ((novaTime*.06+i*51)%
      (height+100));

    ctx.fillStyle=
      "rgba(251,113,36,.09)";

    ctx.fillRect(
      x,
      y,
      2,
      8+i%6
    );
  }
}

function modeSnowstorm() {
  for(let i=0;i<180;i++){
    const x=
      (i*31+
      Math.sin(i)*40)%
      width;

    const y=
      ((novaTime*.05+i*41)%
      (height+50));

    ctx.fillStyle=
      "rgba(255,255,255,.1)";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1+i%3,
      0,
      Math.PI*2
    );

    ctx.fill();
  }
}

function modeSandstorm() {
  for(let i=0;i<130;i++){
    const y=
      (i*23)%height;

    const x=
      ((novaTime*.15+i*55)%
      (width+100))-50;

    ctx.fillStyle=
      "rgba(251,191,36,.06)";

    ctx.fillRect(
      x,
      y,
      18,
      1
    );
  }
}

function modeLeafstorm() {
  for(let i=0;i<65;i++){
    const x=
      (i*79+
      Math.sin(novaTime*.001+i)*40)%
      width;

    const y=
      ((novaTime*.025+i*55)%
      (height+80));

    ctx.save();

    ctx.translate(x,y);

    ctx.rotate(
      novaTime*.001+i
    );

    ctx.fillStyle=
      "rgba(52,211,153,.07)";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      4,
      9,
      0,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.restore();
  }
}

function modeSwarm() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<100;i++){
    const a=
      i*.73+
      novaTime*.001;

    const r=
      70+
      Math.sin(
        novaTime*.002+i
      )*100;

    ctx.fillStyle=
      "rgba(110,231,255,.07)";

    ctx.fillRect(
      cx+
      Math.cos(a)*r,
      cy+
      Math.sin(a)*r,
      2,
      2
    );
  }
}

function modeFlock() {
  for(let i=0;i<45;i++){
    const x=
      width/2+
      Math.sin(i*.8+
      novaTime*.001)*250;

    const y=
      height/2+
      Math.cos(i*.9+
      novaTime*.0012)*170;

    ctx.beginPath();

    ctx.moveTo(x,y);

    ctx.lineTo(
      x-10,
      y+5
    );

    ctx.lineTo(
      x-10,
      y-5
    );

    ctx.closePath();

    ctx.fillStyle=
      "rgba(196,181,253,.08)";

    ctx.fill();
  }
}

function modeWavegrid() {
  for(let x=0;x<width;x+=35){
    ctx.beginPath();

    for(let y=0;y<=height;y+=10){
      const xx=
        x+
        Math.sin(
          y*.015+
          novaTime*.001
        )*15;

      if(y===0){
        ctx.moveTo(xx,y);
      }else{
        ctx.lineTo(xx,y);
      }
    }

    ctx.strokeStyle=
      "rgba(110,231,255,.035)";

    ctx.stroke();
  }
}

function modeMoire() {
  for(let i=0;i<30;i++){
    ctx.beginPath();

    ctx.arc(
      width/2,
      height/2,
      50+i*14+
      Math.sin(novaTime*.001)*5,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      `rgba(139,92,246,${.025+i*.001})`;

    ctx.stroke();
  }
}

function modeHologram() {
  for(let i=0;i<60;i++){
    const y=
      (i*17+
      Math.sin(novaTime*.002+i)*20)%
      height;

    ctx.fillStyle=
      `rgba(110,231,255,${.025+i%3*.01})`;

    ctx.fillRect(
      0,
      y,
      width,
      1
    );
  }
}

function modeNeonlines() {
  for(let i=0;i<12;i++){
    ctx.beginPath();

    ctx.moveTo(
      0,
      height*.1+i*75
    );

    ctx.bezierCurveTo(
      width*.3,
      height*.2+i*35,
      width*.7,
      height*.0+i*95,
      width,
      height*.1+i*75
    );

    ctx.strokeStyle=
      `rgba(110,231,255,${.025+i*.003})`;

    ctx.lineWidth=2;

    ctx.stroke();
  }
}

function modeRibbon() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<5;i++){
    ctx.beginPath();

    for(let t=-4;t<=4;t+=.03){
      const x=
        cx+
        t*110;

      const y=
        cy+
        Math.sin(
          t+
          novaTime*.001+
          i
        )*
        70;

      if(t===-4){
        ctx.moveTo(x,y);
      }else{
        ctx.lineTo(x,y);
      }
    }

    ctx.strokeStyle=
      "rgba(196,181,253,.05)";

    ctx.stroke();
  }
}

function modeGalaxy2() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<700;i++){
    const a=
      i*.13+
      novaTime*.00025;

    const r=
      Math.sqrt(i)*10;

    ctx.fillStyle=
      `rgba(196,181,253,${Math.max(0,.09-r/900)})`;

    ctx.fillRect(
      cx+
      Math.cos(a)*r,
      cy+
      Math.sin(a)*r*.5,
      1.5,
      1.5
    );
  }
}

function modeSupernova() {
  const cx=width/2;
  const cy=height/2;

  const pulse=
    90+
    Math.sin(novaTime*.003)*25;

  glowCircle(
    cx,
    cy,
    pulse*2,
    .12
  );

  for(let i=0;i<30;i++){
    const a=
      i*Math.PI*2/30;

    ctx.beginPath();

    ctx.moveTo(
      cx+
      Math.cos(a)*pulse,
      cy+
      Math.sin(a)*pulse
    );

    ctx.lineTo(
      cx+
      Math.cos(a)*
      (pulse+80),
      cy+
      Math.sin(a)*
      (pulse+80)
    );

    ctx.strokeStyle=
      "rgba(110,231,255,.08)";

    ctx.stroke();
  }
}

function modeWormhole() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<20;i++){
    const r=
      20+
      i*30+
      Math.sin(novaTime*.001+i)*8;

    ctx.beginPath();

    ctx.ellipse(
      cx,
      cy,
      r,
      r*.35,
      novaTime*.0002,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      `rgba(139,92,246,${.08-i*.003})`;

    ctx.stroke();
  }
}

function modeStardust() {
  for(let i=0;i<220;i++){
    const a=
      i*.17+
      novaTime*.0002;

    const r=
      100+
      (i*13)%400;

    const x=
      width/2+
      Math.cos(a)*r;

    const y=
      height/2+
      Math.sin(a)*r*.5;

    ctx.fillStyle=
      "rgba(255,255,255,.08)";

    ctx.fillRect(
      x,
      y,
      1,
      1
    );
  }
}

function modePortal() {
  const cx=width/2;
  const cy=height/2;

  for(let i=0;i<15;i++){
    const r=
      35+i*35;

    ctx.beginPath();

    ctx.ellipse(
      cx,
      cy,
      r,
      r*.7,
      novaTime*.0005+i*.1,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      `rgba(110,231,255,${.09-i*.004})`;

    ctx.stroke();
  }
}

function modeHeartbeat() {
  const mid=height/2;

  ctx.beginPath();

  for(let x=0;x<=width;x+=4){
    const phase=
      x*.02+
      novaTime*.004;

    let y=mid;

    if(
      phase%Math.PI*2 >
      Math.PI*.8 &&
      phase%Math.PI*2 <
      Math.PI*1.2
    ){
      y-=
        Math.sin(
          phase
        )*70;
    }

    if(x===0){
      ctx.moveTo(x,y);
    }else{
      ctx.lineTo(x,y);
    }
  }

  ctx.strokeStyle=
    "rgba(110,231,255,.12)";

  ctx.lineWidth=2;

  ctx.stroke();
}

function modeEqualizer() {
  const bars=45;

  const gap=
    width/bars;

  for(let i=0;i<bars;i++){
    const h=
      30+
      Math.abs(
        Math.sin(
          novaTime*.003+
          i*.4
        )
      )*120;

    ctx.fillStyle=
      `rgba(110,231,255,${.025+i%3*.015})`;

    ctx.fillRect(
      i*gap,
      height/2-h/2,
      gap-3,
      h
    );
  }
}

function modeInfinity() {
  const cx=width/2;
  const cy=height/2;

  ctx.beginPath();

  for(
    let t=0;
    t<=Math.PI*2;
    t+=.01
  ){
    const x=
      Math.sin(t)*
      150;

    const y=
      Math.sin(t*2)*
      75;

    const rx=
      cx+x;

    const ry=
      cy+y;

    if(t===0){
      ctx.moveTo(rx,ry);
    }else{
      ctx.lineTo(rx,ry);
    }
  }

  ctx.strokeStyle=
    "rgba(110,231,255,.13)";

  ctx.lineWidth=2;

  ctx.stroke();
}


/* =========================================================
   MAPA DE MODOS
   ========================================================= */

const MODE_HANDLERS = {
  cosmic: modeCosmic,
  aurora: modeAurora,
  pulse: modePulse,
  matrix: modeMatrix,
  nebula: modeNebula,
  waves: modeWaves,
  starfield: modeStarfield,
  vortex: modeVortex,
  firefly: modeFirefly,
  rain: modeRain,

  grid: modeGrid,
  spiral: modeSpiral,
  orbit: modeOrbit,
  plasma: modePlasma,
  dna: modeDNA,
  snow: modeSnow,
  lightning: modeLightning,
  galaxy: modeGalaxy,
  comet: modeComet,
  quantum: modeQuantum,

  solar: modeSolar,
  meteor: modeMeteor,
  bubbles: modeBubbles,
  hexgrid: modeHexgrid,
  ripples: modeRipples,
  sparks: modeSparks,
  petals: modePetals,
  constellation: modeConstellation,
  tunnel: modeTunnel,
  rings: modeRings,

  glitch: modeGlitch,
  spectrum: modeSpectrum,
  fractal: modeFractal,
  satellites: modeSatellites,
  electric: modeElectric,
  chrono: modeChrono,
  particles: modeParticles,
  mandala: modeMandala,
  eclipse: modeEclipse,
  crystal: modeCrystal,

  prism: modePrism,
  ink: modeInk,
  lava: modeLava,
  ocean: modeOcean,
  desert: modeDesert,
  forest: modeForest,
  ember: modeEmber,
  smoke: modeSmoke,
  vortex2: modeVortex2,
  magnetic: modeMagnetic,

  kaleido: modeKaleido,
  clockwork: modeClockwork,
  circuit: modeCircuit,
  radar: modeRadar,
  sonar: modeSonar,
  topography: modeTopography,
  blueprint: modeBlueprint,
  binary: modeBinary,
  rainbows: modeRainbows,
  aurora2: modeAurora2,

  cometstorm: modeCometstorm,
  firestorm: modeFirestorm,
  snowstorm: modeSnowstorm,
  sandstorm: modeSandstorm,
  leafstorm: modeLeafstorm,
  swarm: modeSwarm,
  flock: modeFlock,
  wavegrid: modeWavegrid,
  moire: modeMoire,
  hologram: modeHologram,

  neonlines: modeNeonlines,
  ribbon: modeRibbon,
  galaxy2: modeGalaxy2,
  supernova: modeSupernova,
  wormhole: modeWormhole,
  stardust: modeStardust,
  portal: modePortal,
  heartbeat: modeHeartbeat,
  equalizer: modeEqualizer,
  infinity: modeInfinity
};


/* =========================================================
   ANIMACIÓN GLOBAL
   ========================================================= */

function animateNova(now) {
  if (!ctx || !canvas) {
    return;
  }

  const delta =
    Math.min(
      50,
      now - lastFrame
    );

  lastFrame = now;

  novaTime = now;

  if (state.motion) {
    mouseX +=
      (targetMouseX - mouseX) *
      .04;

    mouseY +=
      (targetMouseY - mouseY) *
      .04;
  }

  clearCanvas();

  /*
    IMPORTANTE:
    NOVA FLOW SE DIBUJA AQUÍ CONTINUAMENTE.
    NO depende de la sección actual.
  */

  if (state.motion) {
    try {
      const handler =
        MODE_HANDLERS[state.novaMode] ||
        MODE_HANDLERS.cosmic;

      handler();
    } catch (error) {
      console.warn(
        "Error en modo NOVA:",
        state.novaMode,
        error
      );

      try {
        MODE_HANDLERS.cosmic();
      } catch (_) {}
    }
  } else {
    drawCenterGlow();
  }

  /* FPS */

  fpsFrames++;

  if (
    now - fpsLast >= 1000
  ) {
    currentFPS = fpsFrames;

    fpsFrames = 0;
    fpsLast = now;

    const fpsElement =
      $("#fps");

    if (fpsElement) {
      fpsElement.textContent =
        `${currentFPS} FPS`;
    }
  }

  animationFrame =
    requestAnimationFrame(
      animateNova
    );
}

function startNova() {
  if (!animationFrame) {
    animationFrame =
      requestAnimationFrame(
        animateNova
      );
  }
}


/* =========================================================
   CAMBIO DE MODO NOVA
   ========================================================= */

function setNovaMode(mode) {
  if (!MODE_HANDLERS[mode]) {
    mode = "cosmic";
  }

  state.novaMode = mode;

  saveState();

  $$(".novaMode").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });

  const name =
    $("#novaModeName");

  if (name) {
    name.textContent =
      MODE_NAMES[mode] ||
      mode;
  }
}

function setNovaIntensity(value) {
  state.novaIntensity =
    Math.max(
      0,
      Math.min(
        1,
        safeNumber(value, .8)
      )
    );

  saveState();
}


/* =========================================================
   NAVEGACIÓN ENTRE SECCIONES
   ========================================================= */

const sectionMap = {
  home: "homeSection",
  tools: "toolsSection",
  nova: "novaSection",
  favorites: "favoritesSection",
  recent: "recentSection",
  settings: "settingsSection"
};

function showSection(name) {
  const sectionId =
    sectionMap[name] ||
    sectionMap.home;

  $$(".siteSection").forEach(section => {
    section.classList.remove(
      "activeSection"
    );
  });

  const target =
    document.getElementById(
      sectionId
    );

  if (target) {
    target.classList.add(
      "activeSection"
    );
  }

  $$(".navItem").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === name
    );
  });

  window.scrollTo({
    top: 0,
    behavior: state.motion
      ? "smooth"
      : "auto"
  });

  if (name === "favorites") {
    renderFavorites();
  }

  if (name === "recent") {
    renderRecent();
  }
}


/* =========================================================
   CATÁLOGO DE HERRAMIENTAS
   ========================================================= */

const tools = [

  {
    id: "calculator",
    title: "Calculadora",
    icon: "🧮",
    category: "math",
    description: "Realiza operaciones matemáticas."
  },

  {
    id: "percentage",
    title: "Porcentaje",
    icon: "%",
    category: "math",
    description: "Calcula porcentajes rápidamente."
  },

  {
    id: "discount",
    title: "Descuento",
    icon: "🏷️",
    category: "math",
    description: "Calcula descuentos y precios finales."
  },

  {
    id: "rule3",
    title: "Regla de tres",
    icon: "📐",
    category: "math",
    description: "Resuelve reglas de tres simples."
  },

  {
    id: "average",
    title: "Promedio",
    icon: "∑",
    category: "math",
    description: "Calcula el promedio de varios números."
  },

  {
    id: "change",
    title: "Cambio %",
    icon: "↗",
    category: "math",
    description: "Calcula cambios porcentuales."
  },

  {
    id: "tip",
    title: "Propina",
    icon: "💵",
    category: "math",
    description: "Calcula una propina y total."
  },

  {
    id: "split",
    title: "Dividir cuenta",
    icon: "👥",
    category: "math",
    description: "Divide una cuenta entre personas."
  },

  {
    id: "area",
    title: "Área",
    icon: "⬛",
    category: "math",
    description: "Calcula áreas básicas."
  },

  {
    id: "length",
    title: "Longitud",
    icon: "📏",
    category: "convert",
    description: "Convierte unidades de longitud."
  },

  {
    id: "weight",
    title: "Peso",
    icon: "⚖️",
    category: "convert",
    description: "Convierte unidades de peso."
  },

  {
    id: "volume",
    title: "Volumen",
    icon: "🧪",
    category: "convert",
    description: "Convierte unidades de volumen."
  },

  {
    id: "temperature",
    title: "Temperatura",
    icon: "🌡️",
    category: "convert",
    description: "Convierte Celsius, Fahrenheit y Kelvin."
  },

  {
    id: "timeconvert",
    title: "Tiempo",
    icon: "⏱️",
    category: "convert",
    description: "Convierte unidades de tiempo."
  },

  {
    id: "data",
    title: "Datos digitales",
    icon: "💾",
    category: "convert",
    description: "Convierte KB, MB, GB y más."
  },

  {
    id: "currency",
    title: "Monedas",
    icon: "💱",
    category: "convert",
    description: "Calcula conversiones de monedas."
  },

  {
    id: "speed",
    title: "Velocidad",
    icon: "🏎️",
    category: "convert",
    description: "Convierte velocidad."
  },

  {
    id: "time",
    title: "Reloj",
    icon: "🕐",
    category: "time",
    description: "Consulta la hora actual."
  },

  {
    id: "timer",
    title: "Temporizador",
    icon: "⏳",
    category: "time",
    description: "Crea una cuenta regresiva."
  },

  {
    id: "stopwatch",
    title: "Cronómetro",
    icon: "⏱️",
    category: "time",
    description: "Mide el tiempo transcurrido."
  },

  {
    id: "datediff",
    title: "Diferencia de fechas",
    icon: "📅",
    category: "time",
    description: "Calcula días entre fechas."
  },

  {
    id: "age",
    title: "Edad",
    icon: "🎂",
    category: "time",
    description: "Calcula la edad a partir de una fecha."
  },

  {
    id: "text",
    title: "Texto",
    icon: "📝",
    category: "text",
    description: "Trabaja y transforma texto."
  },

  {
    id: "counter",
    title: "Contador",
    icon: "🔢",
    category: "text",
    description: "Cuenta palabras y caracteres."
  },

  {
    id: "case",
    title: "Mayúsculas",
    icon: "Aa",
    category: "text",
    description: "Cambia el formato de un texto."
  },

  {
    id: "dictionary",
    title: "Diccionario",
    icon: "📖",
    category: "text",
    description: "Busca definiciones de palabras."
  },

  {
    id: "notes",
    title: "Notas",
    icon: "📒",
    category: "organize",
    description: "Guarda notas localmente."
  },

  {
    id: "tasks",
    title: "Tareas",
    icon: "✅",
    category: "organize",
    description: "Organiza tareas pendientes."
  },

  {
    id: "shopping",
    title: "Lista de compras",
    icon: "🛒",
    category: "organize",
    description: "Crea y guarda una lista."
  },

  {
    id: "password",
    title: "Contraseña",
    icon: "🔐",
    category: "fun",
    description: "Genera contraseñas aleatorias."
  },

  {
    id: "random",
    title: "Aleatorio",
    icon: "🎲",
    category: "fun",
    description: "Genera números aleatorios."
  },

  {
    id: "qr",
    title: "Código QR",
    icon: "▦",
    category: "fun",
    description: "Genera un código QR."
  },

  {
    id: "food",
    title: "Buscar comida",
    icon: "🍔",
    category: "life",
    description: "Busca opciones de comida."
  },

  {
    id: "buy",
    title: "Buscar productos",
    icon: "🛍️",
    category: "life",
    description: "Busca productos para comprar."
  },

  {
    id: "calendar",
    title: "Calendario",
    icon: "🗓️",
    category: "time",
    description: "Consulta información del calendario."
  }

];


/* =========================================================
   RENDER DE HERRAMIENTAS
   ========================================================= */

let currentCategory = "all";
let currentSearch = "";

function renderTools() {
  const grid =
    $("#toolGrid");

  if (!grid) return;

  const filtered =
    tools.filter(tool => {

      const matchesCategory =
        currentCategory === "all" ||
        tool.category === currentCategory;

      const search =
        currentSearch
          .trim()
          .toLowerCase();

      const matchesSearch =
        !search ||
        tool.title
          .toLowerCase()
          .includes(search) ||
        tool.description
          .toLowerCase()
          .includes(search);

      return (
        matchesCategory &&
        matchesSearch
      );
    });

  grid.innerHTML =
    filtered.length
      ? filtered
          .map(toolCardHTML)
          .join("")
      : `
        <div class="emptyState">
          <h3>No encontramos esa herramienta</h3>
          <p>Prueba con otra búsqueda.</p>
        </div>
      `;
}

function toolCardHTML(tool) {
  const favorite =
    state.favorites.includes(
      tool.id
    );

  return `
    <article
      class="toolCard"
      data-open="${escapeHTML(tool.id)}"
    >

      <button
        class="favoriteToggle ${favorite ? "active" : ""}"
        data-favorite="${escapeHTML(tool.id)}"
        type="button"
        aria-label="Favorito"
      >
        ${favorite ? "★" : "☆"}
      </button>

      <div class="toolIcon">
        ${escapeHTML(tool.icon)}
      </div>

      <h3>
        ${escapeHTML(tool.title)}
      </h3>

      <p>
        ${escapeHTML(tool.description)}
      </p>

      <span class="toolCategory">
        ${escapeHTML(tool.category)}
      </span>

    </article>
  `;
}


/* =========================================================
   QUICK TOOLS
   ========================================================= */

function renderQuickTools() {
  const grid =
    $("#quickTools");

  if (!grid) return;

  const ids = [
    "calculator",
    "percentage",
    "timer",
    "notes",
    "tasks",
    "qr"
  ];

  const selected =
    ids
      .map(id =>
        tools.find(
          tool =>
            tool.id === id
        )
      )
      .filter(Boolean);

  grid.innerHTML =
    selected
      .map(toolCardHTML)
      .join("");
}


/* =========================================================
   FAVORITOS
   ========================================================= */

function toggleFavorite(id) {
  const index =
    state.favorites.indexOf(id);

  if (index >= 0) {
    state.favorites.splice(
      index,
      1
    );

    showToast(
      "Eliminado de favoritos."
    );
  } else {
    state.favorites.push(id);

    showToast(
      "Añadido a favoritos."
    );
  }

  saveState();

  renderTools();
  renderQuickTools();
  renderFavorites();
  updateStats();
}

function renderFavorites() {
  const grid =
    $("#favoritesGrid");

  if (!grid) return;

  const favoriteTools =
    state.favorites
      .map(id =>
        tools.find(
          tool =>
            tool.id === id
        )
      )
      .filter(Boolean);

  grid.innerHTML =
    favoriteTools.length
      ? favoriteTools
          .map(toolCardHTML)
          .join("")
      : `
        <div class="emptyState">
          <h3>Aún no tienes favoritos</h3>
          <p>
            Pulsa ☆ en una herramienta para guardarla.
          </p>
        </div>
      `;
}


/* =========================================================
   RECIENTES
   ========================================================= */

function addRecent(id) {
  state.recent =
    state.recent.filter(
      item => item !== id
    );

  state.recent.unshift(id);

  state.recent =
    state.recent.slice(
      0,
      10
    );

  saveState();

  updateStats();
  renderRecent();
}

function renderRecent() {
  const grid =
    $("#recentGrid");

  if (!grid) return;

  const recentTools =
    state.recent
      .map(id =>
        tools.find(
          tool =>
            tool.id === id
        )
      )
      .filter(Boolean);

  grid.innerHTML =
    recentTools.length
      ? recentTools
          .map(toolCardHTML)
          .join("")
      : `
        <div class="emptyState">
          <h3>No hay herramientas recientes</h3>
          <p>
            Las herramientas que abras aparecerán aquí.
          </p>
        </div>
      `;
}


/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function updateStats() {
  const toolCount =
    $("#toolCount");

  const favoriteCount =
    $("#favoriteCount");

  const recentCount =
    $("#recentCount");

  if (toolCount) {
    toolCount.textContent =
      tools.length;
  }

  if (favoriteCount) {
    favoriteCount.textContent =
      state.favorites.length;
  }

  if (recentCount) {
    recentCount.textContent =
      state.recent.length;
  }
}


/* =========================================================
   PANEL DE HERRAMIENTAS
   ========================================================= */

function openTool(id) {
  const tool =
    tools.find(
      item =>
        item.id === id
    );

  if (!tool) return;

  addRecent(id);

  const panel =
    $("#toolPanel");

  if (!panel) return;

  const icon =
    $("#toolPanelIcon");

  const category =
    $("#toolPanelCategory");

  const title =
    $("#toolPanelTitle");

  const content =
    $("#toolContent");

  if (icon) {
    icon.textContent =
      tool.icon;
  }

  if (category) {
    category.textContent =
      tool.category;
  }

  if (title) {
    title.textContent =
      tool.title;
  }

  if (content) {
    content.innerHTML =
      renderTool(id);
  }

  panel.classList.add("open");

  panel.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "toolOpen"
  );

  initToolAfterRender(id);
}

function closeTool() {
  const panel =
    $("#toolPanel");

  if (!panel) return;

  panel.classList.remove(
    "open"
  );

  panel.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "toolOpen"
  );
}


/* =========================================================
   RENDER DE HERRAMIENTAS INDIVIDUALES
   ========================================================= */

function renderTool(id) {

  switch (id) {

    case "calculator":
      return `
        <h3>Calculadora</h3>

        <input
          id="calcInput"
          placeholder="Ejemplo: 25 + 15 * 2"
        >

        <button
          class="primaryBtn"
          id="calcBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="calcResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "percentage":
      return `
        <h3>Porcentaje</h3>

        <label>Porcentaje</label>

        <input
          id="percentValue"
          type="number"
          placeholder="20"
        >

        <label>De</label>

        <input
          id="percentBase"
          type="number"
          placeholder="150"
        >

        <button
          class="primaryBtn"
          id="percentBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="percentResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "discount":
      return `
        <h3>Descuento</h3>

        <label>Precio</label>

        <input
          id="discountPrice"
          type="number"
          step="any"
        >

        <label>Descuento (%)</label>

        <input
          id="discountPercent"
          type="number"
          step="any"
        >

        <button
          class="primaryBtn"
          id="discountBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="discountResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "rule3":
      return `
        <h3>Regla de tres</h3>

        <p>
          Si A corresponde a B, ¿cuánto corresponde
          a C?
        </p>

        <input
          id="ruleA"
          type="number"
          placeholder="A"
        >

        <input
          id="ruleB"
          type="number"
          placeholder="B"
        >

        <input
          id="ruleC"
          type="number"
          placeholder="C"
        >

        <button
          class="primaryBtn"
          id="ruleBtn"
          type="button"
        >
          Resolver
        </button>

        <div
          id="ruleResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "average":
      return `
        <h3>Promedio</h3>

        <textarea
          id="averageInput"
          placeholder="Ejemplo: 12, 15, 18, 20"
        ></textarea>

        <button
          class="primaryBtn"
          id="averageBtn"
          type="button"
        >
          Calcular promedio
        </button>

        <div
          id="averageResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "change":
      return `
        <h3>Cambio porcentual</h3>

        <label>Valor inicial</label>

        <input
          id="changeOld"
          type="number"
          step="any"
        >

        <label>Valor final</label>

        <input
          id="changeNew"
          type="number"
          step="any"
        >

        <button
          class="primaryBtn"
          id="changeBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="changeResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "tip":
      return `
        <h3>Propina</h3>

        <input
          id="tipAmount"
          type="number"
          placeholder="Total"
        >

        <input
          id="tipPercent"
          type="number"
          placeholder="Propina %"
          value="10"
        >

        <button
          class="primaryBtn"
          id="tipBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="tipResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "split":
      return `
        <h3>Dividir cuenta</h3>

        <input
          id="splitAmount"
          type="number"
          placeholder="Total"
        >

        <input
          id="splitPeople"
          type="number"
          placeholder="Personas"
          min="1"
        >

        <button
          class="primaryBtn"
          id="splitBtn"
          type="button"
        >
          Dividir
        </button>

        <div
          id="splitResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "area":
      return `
        <h3>Área de rectángulo</h3>

        <input
          id="areaWidth"
          type="number"
          placeholder="Ancho"
        >

        <input
          id="areaHeight"
          type="number"
          placeholder="Alto"
        >

        <button
          class="primaryBtn"
          id="areaBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="areaResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "length":
      return `
        <h3>Conversor de longitud</h3>

        <input
          id="lengthValue"
          type="number"
          step="any"
          placeholder="Valor"
        >

        <select id="lengthFrom">
          <option value="m">Metros</option>
          <option value="km">Kilómetros</option>
          <option value="cm">Centímetros</option>
          <option value="mm">Milímetros</option>
          <option value="ft">Pies</option>
        </select>

        <select id="lengthTo">
          <option value="m">Metros</option>
          <option value="km">Kilómetros</option>
          <option value="cm">Centímetros</option>
          <option value="mm">Milímetros</option>
          <option value="ft">Pies</option>
        </select>

        <button
          class="primaryBtn"
          id="lengthBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="lengthResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "weight":
      return `
        <h3>Conversor de peso</h3>

        <input
          id="weightValue"
          type="number"
          step="any"
        >

        <select id="weightFrom">
          <option value="kg">Kilogramos</option>
          <option value="g">Gramos</option>
          <option value="lb">Libras</option>
        </select>

        <select id="weightTo">
          <option value="kg">Kilogramos</option>
          <option value="g">Gramos</option>
          <option value="lb">Libras</option>
        </select>

        <button
          class="primaryBtn"
          id="weightBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="weightResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "temperature":
      return `
        <h3>Temperatura</h3>

        <input
          id="tempValue"
          type="number"
          step="any"
        >

        <select id="tempFrom">
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
          <option value="k">Kelvin</option>
        </select>

        <select id="tempTo">
          <option value="c">Celsius</option>
          <option value="f">Fahrenheit</option>
          <option value="k">Kelvin</option>
        </select>

        <button
          class="primaryBtn"
          id="tempBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="tempResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "timeconvert":
      return `
        <h3>Conversor de tiempo</h3>

        <input
          id="timeValue"
          type="number"
          step="any"
        >

        <select id="timeFrom">
          <option value="seconds">Segundos</option>
          <option value="minutes">Minutos</option>
          <option value="hours">Horas</option>
          <option value="days">Días</option>
        </select>

        <select id="timeTo">
          <option value="seconds">Segundos</option>
          <option value="minutes">Minutos</option>
          <option value="hours">Horas</option>
          <option value="days">Días</option>
        </select>

        <button
          class="primaryBtn"
          id="timeConvertBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="timeConvertResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "data":
      return `
        <h3>Datos digitales</h3>

        <input
          id="dataValue"
          type="number"
          step="any"
        >

        <select id="dataFrom">
          <option value="B">Bytes</option>
          <option value="KB">KB</option>
          <option value="MB">MB</option>
          <option value="GB">GB</option>
          <option value="TB">TB</option>
        </select>

        <select id="dataTo">
          <option value="B">Bytes</option>
          <option value="KB">KB</option>
          <option value="MB">MB</option>
          <option value="GB">GB</option>
          <option value="TB">TB</option>
        </select>

        <button
          class="primaryBtn"
          id="dataBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="dataResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "speed":
      return `
        <h3>Velocidad</h3>

        <input
          id="speedValue"
          type="number"
          step="any"
        >

        <select id="speedFrom">
          <option value="kmh">km/h</option>
          <option value="ms">m/s</option>
          <option value="mph">mph</option>
        </select>

        <select id="speedTo">
          <option value="kmh">km/h</option>
          <option value="ms">m/s</option>
          <option value="mph">mph</option>
        </select>

        <button
          class="primaryBtn"
          id="speedBtn"
          type="button"
        >
          Convertir
        </button>

        <div
          id="speedResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "time":
      return `
        <h3>Reloj</h3>

        <div
          id="liveClock"
          class="bigResult"
        >
          --:--:--
        </div>

        <p id="liveDate">
          —
        </p>
      `;


    case "timer":
      return `
        <h3>Temporizador</h3>

        <input
          id="timerMinutes"
          type="number"
          min="0"
          placeholder="Minutos"
        >

        <input
          id="timerSeconds"
          type="number"
          min="0"
          max="59"
          placeholder="Segundos"
        >

        <button
          class="primaryBtn"
          id="timerStart"
          type="button"
        >
          Iniciar
        </button>

        <button
          class="secondaryBtn"
          id="timerReset"
          type="button"
        >
          Reiniciar
        </button>

        <div
          id="timerDisplay"
          class="bigResult"
        >
          00:00
        </div>
      `;


    case "stopwatch":
      return `
        <h3>Cronómetro</h3>

        <div
          id="stopwatchDisplay"
          class="bigResult"
        >
          00:00.0
        </div>

        <button
          class="primaryBtn"
          id="stopwatchStart"
          type="button"
        >
          Iniciar
        </button>

        <button
          class="secondaryBtn"
          id="stopwatchReset"
          type="button"
        >
          Reiniciar
        </button>
      `;


    case "datediff":
      return `
        <h3>Diferencia entre fechas</h3>

        <input
          id="dateA"
          type="date"
        >

        <input
          id="dateB"
          type="date"
        >

        <button
          class="primaryBtn"
          id="dateDiffBtn"
          type="button"
        >
          Calcular
        </button>

        <div
          id="dateDiffResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "age":
      return `
        <h3>Calculadora de edad</h3>

        <input
          id="birthDate"
          type="date"
        >

        <button
          class="primaryBtn"
          id="ageBtn"
          type="button"
        >
          Calcular edad
        </button>

        <div
          id="ageResult"
          class="resultBox"
        >
          Resultado: —
        </div>
      `;


    case "text":
      return `
        <h3>Editor de texto</h3>

        <textarea
          id="textEditor"
          placeholder="Escribe aquí..."
        ></textarea>

        <button
          class="secondaryBtn"
          id="copyTextBtn"
          type="button"
        >
          Copiar texto
        </button>

        <div
          id="textInfo"
          class="resultBox"
        >
          0 caracteres
        </div>
      `;


    case "counter":
      return `
        <h3>Contador de texto</h3>

        <textarea
          id="counterInput"
          placeholder="Escribe o pega un texto..."
        ></textarea>

        <div
          id="counterResult"
          class="resultBox"
        >
          Palabras: 0 · Caracteres: 0
        </div>
      `;


    case "case":
      return `
        <h3>Conversor de mayúsculas</h3>

        <textarea
          id="caseInput"
          placeholder="Escribe un texto..."
        ></textarea>

        <button
          class="secondaryBtn"
          id="upperBtn"
          type="button"
        >
          MAYÚSCULAS
        </button>

        <button
          class="secondaryBtn"
          id="lowerBtn"
          type="button"
        >
          minúsculas
        </button>
      `;


    case "dictionary":
      return `
        <h3>Diccionario</h3>

        <input
          id="dictionaryInput"
          placeholder="Escribe una palabra"
        >

        <button
          class="primaryBtn"
          id="dictionaryBtn"
          type="button"
        >
          Buscar
        </button>

        <div
          id="dictionaryResult"
          class="resultBox"
        >
          Escribe una palabra para buscarla.
        </div>
      `;


    case "notes":
      return `
        <h3>Notas</h3>

        <textarea
          id="notesInput"
          placeholder="Escribe tus notas..."
        ></textarea>

        <button
          class="primaryBtn"
          id="saveNotesBtn"
          type="button"
        >
          Guardar
        </button>
      `;


    case "tasks":
      return `
        <h3>Lista de tareas</h3>

        <input
          id="taskInput"
          placeholder="Nueva tarea"
        >

        <button
          class="primaryBtn"
          id="addTaskBtn"
          type="button"
        >
          Añadir
        </button>

        <div
          id="taskList"
          class="taskList"
        ></div>
      `;


    case "shopping":
      return `
        <h3>Lista de compras</h3>

        <input
          id="shoppingInput"
          placeholder="Producto"
        >

        <button
          class="primaryBtn"
          id="addShoppingBtn"
          type="button"
        >
          Añadir
        </button>

        <div
          id="shoppingList"
          class="taskList"
        ></div>
      `;


    case "password":
      return `
        <h3>Generador de contraseña</h3>

        <label>Longitud</label>

        <input
          id="passwordLength"
          type="number"
          min="6"
          max="100"
          value="16"
        >

        <button
          class="primaryBtn"
          id="passwordBtn"
          type="button"
        >
          Generar
        </button>

        <input
          id="passwordResult"
          readonly
          placeholder="Resultado"
        >
      `;


    case "random":
      return `
        <h3>Número aleatorio</h3>

        <input
          id="randomMin"
          type="number"
          placeholder="Mínimo"
          value="1"
        >

        <input
          id="randomMax"
          type="number"
          placeholder="Máximo"
          value="100"
        >

        <button
          class="primaryBtn"
          id="randomBtn"
          type="button"
        >
          Generar
        </button>

        <div
          id="randomResult"
          class="bigResult"
        >
          —
        </div>
      `;


    case "qr":
      return `
        <h3>Generador QR</h3>

        <input
          id="qrInput"
          placeholder="Texto o enlace"
        >

        <button
          class="primaryBtn"
          id="qrBtn"
          type="button"
        >
          Crear QR
        </button>

        <div
          id="qrResult"
          class="qrResult"
        ></div>
      `;


    case "food":
      return `
        <h3>Buscar comida</h3>

        <input
          id="foodInput"
          placeholder="Ejemplo: pizza"
        >

        <button
          class="primaryBtn"
          id="foodBtn"
          type="button"
        >
          Buscar
        </button>

        <div
          id="foodResult"
          class="resultBox"
        >
          La búsqueda se realizará en la web.
        </div>
      `;


    case "buy":
      return `
        <h3>Buscar productos</h3>

        <input
          id="buyInput"
          placeholder="¿Qué producto buscas?"
        >

        <button
          class="primaryBtn"
          id="googleShopBtn"
          type="button"
        >
          Buscar en Google
        </button>

        <button
          class="secondaryBtn"
          id="mercadoBtn"
          type="button"
        >
          Buscar en Mercado Libre
        </button>
      `;


    case "calendar":
      return `
        <h3>Calendario</h3>

        <div
          id="calendarResult"
          class="bigResult"
        >
          —
        </div>
      `;


    default:
      return `
        <h3>Herramienta</h3>
        <p>
          Esta herramienta está disponible en ÚtilHub.
        </p>
      `;
  }
}


/* =========================================================
   CÁLCULOS SEGUROS
   ========================================================= */

function calculateExpression(expression) {
  let text =
    String(expression || "")
      .trim()
      .replace(/,/g, ".")
      .replace(/\^/g, "**");

  if (!text) {
    throw new Error(
      "Escribe una operación."
    );
  }

  /*
    Solo permitimos números,
    operadores y paréntesis.
  */

  if (!/^[0-9+\-*/%().\s*]+$/.test(text)) {
    throw new Error(
      "La operación contiene caracteres no permitidos."
    );
  }

  /*
    Evitamos ejecutar JavaScript.
  */

  if (
    text.includes("**") &&
    !/^[0-9+\-*/%().\s*]+$/.test(text)
  ) {
    throw new Error(
      "Operación no válida."
    );
  }

  return safeMathParser(
    text
  );
}


/*
  Parser matemático pequeño.
*/

function safeMathParser(input) {

  const tokens =
    input.match(
      /(?:\d+(?:\.\d+)?)|[()+\-*/%]/g
    );

  if (!tokens) {
    throw new Error(
      "Operación inválida."
    );
  }

  let position = 0;

  function parseExpression() {
    let value =
      parseTerm();

    while (
      tokens[position] === "+" ||
      tokens[position] === "-"
    ) {
      const operator =
        tokens[position++];

      const right =
        parseTerm();

      if (operator === "+") {
        value += right;
      } else {
        value -= right;
      }
    }

    return value;
  }

  function parseTerm() {
    let value =
      parseFactor();

    while (
      tokens[position] === "*" ||
      tokens[position] === "/" ||
      tokens[position] === "%"
    ) {
      const operator =
        tokens[position++];

      const right =
        parseFactor();

      if (
        operator === "/" &&
        right === 0
      ) {
        throw new Error(
          "No se puede dividir entre cero."
        );
      }

      if (operator === "*") {
        value *= right;
      }

      if (operator === "/") {
        value /= right;
      }

      if (operator === "%") {
        value %= right;
      }
    }

    return value;
  }

  function parseFactor() {
    const token =
      tokens[position];

    if (token === "+") {
      position++;
      return parseFactor();
    }

    if (token === "-") {
      position++;
      return -parseFactor();
    }

    if (token === "(") {
      position++;

      const value =
        parseExpression();

      if (
        tokens[position] !== ")"
      ) {
        throw new Error(
          "Faltan paréntesis."
        );
      }

      position++;

      return value;
    }

    if (
      token &&
      /^\d/.test(token)
    ) {
      position++;

      return Number(token);
    }

    throw new Error(
      "Operación inválida."
    );
  }

  const result =
    parseExpression();

  if (
    position !== tokens.length
  ) {
    throw new Error(
      "Operación inválida."
    );
  }

  if (!Number.isFinite(result)) {
    throw new Error(
      "Resultado no válido."
    );
  }

  return result;
}


/* =========================================================
   INICIALIZACIÓN DE HERRAMIENTAS
   ========================================================= */

function initToolAfterRender(id) {

  try {

    switch (id) {

      case "calculator":
        initCalculator();
        break;

      case "percentage":
        initPercentage();
        break;

      case "discount":
        initDiscount();
        break;

      case "rule3":
        initRule3();
        break;

      case "average":
        initAverage();
        break;

      case "change":
        initChange();
        break;

      case "tip":
        initTip();
        break;

      case "split":
        initSplit();
        break;

      case "area":
        initArea();
        break;

      case "length":
        initLength();
        break;

      case "weight":
        initWeight();
        break;

      case "temperature":
        initTemperature();
        break;

      case "timeconvert":
        initTimeConvert();
        break;

      case "data":
        initDataConvert();
        break;

      case "speed":
        initSpeed();
        break;

      case "time":
        initClockTool();
        break;

      case "timer":
        initTimerTool();
        break;

      case "stopwatch":
        initStopwatchTool();
        break;

      case "datediff":
        initDateDiff();
        break;

      case "age":
        initAge();
        break;

      case "text":
        initTextTool();
        break;

      case "counter":
        initCounter();
        break;

      case "case":
        initCaseTool();
        break;

      case "dictionary":
        initDictionary();
        break;

      case "notes":
        initNotes();
        break;

      case "tasks":
        initTasks();
        break;

      case "shopping":
        initShopping();
        break;

      case "password":
        initPassword();
        break;

      case "random":
        initRandom();
        break;

      case "qr":
        initQR();
        break;

      case "food":
        initFood();
        break;

      case "buy":
        initBuy();
        break;

      case "calendar":
        initCalendar();
        break;
    }

  } catch (error) {
    console.warn(
      "Error inicializando herramienta:",
      id,
      error
    );
  }
}


/* =========================================================
   CALCULADORA
   ========================================================= */

function initCalculator() {
  const input =
    $("#calcInput");

  const button =
    $("#calcBtn");

  const result =
    $("#calcResult");

  if (!input || !button || !result) return;

  button.addEventListener(
    "click",
    () => {
      try {
        const value =
          calculateExpression(
            input.value
          );

        result.textContent =
          `Resultado: ${value}`;
      } catch (error) {
        result.textContent =
          error.message;
      }
    }
  );
}


/* =========================================================
   PORCENTAJE
   ========================================================= */

function initPercentage() {
  $("#percentBtn")
    ?.addEventListener(
      "click",
      () => {

        const p =
          Number(
            $("#percentValue")?.value
          );

        const base =
          Number(
            $("#percentBase")?.value
          );

        const result =
          $("#percentResult");

        if (
          !Number.isFinite(p) ||
          !Number.isFinite(base)
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        result.textContent =
          `Resultado: ${(p / 100 * base).toFixed(2)}`;
      }
    );
}


/* =========================================================
   DESCUENTO
   ========================================================= */

function initDiscount() {
  $("#discountBtn")
    ?.addEventListener(
      "click",
      () => {

        const price =
          Number(
            $("#discountPrice")?.value
          );

        const percent =
          Number(
            $("#discountPercent")?.value
          );

        const result =
          $("#discountResult");

        if (
          !Number.isFinite(price) ||
          !Number.isFinite(percent)
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        const discount =
          price * percent / 100;

        const finalPrice =
          price - discount;

        result.textContent =
          `Descuento: ${discount.toFixed(2)} · Total: ${finalPrice.toFixed(2)}`;
      }
    );
}


/* =========================================================
   REGLA DE TRES
   ========================================================= */

function initRule3() {
  $("#ruleBtn")
    ?.addEventListener(
      "click",
      () => {

        const a =
          Number(
            $("#ruleA")?.value
          );

        const b =
          Number(
            $("#ruleB")?.value
          );

        const c =
          Number(
            $("#ruleC")?.value
          );

        const result =
          $("#ruleResult");

        if (
          !Number.isFinite(a) ||
          !Number.isFinite(b) ||
          !Number.isFinite(c) ||
          a === 0
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        result.textContent =
          `Resultado: ${(b*c/a).toFixed(2)}`;
      }
    );
}


/* =========================================================
   PROMEDIO
   ========================================================= */

function initAverage() {
  $("#averageBtn")
    ?.addEventListener(
      "click",
      () => {

        const values =
          $("#averageInput")
            ?.value
            .split(/[,\s;]+/)
            .map(Number)
            .filter(
              Number.isFinite
            );

        const result =
          $("#averageResult");

        if (!values.length) {
          result.textContent =
            "Introduce números.";

          return;
        }

        const average =
          values.reduce(
            (a,b) => a+b,
            0
          ) /
          values.length;

        result.textContent =
          `Resultado: ${average.toFixed(2)}`;
      }
    );
}


/* =========================================================
   CAMBIO PORCENTUAL
   ========================================================= */

function initChange() {
  $("#changeBtn")
    ?.addEventListener(
      "click",
      () => {

        const oldValue =
          Number(
            $("#changeOld")?.value
          );

        const newValue =
          Number(
            $("#changeNew")?.value
          );

        const result =
          $("#changeResult");

        if (
          !Number.isFinite(oldValue) ||
          !Number.isFinite(newValue) ||
          oldValue === 0
        ) {
          result.textContent =
            "Valores no válidos.";

          return;
        }

        const change =
          ((newValue-oldValue) /
            oldValue) *
          100;

        result.textContent =
          `Cambio: ${change.toFixed(2)}%`;
      }
    );
}


/* =========================================================
   PROPINA
   ========================================================= */

function initTip() {
  $("#tipBtn")
    ?.addEventListener(
      "click",
      () => {

        const amount =
          Number(
            $("#tipAmount")?.value
          );

        const percent =
          Number(
            $("#tipPercent")?.value
          );

        const result =
          $("#tipResult");

        if (
          !Number.isFinite(amount) ||
          !Number.isFinite(percent)
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        const tip =
          amount * percent / 100;

        result.textContent =
          `Propina: ${tip.toFixed(2)} · Total: ${(amount+tip).toFixed(2)}`;
      }
    );
}


/* =========================================================
   DIVIDIR CUENTA
   ========================================================= */

function initSplit() {
  $("#splitBtn")
    ?.addEventListener(
      "click",
      () => {

        const amount =
          Number(
            $("#splitAmount")?.value
          );

        const people =
          Number(
            $("#splitPeople")?.value
          );

        const result =
          $("#splitResult");

        if (
          !Number.isFinite(amount) ||
          !Number.isFinite(people) ||
          people <= 0
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        result.textContent =
          `Cada persona: ${(amount/people).toFixed(2)}`;
      }
    );
}


/* =========================================================
   ÁREA
   ========================================================= */

function initArea() {
  $("#areaBtn")
    ?.addEventListener(
      "click",
      () => {

        const a =
          Number(
            $("#areaWidth")?.value
          );

        const b =
          Number(
            $("#areaHeight")?.value
          );

        const result =
          $("#areaResult");

        if (
          !Number.isFinite(a) ||
          !Number.isFinite(b)
        ) {
          result.textContent =
            "Introduce valores válidos.";

          return;
        }

        result.textContent =
          `Área: ${(a*b).toFixed(2)} unidades²`;
      }
    );
}


/* =========================================================
   CONVERSIÓN DE LONGITUD
   ========================================================= */

function initLength() {
  $("#lengthBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#lengthValue")?.value
          );

        const from =
          $("#lengthFrom")?.value;

        const to =
          $("#lengthTo")?.value;

        const result =
          $("#lengthResult");

        const factor = {
          m: 1,
          km: 1000,
          cm: .01,
          mm: .001,
          ft: .3048
        };

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        const meters =
          value * factor[from];

        const converted =
          meters / factor[to];

        result.textContent =
          `Resultado: ${converted}`;
      }
    );
}


/* =========================================================
   PESO
   ========================================================= */

function initWeight() {
  $("#weightBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#weightValue")?.value
          );

        const from =
          $("#weightFrom")?.value;

        const to =
          $("#weightTo")?.value;

        const factor = {
          kg: 1,
          g: .001,
          lb: .45359237
        };

        const result =
          $("#weightResult");

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        const kg =
          value * factor[from];

        const converted =
          kg / factor[to];

        result.textContent =
          `Resultado: ${converted}`;
      }
    );
}


/* =========================================================
   TEMPERATURA
   ========================================================= */

function initTemperature() {
  $("#tempBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#tempValue")?.value
          );

        const from =
          $("#tempFrom")?.value;

        const to =
          $("#tempTo")?.value;

        const result =
          $("#tempResult");

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        let celsius;

        if (from === "c") {
          celsius = value;
        }

        if (from === "f") {
          celsius =
            (value - 32) * 5 / 9;
        }

        if (from === "k") {
          celsius =
            value - 273.15;
        }

        let converted;

        if (to === "c") {
          converted = celsius;
        }

        if (to === "f") {
          converted =
            celsius * 9 / 5 + 32;
        }

        if (to === "k") {
          converted =
            celsius + 273.15;
        }

        result.textContent =
          `Resultado: ${converted.toFixed(2)}`;
      }
    );
}


/* =========================================================
   TIEMPO
   ========================================================= */

function initTimeConvert() {
  $("#timeConvertBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#timeValue")?.value
          );

        const from =
          $("#timeFrom")?.value;

        const to =
          $("#timeTo")?.value;

        const result =
          $("#timeConvertResult");

        const factor = {
          seconds: 1,
          minutes: 60,
          hours: 3600,
          days: 86400
        };

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        const seconds =
          value * factor[from];

        result.textContent =
          `Resultado: ${seconds / factor[to]}`;
      }
    );
}


/* =========================================================
   DATOS
   ========================================================= */

function initDataConvert() {
  $("#dataBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#dataValue")?.value
          );

        const from =
          $("#dataFrom")?.value;

        const to =
          $("#dataTo")?.value;

        const result =
          $("#dataResult");

        const factor = {
          B: 1,
          KB: 1024,
          MB: 1024**2,
          GB: 1024**3,
          TB: 1024**4
        };

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        const bytes =
          value * factor[from];

        result.textContent =
          `Resultado: ${bytes / factor[to]}`;
      }
    );
}


/* =========================================================
   VELOCIDAD
   ========================================================= */

function initSpeed() {
  $("#speedBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          Number(
            $("#speedValue")?.value
          );

        const from =
          $("#speedFrom")?.value;

        const to =
          $("#speedTo")?.value;

        const factor = {
          kmh: 1,
          ms: 3.6,
          mph: 1.609344
        };

        const result =
          $("#speedResult");

        if (
          !Number.isFinite(value)
        ) {
          result.textContent =
            "Introduce un valor.";

          return;
        }

        const kmh =
          value * factor[from];

        result.textContent =
          `Resultado: ${kmh / factor[to]}`;
      }
    );
}


/* =========================================================
   RELOJ
   ========================================================= */

let clockInterval = null;

function initClockTool() {
  updateClock();

  clearInterval(
    clockInterval
  );

  clockInterval =
    setInterval(
      updateClock,
      1000
    );
}

function updateClock() {
  const clock =
    $("#liveClock");

  const date =
    $("#liveDate");

  if (!clock && !date) {
    return;
  }

  const now =
    new Date();

  if (clock) {
    clock.textContent =
      now.toLocaleTimeString(
        "es-PE"
      );
  }

  if (date) {
    date.textContent =
      now.toLocaleDateString(
        "es-PE",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );
  }
}


/* =========================================================
   TEMPORIZADOR
   ========================================================= */

let timerInterval = null;

function initTimerTool() {
  renderTimer();

  $("#timerStart")
    ?.addEventListener(
      "click",
      startTimer
    );

  $("#timerReset")
    ?.addEventListener(
      "click",
      resetTimer
    );
}

function startTimer() {

  if (
    state.timer.running
  ) {
    state.timer.running =
      false;

    saveState();

    clearInterval(
      timerInterval
    );

    const button =
      $("#timerStart");

    if (button) {
      button.textContent =
        "Iniciar";
    }

    return;
  }

  let remaining =
    state.timer.remaining;

  if (!remaining) {
    const minutes =
      Number(
        $("#timerMinutes")?.value
      ) || 0;

    const seconds =
      Number(
        $("#timerSeconds")?.value
      ) || 0;

    remaining =
      minutes * 60 +
      seconds;
  }

  if (remaining <= 0) {
    showToast(
      "Configura el temporizador primero."
    );

    return;
  }

  state.timer.running =
    true;

  state.timer.endAt =
    Date.now() +
    remaining * 1000;

  saveState();

  clearInterval(
    timerInterval
  );

  timerInterval =
    setInterval(
      updateTimer,
      200
    );

  updateTimer();
}

function updateTimer() {

  if (
    !state.timer.running
  ) {
    renderTimer();
    return;
  }

  const remaining =
    Math.max(
      0,
      Math.ceil(
        (state.timer.endAt -
          Date.now()) /
        1000
      )
    );

  state.timer.remaining =
    remaining;

  renderTimer();

  if (remaining <= 0) {

    state.timer.running =
      false;

    saveState();

    clearInterval(
      timerInterval
    );

    showToast(
      "⏰ ¡Temporizador terminado!"
    );
  }
}

function resetTimer() {

  state.timer = {
    running: false,
    endAt: 0,
    remaining: 0
  };

  saveState();

  clearInterval(
    timerInterval
  );

  renderTimer();
}

function renderTimer() {
  const display =
    $("#timerDisplay");

  if (!display) return;

  const seconds =
    state.timer.remaining || 0;

  const minutes =
    Math.floor(
      seconds / 60
    );

  const secs =
    seconds % 60;

  display.textContent =
    `${String(minutes).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}


/* =========================================================
   CRONÓMETRO
   ========================================================= */

let stopwatchInterval = null;

function initStopwatchTool() {

  renderStopwatch();

  $("#stopwatchStart")
    ?.addEventListener(
      "click",
      toggleStopwatch
    );

  $("#stopwatchReset")
    ?.addEventListener(
      "click",
      resetStopwatch
    );
}

function toggleStopwatch() {

  if (
    state.stopwatch.running
  ) {

    state.stopwatch.elapsed +=
      Date.now() -
      state.stopwatch.startedAt;

    state.stopwatch.running =
      false;

    saveState();

    clearInterval(
      stopwatchInterval
    );

    return;
  }

  state.stopwatch.startedAt =
    Date.now();

  state.stopwatch.running =
    true;

  saveState();

  clearInterval(
    stopwatchInterval
  );

  stopwatchInterval =
    setInterval(
      renderStopwatch,
      100
    );

  renderStopwatch();
}

function resetStopwatch() {

  state.stopwatch = {
    running: false,
    elapsed: 0,
    startedAt: 0
  };

  saveState();

  clearInterval(
    stopwatchInterval
  );

  renderStopwatch();
}

function renderStopwatch() {

  const display =
    $("#stopwatchDisplay");

  if (!display) return;

  let elapsed =
    state.stopwatch.elapsed;

  if (
    state.stopwatch.running
  ) {
    elapsed +=
      Date.now() -
      state.stopwatch.startedAt;
  }

  const totalSeconds =
    elapsed / 1000;

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    totalSeconds % 60;

  display.textContent =
    `${String(minutes).padStart(2,"0")}:${seconds.toFixed(1).padStart(4,"0")}`;
}


/* =========================================================
   DIFERENCIA DE FECHAS
   ========================================================= */

function initDateDiff() {
  $("#dateDiffBtn")
    ?.addEventListener(
      "click",
      () => {

        const a =
          $("#dateA")?.value;

        const b =
          $("#dateB")?.value;

        const result =
          $("#dateDiffResult");

        if (!a || !b) {
          result.textContent =
            "Selecciona las dos fechas.";

          return;
        }

        const first =
          new Date(
            `${a}T00:00:00`
          );

        const second =
          new Date(
            `${b}T00:00:00`
          );

        const days =
          Math.abs(
            Math.round(
              (second-first) /
              86400000
            )
          );

        result.textContent =
          `Diferencia: ${days} días`;
      }
    );
}


/* =========================================================
   EDAD
   ========================================================= */

function initAge() {
  $("#ageBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          $("#birthDate")?.value;

        const result =
          $("#ageResult");

        if (!value) {
          result.textContent =
            "Selecciona una fecha.";

          return;
        }

        const birth =
          new Date(
            `${value}T00:00:00`
          );

        const now =
          new Date();

        let age =
          now.getFullYear() -
          birth.getFullYear();

        const month =
          now.getMonth() -
          birth.getMonth();

        if (
          month < 0 ||
          (
            month === 0 &&
            now.getDate() <
            birth.getDate()
          )
        ) {
          age--;
        }

        result.textContent =
          `Edad: ${age} años`;
      }
    );
}


/* =========================================================
   TEXTO
   ========================================================= */

function initTextTool() {

  const input =
    $("#textEditor");

  const info =
    $("#textInfo");

  if (input) {
    input.addEventListener(
      "input",
      () => {
        const text =
          input.value;

        if (info) {
          info.textContent =
            `${text.length} caracteres · ${countWords(text)} palabras`;
        }
      }
    );
  }

  $("#copyTextBtn")
    ?.addEventListener(
      "click",
      async () => {

        try {
          await navigator.clipboard.writeText(
            input?.value || ""
          );

          showToast(
            "Texto copiado."
          );
        } catch {
          showToast(
            "No se pudo copiar."
          );
        }
      }
    );
}

function countWords(text) {
  return text
    .trim()
    ? text
        .trim()
        .split(/\s+/)
        .length
    : 0;
}


/* =========================================================
   CONTADOR
   ========================================================= */

function initCounter() {

  const input =
    $("#counterInput");

  const result =
    $("#counterResult");

  if (!input || !result) return;

  input.addEventListener(
    "input",
    () => {

      const text =
        input.value;

      result.textContent =
        `Palabras: ${countWords(text)} · Caracteres: ${text.length}`;
    }
  );
}


/* =========================================================
   MAYÚSCULAS / MINÚSCULAS
   ========================================================= */

function initCaseTool() {

  const input =
    $("#caseInput");

  if (!input) return;

  $("#upperBtn")
    ?.addEventListener(
      "click",
      () => {
        input.value =
          input.value.toUpperCase();
      }
    );

  $("#lowerBtn")
    ?.addEventListener(
      "click",
      () => {
        input.value =
          input.value.toLowerCase();
      }
    );
}


/* =========================================================
   DICCIONARIO
   ========================================================= */

async function searchDictionary(word) {

  const url =
    `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`;

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      7000
    );

  try {

    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      throw new Error(
        "Palabra no encontrada."
      );
    }

    const data =
      await response.json();

    return data;

  } finally {
    clearTimeout(
      timeout
    );
  }
}

function initDictionary() {

  $("#dictionaryBtn")
    ?.addEventListener(
      "click",
      async () => {

        const input =
          $("#dictionaryInput");

        const result =
          $("#dictionaryResult");

        const word =
          input?.value.trim();

        if (!word) {
          result.textContent =
            "Escribe una palabra.";

          return;
        }

        result.textContent =
          "Buscando...";

        try {

          const data =
            await searchDictionary(
              word
            );

          const entry =
            data[0];

          const meanings =
            entry.meanings || [];

          let html =
            `<strong>${escapeHTML(entry.word || word)}</strong>`;

          meanings
            .slice(0,4)
            .forEach(
              meaning => {

                html += `
                  <p>
                    <strong>
                      ${escapeHTML(meaning.partOfSpeech || "")}
                    </strong>
                  </p>
                `;

                (meaning.definitions || [])
                  .slice(0,3)
                  .forEach(
                    definition => {
                      html += `
                        <p>
                          • ${escapeHTML(
                            definition.definition
                          )}
                        </p>
                      `;
                    }
                  );
              }
            );

          result.innerHTML =
            html;

          state.dictionaryRecent =
            [
              word,
              ...state.dictionaryRecent
                .filter(
                  item =>
                    item !== word
                )
            ].slice(0,10);

          saveState();

        } catch (error) {

          result.textContent =
            error.name === "AbortError"
              ? "La búsqueda tardó demasiado."
              : "No encontramos esa palabra o no hay conexión.";
        }
      }
    );
}


/* =========================================================
   NOTAS
   ========================================================= */

function initNotes() {

  const input =
    $("#notesInput");

  if (!input) return;

  input.value =
    state.notes || "";

  input.addEventListener(
    "input",
    () => {
      state.notes =
        input.value;

      saveState();
    }
  );

  $("#saveNotesBtn")
    ?.addEventListener(
      "click",
      () => {

        state.notes =
          input.value;

        saveState();

        showToast(
          "Notas guardadas."
        );
      }
    );
}


/* =========================================================
   TAREAS
   ========================================================= */

function initTasks() {

  renderTasks();

  $("#addTaskBtn")
    ?.addEventListener(
      "click",
      () => {

        const input =
          $("#taskInput");

        const text =
          input?.value.trim();

        if (!text) return;

        state.tasks.push({
          id:
            Date.now() +
            Math.random(),

          text,

          done: false
        });

        saveState();

        input.value = "";

        renderTasks();
      }
    );
}

function renderTasks() {

  const list =
    $("#taskList");

  if (!list) return;

  list.innerHTML =
    state.tasks.length
      ? state.tasks
          .map(
            task => `
              <div class="taskItem">

                <label>

                  <input
                    type="checkbox"
                    data-task="${task.id}"
                    ${task.done ? "checked" : ""}
                  >

                  <span>
                    ${escapeHTML(task.text)}
                  </span>

                </label>

                <button
                  class="secondaryBtn"
                  data-delete-task="${task.id}"
                  type="button"
                >
                  ×
                </button>

              </div>
            `
          )
          .join("")
      : "<p>No hay tareas.</p>";
}


/* =========================================================
   LISTA DE COMPRAS
   ========================================================= */

function initShopping() {

  renderShopping();

  $("#addShoppingBtn")
    ?.addEventListener(
      "click",
      () => {

        const input =
          $("#shoppingInput");

        const text =
          input?.value.trim();

        if (!text) return;

        state.shopping.push({
          id:
            Date.now() +
            Math.random(),

          text,

          done: false
        });

        saveState();

        input.value = "";

        renderShopping();
      }
    );
}

function renderShopping() {

  const list =
    $("#shoppingList");

  if (!list) return;

  list.innerHTML =
    state.shopping.length
      ? state.shopping
          .map(
            item => `
              <div class="taskItem">

                <label>

                  <input
                    type="checkbox"
                    data-shopping="${item.id}"
                    ${item.done ? "checked" : ""}
                  >

                  <span>
                    ${escapeHTML(item.text)}
                  </span>

                </label>

                <button
                  class="secondaryBtn"
                  data-delete-shopping="${item.id}"
                  type="button"
                >
                  ×
                </button>

              </div>
            `
          )
          .join("")
      : "<p>No hay productos.</p>";
}


/* =========================================================
   CONTRASEÑAS
   ========================================================= */

function randomSecureIndex(max) {

  if (
    window.crypto &&
    crypto.getRandomValues
  ) {
    const array =
      new Uint32Array(1);

    crypto.getRandomValues(
      array
    );

    return array[0] % max;
  }

  return Math.floor(
    Math.random() * max
  );
}

function initPassword() {

  $("#passwordBtn")
    ?.addEventListener(
      "click",
      () => {

        const length =
          Math.max(
            6,
            Math.min(
              100,
              Number(
                $("#passwordLength")?.value
              ) || 16
            )
          );

        const chars =
          "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";

        let password = "";

        for (
          let i = 0;
          i < length;
          i++
        ) {
          password +=
            chars[
              randomSecureIndex(
                chars.length
              )
            ];
        }

        const output =
          $("#passwordResult");

        if (output) {
          output.value =
            password;
        }
      }
    );
}


/* =========================================================
   ALEATORIO
   ========================================================= */

function initRandom() {

  $("#randomBtn")
    ?.addEventListener(
      "click",
      () => {

        const min =
          Number(
            $("#randomMin")?.value
          );

        const max =
          Number(
            $("#randomMax")?.value
          );

        const result =
          $("#randomResult");

        if (
          !Number.isFinite(min) ||
          !Number.isFinite(max) ||
          min > max
        ) {
          result.textContent =
            "Rango inválido.";

          return;
        }

        const value =
          Math.floor(
            Math.random() *
            (max-min+1)
          ) + min;

        result.textContent =
          value;
      }
    );
}


/* =========================================================
   QR
   ========================================================= */

function initQR() {

  $("#qrBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          $("#qrInput")
            ?.value
            .trim();

        const result =
          $("#qrResult");

        if (!value) {
          result.textContent =
            "Escribe un texto o enlace.";

          return;
        }

        const url =
          "https://api.qrserver.com/v1/create-qr-code/" +
          `?size=240x240&data=${encodeURIComponent(value)}`;

        result.innerHTML =
          `
            <img
              src="${url}"
              alt="Código QR generado"
              width="240"
              height="240"
              loading="lazy"
            >
          `;
      }
    );
}


/* =========================================================
   COMIDA
   ========================================================= */

function initFood() {

  $("#foodBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          $("#foodInput")
            ?.value
            .trim();

        if (!value) {
          showToast(
            "Escribe qué comida buscas."
          );

          return;
        }

        const url =
          `https://www.google.com/search?q=${encodeURIComponent(
            value + " comida cerca"
          )}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );
}


/* =========================================================
   COMPRAS
   ========================================================= */

function initBuy() {

  $("#googleShopBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          $("#buyInput")
            ?.value
            .trim();

        if (!value) return;

        const url =
          `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(value)}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );

  $("#mercadoBtn")
    ?.addEventListener(
      "click",
      () => {

        const value =
          $("#buyInput")
            ?.value
            .trim();

        if (!value) return;

        const url =
          `https://listado.mercadolibre.com.pe/${encodeURIComponent(value)}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );
}


/* =========================================================
   CALENDARIO
   ========================================================= */

function initCalendar() {

  const result =
    $("#calendarResult");

  if (!result) return;

  const now =
    new Date();

  result.innerHTML =
    `
      <strong>
        ${now.toLocaleDateString(
          "es-PE",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }
        )}
      </strong>
    `;
}


/* =========================================================
   EVENTOS GLOBALES
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const nav =
      event.target.closest(
        ".navItem"
      );

    if (nav) {
      showSection(
        nav.dataset.section
      );

      return;
    }


    const favorite =
      event.target.closest(
        "[data-favorite]"
      );

    if (favorite) {

      event.stopPropagation();

      toggleFavorite(
        favorite.dataset.favorite
      );

      return;
    }


    const open =
      event.target.closest(
        "[data-open]"
      );

    if (open) {

      openTool(
        open.dataset.open
      );

      return;
    }


    const closeToolButton =
      event.target.closest(
        "[data-close-tool]"
      );

    if (closeToolButton) {
      closeTool();
      return;
    }


    const closeModalButton =
      event.target.closest(
        "[data-close-modal]"
      );

    if (closeModalButton) {
      closeModal();
      return;
    }


    const deleteTask =
      event.target.closest(
        "[data-delete-task]"
      );

    if (deleteTask) {

      const id =
        Number(
          deleteTask.dataset.deleteTask
        );

      state.tasks =
        state.tasks.filter(
          task =>
            task.id !== id
        );

      saveState();

      renderTasks();

      return;
    }


    const taskCheck =
      event.target.closest(
        "[data-task]"
      );

    if (
      taskCheck &&
      taskCheck.matches(
        "input"
      )
    ) {

      const id =
        Number(
          taskCheck.dataset.task
        );

      const task =
        state.tasks.find(
          item =>
            item.id === id
        );

      if (task) {
        task.done =
          taskCheck.checked;
      }

      saveState();

      return;
    }


    const deleteShopping =
      event.target.closest(
        "[data-delete-shopping]"
      );

    if (deleteShopping) {

      const id =
        Number(
          deleteShopping.dataset
            .deleteShopping
        );

      state.shopping =
        state.shopping.filter(
          item =>
            item.id !== id
        );

      saveState();

      renderShopping();

      return;
    }


    const shoppingCheck =
      event.target.closest(
        "[data-shopping]"
      );

    if (
      shoppingCheck &&
      shoppingCheck.matches(
        "input"
      )
    ) {

      const id =
        Number(
          shoppingCheck.dataset.shopping
        );

      const item =
        state.shopping.find(
          product =>
            product.id === id
        );

      if (item) {
        item.done =
          shoppingCheck.checked;
      }

      saveState();
    }
  }
);


/* =========================================================
   CERRAR PANEL
   ========================================================= */

$("#closeTool")
  ?.addEventListener(
    "click",
    closeTool
  );


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {
      closeTool();
      closeModal();
    }


    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      showSection(
        "tools"
      );

      $("#toolSearch")
        ?.focus();
    }
  }
);


/* =========================================================
   MODAL
   ========================================================= */

function closeModal() {

  const modal =
    $("#modal");

  if (!modal) return;

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   BÚSQUEDA
   ========================================================= */

$("#toolSearch")
  ?.addEventListener(
    "input",
    event => {

      currentSearch =
        event.target.value;

      renderTools();
    }
  );


/* =========================================================
   CATEGORÍAS
   ========================================================= */

$$(".categoryBtn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentCategory =
          button.dataset.category;

        $$(".categoryBtn")
          .forEach(
            item =>
              item.classList.toggle(
                "active",
                item === button
              )
          );

        renderTools();
      }
    );
  });


/* =========================================================
   NOVA BUTTONS
   ========================================================= */

$$(".novaMode")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {
        setNovaMode(
          button.dataset.mode
        );
      }
    );
  });


$("#novaIntensity")
  ?.addEventListener(
    "input",
    event => {
      setNovaIntensity(
        event.target.value
      );
    }
  );


$("#performanceSelect")
  ?.addEventListener(
    "change",
    event => {

      state.performance =
        event.target.value;

      saveState();

      createNovaParticles();

      showToast(
        "Rendimiento actualizado."
      );
    }
  );


/* =========================================================
   TEMA
   ========================================================= */

function toggleTheme() {

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  applyTheme();

  saveState();
}

function applyTheme() {

  document.body.classList.toggle(
    "lightTheme",
    state.theme === "light"
  );
}

$("#themeBtn")
  ?.addEventListener(
    "click",
    toggleTheme
  );

$("#settingsThemeBtn")
  ?.addEventListener(
    "click",
    toggleTheme
  );


/* =========================================================
   MOVIMIENTO
   ========================================================= */

function toggleMotion() {

  state.motion =
    !state.motion;

  applyMotion();

  saveState();

  showToast(
    state.motion
      ? "NOVA FLOW activado."
      : "NOVA FLOW reducido."
  );
}

function applyMotion() {

  document.body.classList.toggle(
    "motionOff",
    !state.motion
  );

  const buttons = [
    $("#motionBtn"),
    $("#settingsMotionBtn")
  ];

  buttons.forEach(
    button => {
      if (!button) return;

      button.textContent =
        state.motion
          ? "Desactivar"
          : "Activar";
    }
  );
}

$("#motionBtn")
  ?.addEventListener(
    "click",
    toggleMotion
  );

$("#settingsMotionBtn")
  ?.addEventListener(
    "click",
    toggleMotion
  );


/* =========================================================
   MODO ENFOQUE
   ========================================================= */

function toggleFocus() {

  state.focus =
    !state.focus;

  document.body.classList.toggle(
    "focusMode",
    state.focus
  );

  saveState();
}

$("#focusBtn")
  ?.addEventListener(
    "click",
    toggleFocus
  );


/* =========================================================
   BOTONES HERO
   ========================================================= */

$("#exploreBtn")
  ?.addEventListener(
    "click",
    () => {
      showSection(
        "tools"
      );
    }
  );

$("#novaBtn")
  ?.addEventListener(
    "click",
    () => {
      showSection(
        "nova"
      );
    }
  );


/* =========================================================
   LIMPIAR RECIENTES
   ========================================================= */

$("#clearRecentBtn")
  ?.addEventListener(
    "click",
    () => {

      state.recent = [];

      saveState();

      renderRecent();

      updateStats();

      showToast(
        "Historial eliminado."
      );
    }
  );


/* =========================================================
   MOUSE — NOVA GLOBAL
   ========================================================= */

window.addEventListener(
  "pointermove",
  event => {

    targetMouseX =
      event.clientX;

    targetMouseY =
      event.clientY;

    const cursor =
      $("#cursorGlow");

    if (cursor) {
      cursor.style.transform =
        `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
    }
  },
  { passive: true }
);


/* =========================================================
   CONEXIÓN
   ========================================================= */

function updateConnectionStatus() {

  const text =
    $("#connectionText");

  const dot =
    $(".connectionDot");

  if (!text) return;

  if (navigator.onLine) {

    text.textContent =
      "Conectado";

    if (dot) {
      dot.style.background =
        "var(--success)";
    }

  } else {

    text.textContent =
      "Sin conexión";

    if (dot) {
      dot.style.background =
        "var(--danger)";
    }
  }
}

window.addEventListener(
  "online",
  updateConnectionStatus
);

window.addEventListener(
  "offline",
  updateConnectionStatus
);


/* =========================================================
   EXPORTAR DATOS
   ========================================================= */

function exportData() {

  try {

    const data =
      JSON.stringify(
        state,
        null,
        2
      );

    const blob =
      new Blob(
        [data],
        {
          type:
            "application/json"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "utilhub-v22-datos.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );

    showToast(
      "Datos exportados."
    );

  } catch {
    showToast(
      "No se pudieron exportar los datos."
    );
  }
}

$("#exportBtn")
  ?.addEventListener(
    "click",
    exportData
);


/* =========================================================
   IMPORTAR DATOS
   ========================================================= */

$("#importBtn")
  ?.addEventListener(
    "click",
    () => {
      $("#importFile")?.click();
    }
  );

$("#importFile")
  ?.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload =
        () => {

          try {

            const imported =
              JSON.parse(
                reader.result
              );

            state =
              mergeState(
                defaultState,
                imported
              );

            saveState();

            applyTheme();
            applyMotion();

            setNovaMode(
              state.novaMode
            );

            renderTools();
            renderQuickTools();
            renderFavorites();
            renderRecent();
            updateStats();

            showToast(
              "Datos importados."
            );

          } catch {
            showToast(
              "Archivo no válido."
            );
          }
        };

      reader.readAsText(
        file
      );
    }
  );


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .then(
          registration => {

            console.log(
              "ÚtilHub V22 PWA activa:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "No se pudo registrar la PWA:",
              error
            );

          }
        );
    }
  );
}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function initializeApp() {

  applyTheme();

  applyMotion();

  document.body.classList.toggle(
    "focusMode",
    state.focus
  );

  if (
    $("#performanceSelect")
  ) {
    $("#performanceSelect").value =
      state.performance;
  }

  if (
    $("#novaIntensity")
  ) {
    $("#novaIntensity").value =
      state.novaIntensity;
  }

  renderTools();

  renderQuickTools();

  renderFavorites();

  renderRecent();

  updateStats();

  setNovaMode(
    state.novaMode
  );

  updateConnectionStatus();

  resizeCanvas();

  startNova();
}


/* =========================================================
   INICIAR ÚTILHUB V22
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();

}


/* =========================================================
   FIN — ÚTILHUB V22
   NOVA FLOW GLOBAL
   ========================================================= */
