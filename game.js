// The White Mask — engine: rooms, walking, code-drawn art, slip-based dialogue.
'use strict';
const $ = id => document.getElementById(id);
const cv = $('cv'), c = cv.getContext('2d');
const W = 1280, H = 720, FLOOR = 540, GROUND = 648;

let lang = (navigator.language || 'ru').toLowerCase().startsWith('ru') ? 'ru' : 'en';
const t = o => (typeof o === 'string' ? o : o[lang]);

// ---------- state ----------
const S = {
  mode: 'title', room: 'buffet', x: 800, tx: null, face: 1, walking: false,
  slips: [], seen: {}, met: {}, unmasked: {}, caught: {}, candles: 6, introDone: false,
  pending: null, near: null, roomT: 0, flash: 0, finale: false,
  otherOn: false, other: 0, tear: 0, otherWho: null, freezeT: 0,
};
const has = id => S.slips.includes(id);
const helper = { has };
// A slip stays in the notebook while it can still do something: its speaker is still masked,
// or some masked character reacts to it or can be named with it.
const live = id => {
  const sp = SLIPS[id].who;
  if (NPC[sp] && !S.unmasked[sp]) return true;
  return Object.keys(NPC).some(k => !S.unmasked[k] && (NPC[k].proofs.includes(id) || NPC[k].react[id] || (NPC[k].lie && !S.caught[k] && NPC[k].lie.by.includes(id))));
};
const liveSlips = () => S.slips.filter(live);

const WORLD = {
  gallery: { w: 1280, doors: [{ x: 1150, to: 'hall', tx: 1300 }], npcs: [], objs: [{ id: 'mirror', x: 520 }] },
  hall: { w: 2600, doors: [{ x: 120, to: 'buffet', tx: 1120 }, { x: 1300, to: 'gallery', tx: 1090 }, { x: 2480, to: 'cards', tx: 170 }],
          npcs: [{ k: 'harlequin', x: 690 }, { k: 'owl', x: 1010 }, { k: 'fox', x: 1930 }], objs: [] },
  buffet: { w: 1280, doors: [{ x: 1180, to: 'hall', tx: 200 }], npcs: [{ k: 'exec', x: 640 }], objs: [{ id: 'body', x: 360 }] },
  cards: { w: 1280, doors: [{ x: 110, to: 'hall', tx: 2400 }], npcs: [{ k: 'raven', x: 640 }], objs: [] },
};

// ---------- small drawing helpers ----------
function ell(g, x, y, rx, ry, fill, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = fill; g.fill(); }
function poly(g, pts, fill, stroke, lw = 1) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
function glow(g, x, y, r, col, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0));
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
const flick = (tm, ph = 0) => 0.85 + 0.1 * Math.sin(tm * 7 + ph) + 0.05 * Math.sin(tm * 17 + ph * 3);

// ---------- masks (unit: s = half of face height) ----------
function drawMask(g, k, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
  const eye = (ex, ey, rx, ry, rot, col = '#050305') => ell(g, ex, ey, rx, ry, col, rot);
  if (k === 'white') {
    ell(g, 0, -0.1, 0.92, 1.12, '#0d0a10');                       // hood
    const gr = g.createLinearGradient(-0.7, -1, 0.7, 1); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#bdb3a2');
    ell(g, 0, 0, 0.7, 1, gr);
    eye(-0.3, -0.18, 0.2, 0.085, 0.12); eye(0.3, -0.18, 0.2, 0.085, -0.12);
    g.strokeStyle = 'rgba(60,50,45,.5)'; g.lineWidth = 0.03;
    g.beginPath(); g.moveTo(0, -0.1); g.lineTo(-0.05, 0.28); g.lineTo(0.06, 0.3); g.stroke();
    g.beginPath(); g.moveTo(-0.17, 0.58); g.quadraticCurveTo(0, 0.63, 0.17, 0.58); g.stroke();
    poly(g, [-0.3, -0.04, -0.34, 0.2, -0.26, 0.2], '#111');       // black tear
  } else if (k === 'exec') {
    // executioner's hood: covers the head and falls onto the shoulders
    const gr = g.createLinearGradient(0, -1.3, 0, 1.4); gr.addColorStop(0, '#7a161b'); gr.addColorStop(0.55, '#4a0d12'); gr.addColorStop(1, '#16060a');
    g.beginPath(); g.moveTo(-0.8, -0.45); g.quadraticCurveTo(-0.7, -1.2, 0, -1.32); g.quadraticCurveTo(0.7, -1.2, 0.8, -0.45);
    g.quadraticCurveTo(0.84, 0.6, 1.12, 1.3); g.lineTo(0.8, 1.12); g.lineTo(0.52, 1.36); g.lineTo(0.26, 1.14); g.lineTo(0, 1.4); g.lineTo(-0.26, 1.14); g.lineTo(-0.52, 1.36); g.lineTo(-0.8, 1.12); g.lineTo(-1.12, 1.3);
    g.quadraticCurveTo(-0.84, 0.6, -0.8, -0.45); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = '#1a0507'; g.lineWidth = 0.04; g.stroke();
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.moveTo(0, -1.32); g.quadraticCurveTo(0.7, -1.2, 0.8, -0.45); g.quadraticCurveTo(0.84, 0.6, 1.12, 1.3); g.lineTo(0.8, 1.12); g.lineTo(0.52, 1.36); g.lineTo(0.26, 1.14); g.lineTo(0, 1.4); g.closePath(); g.fill();
    g.strokeStyle = '#1a0507'; g.lineWidth = 0.03; g.setLineDash([0.09, 0.07]); g.beginPath(); g.moveTo(0, -1.3); g.lineTo(0, 1.35); g.stroke(); g.setLineDash([]);
    poly(g, [-0.56, -0.3, -0.14, -0.2, -0.16, -0.06, -0.54, -0.12], '#050203'); poly(g, [0.56, -0.3, 0.14, -0.2, 0.16, -0.06, 0.54, -0.12], '#050203');
    ell(g, -0.33, -0.17, 0.035, 0.035, 'rgba(255,220,200,.7)'); ell(g, 0.37, -0.17, 0.035, 0.035, 'rgba(255,220,200,.7)');
    g.strokeStyle = '#8a6b3f'; g.lineWidth = 0.09; g.beginPath(); g.moveTo(-0.86, 0.78); g.quadraticCurveTo(0, 0.98, 0.86, 0.78); g.stroke();   // rope at the neck
    g.strokeStyle = '#5a4424'; g.lineWidth = 0.025; for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(i * 0.13 - 0.03, 0.83 + (1 - Math.abs(i) / 6) * 0.1 - 0.05); g.lineTo(i * 0.13 + 0.03, 0.9 + (1 - Math.abs(i) / 6) * 0.1 - 0.02); g.stroke(); }
  } else if (k === 'harlequin') {
    poly(g, [-1.0, -0.62, -1.5, -1.5, -0.25, -1.0, 0, -1.2, 0, -0.62], '#a8262b');   // two-horned cap
    poly(g, [1.0, -0.62, 1.5, -1.5, 0.25, -1.0, 0, -1.2, 0, -0.62], '#1f6f6a');
    ell(g, -1.5, -1.5, 0.11, 0.11, '#e9c05a'); ell(g, 1.5, -1.5, 0.11, 0.11, '#e9c05a');
    ell(g, 0, 0.12, 0.68, 0.92, '#e6c6a4');
    g.strokeStyle = '#8f1d22'; g.lineWidth = 0.07; g.beginPath(); g.arc(0, 0.38, 0.36, 0.25, Math.PI - 0.25); g.stroke();
    g.save();
    g.beginPath(); g.moveTo(-0.8, -0.66); g.lineTo(0.8, -0.66); g.lineTo(0.74, 0.02);
    g.quadraticCurveTo(0.3, 0.16, 0, -0.06); g.quadraticCurveTo(-0.3, 0.16, -0.74, 0.02); g.closePath();
    g.fillStyle = '#121014'; g.fill(); g.clip();
    for (let i = -4; i <= 4; i++) for (let j = -3; j <= 1; j++) {
      const dx = i * 0.3 + (j & 1) * 0.15, dy = j * 0.26 - 0.1;
      if ((i + j) & 1) poly(g, [dx, dy - 0.13, dx + 0.075, dy, dx, dy + 0.13, dx - 0.075, dy], (i & 1) ? '#a8262b' : '#c9a24a');
    }
    g.restore();
    eye(-0.36, -0.3, 0.19, 0.09, 0.15); eye(0.36, -0.3, 0.19, 0.09, -0.15);
  } else if (k === 'fox') {
    poly(g, [-0.82, -0.5, -1.02, -1.55, -0.2, -0.86], '#d9621e'); poly(g, [0.82, -0.5, 1.02, -1.55, 0.2, -0.86], '#d9621e');
    poly(g, [-0.72, -0.72, -0.9, -1.3, -0.42, -0.86], '#3a1408'); poly(g, [0.72, -0.72, 0.9, -1.3, 0.42, -0.86], '#3a1408');
    const gr = g.createLinearGradient(0, -1, 0, 1.1); gr.addColorStop(0, '#e9792a'); gr.addColorStop(1, '#b8480f');
    poly(g, [-0.92, -0.62, 0, -0.92, 0.92, -0.62, 0.6, 0.3, 0, 1.18, -0.6, 0.3], gr);
    poly(g, [-0.6, 0.3, -0.92, -0.2, -0.3, 0.2, 0, 1.18], '#f1e6d2'); poly(g, [0.6, 0.3, 0.92, -0.2, 0.3, 0.2, 0, 1.18], '#f1e6d2');
    ell(g, 0, 1.08, 0.12, 0.09, '#120a08');
    eye(-0.4, -0.22, 0.22, 0.085, 0.38); eye(0.4, -0.22, 0.22, 0.085, -0.38);
    g.strokeStyle = '#c9a24a'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(0, -0.9); g.lineTo(0, -0.2); g.stroke();
  } else if (k === 'owl') {
    poly(g, [-0.7, -0.7, -0.98, -1.35, -0.3, -0.92], '#4a3524'); poly(g, [0.7, -0.7, 0.98, -1.35, 0.3, -0.92], '#4a3524');
    ell(g, 0, 0, 0.98, 1.02, '#6b5138');
    g.strokeStyle = '#4a3524'; g.lineWidth = 0.04;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.arc(i * 0.3, 0.72, 0.16, 0, Math.PI); g.stroke(); }
    for (const sx of [-1, 1]) {
      ell(g, sx * 0.43, -0.15, 0.44, 0.44, '#e9dcc0');
      g.strokeStyle = '#8a6b3f'; g.lineWidth = 0.05;
      g.beginPath(); g.arc(sx * 0.43, -0.15, 0.3, 0, 7); g.stroke();
      g.beginPath(); g.arc(sx * 0.43, -0.15, 0.43, 0, 7); g.stroke();
      ell(g, sx * 0.43, -0.15, 0.17, 0.17, '#070506');
    }
    poly(g, [-0.13, 0.12, 0.13, 0.12, 0, 0.58], '#c9973a');
  } else if (k === 'raven') {
    ell(g, 0, -0.92, 1.25, 0.17, '#09080b'); poly(g, [-0.55, -0.95, -0.48, -1.62, 0.48, -1.62, 0.55, -0.95], '#0d0b10');
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) poly(g, [sx * 0.5, 0.1 + i * 0.16, sx * (1.0 - i * 0.06), 0.42 + i * 0.2, sx * 0.42, 0.42 + i * 0.16], '#141118');
    ell(g, 0, -0.22, 0.7, 0.74, '#262130');
    poly(g, [-0.32, -0.08, 0.32, -0.08, 0.1, 1.5, 0, 1.62, -0.1, 1.5], '#3a3342', '#57506a', 0.03);
    poly(g, [0, -0.08, 0.32, -0.08, 0.1, 1.5, 0, 1.62], 'rgba(0,0,0,.3)');
    g.strokeStyle = '#3d3748'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(0, -0.05); g.lineTo(0, 1.55); g.stroke();
    for (const sx of [-1, 1]) {
      ell(g, sx * 0.34, -0.32, 0.23, 0.23, '#8d8a93'); ell(g, sx * 0.34, -0.32, 0.18, 0.18, '#3d0c10');
      ell(g, sx * 0.34 - 0.06, -0.38, 0.05, 0.05, 'rgba(255,200,190,.6)');
    }
  } else if (k === 'devil') {
    poly(g, [-0.55, -0.7, -1.0, -1.65, -0.2, -0.95], '#120406'); poly(g, [0.55, -0.7, 1.0, -1.65, 0.2, -0.95], '#120406');
    poly(g, [-0.75, -0.7, 0, -1.0, 0.75, -0.7, 0.6, 0.35, 0, 1.2, -0.6, 0.35], '#150508');
    eye(-0.32, -0.2, 0.2, 0.075, 0.3, '#ff7b3a'); eye(0.32, -0.2, 0.2, 0.075, -0.3, '#ff7b3a');
    eye(-0.32, -0.2, 0.06, 0.07, 0, '#fff0c0'); eye(0.32, -0.2, 0.06, 0.07, 0, '#fff0c0');
    g.strokeStyle = '#c2401f'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(-0.3, 0.52); g.quadraticCurveTo(0, 0.68, 0.34, 0.46); g.stroke();
  }
  maskDetail(g, k);
  g.restore();
}

// Faces that appear once a mask comes off.
const FACES = {
  exec: { skin: '#d9bfa6', hair: '#2a2019', stache: 1, beard: 1, old: 1 },
  harlequin: { skin: '#eccdb0', hair: '#b08a45', stache: 1 },
  fox: { skin: '#f0d9c6', hair: '#3a2a22', lady: 1 },
  owl: { skin: '#e0c2a2', hair: '#8c8478', bald: 1, glasses: 1 },
  raven: { skin: '#cdbcae', hair: '#9a968f', old: 1, scar: 1, gaunt: 1 },
};
function drawFace(g, k, x, y, s) {
  const f = FACES[k]; g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round';
  const fw = f.gaunt ? 0.6 : 0.68;
  if (f.lady) { ell(g, 0, -0.72, 0.66, 0.56, f.hair); ell(g, 0, -1.27, 0.32, 0.3, f.hair); g.strokeStyle = '#c9a24a'; g.lineWidth = 0.035; g.beginPath(); g.arc(0, -1.02, 0.3, 0.2, Math.PI - 0.2); g.stroke(); }
  else if (!f.bald) ell(g, 0, -0.45, 0.76, 0.74, f.hair);
  ell(g, -fw + 0.02, -0.02, 0.09, 0.17, f.skin); ell(g, fw - 0.02, -0.02, 0.09, 0.17, f.skin);          // ears
  g.beginPath(); g.moveTo(-fw, -0.25); g.quadraticCurveTo(-fw - 0.02, -0.98, 0, -0.98); g.quadraticCurveTo(fw + 0.02, -0.98, fw, -0.25);
  g.quadraticCurveTo(fw, 0.5, 0.3, 0.86); g.quadraticCurveTo(0, 1.02, -0.3, 0.86); g.quadraticCurveTo(-fw, 0.5, -fw, -0.25); g.closePath(); g.fillStyle = f.skin; g.fill();
  ell(g, fw * 0.55, 0.3, 0.2, 0.34, 'rgba(120,70,60,.16)'); ell(g, -fw * 0.5, 0.18, 0.16, 0.12, 'rgba(210,110,100,.16)');   // cheek shade and warmth
  if (f.gaunt) { ell(g, -0.36, 0.34, 0.1, 0.24, 'rgba(60,40,50,.25)'); ell(g, 0.36, 0.34, 0.1, 0.24, 'rgba(60,40,50,.3)'); }
  if (f.bald) { ell(g, -0.66, -0.12, 0.15, 0.34, f.hair); ell(g, 0.66, -0.12, 0.15, 0.34, f.hair); ell(g, -0.2, -0.72, 0.2, 0.1, 'rgba(255,255,255,.2)'); }
  else if (f.lady) { poly(g, [-0.7, -0.36, -0.24, -0.98, 0.7, -0.36, 0.32, -0.72, -0.3, -0.72], f.hair); ell(g, -0.74, 0.18, 0.05, 0.09, '#c9a24a'); ell(g, 0.74, 0.18, 0.05, 0.09, '#c9a24a'); }
  else { g.fillStyle = f.hair; g.beginPath(); g.moveTo(-fw - 0.04, -0.2); g.quadraticCurveTo(-0.6, -1.06, 0.05, -1.04); g.quadraticCurveTo(0.66, -1.02, fw + 0.04, -0.2); g.quadraticCurveTo(0.5, -0.72, 0.1, -0.7); g.quadraticCurveTo(-0.4, -0.66, -fw - 0.04, -0.2); g.fill(); }
  for (const sx of [-1, 1]) {                                                                        // eyes
    ell(g, sx * 0.3, -0.2, 0.17, 0.12, 'rgba(60,30,40,.3)');
    ell(g, sx * 0.3, -0.2, 0.115, 0.058, '#efe6d6'); ell(g, sx * 0.3 + 0.01, -0.2, 0.052, 0.056, f.lady ? '#3a4a3a' : '#2a2018'); ell(g, sx * 0.3 + 0.01, -0.2, 0.024, 0.026, '#050304'); ell(g, sx * 0.3 - 0.015, -0.222, 0.012, 0.012, '#fff');
    g.strokeStyle = '#2a1a18'; g.lineWidth = 0.028; g.beginPath(); g.moveTo(sx * 0.3 - 0.13, -0.215); g.quadraticCurveTo(sx * 0.3, -0.3, sx * 0.3 + 0.13, -0.215); g.stroke();
    if (f.old) { g.strokeStyle = 'rgba(80,45,40,.4)'; g.lineWidth = 0.018; g.beginPath(); g.moveTo(sx * 0.2, -0.1); g.quadraticCurveTo(sx * 0.32, -0.04, sx * 0.44, -0.11); g.stroke(); }
    g.strokeStyle = f.hair; g.lineWidth = f.lady ? 0.035 : 0.06; g.beginPath(); g.moveTo(sx * 0.47, -0.36); g.quadraticCurveTo(sx * 0.3, f.old ? -0.4 : -0.44, sx * 0.14, f.old ? -0.33 : -0.37); g.stroke();
  }
  g.strokeStyle = 'rgba(90,50,45,.55)'; g.lineWidth = 0.03;
  g.beginPath(); g.moveTo(0.03, -0.18); g.quadraticCurveTo(0.1, 0.1, 0.02, 0.22); g.quadraticCurveTo(-0.06, 0.26, -0.1, 0.2); g.stroke();
  ell(g, 0.08, 0.14, 0.07, 0.14, 'rgba(120,70,60,.14)');
  g.strokeStyle = 'rgba(110,50,50,.75)'; g.lineWidth = 0.032; g.beginPath(); g.moveTo(-0.19, 0.52); g.quadraticCurveTo(0, f.lady ? 0.57 : 0.5, 0.19, 0.52); g.stroke();
  if (f.lady) { g.fillStyle = '#9a2f38'; g.beginPath(); g.moveTo(-0.17, 0.52); g.quadraticCurveTo(-0.06, 0.45, 0, 0.49); g.quadraticCurveTo(0.06, 0.45, 0.17, 0.52); g.quadraticCurveTo(0, 0.63, -0.17, 0.52); g.fill(); }
  if (f.old) { g.strokeStyle = 'rgba(80,45,40,.38)'; g.lineWidth = 0.022; g.beginPath(); g.moveTo(-0.2, 0.2); g.quadraticCurveTo(-0.32, 0.38, -0.27, 0.56); g.moveTo(0.2, 0.2); g.quadraticCurveTo(0.32, 0.38, 0.27, 0.56); g.moveTo(-0.3, -0.62); g.quadraticCurveTo(0, -0.67, 0.3, -0.62); g.stroke(); }
  if (f.beard) { g.fillStyle = f.hair; g.beginPath(); g.moveTo(-fw + 0.04, 0.2); g.quadraticCurveTo(-0.5, 1.0, 0, 1.22); g.quadraticCurveTo(0.5, 1.0, fw - 0.04, 0.2); g.quadraticCurveTo(0.42, 0.7, 0.2, 0.66); g.quadraticCurveTo(0, 0.6, -0.2, 0.66); g.quadraticCurveTo(-0.42, 0.7, -fw + 0.04, 0.2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 0.02; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 0.1, 0.74); g.lineTo(i * 0.09, 1.08 - Math.abs(i) * 0.07); g.stroke(); } }
  if (f.stache) { g.fillStyle = f.hair; g.beginPath(); g.moveTo(0, 0.34); g.quadraticCurveTo(0.2, 0.32, 0.36, 0.5); g.quadraticCurveTo(0.18, 0.46, 0, 0.45); g.quadraticCurveTo(-0.18, 0.46, -0.36, 0.5); g.quadraticCurveTo(-0.2, 0.32, 0, 0.34); g.fill(); }
  if (f.scar) { g.strokeStyle = '#9a5a55'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(0.2, -0.66); g.lineTo(0.4, 0.32); g.stroke(); g.lineWidth = 0.018; for (const yy of [-0.4, 0, 0.2]) { g.beginPath(); g.moveTo(0.22 + (yy + 0.66) * 0.2, yy); g.lineTo(0.34 + (yy + 0.66) * 0.2, yy - 0.03); g.stroke(); } }
  if (f.glasses) { g.strokeStyle = '#c9a24a'; g.lineWidth = 0.03; g.beginPath(); g.arc(-0.3, -0.2, 0.18, 0, 7); g.moveTo(0.48, -0.2); g.arc(0.3, -0.2, 0.18, 0, 7); g.moveTo(-0.12, -0.2); g.quadraticCurveTo(0, -0.26, 0.12, -0.2); g.moveTo(-0.48, -0.2); g.lineTo(-fw, -0.14); g.moveTo(0.48, -0.2); g.lineTo(fw, -0.14); g.stroke(); ell(g, -0.36, -0.26, 0.05, 0.03, 'rgba(255,255,255,.35)'); ell(g, 0.24, -0.26, 0.05, 0.03, 'rgba(255,255,255,.35)'); }
  g.restore();
}

// finer details layered over every mask (same unit space as drawMask)
function maskDetail(g, k) {
  g.lineCap = 'round';
  if (k === 'white') {
    ell(g, 0.34, 0.22, 0.3, 0.52, 'rgba(110,95,90,.18)'); ell(g, -0.27, -0.5, 0.17, 0.24, 'rgba(255,255,255,.4)');
    g.strokeStyle = '#c9a24a'; g.lineWidth = 0.02;
    g.beginPath(); g.moveTo(-0.34, -0.6); g.quadraticCurveTo(-0.16, -0.86, 0, -0.62); g.quadraticCurveTo(0.16, -0.86, 0.34, -0.6); g.moveTo(-0.2, -0.52); g.quadraticCurveTo(0, -0.42, 0.2, -0.52); g.stroke();
    poly(g, [0, -0.6, 0.04, -0.53, 0, -0.46, -0.04, -0.53], '#c9a24a');
    g.strokeStyle = 'rgba(150,60,60,.45)'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(-0.13, 0.585); g.quadraticCurveTo(0, 0.62, 0.13, 0.585); g.stroke();
  } else if (k === 'exec') {
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 0.014;
    for (let y = -1.12; y < 1.05; y += 0.12) { const w = 0.76 - Math.max(0, -0.45 - y) * 0.62 + Math.max(0, y - 0.5) * 0.3; g.beginPath(); g.moveTo(-w, y); g.lineTo(w, y + 0.03); g.stroke(); }
    g.strokeStyle = 'rgba(255,160,150,.32)'; g.lineWidth = 0.035; g.beginPath(); g.moveTo(-0.74, -0.4); g.quadraticCurveTo(-0.64, -1.1, -0.08, -1.27); g.stroke();
    g.strokeStyle = '#1a0507'; g.lineWidth = 0.03; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 0.6, -0.36); g.lineTo(sx * 0.1, -0.25); g.stroke(); }
  } else if (k === 'harlequin') {
    g.strokeStyle = '#c9a24a'; g.lineWidth = 0.03;
    g.beginPath(); g.moveTo(-0.8, -0.66); g.lineTo(0.8, -0.66); g.lineTo(0.74, 0.02); g.quadraticCurveTo(0.3, 0.16, 0, -0.06); g.quadraticCurveTo(-0.3, 0.16, -0.74, 0.02); g.closePath(); g.stroke();
    g.lineWidth = 0.05; g.beginPath(); g.moveTo(-1.0, -0.63); g.lineTo(1.0, -0.63); g.stroke();
    ell(g, -0.4, 0.34, 0.13, 0.08, 'rgba(200,80,70,.4)'); ell(g, 0.4, 0.34, 0.13, 0.08, 'rgba(200,80,70,.4)');
    ell(g, -1.53, -1.53, 0.04, 0.04, '#fff6d0'); ell(g, 1.47, -1.53, 0.04, 0.04, '#fff6d0');
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.02; g.beginPath(); g.moveTo(-0.6, -0.72); g.lineTo(-1.3, -1.36); g.moveTo(0.6, -0.72); g.lineTo(1.3, -1.36); g.stroke();
  } else if (k === 'fox') {
    g.lineWidth = 0.022;
    for (let i = 0; i < 26; i++) { const x = -0.78 + (i % 13) * 0.13, y = -0.62 + (i > 12 ? 0.28 : 0) + ((i * 7) % 5) * 0.035; if (Math.abs(x) > 0.2 && Math.abs(x) < 0.62 && i > 12) continue; g.strokeStyle = i % 2 ? 'rgba(120,45,10,.6)' : 'rgba(255,190,120,.5)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.sign(x || 1) * 0.03, y + 0.11); g.stroke(); }
    g.strokeStyle = '#c9a24a'; g.lineWidth = 0.022; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 0.4, -0.22, 0.25, 0.105, sx * -0.38, 0, 7); g.stroke(); }
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) ell(g, sx * (0.26 + i * 0.1), 0.52 + i * 0.03, 0.018, 0.018, '#8a6a50');
    ell(g, -0.03, 1.05, 0.04, 0.025, 'rgba(255,255,255,.5)');
  } else if (k === 'owl') {
    poly(g, [-0.88, -0.66, 0, -0.3, 0.88, -0.66, 0, -0.45], '#4a3524');
    g.strokeStyle = 'rgba(138,107,63,.55)'; g.lineWidth = 0.018;
    for (const sx of [-1, 1]) for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.beginPath(); g.moveTo(sx * 0.43 + Math.cos(a) * 0.2, -0.15 + Math.sin(a) * 0.2); g.lineTo(sx * 0.43 + Math.cos(a) * 0.41, -0.15 + Math.sin(a) * 0.41); g.stroke(); }
    g.strokeStyle = 'rgba(255,240,200,.5)'; g.lineWidth = 0.025; g.beginPath(); g.moveTo(-0.06, 0.16); g.lineTo(-0.01, 0.46); g.stroke();
    g.strokeStyle = 'rgba(40,25,15,.5)'; g.lineWidth = 0.03; for (let i = -3; i <= 3; i++) { g.beginPath(); g.arc(i * 0.24 + 0.12, 0.5, 0.12, 0.2, Math.PI - 0.2); g.stroke(); }
  } else if (k === 'raven') {
    g.fillStyle = '#3a0c12'; g.fillRect(-0.5, -1.1, 1.0, 0.11);
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 0.045; g.beginPath(); g.moveTo(-0.16, 0.02); g.lineTo(-0.04, 1.38); g.stroke();
    g.strokeStyle = '#3d3748'; g.lineWidth = 0.02; for (let y = 0.1; y < 1.4; y += 0.14) { g.beginPath(); g.moveTo(-0.04, y); g.lineTo(0.04, y + 0.03); g.stroke(); }
    for (const sx of [-1, 1]) {
      g.strokeStyle = '#b8924a'; g.lineWidth = 0.04; g.beginPath(); g.arc(sx * 0.34, -0.32, 0.225, 0, 7); g.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.3; ell(g, sx * 0.34 + Math.cos(a) * 0.225, -0.32 + Math.sin(a) * 0.225, 0.02, 0.02, '#5a4424'); }
    }
    g.strokeStyle = '#2f2a38'; g.lineWidth = 0.03; g.beginPath(); g.moveTo(-0.12, -0.32); g.lineTo(0.12, -0.32); g.stroke();
  }
}

// figures live in figures.js

// ---------- rooms ----------
const PAL = {
  gallery: { wall1: '#35204a', wall2: '#150c20', f1: '#4a3a5c', f2: '#18101f', acc: '#a184c4' },
  hall: { wall1: '#4a1620', wall2: '#1c0810', f1: '#d8cdb8', f2: '#19121a', acc: '#c9a24a' },
  buffet: { wall1: '#1f3a3a', wall2: '#0b1617', f1: '#4a3a2a', f2: '#2a2018', acc: '#9fc2b8' },
  cards: { wall1: '#16301f', wall2: '#07120b', f1: '#3a2616', f2: '#22160c', acc: '#c9a24a' },
};
function roomBase(id, cam, tm) {
  const p = PAL[id], w = WORLD[id].w;
  const gr = c.createLinearGradient(0, 0, 0, FLOOR); gr.addColorStop(0, p.wall2); gr.addColorStop(1, p.wall1);
  c.fillStyle = gr; c.fillRect(0, 0, W, FLOOR);
  // wallpaper lozenges
  c.globalAlpha = 0.09; c.strokeStyle = p.acc; c.lineWidth = 1;
  for (let x = -(cam % 80) - 80; x < W + 80; x += 80) for (let y = 40; y < FLOOR - 70; y += 100) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20, y + 30); c.lineTo(x, y + 60); c.lineTo(x - 20, y + 30); c.closePath(); c.stroke();
  }
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, FLOOR - 64, W, 64);
  c.fillStyle = p.acc; c.globalAlpha = 0.35; c.fillRect(0, FLOOR - 66, W, 2); c.globalAlpha = 1;
  // chequered floor, rows widen towards the viewer
  let y = FLOOR;
  for (let r = 0; r < 6; r++) {
    const rh = 16 + r * 7, tw = 70 + r * 26, off = (cam * (0.7 + r * 0.06)) % (tw * 2);
    for (let x = -off - tw * 2, i = 0; x < W + tw; x += tw, i++) {
      c.fillStyle = ((i + r) & 1) ? p.f1 : p.f2;
      c.beginPath(); c.moveTo(x + r * 3, y); c.lineTo(x + tw + r * 3, y); c.lineTo(x + tw + (r + 1) * 3, y + rh); c.lineTo(x + (r + 1) * 3, y + rh); c.fill();
    }
    y += rh;
  }
  const sh = c.createLinearGradient(0, FLOOR, 0, H); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(0.4, 'rgba(0,0,0,.2)'); sh.addColorStop(1, 'rgba(0,0,0,.6)');
  c.fillStyle = sh; c.fillRect(0, FLOOR, W, H - FLOOR);
}
function doorway(x, col, lit, label, near) {
  c.save(); c.translate(x, 0);
  c.fillStyle = '#050305';
  c.beginPath(); c.moveTo(-78, FLOOR); c.lineTo(-78, 250); c.quadraticCurveTo(0, 150, 78, 250); c.lineTo(78, FLOOR); c.fill();
  const gr = c.createLinearGradient(0, 200, 0, FLOOR); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, lit);
  c.fillStyle = gr; c.beginPath(); c.moveTo(-66, FLOOR); c.lineTo(-66, 256); c.quadraticCurveTo(0, 168, 66, 256); c.lineTo(66, FLOOR); c.fill();
  c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-78, FLOOR); c.lineTo(-78, 250); c.quadraticCurveTo(0, 150, 78, 250); c.lineTo(78, FLOOR); c.stroke();
  // curtains
  for (const s of [-1, 1]) { c.fillStyle = 'rgba(90,20,30,.92)'; c.beginPath(); c.moveTo(s * 78, 236); c.quadraticCurveTo(s * 20, 300, s * 60, FLOOR); c.lineTo(s * 78, FLOOR); c.fill(); }
  c.font = '500 19px "Cormorant SC", Georgia, serif'; c.textAlign = 'center';
  c.fillStyle = near ? '#ffe6a6' : 'rgba(201,162,74,.75)'; c.fillText(label, 0, 150);
  c.restore();
}
function chandelier(x, tm) {
  c.strokeStyle = '#8a6b2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 70); c.stroke();
  c.strokeStyle = '#c9a24a'; c.lineWidth = 3;
  for (const r of [70, 42]) { c.beginPath(); c.ellipse(x, 84 + (70 - r) * 0.4, r, r * 0.22, 0, 0, 7); c.stroke(); }
  for (let i = -3; i <= 3; i++) { const fx = x + i * 22, fy = 76 - Math.abs(i) * 2; c.fillStyle = '#efe6cf'; c.fillRect(fx - 2, fy, 4, 12); ell(c, fx, fy - 5, 3, 6 * flick(tm, i), '#ffd98a'); }
  glow(c, x, 90, 420, 'rgba(255,190,100,A)', 0.2 * flick(tm, x));
}
function candle(x, y, tm, col = '#efe6cf') { c.fillStyle = col; c.fillRect(x - 3, y, 6, 26); ell(c, x, y - 6, 3.5, 7 * flick(tm, x), '#ffd98a'); glow(c, x, y - 6, 110, 'rgba(255,190,100,A)', 0.28 * flick(tm, x)); }

function drawRoom(id, cam, tm) {
  roomBase(id, cam, tm);
  const X = x => x - cam, near = S.near && S.near.type === 'door' ? S.near.d : null;
  const door = (d, col, lit) => doorway(X(d.x), col, lit, t(ROOMS[d.to]), near === d);
  const D = WORLD[id].doors;
  if (id === 'hall') {
    for (const wx of [400, 950, 1650, 2200]) {           // tall windows with snow
      const x = X(wx); if (x < -200 || x > W + 200) continue;
      const g2 = c.createLinearGradient(0, 110, 0, 440); g2.addColorStop(0, '#0d1836'); g2.addColorStop(1, '#27365e');
      c.fillStyle = g2; c.beginPath(); c.moveTo(x - 70, 440); c.lineTo(x - 70, 180); c.quadraticCurveTo(x, 90, x + 70, 180); c.lineTo(x + 70, 440); c.fill();
      c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.75)';
      for (let i = 0; i < 26; i++) { const sx = x - 70 + ((i * 53 + tm * (8 + i % 5)) % 140), sy = 100 + ((i * 97 + tm * (22 + i % 7 * 4)) % 340); c.fillRect(sx, sy, 2, 2); }
      c.restore();
      c.strokeStyle = '#6b4a22'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.moveTo(x, 110); c.lineTo(x, 440); c.moveTo(x - 70, 300); c.lineTo(x + 70, 300); c.stroke();
    }
    door(D[0], '#9fc2b8', 'rgba(110,170,160,.35)'); door(D[1], '#8a5fb0', 'rgba(120,50,150,.45)'); door(D[2], '#c9a24a', 'rgba(60,140,80,.35)');
    for (let i = 0; i < 9; i++) {                         // dancers far behind
      const bx = 330 + i * 250 + Math.sin(tm * 0.5 + i * 2) * 60, x = bx - cam * 0.86 - 90; if (x < -80 || x > W + 80) continue;
      const tw = Math.sin(tm * 1.6 + i);
      c.globalAlpha = 0.5;
      c.fillStyle = '#12080c'; c.beginPath(); c.moveTo(x - 14 + tw * 4, 440); c.quadraticCurveTo(x - 50, 520, x - 46 + tw * 8, 568); c.lineTo(x + 30 + tw * 8, 568); c.quadraticCurveTo(x + 20, 500, x + 6 + tw * 4, 440); c.fill();
      ell(c, x - 4 + tw * 4, 428, 12, 14, '#12080c'); c.fillRect(x + 14 - tw * 4, 440, 22, 128); ell(c, x + 25 - tw * 4, 424, 12, 14, '#12080c');
      c.globalAlpha = 1;
    }
    for (const cx of [260, 780, 1820, 2340]) {            // columns
      const x = X(cx); if (x < -80 || x > W + 80) continue;
      const g2 = c.createLinearGradient(x - 30, 0, x + 30, 0); g2.addColorStop(0, '#2a1a1c'); g2.addColorStop(0.4, '#b9a98c'); g2.addColorStop(1, '#3a2a28');
      c.fillStyle = g2; c.fillRect(x - 28, 40, 56, FLOOR - 40 + 14); c.fillStyle = '#8f7d5e'; c.fillRect(x - 40, 28, 80, 16); c.fillRect(x - 40, FLOOR, 80, 16);
    }
    for (const lx of [520, 1040, 1560, 2080]) chandelier(X(lx), tm);
  } else if (id === 'buffet') {
    door(D[0], '#c9a24a', 'rgba(200,80,60,.35)');
    // long table
    const x = X(860);
    c.fillStyle = '#e8e1d2'; c.fillRect(x - 170, 470, 340, 20); c.fillStyle = '#c9c0ac'; c.beginPath(); c.moveTo(x - 170, 490); c.lineTo(x + 170, 490); c.lineTo(x + 160, 600); c.lineTo(x - 160, 600); c.fill();
    for (let i = 0; i < 5; i++) { c.fillStyle = ['#2c4a3a', '#5a1a1e', '#2c4a3a', '#c9a24a', '#5a1a1e'][i]; c.fillRect(x - 140 + i * 30, 420, 12, 50); c.fillRect(x - 137 + i * 30, 402, 6, 20); }
    c.strokeStyle = 'rgba(230,240,240,.6)'; c.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) { const gx = x + 80 + (i - r / 2) * 18, gy = 404 + r * 17; c.strokeRect(gx - 6, gy, 12, 14); }
    candle(x - 10, 444, tm);
    // sofa and the body under a shawl
    const sx = X(360);
    c.fillStyle = '#3a1418'; c.fillRect(sx - 160, 500, 320, 30); c.beginPath(); c.moveTo(sx - 170, 590); c.lineTo(sx - 170, 470); c.quadraticCurveTo(sx - 150, 440, sx - 130, 470); c.lineTo(sx - 130, 590); c.fill();
    c.fillStyle = '#4a1a20'; c.fillRect(sx - 160, 528, 330, 50); c.fillStyle = '#1a0a0c'; c.fillRect(sx - 150, 578, 12, 26); c.fillRect(sx + 150, 578, 12, 26);
    c.fillStyle = '#ddd6c6'; c.beginPath(); c.moveTo(sx - 120, 528); c.quadraticCurveTo(sx - 100, 486, sx - 60, 500); c.quadraticCurveTo(sx + 20, 478, sx + 150, 516); c.lineTo(sx + 160, 540); c.lineTo(sx - 124, 540); c.fill();
    ell(c, sx - 104, 498, 20, 16, '#efe2d2'); ell(c, sx - 112, 490, 22, 12, '#2a1a14');
    c.strokeStyle = '#efe2d2'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx + 30, 536); c.quadraticCurveTo(sx + 44, 570, sx + 38, 592); c.stroke(); c.lineCap = 'butt';
    c.fillStyle = '#2a1a14'; c.fillRect(sx + 176, 520, 44, 6); c.fillRect(sx + 195, 526, 6, 76);
    c.strokeStyle = 'rgba(230,240,240,.8)'; c.strokeRect(sx + 190, 500, 12, 20); c.fillStyle = 'rgba(240,230,200,.5)'; c.fillRect(sx + 191, 510, 10, 9);
    candle(sx - 190, 440, tm); c.fillStyle = '#2a1a14'; c.fillRect(sx - 196, 466, 12, 140);
    glow(c, X(640), 200, 520, 'rgba(120,200,190,A)', 0.07);
  } else if (id === 'cards') {
    door(D[0], '#c9a24a', 'rgba(200,80,60,.35)');
    for (const tx of [400, 760, 1090]) {
      const x = X(tx);
      c.fillStyle = 'rgba(255,220,150,.07)'; c.beginPath(); c.moveTo(x - 10, 150); c.lineTo(x + 10, 150); c.lineTo(x + 150, 560); c.lineTo(x - 150, 560); c.fill();
      c.strokeStyle = '#3a2a16'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 130); c.stroke();
      poly(c, [x - 34, 150, x + 34, 150, x + 16, 124, x - 16, 124], '#1f5a36', '#c9a24a', 2);
      glow(c, x, 170, 300, 'rgba(255,200,120,A)', 0.2 * flick(tm, tx));
      c.fillStyle = '#1f5a36'; c.beginPath(); c.ellipse(x, 560, 130, 18, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3a1a'; c.lineWidth = 5; c.stroke();
      c.fillStyle = '#2a1a0c'; c.fillRect(x - 8, 572, 16, 60);
      for (let i = 0; i < 5; i++) { c.save(); c.translate(x - 70 + i * 34, 556); c.rotate((i * 1.7) % 1 - 0.5); c.fillStyle = '#efe6cf'; c.fillRect(-9, -4, 18, 8); c.fillStyle = i & 1 ? '#a8262b' : '#111'; c.fillRect(-3, -2, 5, 4); c.restore(); }
    }
    c.globalAlpha = 0.06; c.fillStyle = '#cfe0d0';           // smoke
    for (let i = 0; i < 6; i++) { const sx = ((i * 260 + tm * 14) % 1500) - 100, sy = 230 + Math.sin(tm * 0.4 + i) * 40 + i * 20; c.beginPath(); c.ellipse(sx, sy, 220, 26, 0, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  } else if (id === 'gallery') {
    door(D[0], '#c9a24a', 'rgba(220,120,60,.35)');
    for (const mx of [150, 890]) {                         // side mirrors
      const x = X(mx); c.fillStyle = '#0a0a12'; c.fillRect(x - 46, 210, 92, 250); c.strokeStyle = '#6b5524'; c.lineWidth = 5; c.strokeRect(x - 46, 210, 92, 250);
      c.fillStyle = 'rgba(160,150,200,.07)'; c.beginPath(); c.moveTo(x - 40, 420); c.lineTo(x + 10, 216); c.lineTo(x + 36, 216); c.lineTo(x - 14, 454); c.fill();
    }
    const x = X(520), fl = flick(tm, 2);                  // the great mirror
    glow(c, x, 330, 430, 'rgba(200,30,30,A)', 0.3 * fl);
    c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(x, 330, 138, 208, 0, 0, 7); c.fill();
    c.fillStyle = '#5a4416'; c.beginPath(); c.ellipse(x, 330, 128, 198, 0, 0, 7); c.fill();
    c.save(); c.beginPath(); c.ellipse(x, 330, 120, 190, 0, 0, 7); c.clip();
    const g2 = c.createRadialGradient(x, 380, 10, x, 330, 220); g2.addColorStop(0, '#7a1418'); g2.addColorStop(1, '#0a0204');
    c.fillStyle = g2; c.fillRect(x - 130, 130, 260, 400);
    c.fillStyle = '#0c0305'; c.beginPath(); c.moveTo(x - 120, 530); c.quadraticCurveTo(x - 100, 400, x - 36, 390); c.lineTo(x + 36, 390); c.quadraticCurveTo(x + 100, 400, x + 120, 530); c.fill();
    drawMask(c, 'devil', x, 320 + Math.sin(tm) * 4, 62);
    c.fillStyle = 'rgba(255,255,255,.05)'; c.beginPath(); c.moveTo(x - 110, 470); c.lineTo(x - 10, 140); c.lineTo(x + 30, 140); c.lineTo(x - 70, 520); c.fill();
    c.restore();
    // chalk circle on the floor
    c.save(); c.translate(x, 630); c.scale(1, 0.24); c.strokeStyle = 'rgba(230,220,230,.4)'; c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, 190, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 160, 0, 7); c.stroke();
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 2 * Math.PI * 2 / 5 - Math.PI / 2; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 160, Math.sin(a) * 160); } c.stroke(); c.restore();
    for (const s of [-1, 1]) { c.fillStyle = '#1a1014'; c.fillRect(x + s * 190 - 5, 470, 10, 136); candle(x + s * 190, 444, tm, '#111'); }
  }
}

// ---------- world update / draw ----------
const keys = {};
let last = performance.now(), TM = 0;
function interactables() {
  const R = WORLD[S.room], out = [];
  R.npcs.forEach(n => out.push({ type: 'npc', k: n.k, x: n.x }));
  R.objs.forEach(o => out.push({ type: 'obj', id: o.id, x: o.x }));
  R.doors.forEach(d => out.push({ type: 'door', d, x: d.x }));
  return out;
}
function update(dt) {
  S.roomT += dt; if (S.flash > 0) S.flash -= dt; if (S.snuff > 0) S.snuff -= dt;
  if (S.mode !== 'walk') { S.walking = false; return; }
  const R = WORLD[S.room];
  let v = 0;
  if (keys.left) v = -1; if (keys.right) v = 1;
  if (v) { S.tx = null; S.pending = null; }
  else if (S.tx != null) { const d = S.tx - S.x; if (Math.abs(d) < 6) { S.tx = null; if (S.pending) { const p = S.pending; S.pending = null; interact(p); return; } } else v = Math.sign(d); }
  S.walking = !!v; if (v) S.face = v;
  S.x = Math.max(50, Math.min(R.w - 50, S.x + v * 330 * dt));
  let best = null, bd = 95;
  for (const it of interactables()) { const d = Math.abs(it.x - S.x); if (d < bd) { bd = d; best = it; } }
  S.near = best;
  const pr = $('prompt');
  if (best) {
    const what = best.type === 'npc' ? t(UI.talk) + ' — ' + label(best.k) : best.type === 'door' ? t(UI.go) + ' — ' + t(ROOMS[best.d.to]) : best.id === 'mirror' ? t(UI.mirror) : t(UI.look);
    pr.innerHTML = '<b>E</b>' + what; pr.style.opacity = 1;
  } else pr.style.opacity = 0;
}
const label = k => (S.unmasked[k] ? t(NAMES[NPC[k].name].n) : t(MASKS[k]));
function draw() {
  const R = WORLD[S.room], cam = Math.max(0, Math.min(R.w - W, S.x - W / 2));
  c.clearRect(0, 0, W, H);
  // while a dialogue panel is open the scene slides up so the figures stay visible
  S.lift = (S.lift || 0) + ((S.mode === 'dlg' ? 190 : 0) - (S.lift || 0)) * 0.12;
  S.other += ((S.otherOn ? 1 : 0) - S.other) * 0.07; if (S.tear > 0) S.tear -= 0.025;
  const ow = S.other;
  c.save(); c.translate(0, -S.lift);
  drawRoom(S.room, cam, ow > 0.3 ? S.freezeT - (TM - S.freezeT) * 0.3 : TM);   // on the Underside time crawls backwards
  backHaze();
  floorFx(cam, ow);
  if (ow > 0.02) underside(ow, cam);
  R.npcs.forEach(n => {
    if (ow > 0.3 && n.k !== S.otherWho) return;
    if (ow > 0.02) glow(c, n.x - cam, GROUND - 190, 300, 'rgba(255,235,215,A)', 0.3 * ow);
    figure(c, n.k, n.x - cam, GROUND - 14, TM, figOpts(n.x, { um: S.unmasked[n.k], face: S.x < n.x ? -1 : 1 }));
    if (S.near && S.near.k === n.k && S.mode === 'walk') { c.font = '500 20px "Cormorant SC", Georgia, serif'; c.textAlign = 'center'; c.fillStyle = '#ffe6a6'; c.fillText(label(n.k), n.x - cam, GROUND - FIG[n.k].h - 62); }
  });
  figure(c, 'white', S.x - cam, GROUND + 8, TM, figOpts(S.x, { walk: S.walking, face: S.face }));
  fgLayer(cam, ow);
  c.fillStyle = '#050305'; c.fillRect(0, H, W, 200);
  c.restore();
  lightPass(cam, S.lift, 1 - ow);
  fgGlow(cam, S.lift, 1 - ow);
  // vignette and room fade-in
  const vg = c.createRadialGradient(W / 2, H * 0.48, 260, W / 2, H / 2, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.42)');
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (ow > 0.02) { c.globalAlpha = ow * (0.75 + 0.25 * Math.sin(TM * 2.3)); c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
  if (S.roomT < 0.5) { c.fillStyle = `rgba(0,0,0,${1 - S.roomT * 2})`; c.fillRect(0, 0, W, H); }
  if (S.flash > 0) { c.fillStyle = `rgba(255,235,200,${S.flash * 0.6})`; c.fillRect(0, 0, W, H); }
  // a candle just went out: the whole house darkens for a moment
  const sn = S.snuff > 0 ? S.snuff : 0;
  if (sn > 1.4) { c.fillStyle = `rgba(0,0,0,${(sn - 1.4) * 0.75})`; c.fillRect(0, 0, W, H); }
  // HUD: candles and room name
  for (let i = 0; i < 6; i++) {
    const x = W - 38 - i * 30, on = i < S.candles, dying = !on && i === S.candles && sn > 0;
    c.fillStyle = on ? '#efe6cf' : '#4a443c'; c.fillRect(x - 5, 28, 10, on ? 30 : 14 + (i % 3) * 3);
    if (on) { ell(c, x, 20, 4.5, 8.5 * flick(TM, i), '#ffd98a'); glow(c, x, 20, 30, 'rgba(255,190,100,A)', 0.5); }
    if (dying) {
      const k = 1 - sn / 2.4;                                   // 0 -> 1 over the effect
      glow(c, x, 24, 60 + k * 60, 'rgba(255,60,40,A)', 0.8 * (1 - k));
      ell(c, x, 26, 3, 3, `rgba(255,90,40,${1 - k})`);          // ember
      for (let j = 0; j < 5; j++) { const a = k * 1.4 - j * 0.12; if (a > 0 && a < 1) ell(c, x + Math.sin(a * 9 + j) * 7, 22 - a * 46, 4 + a * 9, 4 + a * 9, `rgba(200,200,210,${0.5 * (1 - a)})`); }
    }
  }
  if (ow > 0.5) { c.globalAlpha = ow * 0.8; c.font = '500 30px "Cormorant SC", Georgia, serif'; c.textAlign = 'center'; c.fillStyle = '#e8dcc8'; c.save(); c.translate(W / 2, 96); c.scale(-1, 1); c.fillText(t(UI.underside), 0, 0); c.restore(); c.globalAlpha = 1; }
  if (S.roomT < 3 && S.mode !== 'title' && ow < 0.1) {
    c.globalAlpha = Math.min(1, 3 - S.roomT, S.roomT * 2); c.font = '500 34px "Cormorant SC", Georgia, serif'; c.textAlign = 'center';
    c.fillStyle = '#ece3d0'; c.fillText(t(ROOMS[S.room]), W / 2, 92); c.globalAlpha = 1;
  }
}
// ---------- the Underside: what the room turns into when a mask is rightly named ----------
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const bc = buf.getContext('2d');
const EYES = [[0.07, 250, 30], [0.2, 330, 44], [0.31, 240, 24], [0.44, 300, 36], [0.63, 250, 40], [0.74, 345, 26], [0.86, 270, 46], [0.95, 360, 22]];
function underside(a, cam) {
  // the picture shivers in horizontal strips, and tears for a moment on the way in
  const tear = Math.max(0, S.tear), amp = a * 8 + tear * 80;
  bc.clearRect(0, 0, W, H); bc.drawImage(cv, 0, 0);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let y = 0; y < H; y += 6) c.drawImage(buf, 0, y, W, 6, Math.sin(y * 0.021 + TM * 1.7) * amp + (Math.random() - 0.5) * tear * 70, y, W, 6);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(200,22,34,${a})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(12,0,5,${a * 0.3})`; c.fillRect(0, 0, W, H);
  c.restore();
  // the true name, written backwards across the wall
  if (S.otherWho) {
    c.save(); c.globalAlpha = 0.1 * a; c.translate(W / 2, 470); c.scale(-1, 1); c.font = '700 150px "Cormorant SC", Georgia, serif'; c.textAlign = 'center'; c.fillStyle = '#e8dcc8';
    c.fillText(t(NAMES[NPC[S.otherWho].name].n).split(' ').pop(), 0, 0); c.restore();
  }
  // eyes open in the wallpaper and follow the White Mask
  const px = S.x - cam;
  EYES.forEach(([fx, y, r], i) => {
    const blink = Math.max(0, Math.min(1, 3 * Math.sin(TM * 0.6 + i * 2.1) + 2.4)), open = a * blink, x = fx * W;
    if (open < 0.05) return;
    ell(c, x, y, r, r * 0.52 * open, `rgba(232,220,200,${0.9 * a})`);
    const dx = Math.max(-1, Math.min(1, (px - x) / 400)) * r * 0.45;
    ell(c, x + dx, y, r * 0.4, r * 0.48 * open, '#5a060b'); ell(c, x + dx, y, r * 0.18, r * 0.3 * open, '#000');
    c.strokeStyle = `rgba(0,0,0,${a})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r, r * 0.52 * open, 0, 0, 7); c.stroke();
  });
  // ash rising, grain
  for (let i = 0; i < 46; i++) {
    const x = (i * 97 + Math.sin(TM * 0.7 + i) * 30) % W, y = H + 190 - ((TM * (22 + i % 7 * 6) + i * 53) % (H + 190));
    c.fillStyle = `rgba(235,225,210,${0.55 * a})`; c.fillRect(x, y, 2 + i % 3, 2 + i % 2);
  }
  c.fillStyle = `rgba(255,240,230,${0.1 * a})`;
  for (let i = 0; i < 140; i++) c.fillRect(Math.random() * W, Math.random() * (H + 190), 2, 2);
}

// low drone for the Underside (WebAudio, no assets)
let AC = null, drone = null;
function audioInit() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
function droneOn() {
  if (!AC || drone) return;
  const g = AC.createGain(); g.gain.value = 0; g.connect(AC.destination);
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.connect(g);
  const os = [55, 55.6, 82.7, 110.4].map((fr, i) => { const o = AC.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'sine'; o.frequency.value = fr; o.connect(f); o.start(); return o; });
  const hi = AC.createOscillator(), hg = AC.createGain(); hi.frequency.value = 932; hg.gain.value = 0.012; hi.connect(hg); hg.connect(g);
  hi.frequency.linearRampToValueAtTime(870, AC.currentTime + 25); hi.start(); os.push(hi);
  g.gain.linearRampToValueAtTime(0.15, AC.currentTime + 1.2); drone = { g, os };
}
function droneOff() {
  if (!AC || !drone) return;
  const d = drone; drone = null;
  d.g.gain.cancelScheduledValues(AC.currentTime); d.g.gain.setValueAtTime(d.g.gain.value, AC.currentTime); d.g.gain.linearRampToValueAtTime(0, AC.currentTime + 0.8);
  setTimeout(() => d.os.forEach(o => o.stop()), 1000);
}
function enterOther(k) {
  S.unmasked[k] = true; S.otherOn = true; S.otherWho = k; S.tear = 1; S.flash = 0.9; S.freezeT = TM;
  $('dlg').classList.add('other'); droneOn();
  const html = NPC[k].unmask.map((ln, i) => { let s = t(ln), cls = 'ol'; if (s[0] === '~') { cls += ' echo'; s = s.slice(1); } return `<p class="${cls}" style="animation-delay:${0.5 + i * 0.9}s">${markup(s)}</p>`; }).join('');
  show(k, { html }, [{ label: t(UI.returnBack), go: () => { leaveOther(); npcRoot(k, GENERIC.back); } }]);
}
function leaveOther() {
  if (!S.otherOn) return;
  NPC[S.otherWho].unmask.forEach(ln => [...t(ln).matchAll(/\[\[(\w+)\|/g)].forEach(m => catchSlip(m[1])));
  S.otherOn = false; S.tear = 0.6; S.flash = 0.5; $('dlg').classList.remove('other'); droneOff();
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; TM += dt;
  update(dt); draw();
  if (S.mode === 'dlg' && S.portWho) drawPortrait($('port').getContext('2d'), S.portWho, 260, 360, TM);   // portraits breathe
  requestAnimationFrame(loop);
}

// ---------- interaction ----------
function interact(it) {
  if (it.type === 'door') { S.room = it.d.to; S.x = it.d.tx; S.tx = null; S.roomT = 0; S.near = null; }
  else if (it.type === 'npc') npcRoot(it.k);
  else if (it.id === 'mirror') devilRoot();
  else if (it.id === 'body') show('body', OBJECTS.body.text, [{ label: t(UI.leave), soft: 1, go: closeDlg }]);
}
function toast(msg, bad) { const e = $('toast'); e.textContent = msg; e.classList.toggle('bad', !!bad); e.style.opacity = 1; clearTimeout(toast.t); toast.t = setTimeout(() => e.style.opacity = 0, bad ? 2600 : 1500); }
function catchSlip(id) { if (!has(id)) { S.slips.push(id); toast(t(UI.caught)); } }

function markup(s) {
  return s.replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (m, id, txt) => `<span class="slip${has(id) ? ' got' : ''}" data-id="${id}">${txt}</span>`);
}
// Show one dialogue node: who speaks, text (string / L object / {html}), and the list of choices.
function show(who, text, choices, question) {
  S.mode = 'dlg'; $('prompt').style.opacity = 0; $('dlg').classList.add('on');
  S.portWho = who; drawPortrait($('port').getContext('2d'), who, 260, 360, TM);
  $('dname').textContent = who === 'devil' || who === 'body' ? t(MASKS[who]) : label(who);
  const dt = $('dtext');
  dt.innerHTML = text.html ? text.html : markup(t(text));
  dt.classList.remove('fade'); void dt.offsetWidth; dt.classList.add('fade'); dt.scrollTop = 0;
  dt.querySelectorAll('.slip').forEach(sp => sp.onclick = () => { catchSlip(sp.dataset.id); sp.classList.add('got'); });
  const box = $('dch'); box.innerHTML = '';
  if (question) { const q = document.createElement('div'); q.id = 'dq'; q.textContent = question; box.appendChild(q); }
  choices.forEach((ch, i) => {
    const b = document.createElement('button'); b.className = 'ch' + (ch.fresh ? ' new' : '') + (ch.soft ? ' soft' : '');
    b.innerHTML = ch.label + (ch.sub ? `<small>${ch.sub}</small>` : ''); b.onclick = ch.go; box.appendChild(b);
  });
  S.choices = choices;
}
function closeDlg() {
  leaveOther();
  $('dlg').classList.remove('on'); S.mode = 'walk';
  if (S.candles <= 0 && !S.finale) { S.room = 'gallery'; S.x = 640; S.roomT = 0; setTimeout(() => pages('devil', [DEVIL.out], () => exam(0)), 600); }
}
function pages(who, arr, done, i = 0) {
  show(who, arr[i], [{ label: t(UI.next), go: () => (i + 1 < arr.length ? pages(who, arr, done, i + 1) : done()) }]);
}

const slipIds = txt => [...t(txt).matchAll(/\[\[(\w+)\|/g)].map(m => m[1]);
function burn(k, text) {      // a mistake: one candle goes out
  S.candles--; S.snuff = 2.4; toast(t(UI.candleOut) + ': ' + S.candles, true);
  return S.candles <= 0 ? show(k, text, [{ label: t(UI.next), go: closeDlg }]) : npcRoot(k, text);
}
function npcRoot(k, text) {
  const n = NPC[k], um = S.unmasked[k], first = !S.met[k]; S.met[k] = 1;
  const topics = (um ? n.after : n.topics).filter(tp => !tp.need || tp.need(helper));
  const ch = topics.map(tp => ({ label: t(tp.label), fresh: !S.seen[k + tp.id], go: () => { S.seen[k + tp.id] = 1; npcRoot(k, tp.text); } }));
  if (!um) {
    ch.push({ label: t(UI.show), go: () => pickSlip(k) });
    if (n.lie && !S.caught[k]) ch.push({ label: t(UI.lie), go: () => pickStatement(k) });
    ch.push({ label: t(UI.name), go: () => pickName(k) });
  }
  ch.push({ label: t(UI.leave), soft: 1, go: closeDlg });
  const missed = !um && slipIds(n.intro).some(id => !has(id));   // a slip missed in the greeting is offered again
  show(k, text || (first || missed ? n.intro : um ? GENERIC.done : n.idle), ch);
}
function slipChoices(k, onPick, back) {
  const ch = liveSlips().map(id => ({ label: '«' + t(SLIPS[id].q) + '»', sub: t(MASKS[SLIPS[id].who]), go: () => onPick(id) }));
  ch.push({ label: t(UI.back), soft: 1, go: back });
  return ch;
}
const dots = extra => ({ html: '<i style="color:#8d8371">' + (extra || '') + '…</i>' });
function pickSlip(k) {
  const n = NPC[k];
  if (!liveSlips().length) return npcRoot(k, UI.noSlips);
  show(k, dots(), slipChoices(k, id => npcRoot(k, SLIPS[id].who === k ? GENERIC.own : (n.react[id] || n.def)), () => npcRoot(k)), t(UI.whichSlip));
}
// Catching a mask in a lie: pick one thing it has said, then a slip that contradicts it.
// Only one claim per mask can be disproved; any other combination costs a candle.
function pickStatement(k) {
  const n = NPC[k];
  const heard = ['intro', ...n.topics.filter(tp => S.seen[k + tp.id]).map(tp => tp.id)];
  const ch = heard.map(id => ({ label: t(n.claims[id]), go: () => pickLieProof(k, id) }));
  ch.push({ label: t(UI.back), soft: 1, go: () => npcRoot(k) });
  show(k, dots(), ch, t(UI.whichLie));
}
function pickLieProof(k, stmt) {
  const n = NPC[k];
  if (!liveSlips().length) return npcRoot(k, UI.noSlips);
  show(k, dots(t(n.claims[stmt]) + ' '), slipChoices(k, id => {
    if (stmt !== n.lie.stmt || !n.lie.by.includes(id)) return burn(k, GENERIC.falseAcc);
    S.caught[k] = true; S.flash = 0.35; toast(t(UI.caughtLie));
    slipIds(n.lie.crack).forEach(catchSlipQuiet);
    npcRoot(k, n.lie.crack);
  }, () => npcRoot(k)), t(UI.lieProof));
}
const catchSlipQuiet = id => { if (!has(id)) S.slips.push(id); };
function pickName(k) {
  const taken = Object.keys(S.unmasked).map(m => NPC[m].name);
  const ch = Object.keys(NAMES).filter(id => !taken.includes(id)).map(id => ({ label: t(NAMES[id].n), sub: t(NAMES[id].d), go: () => pickProof(k, id) }));
  ch.push({ label: t(UI.back), soft: 1, go: () => npcRoot(k) });
  show(k, dots(), ch, t(UI.whoIs));
}
function pickProof(k, nameId) {
  const n = NPC[k];
  if (!liveSlips().length) return npcRoot(k, GENERIC.weak);
  show(k, dots(t(NAMES[nameId].n)), slipChoices(k, id => {
    if (!n.proofs.includes(id)) return npcRoot(k, GENERIC.weak);      // unrelated slip: no risk, no result
    if (n.name !== nameId) return burn(k, GENERIC.wrong);
    enterOther(k);
  }, () => npcRoot(k)), t(UI.proof));
}

// ---------- the devil ----------
function devilRoot(text) {
  if (!S.introDone) return pages('devil', DEVIL.intro, () => { S.introDone = true; closeDlg(); });
  show('devil', text || DEVIL.idle, [
    { label: t(UI.hint), go: () => devilRoot(hint()) },
    { label: t(UI.ready), go: () => exam(0) },
    { label: t(UI.leave), soft: 1, go: closeDlg },
  ]);
}
function hint() {
  const h = DEVIL.hints, u = S.unmasked, cg = S.caught;
  if (!has('wrist')) return h.start;
  if (!u.exec) return h.exec;
  if (!u.harlequin) return !has('epaulet') ? h.wrist : !cg.harlequin && S.seen.harlequinself ? h.catchH : h.harlequin;
  if (!u.fox) return has('glove') && !cg.fox ? h.catchFox : h.fox;
  if (!u.owl) return cg.owl || has('clerk') ? h.owl : has('owlmoney') ? h.catchOwl : h.askRaven;
  if (!u.raven) return !cg.raven ? h.catchRaven : h.raven;
  return h.all;
}
function knots() {
  const u = S.unmasked;
  return [has('column') || has('sawfall') || !!u.fox, has('foxgave') || !!u.fox, !!u.harlequin || !!u.exec, !!u.owl, !!u.raven];
}
// The finale: three questions answered with names.
const EXAM = [{ a: 'turova', mask: 'fox' }, { a: 'vyunov', mask: 'owl' }, { a: 'belsky', mask: 'raven' }];
function exam(i) {
  if (i === 0) { S.finale = true; S.answers = []; }
  const ch = Object.keys(NAMES).map(id => ({ label: t(NAMES[id].n), go: () => answer(i, id) }));
  show('devil', DEVIL.exam.q[i], ch, t(UI.verdictQ));
}
function answer(i, id) {
  const E = DEVIL.exam, V = DEVIL.verdict, ok = id === EXAM[i].a, known = !!S.unmasked[EXAM[i].mask];
  S.answers.push(ok);
  const comment = i < 2 ? (ok ? (known ? E.right[i] : E.guess[i]) : E.wrong[i])
    : id === 'belsky' ? (known ? V.belskyFull : V.belskyGuess) : (V[id] || V.absent);
  if (i < 2) return pages('devil', [comment], () => exam(i + 1));
  const kn = knots(), score = S.answers.filter(Boolean).length;
  const recap = { html: t(DEVIL.recapHead) + '<ol class="recap">' + DEVIL.recap.map((r, j) => `<li class="${kn[j] ? 'on' : 'off'}">${t(r)}</li>`).join('') + '</ol>' };
  pages('devil', [comment, E.score[score], recap, DEVIL.hand, ...DEVIL.twist], () => {
    $('dlg').classList.remove('on'); S.mode = 'end';
    $('e1').textContent = t(UI.end);
    $('stats').innerHTML = `${t(UI.answers)}: ${score} / 3<br>${t(UI.masksOff)}: ${Object.keys(S.unmasked).length} / 5<br>${t(UI.lies)}: ${Object.keys(S.caught).length} / 4<br>${t(UI.candles)}: ${Math.max(0, S.candles)} / 6`;
    $('bagain').textContent = t(UI.again); $('end').classList.add('on');
  });
}

// ---------- notebook ----------
function openBook() {
  if (S.mode === 'title' || S.mode === 'end') return;
  $('bh1').textContent = t(UI.bookNames); $('bh2').textContent = t(UI.bookSlips); $('bookx').textContent = t(UI.close);
  const maskOf = id => Object.keys(S.unmasked).find(m => NPC[m].name === id);
  $('bnames').innerHTML = Object.keys(NAMES).map(id => {
    const m = maskOf(id);
    return m
      ? `<div class="nm known"><canvas width="60" height="72" data-k="${m}"></canvas><div><b>${t(NAMES[id].n)}</b><br><i>${t(NAMES[id].d)}</i><br><span class="st">◆ ${t(UI.under)}: ${t(MASKS[m])}</span></div></div>`
      : `<div class="nm"><b>${t(NAMES[id].n)}</b><br><i>${t(NAMES[id].d)}</i><br><span class="st">${t(UI.unknown)}</span></div>`;
  }).join('');
  $('bnames').querySelectorAll('canvas').forEach(cn => { const k = cn.dataset.k; drawMask(cn.getContext('2d'), k, 30, k === 'raven' || k === 'exec' ? 36 : 40, k === 'fox' || k === 'owl' || k === 'white' ? 24 : 20); });
  const ls = liveSlips(), gone = S.slips.length - ls.length;
  $('bslips').innerHTML = (ls.length ? ls.map(id => `<div class="sl"><span>${t(MASKS[SLIPS[id].who])}</span>«${t(SLIPS[id].q)}»</div>`).join('') : `<div class="sl" style="color:#8d8371">${t(UI.noSlips)}</div>`)
    + (gone ? `<div class="sl gone">${t(UI.spent)}: ${gone}</div>` : '');
  $('book').classList.add('on');
}
const closeBook = () => $('book').classList.remove('on');

// ---------- input, language, start ----------
function setLang(l) {
  lang = l; document.documentElement.lang = l; document.title = t(UI.title);
  $('t1').textContent = t(UI.title); $('t2').textContent = t(UI.sub); $('bstart').textContent = t(UI.start); $('how').textContent = t(UI.how);
  $('ctip').textContent = t(UI.candleTip);
  $('bbook').textContent = t(UI.book); $('blang').textContent = l === 'ru' ? 'EN' : 'RU';
  document.querySelectorAll('#langs .chip').forEach(b => b.classList.toggle('sel', b.dataset.l === l));
  if ($('book').classList.contains('on')) openBook();
}
document.querySelectorAll('#langs .chip').forEach(b => b.onclick = () => setLang(b.dataset.l));
$('blang').onclick = () => { setLang(lang === 'ru' ? 'en' : 'ru'); if (S.mode === 'dlg') { closeDlg(); } };
$('bbook').onclick = openBook; $('bookx').onclick = closeBook;
$('bagain').onclick = () => location.reload();
$('bstart').onclick = () => { audioInit(); $('title').classList.remove('on'); S.mode = 'walk'; S.roomT = 0; setTimeout(() => pages('devil', DEVIL.intro, () => { S.introDone = true; npcRoot('exec'); }), 900); };

const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
addEventListener('keydown', e => {
  if (e.code === 'Tab') { e.preventDefault(); $('book').classList.contains('on') ? closeBook() : openBook(); return; }
  if (e.code === 'Escape') { closeBook(); return; }
  if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = true;
  if (S.mode === 'walk' && (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp') && S.near) { e.preventDefault(); interact(S.near); }
  else if (S.mode === 'dlg' && /^Digit[1-9]$/.test(e.code)) { const ch = S.choices[+e.code.slice(5) - 1]; if (ch) ch.go(); }
  else if (S.mode === 'dlg' && (e.code === 'Space' || e.code === 'Enter') && S.choices.length === 1) { e.preventDefault(); S.choices[0].go(); }
});
addEventListener('keyup', e => { if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false; });
cv.addEventListener('pointerdown', e => {
  if (S.mode !== 'walk') return;
  const r = cv.getBoundingClientRect(), R = WORLD[S.room];
  const cam = Math.max(0, Math.min(R.w - W, S.x - W / 2)), wx = (e.clientX - r.left) / r.width * W + cam;
  let hit = null, bd = 80;
  for (const it of interactables()) { const d = Math.abs(it.x - wx); if (d < bd) { bd = d; hit = it; } }
  S.pending = hit; S.tx = hit ? hit.x + (S.x < hit.x ? -1 : 1) * (hit.type === 'door' ? 0 : 70) : wx;
});

function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H), st = $('stage');
  st.style.transform = `translate(${-W / 2 * s}px, ${-H / 2 * s}px) scale(${s})`;
}
addEventListener('resize', fit); fit();
setLang(lang);
drawMask($('tmask').getContext('2d'), 'white', 100, 118, 96);
requestAnimationFrame(loop);
// Test hook for automated play-throughs.
window.__game = { S, interact, WORLD, catchSlip, enterOther };
