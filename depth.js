// Depth: an out-of-focus foreground (drapes, crowd, furniture), haze on the back wall, parallax in the ballroom.
// Loaded after game.js and light.js; uses c, W, H, FLOOR, WORLD, S, TM, ell, poly, glow, flick.
'use strict';
const FG_PAR = 1.4;                                        // the foreground slides faster than the room
const DRAPE = { hall: ['#2a0a12', '#5a1a26'], buffet: ['#0a2020', '#1c4a48'], cards: ['#0a1c10', '#1e4a2a'], gallery: ['#180c22', '#3c2456'] };
const HAZE = { hall: '120,60,70', buffet: '90,150,150', cards: '110,150,110', gallery: '120,80,160' };
const SIL = '#06040a';
const FG = {};                                             // room -> pre-blurred foreground canvas
const FG_FLAMES = { buffet: [[1052, 566], [1082, 548], [1112, 566]], gallery: [[236, 590], [1016, 604]], hall: [], cards: [] };

function fgHead(g, x, y, s, kind) {
  ell(g, x, y + 78 * s, 66 * s, 50 * s, SIL); g.fillStyle = SIL; g.fillRect(x - 9 * s, y + 14 * s, 18 * s, 26 * s); ell(g, x, y, 22 * s, 27 * s, SIL);
  if (kind === 'tricorn') poly(g, [x - 44 * s, y - 14 * s, x, y - 48 * s, x + 44 * s, y - 14 * s, x, y - 24 * s], SIL);
  else if (kind === 'tophat') { g.fillRect(x - 18 * s, y - 66 * s, 36 * s, 48 * s); ell(g, x, y - 20 * s, 32 * s, 6 * s, SIL); }
  else if (kind === 'plumes') for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) { g.save(); g.translate(x, y - 16 * s); g.rotate(a); ell(g, 0, -30 * s, 5 * s, 30 * s, SIL); g.restore(); }
  else if (kind === 'updo') { ell(g, x, y - 26 * s, 22 * s, 18 * s, SIL); ell(g, x + 4 * s, y - 46 * s, 12 * s, 11 * s, SIL); g.save(); g.translate(x + 12 * s, y - 50 * s); g.rotate(0.5); ell(g, 0, -22 * s, 6 * s, 24 * s, SIL); g.restore(); }
  else if (kind === 'horns') { poly(g, [x - 18 * s, y - 16 * s, x - 34 * s, y - 60 * s, x - 4 * s, y - 24 * s], SIL); poly(g, [x + 18 * s, y - 16 * s, x + 34 * s, y - 60 * s, x + 4 * s, y - 24 * s], SIL); }
}
function fgFan(g, x, y, s) { g.fillStyle = SIL; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 62 * s, -2.5, -0.9); g.closePath(); g.fill(); }
function drape(g, x, side, w, cols, top = 0) {                 // a heavy curtain hanging down one edge
  const gr = g.createLinearGradient(x, 0, x + side * w, 0); gr.addColorStop(0, cols[0]); gr.addColorStop(0.55, cols[1]); gr.addColorStop(1, cols[0]);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x, top);
  g.lineTo(x + side * w * 0.9, top); g.quadraticCurveTo(x + side * w * 1.15, 260, x + side * w * 0.7, 430); g.quadraticCurveTo(x + side * w * 0.45, 600, x + side * w * 0.95, H); g.lineTo(x, H); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 5; for (const f of [0.25, 0.5, 0.72]) { g.beginPath(); g.moveTo(x + side * w * f, top); g.quadraticCurveTo(x + side * w * f * 1.2, 300, x + side * w * f * 0.8, H); g.stroke(); }
  g.strokeStyle = '#8a6b2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 432); g.quadraticCurveTo(x + side * w * 0.4, 452, x + side * w * 0.72, 428); g.stroke();    // tie-back
}
function valance(g, width, cols) {                            // scalloped pelmet along the top
  for (let x = -40; x < width + 200; x += 200) {
    const gr = g.createLinearGradient(0, 0, 0, 80); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 200, 0); g.lineTo(x + 200, 34); g.quadraticCurveTo(x + 100, 96, x, 34); g.closePath(); g.fill();
    g.strokeStyle = '#8a6b2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 200, 34); g.quadraticCurveTo(x + 100, 96, x, 34); g.stroke();
    g.fillStyle = '#8a6b2a'; g.fillRect(x - 3, 30, 6, 30); ell(g, x, 64, 6, 9, '#8a6b2a');
  }
}
function buildFg(room) {
  const width = W + (WORLD[room].w - W) * FG_PAR + 40;
  const raw = document.createElement('canvas'); raw.width = width; raw.height = H; const g = raw.getContext('2d'), cols = DRAPE[room];
  valance(g, width, cols);
  if (room === 'hall') {
    const kinds = ['tricorn', 'plumes', 'tophat', 'updo', 'horns', 'plumes', 'tricorn', 'updo'];
    kinds.forEach((kd, i) => { const x = 150 + i * 400 + (i % 3) * 46, s = 1.3 + (i % 2) * 0.15; fgHead(g, x, 694 + (i % 3) * 10, s, kd); if (i % 3 === 1) fgFan(g, x + 100, 740, s); });
  } else if (room === 'buffet') {
    drape(g, 0, 1, 84, cols, 30);
    for (let i = 0; i < 9; i++) { g.save(); g.translate(60, 700); g.rotate(-1.25 + i * 0.3); ell(g, 0, -112, 13, 112, SIL); g.restore(); }     // palm in a tub
    ell(g, 60, 716, 60, 34, SIL);
    g.fillStyle = SIL; g.fillRect(1004, 640, 160, 12); g.fillRect(1076, 650, 14, 80);                                                    // little table with a candelabrum
    g.fillRect(1079, 566, 6, 76); g.strokeStyle = SIL; g.lineWidth = 6; g.beginPath(); g.moveTo(1052, 596); g.quadraticCurveTo(1082, 632, 1112, 596); g.stroke();
    for (const [x, y] of FG_FLAMES.buffet) g.fillRect(x - 4, y + 6, 8, 30);
    g.beginPath(); g.moveTo(1190, H); g.lineTo(1186, 628); g.quadraticCurveTo(1236, 596, 1284, 628); g.lineTo(1284, H); g.closePath(); g.fillStyle = SIL; g.fill();   // chair back
  } else if (room === 'cards') {
    drape(g, W + 0, -1, 84, cols, 30);
    fgHead(g, 236, 640, 1.7, 'tophat'); g.fillStyle = SIL; g.fillRect(120, 700, 240, 30);
    fgHead(g, 1010, 656, 1.6, 'none'); ell(g, 1010, 632, 30, 12, SIL);
    g.save(); g.translate(1066, 668); g.rotate(-0.3); g.fillRect(0, -3, 34, 6); g.restore();                                               // cigar
  } else if (room === 'gallery') {
    drape(g, 0, 1, 112, cols, 30); drape(g, W, -1, 44, cols, 30);
    for (const [x, y] of FG_FLAMES.gallery) { g.fillStyle = SIL; g.fillRect(x - 9, y + 12, 18, 140); ell(g, x, y + 14, 16, 6, SIL); }
  }
  const out = document.createElement('canvas'); out.width = width; out.height = H; const o = out.getContext('2d');
  o.filter = 'blur(2.6px)'; o.drawImage(raw, 0, 0); o.filter = 'none';
  return out;
}

// Haze where the wall meets the floor pushes the back of the room away.
function backHaze() {
  const gr = c.createLinearGradient(0, FLOOR - 150, 0, FLOOR + 46);
  gr.addColorStop(0, `rgba(${HAZE[S.room]},0)`); gr.addColorStop(0.75, `rgba(${HAZE[S.room]},.16)`); gr.addColorStop(1, `rgba(${HAZE[S.room]},0)`);
  c.fillStyle = gr; c.fillRect(0, FLOOR - 150, W, 196);
}
// The out-of-focus foreground, drawn over the figures.
function fgLayer(cam, ow) {
  const cv2 = FG[S.room] || (FG[S.room] = buildFg(S.room));
  c.save(); c.globalAlpha = 1 - ow * 0.5; c.drawImage(cv2, -cam * FG_PAR, 0); c.restore();
}
// Candle flames in the foreground: big soft discs, as a lens would blur them. Drawn after the darkness.
function fgGlow(cam, lift, strength) {
  for (const [x, y] of FG_FLAMES[S.room]) {
    const fl = flick(TM, x), sx = x - cam * FG_PAR, sy = y - lift;
    glow(c, sx, sy, 70, 'rgba(255,190,100,A)', 0.4 * fl * strength);
    c.save(); c.globalAlpha = 0.85 * strength; ell(c, sx, sy, 9 + fl * 3, 13 + fl * 4, '#ffd98a'); ell(c, sx, sy + 2, 4, 7, '#fff6d8'); c.restore();
  }
}
