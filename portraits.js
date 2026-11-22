// Dialogue portraits: lit, animated busts drawn in code.
// Loaded after game.js; uses its helpers (ell, poly, glow, flick, drawMask, drawFace, S, NPC).
'use strict';
const PW = 260, PH = 360, CX = 130;
const mk = () => { const cn = document.createElement('canvas'); cn.width = PW; cn.height = PH; return cn; };
const pbuf = mk(), pb = pbuf.getContext('2d');      // the bust before it is put on the panel
const prim = mk(), pr = prim.getContext('2d');      // rim-light scratch
const hatchCv = document.createElement('canvas'); hatchCv.width = hatchCv.height = 7;
{ const h = hatchCv.getContext('2d'); h.strokeStyle = '#000'; h.lineWidth = 1; h.beginPath(); h.moveTo(-1, 8); h.lineTo(8, -1); h.stroke(); }
const hatch = pb.createPattern(hatchCv, 'repeat');

// where the head sits and how big it is, per character
const HEAD = {
  exec: { y: 152, s: 58 }, harlequin: { y: 168, s: 56 }, fox: { y: 164, s: 62 }, owl: { y: 162, s: 64 },
  raven: { y: 142, s: 54 }, devil: { y: 170, s: 72 }, face: { y: 160, s: 62 },
};
const TINT = { exec: '58,18,22', harlequin: '42,32,60', fox: '60,36,20', owl: '46,40,24', raven: '28,26,48', devil: '110,14,18', body: '29,58,54' };
const hash = i => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

function shoulders(g, top, wide, fill) {
  g.beginPath(); g.moveTo(CX - wide, PH); g.quadraticCurveTo(CX - wide - 4, top + 26, CX - 46, top);
  g.lineTo(CX + 46, top); g.quadraticCurveTo(CX + wide + 4, top + 26, CX + wide, PH); g.closePath();
  g.fillStyle = fill; g.fill();
}
const vgrad = (g, y0, y1, c0, c1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };

// ---------- costumes from the shoulders down ----------
function bustBody(g, k, bare) {
  if (k === 'exec') {
    shoulders(g, 232, 120, vgrad(g, 230, PH, '#431519', '#0d0506'));
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
    for (const x of [-70, -30, 36, 78]) { g.beginPath(); g.moveTo(CX + x, 262); g.quadraticCurveTo(CX + x * 1.1, 310, CX + x * 1.2, PH); g.stroke(); }
    poly(g, [44, 262, 62, 252, 214, PH, 190, PH], '#2a1a12', '#120a06', 2);                 // leather strap
    poly(g, [112, 300, 132, 292, 142, 312, 122, 320], '#b8924a', '#5a4424', 2); poly(g, [119, 303, 130, 299, 135, 310, 124, 314], '#2a1a12');
    if (bare) { g.fillStyle = '#c9ad94'; g.fillRect(CX - 17, 204, 34, 40); }
  } else if (k === 'harlequin') {
    shoulders(g, 240, 104, '#15121a');
    g.save(); g.clip();
    for (let i = -5; i <= 5; i++) for (let j = 0; j < 6; j++) {
      const dx = CX + i * 30 + (j & 1) * 15, dy = 246 + j * 26;
      poly(g, [dx, dy - 13, dx + 15, dy, dx, dy + 13, dx - 15, dy], ['#a8262b', '#1f6f6a', '#c9a24a', '#15121a'][(i + j * 3 + 20) % 4]);
    }
    g.restore();
    g.fillStyle = '#e6c6a4'; g.fillRect(CX - 15, 208, 30, 36);
    for (let r = 0; r < 2; r++) for (let i = -4; i <= 4; i++) {                              // ruff
      const x = CX + i * (20 - r * 3), y = 246 - r * 9 + Math.abs(i) * (3 - r);
      ell(g, x, y, 16 - r * 3, 11 - r * 2, r ? '#fbf8f0' : '#e4ddcf');
      g.strokeStyle = 'rgba(90,80,70,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 9 + r * 2); g.lineTo(x, y + 9 - r * 2); g.stroke();
    }
  } else if (k === 'fox') {
    shoulders(g, 234, 98, '#f0d9c6');
    g.fillStyle = '#f0d9c6'; g.fillRect(CX - 15, 208, 30, 34);
    g.beginPath(); g.moveTo(CX - 104, PH); g.lineTo(CX - 74, 286); g.quadraticCurveTo(CX, 326, CX + 74, 286); g.lineTo(CX + 104, PH); g.closePath();
    g.fillStyle = vgrad(g, 286, PH, '#d0611f', '#6a240a'); g.fill();
    g.strokeStyle = '#f1e6d2'; g.lineWidth = 2; g.beginPath(); g.moveTo(CX - 74, 286); g.quadraticCurveTo(CX, 326, CX + 74, 286); g.stroke();
    g.fillStyle = '#0c0a0e'; g.fillRect(CX - 16, 226, 32, 8); ell(g, CX, 236, 5, 6, '#8f1d22'); ell(g, CX - 1.5, 234, 1.5, 2, 'rgba(255,200,200,.8)');   // mourning ribbon with a garnet
    for (const sx of [-1, 1]) {                                                              // fur stole
      g.beginPath(); g.moveTo(CX + sx * 44, 238); g.quadraticCurveTo(CX + sx * 118, 250, CX + sx * 112, PH); g.lineTo(CX + sx * 70, PH); g.quadraticCurveTo(CX + sx * 78, 280, CX + sx * 40, 256); g.closePath();
      g.fillStyle = '#b8480f'; g.fill();
      for (let i = 0; i < 70; i++) {
        const u = hash(i + sx * 50), v = hash(i * 3 + 7), x = CX + sx * (46 + u * 64), y = 242 + u * u * 96 + v * 26;
        g.strokeStyle = ['#8f3a0c', '#e9a060', '#f1e6d2', '#c9581c'][i % 4]; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * (3 + v * 5), y + 10 + v * 6); g.stroke();
      }
    }
  } else if (k === 'owl') {
    shoulders(g, 240, 112, vgrad(g, 238, PH, '#5c452f', '#241810'));
    g.fillStyle = '#d9c9a8'; g.fillRect(CX - 16, 212, 32, 34);
    poly(g, [CX - 26, 240, CX + 26, 240, CX + 10, 318, CX - 10, 318], '#efe6d0');           // shirt front
    poly(g, [CX - 14, 244, CX + 14, 244, CX + 8, 262, CX, 284, CX - 8, 262], '#f7f1e2', '#b9ab8c', 1); ell(g, CX, 250, 9, 6, '#e2d6bb');   // cravat
    poly(g, [CX - 30, 238, CX - 8, 318, CX - 66, PH, CX - 100, PH, CX - 60, 258], '#3a2818'); poly(g, [CX + 30, 238, CX + 8, 318, CX + 66, PH, CX + 100, PH, CX + 60, 258], '#3a2818');
    for (const y of [330, 348]) { ell(g, CX, y, 4, 4, '#c9973a'); ell(g, CX - 1, y - 1, 1.3, 1.3, '#fff0c0'); }
    g.strokeStyle = '#4a3524'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.arc(CX + i * 18, 238 + Math.abs(i) * 2, 10, 0.1, Math.PI - 0.1); g.stroke(); }
  } else if (k === 'raven') {
    shoulders(g, 230, 122, vgrad(g, 230, PH, '#17141d', '#050407'));
    g.save(); g.clip();
    for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) {                               // feather mantle
      const x = CX - 121 + i * 22 + (r & 1) * 11, y = 246 + r * 27 + Math.abs(x - CX) * 0.1;
      poly(g, [x - 11, y, x + 11, y, x, y + 34], r & 1 ? '#221e2c' : '#191620', '#3a3550', 1);
      g.strokeStyle = 'rgba(120,120,190,.28)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x, y + 28); g.stroke();
    }
    g.restore();
    poly(g, [CX - 46, 236, CX - 20, 196, CX - 12, 252], '#0b090e', '#2f2a3c', 1); poly(g, [CX + 46, 236, CX + 20, 196, CX + 12, 252], '#0b090e', '#2f2a3c', 1);
    if (bare) { g.fillStyle = '#b9a99c'; g.fillRect(CX - 13, 204, 26, 40); }
    ell(g, CX, 250, 8, 8, '#8d8a93'); ell(g, CX, 250, 4.5, 4.5, '#3d0c10'); ell(g, CX - 2, 248, 1.5, 1.5, '#fff');
  } else if (k === 'devil') {
    shoulders(g, 250, 128, vgrad(g, 250, PH, '#1a0507', '#050102'));
  }
}

// small living details drawn over the mask after lighting: eyes in the slits, glints, blinks
function maskEyes(g, k, x, y, s, tm) {
  const cyc = (tm * 0.9 + s) % 4.6, blink = cyc < 0.14 ? Math.abs(cyc - 0.07) / 0.07 : 1;
  const lx = Math.sin(tm * 0.37 + s) * 0.035 * s, ly = Math.sin(tm * 0.23) * 0.012 * s;
  const eyeAt = (ex, ey, r) => { ell(g, x + ex * s + lx, y + ey * s + ly, r * s, r * s * 0.62 * blink, 'rgba(238,228,210,.9)'); ell(g, x + ex * s + lx * 1.5, y + ey * s + ly, r * s * 0.5, r * s * 0.55 * blink, '#120a0c'); ell(g, x + ex * s + lx * 1.5 - r * s * 0.2, y + ey * s - r * s * 0.2, r * s * 0.16, r * s * 0.16 * blink, '#fff'); };
  if (k === 'exec') { eyeAt(-0.35, -0.175, 0.075); eyeAt(0.35, -0.175, 0.075); }
  else if (k === 'harlequin') { eyeAt(-0.36, -0.3, 0.085); eyeAt(0.36, -0.3, 0.085); }
  else if (k === 'fox') { eyeAt(-0.4, -0.22, 0.08); eyeAt(0.4, -0.22, 0.08); }
  else if (k === 'owl') {
    const pr2 = 0.165 + 0.025 * Math.sin(tm * 0.8);
    for (const sx of [-1, 1]) { ell(g, x + sx * 0.43 * s + lx, y - 0.15 * s, pr2 * s, pr2 * s * blink, '#050304'); ell(g, x + sx * 0.43 * s + lx - 0.05 * s, y - 0.2 * s, 0.035 * s, 0.035 * s * blink, 'rgba(255,255,255,.85)'); }
  } else if (k === 'raven') {
    for (const sx of [-1, 1]) {
      const gx = x + sx * 0.34 * s, gy = y - 0.32 * s;
      glow(g, gx, gy, 0.3 * s, 'rgba(255,60,40,A)', 0.22 + 0.12 * Math.sin(tm * 1.3 + sx));
      g.save(); g.beginPath(); g.arc(gx, gy, 0.17 * s, 0, 7); g.clip();
      g.fillStyle = 'rgba(255,225,190,.5)'; const sw = ((tm * 0.35 + (sx > 0 ? 0.15 : 0)) % 1) * 0.8 - 0.4;
      g.beginPath(); g.moveTo(gx + (sw - 0.05) * s, gy - 0.2 * s); g.lineTo(gx + (sw + 0.04) * s, gy - 0.2 * s); g.lineTo(gx + (sw - 0.06) * s, gy + 0.2 * s); g.lineTo(gx + (sw - 0.15) * s, gy + 0.2 * s); g.fill();
      g.restore();
    }
  } else if (k === 'devil') {
    for (const sx of [-1, 1]) glow(g, x + sx * 0.32 * s, y - 0.2 * s, 0.5 * s, 'rgba(255,110,40,A)', 0.45 * flick(tm, sx));
  }
}

// mode: undefined = follow the game state; 'mask' | 'face' | 'under' force a look (used by the review page)
function drawPortrait(g, k, w, h, tm = 0, mode) {
  g.setTransform(w / PW, 0, 0, h / PH, 0, 0);
  g.clearRect(0, 0, PW, PH);
  const under = mode ? mode === 'under' : (S.otherOn && S.otherWho === k);
  const bare = under || (mode ? mode === 'face' : !!S.unmasked[k]);
  const fl = flick(tm, 3);

  // backdrop: a soft dark halo so the bust reads against any room
  const halo = g.createRadialGradient(CX, 190, 30, CX, 190, 200);
  halo.addColorStop(0, `rgba(${under ? '120,8,14' : TINT[k] || '40,30,40'},.96)`); halo.addColorStop(0.7, 'rgba(8,5,10,.9)'); halo.addColorStop(1, 'rgba(8,5,10,0)');
  g.fillStyle = halo; g.fillRect(0, 0, PW, PH);

  if (k === 'body') {            // the glass on the little table and the shawl
    g.fillStyle = '#d9d2c2'; g.beginPath(); g.moveTo(10, 300); g.quadraticCurveTo(CX, 220, PW - 10, 306); g.lineTo(PW - 10, PH); g.lineTo(10, PH); g.fill();
    g.strokeStyle = 'rgba(120,110,100,.5)'; g.lineWidth = 2; for (const x of [60, 110, 170]) { g.beginPath(); g.moveTo(x, 290); g.quadraticCurveTo(x + 12, 320, x + 4, PH); g.stroke(); }
    g.strokeStyle = 'rgba(230,240,240,.85)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(96, 110); g.lineTo(110, 190); g.lineTo(150, 190); g.lineTo(164, 110); g.moveTo(CX, 190); g.lineTo(CX, 236); g.moveTo(104, 238); g.lineTo(156, 238); g.stroke();
    g.fillStyle = 'rgba(240,230,190,.5)'; g.beginPath(); g.moveTo(104, 156); g.lineTo(110, 190); g.lineTo(150, 190); g.lineTo(156, 156); g.fill();
    glow(g, CX, 160, 110, 'rgba(160,230,220,A)', 0.14 * fl);
  } else {
    const breath = Math.sin(tm * 1.4 + (HEAD[k] ? HEAD[k].s : 0)) * 1.3;
    const hd = bare ? { y: HEAD.face.y, s: HEAD.face.s } : HEAD[k];
    pb.setTransform(1, 0, 0, 1, 0, 0); pb.globalCompositeOperation = 'source-over'; pb.globalAlpha = 1; pb.clearRect(0, 0, PW, PH);
    if (under) { pb.save(); pb.globalAlpha = 0.5; pb.translate(CX, 62); pb.rotate(Math.PI + Math.sin(tm * 0.7) * 0.08); drawMask(pb, k, 0, 0, 30); pb.restore(); }
    if (k === 'devil') glow(g, CX, 170, 190, 'rgba(255,40,20,A)', 0.3 * fl);
    pb.save(); pb.translate(0, breath * 0.5); bustBody(pb, k, bare); pb.restore();
    if (bare) drawFace(pb, k, CX, hd.y + breath, hd.s); else drawMask(pb, k, CX, hd.y + breath, hd.s);
    if (bare && !under) { pb.save(); pb.translate(206, 318 + breath * 0.5); pb.rotate(0.35); drawMask(pb, k, 0, 0, 30); pb.restore(); }

    // light: warm candle from the left, deep shadow to the right, engraving hatch, cool rim
    pb.globalCompositeOperation = 'source-atop';
    const lg = pb.createLinearGradient(0, 0, PW, 0);
    lg.addColorStop(0, `rgba(255,196,120,${0.26 * fl})`); lg.addColorStop(0.42, 'rgba(255,196,120,0)'); lg.addColorStop(0.6, 'rgba(6,3,12,0)'); lg.addColorStop(1, 'rgba(6,3,12,.62)');
    pb.fillStyle = lg; pb.fillRect(0, 0, PW, PH);
    pb.fillStyle = vgrad(pb, 230, PH, 'rgba(6,3,12,0)', 'rgba(6,3,12,.5)'); pb.fillRect(0, 0, PW, PH);
    pb.globalAlpha = 0.08; pb.fillStyle = hatch; pb.fillRect(0, 0, PW, PH); pb.globalAlpha = 1;
    if (under) { pb.fillStyle = 'rgba(196,22,34,.6)'; pb.fillRect(0, 0, PW, PH); }
    pr.globalCompositeOperation = 'source-over'; pr.clearRect(0, 0, PW, PH); pr.drawImage(pbuf, 0, 0);
    pr.globalCompositeOperation = 'destination-out'; pr.drawImage(pbuf, -4, 1);
    pr.globalCompositeOperation = 'source-in'; pr.fillStyle = under ? '#ffb0a0' : '#aebcff'; pr.fillRect(0, 0, PW, PH);
    pb.globalCompositeOperation = 'lighter'; pb.globalAlpha = 0.6; pb.drawImage(prim, 0, 0); pb.globalAlpha = 1; pb.globalCompositeOperation = 'source-over';
    g.drawImage(pbuf, 0, 0);

    if (under) {                 // empty sockets with a pinprick of light
      for (const sx of [-1, 1]) { ell(g, CX + sx * 0.3 * hd.s, hd.y + breath - 0.2 * hd.s, 0.18 * hd.s, 0.14 * hd.s, '#050002'); ell(g, CX + sx * 0.3 * hd.s + Math.sin(tm * 2.1) * 1.5, hd.y + breath - 0.2 * hd.s, 1.8, 1.8, '#f4ead8'); }
    } else if (!bare) maskEyes(g, k, CX, hd.y + breath, hd.s, tm);
    if (k === 'devil') for (let i = 0; i < 9; i++) { const a = (tm * 0.25 + hash(i)) % 1; ell(g, 40 + hash(i + 9) * 180 + Math.sin(tm + i) * 8, PH - a * 260, 1.6, 1.6, `rgba(255,150,60,${0.8 * (1 - a)})`); }
  }
  // the bottom melts into the dialogue panel
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = vgrad(g, PH - 44, PH, 'rgba(0,0,0,0)', 'rgba(0,0,0,1)'); g.fillRect(0, PH - 44, PW, 44);
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ---------- review page: index.html?review shows every portrait in every state ----------
if (location.search.includes('review')) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99;overflow:auto;padding:20px 26px;background:#241a26;font:20px Georgia,serif;color:#ece3d0';
  wrap.innerHTML = '<h2 style="margin:0 0 6px;color:#c9a24a;font-weight:500">Portrait review</h2>';
  const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,200px);gap:6px 16px'; wrap.appendChild(grid);
  const cells = [];
  const add = (k, mode, cap) => {
    const d = document.createElement('div'); d.style.textAlign = 'center';
    const cn = document.createElement('canvas'); cn.width = PW; cn.height = PH; cn.style.cssText = 'width:200px;height:277px;display:block';
    d.appendChild(cn); d.appendChild(document.createTextNode(cap)); grid.appendChild(d); cells.push([cn.getContext('2d'), k, mode]);
  };
  for (const mode of ['mask', 'face', 'under']) for (const k of ['exec', 'harlequin', 'fox', 'owl', 'raven']) add(k, mode, MASKS[k].en + ' · ' + mode);
  add('devil', 'mask', 'The Voice'); add('body', 'mask', 'The body');
  document.body.appendChild(wrap);
  const tick = now => { cells.forEach(([g, k, mode]) => drawPortrait(g, k, PW, PH, now / 1000, mode)); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  window.__reviewDraw = tm => cells.forEach(([g, k, mode]) => drawPortrait(g, k, PW, PH, tm, mode));
}
