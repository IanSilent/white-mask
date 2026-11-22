// Room lighting: pools of candlelight cut out of the dark, figure shadows, floor reflections, dust.
// Loaded after game.js; uses its canvas (c, W, H), figure(), FIG, glow(), flick(), S, WORLD.
'use strict';
const WARM = '255,196,120';
// kind: 'top' = hangs overhead (also lights the floor), 'low' = candle or door glow
const LIGHTS = {
  hall: { dark: 0.7, list: [
    ...[520, 1040, 1560, 2080].map(x => ({ x, y: 120, r: 440, col: WARM, a: 0.13, kind: 'top' })),
    { x: 120, y: 290, r: 290, col: '120,190,180', a: 0.1, kind: 'low' }, { x: 1300, y: 290, r: 290, col: '160,90,210', a: 0.12, kind: 'low' }, { x: 2480, y: 290, r: 290, col: '120,200,140', a: 0.1, kind: 'low' },
  ] },
  buffet: { dark: 0.7, list: [
    { x: 850, y: 440, r: 380, col: WARM, a: 0.12, kind: 'low' }, { x: 170, y: 436, r: 320, col: WARM, a: 0.12, kind: 'low' },
    { x: 1180, y: 290, r: 290, col: '230,120,90', a: 0.1, kind: 'low' }, { x: 560, y: 260, r: 420, col: '120,200,190', a: 0.05, kind: 'fill' },
  ] },
  cards: { dark: 0.74, list: [
    ...[400, 760, 1090].map(x => ({ x, y: 380, r: 350, col: WARM, a: 0.1, kind: 'top' })),
    { x: 110, y: 290, r: 290, col: '230,120,90', a: 0.1, kind: 'low' },
  ] },
  gallery: { dark: 0.72, list: [
    { x: 520, y: 340, r: 460, col: '230,40,40', a: 0.12, kind: 'low' }, { x: 330, y: 440, r: 230, col: WARM, a: 0.1, kind: 'low' }, { x: 710, y: 440, r: 230, col: WARM, a: 0.1, kind: 'low' },
    { x: 1150, y: 290, r: 290, col: '230,150,90', a: 0.1, kind: 'low' },
  ] },
};
const lightCv = document.createElement('canvas'); lightCv.width = W; lightCv.height = H; const lc = lightCv.getContext('2d');
const reflCv = document.createElement('canvas'); reflCv.width = 360; reflCv.height = 400; const rc = reflCv.getContext('2d');
const lhash = i => { const x = Math.sin(i * 91.7) * 43758.5453; return x - Math.floor(x); };

// Drawn on the floor before the figures: light on the parquet, moonlight, shadows and reflections.
function floorFx(cam, ow) {
  const L = LIGHTS[S.room], R = WORLD[S.room];
  for (const l of L.list) if (l.kind === 'top') {
    c.save(); c.translate(l.x - cam, FLOOR + 78); c.scale(1, 0.3); glow(c, 0, 0, 340, `rgba(${l.col},A)`, 0.2 * flick(TM, l.x)); c.restore();
  }
  if (S.room === 'hall') for (const wx of [400, 950, 1650, 2200]) {          // moonlight through the tall windows
    const x = wx - cam; if (x < -260 || x > W + 260) continue;
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(110,140,255,.07)';
    c.beginPath(); c.moveTo(x - 66, 440); c.lineTo(x + 66, 440); c.lineTo(x + 60, H); c.lineTo(x - 190, H); c.fill(); c.restore();
  }
  const figs = R.npcs.filter(n => !(ow > 0.3 && n.k !== S.otherWho)).map(n => ({ k: n.k, x: n.x - cam, gy: GROUND - 14, o: figOpts(n.x, { um: S.unmasked[n.k], face: S.x < n.x ? -1 : 1 }) }));
  figs.push({ k: 'white', x: S.x - cam, gy: GROUND + 8, o: figOpts(S.x, { walk: S.walking, face: S.face }) });
  for (const f of figs) {
    // shadow thrown away from the nearest light
    let best = null, bd = 1e9;
    for (const l of L.list) { if (l.kind === 'fill') continue; const d = Math.abs(l.x - cam - f.x); if (d < bd) { bd = d; best = l; } }
    const dir = Math.sign(f.x - (best.x - cam)) || 1, len = Math.min(170, bd * 0.42);
    ell(c, f.x + dir * len * 0.55, f.gy + 9, FIG[f.k].hem * 0.85 + len * 0.55, 13, 'rgba(0,0,0,.38)');
    // faint reflection in the polished floor
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.globalAlpha = 1; rc.clearRect(0, 0, 360, 400);
    figure(rc, f.k, 180, 380, TM, f.o);
    c.save(); c.globalAlpha = 0.13; c.translate(f.x, f.gy + 8); c.scale(1, -0.42); c.drawImage(reflCv, -180, -380); c.restore();
  }
}

// Drawn over everything in the room: darkness with holes where the lights are, a tint per light, dust in the air.
function lightPass(cam, lift, strength) {
  if (strength <= 0.02) return;
  const L = LIGHTS[S.room];
  lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, W, H);
  lc.fillStyle = `rgba(6,4,12,${L.dark * strength})`; lc.fillRect(0, 0, W, H);
  lc.globalCompositeOperation = 'destination-out';
  for (const l of L.list) {
    const x = l.x - cam, y = l.y - lift, r = l.r * (0.95 + 0.07 * flick(TM, l.x * 0.01));
    if (x < -r || x > W + r) continue;
    const gr = lc.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    lc.fillStyle = gr; lc.fillRect(x - r, y - r, r * 2, r * 2);
  }
  c.drawImage(lightCv, 0, 0);
  for (const l of L.list) {
    const x = l.x - cam; if (x < -l.r || x > W + l.r) continue;
    glow(c, x, l.y - lift, l.r * 0.85, `rgba(${l.col},A)`, l.a * strength * flick(TM, l.x * 0.02));
  }
  c.save(); c.globalCompositeOperation = 'lighter';                        // dust drifting through the light
  for (let i = 0; i < 44; i++) {
    const x = ((lhash(i) * W + TM * 9 * (lhash(i + 3) - 0.5) - cam * 0.3) % W + W) % W, y = 70 + lhash(i + 7) * 470 + Math.sin(TM * 0.3 + i) * 12 - lift;
    c.fillStyle = `rgba(255,220,170,${(0.1 + 0.1 * Math.sin(TM * 0.9 + i * 2)) * strength})`; c.fillRect(x, y, 2, 2);
  }
  c.restore();
}
