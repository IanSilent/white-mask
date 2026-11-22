// Full-height figures in the rooms: body, arms, props, costume detail and a light pass.
// Loaded after game.js; uses ell, poly, drawMask, drawFace, flick.
'use strict';
const FIG = {
  white: { h: 286, hem: 74, head: 26, ph: 0, maskAt: null },
  exec: { h: 298, hem: 84, head: 27, ph: 1, maskAt: [-66, -108, -0.3] },
  harlequin: { h: 284, hem: 44, head: 24, ph: 2, maskAt: [-30, -146, 0.4] },
  fox: { h: 264, hem: 112, head: 24, ph: 3, maskAt: [44, -150, 0.5] },
  owl: { h: 240, hem: 60, head: 28, ph: 4, maskAt: [44, -96, 0.3] },
  raven: { h: 308, hem: 64, head: 24, ph: 5, maskAt: [20, -150, 0.6] },
};
const FW = 360, FH = 400, FOX_ = 180, FOY = 372;       // scratch canvas and where the feet stand in it
const figCv = document.createElement('canvas'); figCv.width = FW; figCv.height = FH; const fb = figCv.getContext('2d');
const figRim = document.createElement('canvas'); figRim.width = FW; figRim.height = FH; const fr = figRim.getContext('2d');
const fh = i => { const x = Math.sin(i * 78.233) * 43758.5453; return x - Math.floor(x); };
const lg = (g, y0, y1, c0, c1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
// a limb: a thick rounded stroke through the given points
function limb(g, pts, w, col) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke();
}
function folds(g, xs, y0, y1, spread, a = 0.3) {
  g.strokeStyle = `rgba(0,0,0,${a})`; g.lineWidth = 2; g.lineCap = 'round';
  for (const x of xs) { g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x * (1 + spread * 0.4), (y0 + y1) / 2, x * (1 + spread), y1); g.stroke(); }
}
function diamonds(g, x0, y0, x1, y1, size, cols) {
  for (let j = 0, y = y0; y < y1 + size; y += size, j++) for (let i = 0, x = x0 - size; x < x1 + size; x += size, i++) {
    const dx = x + (j & 1) * size / 2; poly(g, [dx, y - size / 2, dx + size / 2, y, dx, y + size / 2, dx - size / 2, y], cols[(i + j * 2) % cols.length]);
  }
}

const BODY = {
  white(g, tm, o) {
    const sw = o.walk ? Math.sin(tm * 9) * 9 : Math.sin(tm * 0.9) * 2;
    if (o.walk) { ell(g, -14 + Math.sin(tm * 9) * 12, -3, 11, 5, '#050406'); ell(g, 14 - Math.sin(tm * 9) * 12, -3, 11, 5, '#050406'); }
    g.beginPath(); g.moveTo(-34, -236); g.quadraticCurveTo(-58, -120, -74 + sw, 0); g.lineTo(74 + sw, 0); g.quadraticCurveTo(58, -120, 34, -236); g.quadraticCurveTo(0, -252, -34, -236); g.closePath();
    g.fillStyle = lg(g, -240, 0, '#2a2334', '#08070b'); g.fill();
    poly(g, [-5, -214, 5, -214, 18 + sw * 0.6, 0, -18 + sw * 0.6, 0], '#040306');                  // the cloak falls open
    folds(g, [-40, -22, 24, 44], -200, -4, 0.5, 0.35);
    g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-30, -220); g.quadraticCurveTo(-50, -110, -64 + sw, -4); g.stroke();
    g.beginPath(); g.moveTo(-40, -236); g.quadraticCurveTo(0, -254, 40, -236); g.quadraticCurveTo(52, -210, 48, -186);            // short cape
    for (let i = 4; i >= -4; i--) g.quadraticCurveTo(i * 11 + 5, -176, i * 11, -186 - (i & 1) * 3);
    g.quadraticCurveTo(-52, -210, -40, -236); g.closePath(); g.fillStyle = '#322a3e'; g.fill(); g.strokeStyle = '#4a4155'; g.lineWidth = 1.2; g.stroke();
    ell(g, 0, -232, 5, 5, '#c9a24a'); ell(g, -1.5, -233.5, 1.5, 1.5, '#fff3c8');
    limb(g, [26, -216, 30, -186, 14, -170], 12, '#221c2a'); ell(g, 12, -168, 7, 8, '#e8e0d0'); g.strokeStyle = '#b9ae9a'; g.lineWidth = 1; g.beginPath(); g.moveTo(8, -164); g.lineTo(16, -166); g.stroke();
  },
  exec(g, tm) {
    limb(g, [60, 0, 56, -276], 6, '#3a2a1a');                                                         // the axe
    g.beginPath(); g.moveTo(56, -270); g.quadraticCurveTo(106, -278, 100, -214); g.quadraticCurveTo(84, -236, 58, -230); g.closePath(); g.fillStyle = '#8f959d'; g.fill();
    g.strokeStyle = '#e6eaee'; g.lineWidth = 2; g.beginPath(); g.moveTo(98, -268); g.quadraticCurveTo(104, -244, 99, -218); g.stroke();
    g.beginPath(); g.moveTo(-54, -240); g.quadraticCurveTo(-72, -110, -84, 0); g.lineTo(84, 0); g.quadraticCurveTo(72, -110, 54, -240); g.quadraticCurveTo(0, -256, -54, -240); g.closePath();
    g.fillStyle = lg(g, -240, 0, '#3a161a', '#090405'); g.fill();
    folds(g, [-56, -30, 34, 60], -140, -4, 0.3, 0.4);
    poly(g, [-30, -150, 30, -150, 40, 0, -40, 0], '#170b0a');                                         // leather apron
    g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1.5; for (const x of [-22, 0, 22]) { g.beginPath(); g.moveTo(x, -146); g.lineTo(x * 1.3, -4); g.stroke(); }
    g.fillStyle = '#2a1a12'; g.fillRect(-64, -158, 128, 13); poly(g, [-10, -162, 10, -162, 10, -141, -10, -141], '#b8924a', '#5a4424', 1.5); g.fillStyle = '#2a1a12'; g.fillRect(-5, -157, 10, 11);
    limb(g, [18, -146, 22, -96, 16, -84], 3.5, '#8a6b3f');                                             // rope end
    limb(g, [-50, -228, -64, -170], 24, '#2c1216'); limb(g, [-64, -164, -66, -126], 15, '#b0927c'); g.fillStyle = '#2a1a12'; g.fillRect(-75, -138, 18, 9); ell(g, -66, -116, 10, 11, '#b0927c');
    limb(g, [50, -228, 72, -186], 24, '#2c1216'); limb(g, [72, -182, 60, -150], 15, '#b0927c'); g.fillStyle = '#2a1a12'; g.fillRect(55, -168, 18, 9); ell(g, 58, -146, 10, 11, '#b0927c');
    limb(g, [59, -160, 58, -132], 6, '#3a2a1a');
  },
  harlequin(g, tm, o) {
    const jig = Math.sin(tm * 3.2), shake = Math.sin(tm * 11) * (0.5 + 0.5 * Math.sin(tm * 0.9));
    for (const [sx, cols] of [[-1, ['#a8262b', '#15121a']], [1, ['#1f6f6a', '#c9a24a']]]) {             // legs in two colours
      g.save(); g.beginPath(); const x = sx * 13; g.moveTo(x - 10, -134); g.lineTo(x + 10, -134); g.lineTo(x + 7 + sx * 3, -8); g.lineTo(x - 7 + sx * 3, -8); g.closePath(); g.clip();
      g.fillStyle = cols[1]; g.fillRect(-40, -140, 80, 140); diamonds(g, x - 14, -134, x + 14, -8, 16, cols); g.restore();
      const fx = x + sx * 3;                                                                          // pointed shoe with a bell
      g.fillStyle = '#15121a'; g.beginPath(); g.moveTo(fx - sx * 8, -10); g.lineTo(fx - sx * 8, 0); g.lineTo(fx + sx * 22, 0); g.quadraticCurveTo(fx + sx * 30, -4, fx + sx * 26, -12); g.quadraticCurveTo(fx + sx * 12, -4, fx + sx * 6, -10); g.closePath(); g.fill();
      ell(g, fx + sx * 27, -13, 3, 3, '#e9c05a');
    }
    g.save(); g.beginPath(); g.moveTo(-32, -238); g.lineTo(-22, -152); g.lineTo(-36, -122); g.lineTo(36, -122); g.lineTo(22, -152); g.lineTo(32, -238); g.quadraticCurveTo(0, -248, -32, -238); g.closePath(); g.clip();
    g.fillStyle = '#15121a'; g.fillRect(-40, -250, 80, 130); diamonds(g, -40, -240, 40, -120, 24, ['#a8262b', '#1f6f6a', '#c9a24a', '#15121a']); g.restore();
    g.fillStyle = '#0c0a0e'; g.fillRect(-24, -157, 48, 9); ell(g, 0, -152.5, 6, 6, '#e9c05a');
    limb(g, [-30, -226, -54, -184, -28, -152], 12, '#a8262b'); ell(g, -32, -226, 12, 10, '#a8262b'); ell(g, -26, -150, 7, 7, '#e6c6a4');
    g.save(); g.translate(30, -226); g.rotate(shake * 0.05);                                           // the arm that shows off the bracelet
    limb(g, [0, 0, 26, 14, 32, -30], 12, '#1f6f6a'); ell(g, 2, 0, 12, 10, '#1f6f6a'); ell(g, 33, -40, 7, 8, '#e6c6a4');
    g.strokeStyle = '#f0c95a'; g.lineWidth = 3.5; g.beginPath(); g.ellipse(32, -28, 8.5, 3.6, 0.1, 0, 7); g.stroke(); ell(g, 37, -28, 2, 2, '#a8262b');
    const sp = 0.5 + 0.5 * Math.sin(tm * 6); g.strokeStyle = `rgba(255,240,180,${sp})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(26, -44 - sp * 4); g.lineTo(26, -36 + sp * 4); g.moveTo(22 - sp * 4, -40); g.lineTo(30 + sp * 4, -40); g.stroke();
    g.restore();
    for (let i = -2; i <= 2; i++) { ell(g, i * 13, -240 + Math.abs(i) * 3, 11, 8, '#f3eee2'); g.strokeStyle = 'rgba(90,80,70,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(i * 13, -246 + Math.abs(i) * 3); g.lineTo(i * 13, -234 + Math.abs(i) * 3); g.stroke(); }
    return { bounce: Math.abs(jig) * 3 };
  },
  fox(g, tm) {
    const sw = Math.sin(tm * 0.8) * 3;
    g.beginPath(); g.moveTo(-20, -152); g.quadraticCurveTo(-104, -124, -112 + sw, 0); g.lineTo(112 + sw, 0); g.quadraticCurveTo(104, -124, 20, -152); g.closePath();
    g.fillStyle = lg(g, -152, 0, '#cf5d1f', '#5c1f08'); g.fill();
    folds(g, [-70, -44, -18, 18, 44, 70], -128, -6, 0.25, 0.28);
    g.strokeStyle = 'rgba(255,200,150,.14)'; g.lineWidth = 2; for (const x of [-56, -30, 30, 56]) { g.beginPath(); g.moveTo(x * 0.5, -140); g.quadraticCurveTo(x * 0.9, -70, x * 1.2 + sw, -6); g.stroke(); }
    for (const [y, a] of [[-44, 0.85], [-2, 1]]) {                                                    // two rows of lace flounce
      const hw = 112 * (1 + y / 400) - (y < -20 ? 16 : 0);
      g.strokeStyle = '#f1e6d2'; g.lineWidth = 3; g.globalAlpha = a; g.beginPath();
      for (let i = 0; i < 11; i++) { const x = -hw + i * hw * 2 / 11 + sw * (1 + y / 200); g.moveTo(x, y); g.quadraticCurveTo(x + hw / 11, y + 9, x + hw * 2 / 11, y); } g.stroke(); g.globalAlpha = 1;
    }
    g.beginPath(); g.moveTo(-27, -232); g.lineTo(-18, -152); g.lineTo(18, -152); g.lineTo(27, -232); g.quadraticCurveTo(0, -222, -27, -232); g.closePath(); g.fillStyle = '#a3421a'; g.fill();
    g.strokeStyle = '#e9c05a'; g.lineWidth = 1.2; for (let y = -214; y < -160; y += 11) { g.beginPath(); g.moveTo(-6, y); g.lineTo(6, y + 6); g.moveTo(6, y); g.lineTo(-6, y + 6); g.stroke(); }
    poly(g, [-17, -240, 17, -240, 22, -229, -22, -229], '#f0d9c6'); g.fillStyle = '#f0d9c6'; g.fillRect(-7, -250, 14, 14); g.fillStyle = '#0c0a0e'; g.fillRect(-8, -243, 16, 4);
    limb(g, [-28, -222, -36, -184, -14, -162], 13, '#b84c1c'); limb(g, [28, -222, 36, -184, 14, -162], 13, '#b84c1c');
    for (const sx of [-1, 1]) {                                                                      // fur stole
      g.beginPath(); g.moveTo(sx * 12, -238); g.quadraticCurveTo(sx * 46, -236, sx * 44, -190); g.quadraticCurveTo(sx * 42, -166, sx * 30, -160); g.quadraticCurveTo(sx * 30, -214, sx * 12, -224); g.closePath(); g.fillStyle = '#b8480f'; g.fill();
      for (let i = 0; i < 26; i++) { const u = fh(i + sx * 31), x = sx * (16 + u * 28), y = -234 + fh(i * 5 + 2) * 70; g.strokeStyle = ['#8f3a0c', '#e9a060', '#f1e6d2'][i % 3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * 3, y + 7); g.stroke(); }
    }
    ell(g, 0, -160, 27, 15, '#b8480f'); ell(g, -25, -160, 6, 13, '#f1e6d2'); ell(g, 25, -160, 6, 13, '#f1e6d2');     // muff
    for (let i = 0; i < 22; i++) { const x = -20 + fh(i + 90) * 40, y = -170 + fh(i * 3 + 91) * 20; g.strokeStyle = i % 2 ? '#8f3a0c' : '#e9a060'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 6); g.stroke(); }
    g.save(); g.translate(8, -148); g.rotate(Math.sin(tm * 1.3) * 0.12); limb(g, [0, 0, 0, 22], 1.2, '#e9c05a'); poly(g, [-3, 22, 3, 22, 4, 54, -4, 54], '#f1e6d2', '#8a6b3f', 1); limb(g, [0, 54, 0, 62], 1.5, '#a8262b'); g.restore();   // closed fan on a cord
  },
  owl(g, tm) {
    poly(g, [-36, -112, -8, -112, -14, -40, -32, -48], '#33231a'); poly(g, [36, -112, 8, -112, 14, -40, 32, -48], '#33231a');       // coat tails
    for (const sx of [-1, 1]) {
      poly(g, [sx * 3, -90, sx * 21, -90, sx * 19, -46, sx * 5, -46], '#3a2818'); poly(g, [sx * 5, -46, sx * 19, -46, sx * 17, -8, sx * 7, -8], '#e9dcc0');
      ell(g, sx * 13, -5, 15, 6, '#0c0a0e'); g.fillStyle = '#c9973a'; g.fillRect(sx * 13 - 4, -10, 8, 5);
    }
    ell(g, 0, -138, 46, 58, '#5c452f'); ell(g, 0, -132, 27, 46, '#8a6b3f');
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -176); g.lineTo(0, -88); g.stroke();
    for (const y of [-160, -140, -120, -100]) { ell(g, 0, y, 3, 3, '#c9973a'); }
    g.strokeStyle = '#e9c05a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-18, -128); g.quadraticCurveTo(-4, -108, 14, -122); g.stroke();
    poly(g, [-28, -180, -44, -150, -22, -100, -20, -168], '#3a2818'); poly(g, [28, -180, 44, -150, 22, -100, 20, -168], '#3a2818');   // lapels
    poly(g, [-10, -188, 10, -188, 6, -172, 0, -160, -6, -172], '#f3ecda', '#b9ab8c', 1);
    limb(g, [34, -182, -30, -96], 5, '#2a1a12');                                                       // satchel strap and satchel
    poly(g, [-48, -104, -16, -104, -14, -74, -50, -74], '#4a3020', '#2a1a12', 1.5); poly(g, [-48, -104, -16, -104, -18, -90, -46, -90], '#5a3c28'); ell(g, -32, -90, 3, 3, '#c9973a');
    limb(g, [-38, -178, -58, -142, -42, -116], 14, '#5c452f'); ell(g, -40, -112, 7, 7, '#e0c2a2');
    const flap = Math.sin(tm * 2.1) * 0.08;                                                           // the hand with the letter
    limb(g, [38, -178, 60, -146, 50, -122], 14, '#5c452f'); ell(g, 50, -118, 7, 7, '#e0c2a2');
    g.save(); g.translate(56, -124); g.rotate(-0.35 + flap); poly(g, [-4, -12, 26, -12, 26, 8, -4, 8], '#f3ecda', '#b9ab8c', 1); g.strokeStyle = '#b9ab8c'; g.lineWidth = 1; g.beginPath(); g.moveTo(-4, -12); g.lineTo(11, 0); g.lineTo(26, -12); g.stroke(); ell(g, 11, 1, 3.5, 3.5, '#a8262b'); g.restore();
    return { tilt: Math.sin(tm * 0.7 + 1) * 0.13 };
  },
  raven(g, tm) {
    const sw = Math.sin(tm * 0.6) * 2;
    g.beginPath(); g.moveTo(-36, -252); g.quadraticCurveTo(-44, -120, -64 + sw, -6);
    for (let i = -5; i <= 5; i++) g.lineTo(i * 12.8 + sw, i & 1 ? -8 : 2);                            // ragged, feathered hem
    g.lineTo(64 + sw, -6); g.quadraticCurveTo(44, -120, 36, -252); g.quadraticCurveTo(0, -264, -36, -252); g.closePath();
    g.fillStyle = lg(g, -252, 0, '#201c28', '#050406'); g.fill();
    folds(g, [-38, -20, 22, 40], -200, -8, 0.45, 0.4);
    g.strokeStyle = 'rgba(140,140,210,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-30, -236); g.quadraticCurveTo(-40, -120, -56 + sw, -10); g.stroke();
    g.strokeStyle = '#040306'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -244); g.lineTo(sw * 0.5, -6); g.stroke();
    for (const y of [-214, -190]) ell(g, 5, y, 2.5, 2.5, '#8d8a93');
    for (let r = 0; r < 3; r++) for (let i = -3; i <= 3; i++) {                                         // feather mantle on the shoulders
      const x = i * 15 + (r & 1) * 7.5, y = -256 + r * 13 + Math.abs(x) * 0.1; if (Math.abs(x) > 50) continue;
      poly(g, [x - 8, y, x + 8, y, x, y + 22], r & 1 ? '#262132' : '#1a1722', '#3a3550', 0.8);
    }
    poly(g, [-18, -250, -8, -278, -4, -246], '#0b090e', '#2f2a3c', 1); poly(g, [18, -250, 8, -278, 4, -246], '#0b090e', '#2f2a3c', 1);
    limb(g, [0, -150, 0, 0], 4.5, '#0c0a0e'); g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-1.5, -140); g.lineTo(-1.5, -6); g.stroke();    // cane
    limb(g, [-33, -238, -42, -186, -8, -154], 13, '#17141d'); limb(g, [33, -238, 42, -186, 8, -154], 13, '#17141d');
    ell(g, -6, -152, 8, 7, '#2a2632'); ell(g, 6, -156, 8, 7, '#322d3c');
    ell(g, 0, -164, 7, 7, '#b9b6c0'); poly(g, [3, -167, 15, -162, 3, -159], '#8d8a93'); ell(g, -2, -166, 2, 2, '#fff');                                                     // silver raven-head knob
  },
};

// o: { um, walk, face (-1/1: which way the figure turns), lit (-1/1: which side the light comes from) }
function figure(g, k, x, gy, tm, o = {}) {
  const F = FIG[k], h = F.h, face = o.face < 0 ? -1 : 1, lit = o.lit > 0 ? 1 : -1;
  const bob = o.walk ? Math.abs(Math.sin(tm * 9)) * 6 : Math.sin(tm * 1.8 + F.ph) * 1.5;
  const sway = o.walk ? Math.sin(tm * 9) * 0.02 : Math.sin(tm * 1.1 + F.ph) * 0.011;
  ell(g, x, gy + 6, F.hem * 0.95, 11, 'rgba(0,0,0,.5)');

  fb.setTransform(1, 0, 0, 1, 0, 0); fb.globalCompositeOperation = 'source-over'; fb.globalAlpha = 1; fb.clearRect(0, 0, FW, FH);
  fb.translate(FOX_, FOY); fb.scale(face, 1); fb.rotate(sway * face);
  const extra = BODY[k](fb, tm, o) || {};
  const hy = -h + F.head - (extra.bounce || 0) * 0.3, turn = 3;                                       // the head turns a little towards whoever it faces
  fb.save(); fb.translate(turn, hy); fb.rotate(extra.tilt || 0);
  if (o.um) drawFace(fb, k, 0, 0, F.head * 0.96); else drawMask(fb, k, 0, 0, F.head * 1.05);
  fb.restore();
  if (o.um && F.maskAt) { fb.save(); fb.translate(F.maskAt[0], F.maskAt[1]); fb.rotate(F.maskAt[2]); drawMask(fb, k, 0, 0, F.head * 0.6); fb.restore(); }

  // light: warm on the lit side, shadow on the far side, darker towards the floor, thin cool rim
  fb.setTransform(1, 0, 0, 1, 0, 0); fb.globalCompositeOperation = 'source-atop';
  const gr = fb.createLinearGradient(FOX_ - lit * 90, 0, FOX_ + lit * 90, 0);
  gr.addColorStop(0, 'rgba(6,3,12,.5)'); gr.addColorStop(0.45, 'rgba(6,3,12,0)'); gr.addColorStop(0.6, 'rgba(255,196,120,0)'); gr.addColorStop(1, `rgba(255,196,120,${0.2 * flick(tm, F.ph)})`);
  fb.fillStyle = gr; fb.fillRect(0, 0, FW, FH);
  fb.fillStyle = lg(fb, FOY - 110, FOY, 'rgba(4,2,8,0)', 'rgba(4,2,8,.4)'); fb.fillRect(0, 0, FW, FH);
  fr.globalCompositeOperation = 'source-over'; fr.clearRect(0, 0, FW, FH); fr.drawImage(figCv, 0, 0);
  fr.globalCompositeOperation = 'destination-out'; fr.drawImage(figCv, lit * 2.5, 1);
  fr.globalCompositeOperation = 'source-in'; fr.fillStyle = '#9fb0ff'; fr.fillRect(0, 0, FW, FH);
  fb.globalCompositeOperation = 'lighter'; fb.globalAlpha = 0.45; fb.drawImage(figRim, 0, 0); fb.globalAlpha = 1; fb.globalCompositeOperation = 'source-over';

  g.drawImage(figCv, x - FOX_, gy - FOY - bob - (extra.bounce || 0));
}

// which way a figure in the current room turns and where its light comes from
function figOpts(wx, base) {
  let best = null, bd = 1e9;
  for (const l of LIGHTS[S.room].list) { if (l.kind === 'fill') continue; const d = Math.abs(l.x - wx); if (d < bd) { bd = d; best = l; } }
  return Object.assign({ lit: best && best.x < wx ? -1 : 1 }, base);
}

// ---------- review page: index.html?figures shows every figure, masked and unmasked ----------
if (location.search.includes('figures')) addEventListener('load', () => {
  const cn = document.createElement('canvas'); cn.width = 1280; cn.height = 720;
  cn.style.cssText = 'position:fixed;left:0;top:0;z-index:99;width:100vw;height:56.25vw;background:#2a1a22';
  document.body.appendChild(cn); const g = cn.getContext('2d'), ks = ['white', 'exec', 'harlequin', 'fox', 'owl', 'raven'];
  const paint = tm => {
    g.fillStyle = '#3a2028'; g.fillRect(0, 0, 1280, 720); g.fillStyle = '#5a4a3a'; g.fillRect(0, 340, 1280, 20); g.fillRect(0, 700, 1280, 20);
    ks.forEach((k, i) => { figure(g, k, 120 + i * 208, 344, tm, { face: i % 2 ? -1 : 1, lit: -1, walk: false }); if (k !== 'white') figure(g, k, 120 + i * 208, 704, tm, { um: true, face: 1, lit: 1 }); });
  };
  const tick = now => { paint(now / 1000); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  window.__figDraw = paint;
});
