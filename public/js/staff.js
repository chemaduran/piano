// Grabador de partituras en SVG con la tipografía musical Bravura (SMuFL).
//
// score = {
//   clef: 'treble' | 'bass' | 'grand',
//   time: [4, 4] | null        (null = notas sueltas, sin compases)
//   key: 0                     (nº de sostenidos; negativo = bemoles)
//   pickup: 0                  (pulsos de la anacrusa)
//   rh: [ev], lh: [ev]         (en pentagrama único se usa rh, o lh para clave de fa)
//   spans: [{ type: 'slur'|'cresc'|'dim'|'8va'|'ped'|'volta', v: 'rh', from, to, label }]
//   repeats: [{ from, to }]    (índices de compás)   ·   double: [índice de compás]
//   tempo: 'Allegro'           (texto sobre el primer compás)
// }
// ev = { p: 'C4' | ['C4','E4'] | null (silencio), d: pulsos (negra = 1), f: dedo, tie, dyn: 'mf',
//        stacc, accent, tenuto, fermata, text, mark: 'segno'|'coda'|'trill'|'breath'|'arp', label, hide }
import { parsePitch, noteName, keyAlterations, SHARP_ORDER, FLAT_ORDER } from './music.js';
import { svgEl } from './keyboard.js';

export const G = {
  gClef: '', fClef: '', brace: '', common: '',
  whole: '', half: '', black: '',
  flag8u: '', flag8d: '', flag16u: '', flag16d: '',
  flat: '', natural: '', sharp: '',
  restWhole: '', restHalf: '', restQuarter: '', rest8: '', rest16: '',
  p: '', m: '', f: '', pp: '', mp: '', mf: '', ff: '', ppp: '', fff: '', sfz: '',
  accentA: '', accentB: '', staccA: '', staccB: '', tenutoA: '', tenutoB: '',
  marcato: '', fermata: '', repeatDots: '', segno: '', coda: '',
  ped: '', pedUp: '', trill: '', mordent: '', turn: '', ottava: '',
  dot: '', breath: '', arp: '',
  nWhole: '', nHalf: '', nQuarter: '', n8: '', n16: '',
};
const digit = (n) => String(n).split('').map((c) => String.fromCharCode(0xe080 + Number(c))).join('');

/** Posición vertical de una nota: 0 = línea inferior del pentagrama, +1 por cada línea o espacio. */
export function staffPos(pitch, clef) {
  const n = typeof pitch === 'object' ? pitch : parsePitch(pitch);
  return n.dia - (clef === 'bass' ? 18 : 30);
}

const DUR = [
  [6, 'whole', 1], [4, 'whole', 0], [3, 'half', 1], [2, 'half', 0], [1.5, 'quarter', 1], [1, 'quarter', 0],
  [0.75, 'eighth', 1], [0.5, 'eighth', 0], [0.25, 'sixteenth', 0],
];
function durInfo(d) {
  for (const [v, base, dots] of DUR) if (Math.abs(d - v) < 1e-6) return { base, dots };
  return { base: d >= 4 ? 'whole' : d >= 2 ? 'half' : d >= 1 ? 'quarter' : d >= 0.5 ? 'eighth' : 'sixteenth', dots: 0 };
}
const asArray = (p) => (p == null ? [] : Array.isArray(p) ? p : [p]);

export function renderScore(parent, score, opts = {}) {
  const host = document.createElement('div');
  host.className = 'score' + (opts.color ? ' by-hand' : '');
  parent.appendChild(host);
  const states = new Map(); // "v:i" -> clases
  let cursorAt = null;
  let api = null;

  function draw() {
    host.innerHTML = '';
    const layout = build(host, score, opts);
    api.items = layout.items;
    api.systems = layout.systems;
    api.svg = layout.svg;
    api._cursors = layout.cursors;
    for (const [k, cls] of states) {
      const [v, i] = k.split(':');
      layout.items[v]?.[i]?.el.classList.add(...cls);
    }
    if (cursorAt) api.cursor(cursorAt.v, cursorAt.i, false);
  }

  api = {
    el: host,
    /** Añade o quita clases de estado ('cur', 'ok', 'bad', 'ghost') a una nota. */
    set(v, i, cls, on = true) {
      const key = `${v}:${i}`;
      const cur = states.get(key) || new Set();
      on ? cur.add(cls) : cur.delete(cls);
      cur.size ? states.set(key, cur) : states.delete(key);
      api.items[v]?.[i]?.el.classList.toggle(cls, on);
    },
    clear(cls) {
      for (const [k, set] of states) {
        const [v, i] = k.split(':');
        if (!cls) { api.items[v]?.[i]?.el.classList.remove(...set); states.delete(k); }
        else if (set.has(cls)) { set.delete(cls); api.items[v]?.[i]?.el.classList.remove(cls); }
      }
    },
    /** Lleva la banda de lectura a un evento (y desplaza la vista si hace falta). */
    cursor(v, i, scroll = true) {
      cursorAt = v == null ? null : { v, i };
      api._cursors.forEach((c) => c.setAttribute('visibility', 'hidden'));
      const it = v == null ? null : api.items[v]?.[i];
      if (!it) return;
      const c = api._cursors[it.sys];
      c.setAttribute('x', it.x - c.width.baseVal.value * 0.22);
      c.setAttribute('visibility', 'visible');
      if (scroll && host.scrollHeight > host.clientHeight + 4) {
        const s = api.systems[it.sys];
        const scale = host.scrollWidth / api.svg.viewBox.baseVal.width || 1;
        host.scrollTo({ top: Math.max(0, s.top * scale - 6), behavior: 'smooth' });
      }
    },
    redraw: draw,
    destroy() { ro?.disconnect(); host.remove(); },
  };
  draw();

  let ro = null;
  if (!opts.width && 'ResizeObserver' in window) {
    let last = host.clientWidth, timer = null;
    ro = new ResizeObserver(() => {
      if (Math.abs(host.clientWidth - last) < 8) return;
      last = host.clientWidth;
      clearTimeout(timer);
      timer = setTimeout(draw, 80);
    });
    ro.observe(host);
  }
  return api;
}

function build(host, score, opts) {
  const S = opts.scale || 10; // espacio entre líneas del pentagrama, en px
  const grand = score.clef === 'grand';
  const staves = grand ? [{ clef: 'treble', v: 'rh' }, { clef: 'bass', v: 'lh' }]
    : [{ clef: score.clef || 'treble', v: score.lh && !score.rh ? 'lh' : 'rh' }];
  const voices = {};
  for (const st of staves) voices[st.v] = score[st.v] || [];
  const time = score.time || null;
  const beatsPerMeasure = time ? (time[0] * 4) / time[1] : Infinity;
  const key = score.key || 0;
  const keyAlt = keyAlterations(key);
  const totalW = Math.max(220, opts.width || host.clientWidth || 600);

  // ----- tiempos y compases -----
  const timed = {};
  let nMeasures = 1, minDur = 4, anyEvents = 0;
  for (const v in voices) {
    let t = 0;
    timed[v] = voices[v].map((ev, i) => {
      let m = 0, mt = t;
      if (time) {
        const pk = score.pickup || 0;
        if (pk && t < pk - 1e-6) { m = 0; mt = t; }
        else { m = Math.floor((t - pk + 1e-6) / beatsPerMeasure) + (pk ? 1 : 0); mt = t - pk - (m - (pk ? 1 : 0)) * beatsPerMeasure; }
      }
      const out = { ev, i, t, m, mt, pitches: asArray(ev.p).map(parsePitch) };
      t += ev.d;
      minDur = Math.min(minDur, ev.d);
      nMeasures = Math.max(nMeasures, m + 1);
      anyEvents++;
      return out;
    });
  }
  const measureLen = (m) => (!time ? 0 : score.pickup && m === 0 ? score.pickup : beatsPerMeasure);

  // ----- medidas horizontales -----
  const nKey = Math.abs(key);
  const braceW = grand ? 1.6 * S : 0.4 * S;
  const clefW = 3.4 * S, keyW = nKey ? nKey * 1.05 * S + 0.6 * S : 0, timeW = time ? 2.4 * S : 0;
  const padL = 1.5 * S, padR = 0.5 * S;
  let unit = opts.unit ? opts.unit * S : (minDur < 0.5 ? 7.2 : minDur < 1 ? 4.8 : 3.6) * S;
  const head = (first) => braceW + clefW + keyW + (first ? timeW : 0);
  const systems = [];
  const repStart = (m) => ((score.repeats || []).some((r) => r.from === m && (m > 0 || r.showStart)) ? 1.3 * S : 0);
  const mW = (m, u) => padL + repStart(m) + measureLen(m) * u + padR;

  if (!time) {
    // Notas sueltas: reparto uniforme en un único sistema.
    const n = Math.max(1, anyEvents && Math.max(...Object.values(timed).map((a) => a.length)));
    const avail = totalW - head(true) - 2 * S;
    const step = Math.min(opts.step ? opts.step * S : 5.2 * S, avail / n);
    systems.push({ first: 0, last: 0, free: true, step, width: opts.fit ? head(true) + step * n + 2 * S : totalW });
  } else {
    let m = 0;
    while (m < nMeasures) {
      const first = m;
      let w = head(systems.length === 0);
      do { w += mW(m, unit); m++; } while (m < nMeasures && w + mW(m, unit) <= totalW);
      systems.push({ first, last: m - 1, natural: w });
    }
    // Se estira para justificar; la última línea solo si ya ocupa casi todo el ancho.
    systems.forEach((s, si) => {
      let fixed = head(si === 0) + (s.last - s.first + 1) * (padL + padR);
      let beats = 0;
      for (let k = s.first; k <= s.last; k++) { beats += measureLen(k); fixed += repStart(k); }
      const stretch = (totalW - fixed) / beats;
      const isLast = si === systems.length - 1;
      s.unit = s.natural > totalW ? stretch : isLast && s.natural < totalW * 0.7 ? unit : Math.min(stretch, unit * 2.2);
      s.width = isLast && systems.length === 1 && opts.fit ? fixed + beats * s.unit : totalW;
      if (opts.fit && systems.length === 1) s.unit = unit, s.width = s.natural;
    });
  }

  // ----- medidas verticales -----
  const ext = {};
  for (const st of staves) {
    let hi = 8, lo = 0;
    for (const e of timed[st.v]) for (const p of e.pitches) {
      const pos = staffPos(p, st.clef);
      hi = Math.max(hi, pos); lo = Math.min(lo, pos);
    }
    ext[st.v] = { hi, lo };
  }
  const hasAbove = (v) => voices[v].some((e) => e.f || e.fermata || e.text || e.mark) || (score.spans || []).some((s) => (s.v || 'rh') === v && ['8va', 'volta'].includes(s.type));
  const topV = staves[0].v, botV = staves[staves.length - 1].v;
  const hasDyn = Object.values(voices).some((a) => a.some((e) => e.dyn)) || (score.spans || []).some((s) => s.type === 'cresc' || s.type === 'dim');
  const hasPed = (score.spans || []).some((s) => s.type === 'ped');
  let topPad = Math.max(2.2, (ext[topV].hi - 8) / 2 + 1.6) * S + (hasAbove(topV) ? 2.2 * S : 0) + (score.tempo ? 2.2 * S : 0);
  if (opts.padTop != null) topPad = opts.padTop * S;
  let botPad = Math.max(2.2, -ext[botV].lo / 2 + 1.6) * S;
  if (opts.names) botPad += 2.4 * S;
  if (grand ? hasPed || voices.lh.some((e) => e.f) : hasDyn || voices[botV].some((e) => e.f && botV === 'lh')) botPad += 2.4 * S;
  if (!grand && hasPed) botPad += 2 * S;
  let gap = 0;
  if (grand) {
    gap = Math.max(6.5, 3 + -ext.rh.lo / 2 + Math.max(0, (ext.lh.hi - 8) / 2) + 1.5) * S;
    if (hasDyn || opts.names) gap += 1.6 * S;
  }
  const sysH = topPad + 4 * S + (grand ? gap + 4 * S : 0) + botPad;
  const sysGap = opts.sysGap != null ? opts.sysGap * S : 1.2 * S;
  const height = systems.length * sysH + (systems.length - 1) * sysGap;
  const width = Math.max(...systems.map((s) => s.width));

  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`, width, height, class: 'score-svg', role: 'img',
    'aria-label': opts.label || 'Partitura',
  }, host);
  svg.style.setProperty('--S', `${S}px`);
  const fs = 4 * S;
  const glyph = (parent, ch, x, y, cls, size) => {
    const t = svgEl('text', { x, y, class: 'mg' + (cls ? ' ' + cls : ''), 'font-size': size || fs }, parent);
    t.textContent = ch;
    return t;
  };
  const line = (parent, x1, y1, x2, y2, w, cls) =>
    svgEl('line', { x1, y1, x2, y2, 'stroke-width': w, class: cls || 'ink' }, parent);
  const text = (parent, str, x, y, cls) => {
    const t = svgEl('text', { x, y, class: cls }, parent);
    t.textContent = str;
    return t;
  };

  const items = {};
  for (const v in voices) items[v] = [];
  const cursors = [];
  const sysInfo = [];

  systems.forEach((sys, si) => {
    const top = si * (sysH + sysGap);
    const g = svgEl('g', { class: 'system' }, svg);
    const staffY = {}; // voz -> y de la línea superior
    staves.forEach((st, k) => { staffY[st.v] = top + topPad + k * (4 * S + gap); });
    const yTop = staffY[topV], yBot = staffY[botV] + 4 * S;
    const x0 = braceW;
    let xEnd = sys.width - 0.5;
    if (!sys.free) {
      // El pentagrama termina justo en la última barra del sistema.
      xEnd = x0 + clefW + keyW + (si === 0 ? timeW : 0);
      for (let m = sys.first; m <= sys.last; m++) xEnd += padL + repStart(m) + measureLen(m) * sys.unit + padR;
    }
    sysInfo.push({ top, height: sysH });

    const cur = svgEl('rect', { x: 0, y: yTop - 1.5 * S, width: 2.6 * S, height: yBot - yTop + 3 * S, rx: S * 0.6, class: 'score-cursor', visibility: 'hidden' }, g);
    cursors.push(cur);

    // Pentagramas, claves, armadura y compás.
    for (const st of staves) {
      const y = staffY[st.v];
      for (let l = 0; l < 5; l++) line(g, x0, y + l * S, xEnd, y + l * S, S * 0.11, 'staff-line');
      const yOf = (pos) => y + 4 * S - (pos * S) / 2;
      glyph(g, st.clef === 'bass' ? G.fClef : G.gClef, x0 + 0.7 * S, yOf(st.clef === 'bass' ? 6 : 2), 'clef');
      const order = key > 0 ? SHARP_ORDER : FLAT_ORDER;
      const trebleSharp = [8, 5, 9, 6, 3, 7, 4], trebleFlat = [4, 7, 3, 6, 2, 5, 1];
      for (let k = 0; k < nKey; k++) {
        const pos = (key > 0 ? trebleSharp : trebleFlat)[k] - (st.clef === 'bass' ? 2 : 0);
        glyph(g, key > 0 ? G.sharp : G.flat, x0 + clefW + k * 1.05 * S, yOf(pos), 'keysig');
      }
      void order;
      if (si === 0 && time) {
        const tx = x0 + clefW + keyW + 0.2 * S;
        const two = time[0] > 9 || time[1] > 9;
        glyph(g, digit(time[0]), tx + (two && time[0] < 10 ? 0.85 * S : 0), yOf(6), 'timesig');
        glyph(g, digit(time[1]), tx + (two && time[1] < 10 ? 0.85 * S : 0), yOf(2), 'timesig');
      }
    }
    line(g, x0, yTop, x0, yBot, S * 0.16);
    if (grand) glyph(g, G.brace, x0 - 1.35 * S, yBot, 'brace', yBot - yTop);

    // Posición x de cada compás de este sistema.
    const mx = {};
    let x = x0 + clefW + keyW + (si === 0 ? timeW : 0);
    const contentStart = x;
    if (!sys.free) {
      for (let m = sys.first; m <= sys.last; m++) {
        mx[m] = x;
        x += padL + repStart(m) + measureLen(m) * sys.unit + padR;
        const isLastMeasure = m === nMeasures - 1;
        const rep = (score.repeats || []).find((r) => r.to === m);
        const dbl = (score.double || []).includes(m);
        if (rep) {
          line(g, x - 0.9 * S, yTop, x - 0.9 * S, yBot, S * 0.16);
          line(g, x - 0.25 * S, yTop, x - 0.25 * S, yBot, S * 0.5);
          for (const st of staves) glyph(g, G.repeatDots, x - 1.75 * S, staffY[st.v] + 4 * S, 'repeat');
        } else if (isLastMeasure && !opts.open) {
          line(g, x - 0.75 * S, yTop, x - 0.75 * S, yBot, S * 0.16);
          line(g, x - 0.25 * S, yTop, x - 0.25 * S, yBot, S * 0.5);
        } else if (dbl) {
          line(g, x - 0.45 * S, yTop, x - 0.45 * S, yBot, S * 0.16);
          line(g, x, yTop, x, yBot, S * 0.16);
        } else if (!(isLastMeasure && opts.open)) {
          line(g, x, yTop, x, yBot, S * 0.16);
        }
        if (repStart(m)) {
          const sx = mx[m];
          line(g, sx + 0.25 * S, yTop, sx + 0.25 * S, yBot, S * 0.5);
          line(g, sx + 0.9 * S, yTop, sx + 0.9 * S, yBot, S * 0.16);
          for (const st of staves) glyph(g, G.repeatDots, sx + 1.25 * S, staffY[st.v] + 4 * S, 'repeat');
        }
      }
    }
    if (score.tempo && si === 0) text(g, score.tempo, x0 + clefW * 0.4, yTop - topPad + 1.7 * S, 'score-tempo');

    // ----- eventos -----
    for (const st of staves) {
      const v = st.v, y = staffY[v];
      const yOf = (pos) => y + 4 * S - (pos * S) / 2;
      const evs = timed[v].filter((e) => (sys.free ? true : e.m >= sys.first && e.m <= sys.last));
      const accState = new Map(); // "compás:dia" -> alteración vigente
      const laid = [];

      for (const e of evs) {
        const { ev } = e;
        const info = durInfo(ev.d);
        let ex;
        if (sys.free) ex = contentStart + 1.6 * S + e.i * sys.step;
        else ex = mx[e.m] + padL + repStart(e.m) + e.mt * sys.unit;
        const eg = svgEl('g', { class: `ev ${v}${ev.hide ? ' hidden' : ''}`, 'data-v': v, 'data-i': e.i }, g);
        const rec = { el: eg, x: ex, t: e.t, sys: si, m: e.m, e, info, isRest: !e.pitches.length };
        items[v][e.i] = rec;
        laid.push(rec);

        if (rec.isRest) {
          const wholeMeasure = time && Math.abs(ev.d - measureLen(e.m)) < 1e-6 && e.mt < 1e-6;
          const rx = wholeMeasure ? mx[e.m] + (padL + repStart(e.m) + measureLen(e.m) * sys.unit + padR) / 2 - 0.6 * S : ex;
          const kind = wholeMeasure ? 'whole' : info.base;
          const map = { whole: [G.restWhole, 6], half: [G.restHalf, 4], quarter: [G.restQuarter, 4], eighth: [G.rest8, 4], sixteenth: [G.rest16, 4] };
          glyph(eg, map[kind][0], rx, yOf(map[kind][1]));
          if (info.dots && !wholeMeasure) glyph(eg, G.dot, rx + 1.5 * S, yOf(5));
          rec.x = rx; rec.top = y; rec.bottom = y + 4 * S; rec.cx = rx + 0.55 * S;
          if (ev.fermata) glyph(eg, G.fermata, rx + 0.55 * S, y - 1.1 * S, 'mid');
          continue;
        }

        const poss = e.pitches.map((p) => ({ p, pos: staffPos(p, st.clef) })).sort((a, b) => a.pos - b.pos);
        const avg = poss.reduce((s, n) => s + n.pos, 0) / poss.length;
        rec.up = ev.stem ? ev.stem === 'up' : avg < 4;
        rec.poss = poss;
        const headW = info.base === 'whole' ? 1.69 * S : 1.18 * S;
        rec.headW = headW;
        const headCh = info.base === 'whole' ? G.whole : info.base === 'half' ? G.half : G.black;

        // Líneas adicionales.
        const minPos = poss[0].pos, maxPos = poss[poss.length - 1].pos;
        for (let lp = -2; lp >= minPos; lp -= 2) line(eg, ex - 0.4 * S, yOf(lp), ex + headW + 0.4 * S, yOf(lp), S * 0.16, 'ledger');
        for (let lp = 10; lp <= maxPos; lp += 2) line(eg, ex - 0.4 * S, yOf(lp), ex + headW + 0.4 * S, yOf(lp), S * 0.16, 'ledger');

        let prevPos = -99, prevShift = false, accCol = 0;
        poss.forEach((n) => {
          const shift = n.pos - prevPos === 1 && !prevShift;
          prevShift = shift; prevPos = n.pos;
          n.x = ex + (shift ? headW - S * 0.1 : 0);
          glyph(eg, headCh, n.x, yOf(n.pos), 'head');
          // Alteraciones accidentales (las que no están ya en la armadura o en el compás).
          const k = `${e.m}:${n.p.dia}`;
          const current = accState.has(k) ? accState.get(k) : keyAlt[n.p.letter];
          if (n.p.alter !== current || ev.acc) {
            accState.set(k, n.p.alter);
            glyph(eg, n.p.alter > 0 ? G.sharp : n.p.alter < 0 ? G.flat : G.natural, ex - 1.15 * S - accCol * 1.1 * S, yOf(n.pos), 'acc');
            accCol++;
          }
          for (let dd = 0; dd < info.dots; dd++) {
            glyph(eg, G.dot, ex + headW + (prevShift ? headW : 0) + 0.5 * S + dd * 0.6 * S, yOf(n.pos % 2 === 0 ? n.pos + 1 : n.pos));
          }
        });
        rec.yLow = yOf(minPos); rec.yHigh = yOf(maxPos);
        rec.cx = ex + headW / 2;
        rec.stemX = rec.up ? ex + headW - S * 0.07 : ex + S * 0.07;
        rec.top = rec.yHigh - S * 0.5; rec.bottom = rec.yLow + S * 0.5;
      }

      // ----- barrados de corcheas y semicorcheas -----
      const groups = [];
      if (time) {
        const groupLen = time[1] === 8 ? 1.5 : 1;
        let curG = null;
        for (const r of laid) {
          const beamable = !r.isRest && r.info.base !== 'whole' && r.e.ev.d < 1;
          const gid = beamable ? `${r.m}:${Math.floor((r.e.mt + 1e-6) / groupLen)}` : null;
          if (beamable && curG && curG.id === gid) curG.list.push(r);
          else { curG = beamable ? { id: gid, list: [r] } : null; if (curG) groups.push(curG); }
        }
      }
      for (const grp of groups) {
        if (grp.list.length < 2) continue;
        const L = grp.list;
        const avg = L.reduce((s, r) => s + r.poss.reduce((a, n) => a + n.pos, 0) / r.poss.length, 0) / L.length;
        const up = avg < 4;
        L.forEach((r) => { r.up = up; r.stemX = up ? r.x + r.headW - S * 0.07 : r.x + S * 0.07; r.beamed = true; });
        const tip = (r) => (up ? r.yHigh - 3.4 * S : r.yLow + 3.4 * S);
        let y1 = tip(L[0]), y2 = tip(L[L.length - 1]);
        const maxSlope = 1.1 * S;
        if (Math.abs(y2 - y1) > maxSlope) { const mid = (y1 + y2) / 2, sgn = Math.sign(y2 - y1); y1 = mid - (sgn * maxSlope) / 2; y2 = mid + (sgn * maxSlope) / 2; }
        const xa = L[0].stemX, xb = L[L.length - 1].stemX;
        const at = (xq) => y1 + ((y2 - y1) * (xq - xa)) / (xb - xa || 1);
        // Ningún tallo debe quedar demasiado corto.
        let adj = 0;
        for (const r of L) {
          const need = up ? r.yHigh - 2.6 * S : r.yLow + 2.6 * S;
          const d = at(r.stemX) - need;
          if (up && d > 0) adj = Math.max(adj, d);
          if (!up && d < 0) adj = Math.max(adj, -d);
        }
        y1 += up ? -adj : adj; y2 += up ? -adj : adj;
        const th = 0.5 * S * (up ? 1 : -1);
        const poly = (xq1, xq2, off) => svgEl('polygon', {
          points: `${xq1},${at(xq1) + off} ${xq2},${at(xq2) + off} ${xq2},${at(xq2) + off + th} ${xq1},${at(xq1) + off + th}`, class: `beam ${v}`,
        }, L[0].el.parentNode);
        const b = poly(xa - S * 0.06, xb + S * 0.06, 0);
        b.setAttribute('data-beam', '');
        const off2 = 0.75 * S * (up ? 1 : -1);
        L.forEach((r, k) => {
          r.stemEnd = at(r.stemX);
          if (r.info.base !== 'sixteenth') return;
          const next = L[k + 1], prev = L[k - 1];
          if (next && next.info.base === 'sixteenth') poly(r.stemX, next.stemX, off2);
          else if (!prev || prev.info.base !== 'sixteenth') {
            if (prev) poly(r.stemX - S, r.stemX, off2); else poly(r.stemX, r.stemX + S, off2);
          }
        });
      }

      // ----- tallos, corchetes y adornos -----
      for (const r of laid) {
        if (r.isRest) continue;
        const { ev } = r.e, eg = r.el, info = r.info;
        if (info.base !== 'whole') {
          const from = r.up ? r.yLow - S * 0.17 : r.yHigh + S * 0.17;
          let to = r.stemEnd != null ? r.stemEnd : r.up ? r.yHigh - 3.5 * S : r.yLow + 3.5 * S;
          if (r.stemEnd == null) { const midY = y + 2 * S; if (r.up && to > midY) to = midY; if (!r.up && to < midY) to = midY; }
          line(eg, r.stemX, from, r.stemX, to, S * 0.12, 'stem');
          if (!r.beamed && (info.base === 'eighth' || info.base === 'sixteenth')) {
            const ch = info.base === 'eighth' ? (r.up ? G.flag8u : G.flag8d) : r.up ? G.flag16u : G.flag16d;
            glyph(eg, ch, r.stemX - S * 0.06, to);
          }
          if (r.up) r.top = Math.min(r.top, to); else r.bottom = Math.max(r.bottom, to);
        }
        // Articulaciones: en el lado de la cabeza.
        let ay = r.up ? r.yLow + 1.1 * S : r.yHigh - 1.1 * S;
        const artic = (chA, chB) => {
          const pos = Math.round((y + 4 * S - ay) / (S / 2));
          if (pos >= 0 && pos <= 8 && pos % 2 === 0) ay += r.up ? S * 0.5 : -S * 0.5; // evita caer sobre una línea
          glyph(eg, r.up ? chB : chA, r.cx, ay, 'mid');
          ay += r.up ? 0.9 * S : -0.9 * S;
          if (r.up) r.bottom = Math.max(r.bottom, ay); else r.top = Math.min(r.top, ay);
        };
        if (ev.stacc) artic(G.staccA, G.staccB);
        if (ev.tenuto) artic(G.tenutoA, G.tenutoB);
        if (ev.accent) artic(G.accentA, G.accentB);
        // Sobre el pentagrama: calderón, signos, texto y digitación.
        let above = Math.min(y - 0.9 * S, r.top - 0.7 * S);
        const below = Math.max(y + 4 * S + 1.9 * S, r.bottom + 1.5 * S);
        if (ev.fermata) { glyph(eg, G.fermata, r.cx, above, 'mid'); above -= 1.9 * S; }
        if (ev.mark) {
          const mk = { segno: G.segno, coda: G.coda, trill: G.trill, mordent: G.mordent, turn: G.turn, breath: G.breath }[ev.mark];
          if (ev.mark === 'arp') {
            let d = `M${r.x - 0.9 * S},${r.yHigh - 0.7 * S}`;
            const n = Math.max(3, Math.round((r.yLow - r.yHigh + 1.4 * S) / (0.5 * S)));
            for (let k = 0; k < n; k++) d += ` q${(k % 2 ? 0.4 : -0.4) * S},${0.25 * S} 0,${0.5 * S}`;
            svgEl('path', { d, class: 'bracket' }, eg);
          }
          else if (ev.mark === 'breath') glyph(eg, mk, r.x + r.headW + 1.4 * S, y - 0.4 * S);
          else { glyph(eg, mk, r.cx, above - (ev.mark === 'segno' || ev.mark === 'coda' ? 0.9 * S : 0), 'mid'); above -= 2.4 * S; }
        }
        const fingerBelow = v === 'lh' && grand;
        if (ev.f && !opts.noFingers) {
          if (fingerBelow) text(eg, String(ev.f), r.cx, below, 'finger');
          else { text(eg, String(ev.f), r.cx, above, 'finger'); above -= 1.5 * S; }
        }
        if (ev.text) text(eg, ev.text, r.x, above, 'score-text');
        if (ev.dyn) {
          const dy = grand && v === 'rh' ? y + 4 * S + gap / 2 + 0.6 * S : Math.max(y + 4 * S + 2.6 * S, r.bottom + 1.8 * S);
          glyph(eg, G[ev.dyn] || ev.dyn, r.x - 0.2 * S, dy, 'dyn');
        }
        if (opts.names || ev.label) {
          const ny = grand && v === 'rh' ? y + 4 * S + Math.max(2.4 * S, -ext.rh.lo / 2 * S + 2 * S) : sysTopBottom(top, sysH) - 0.7 * S;
          text(eg, ev.label || r.e.pitches.map((p) => noteName(pitchKey(p))).join('·'), r.cx, ny, 'note-name');
        }
        // Ligadura de unión con la nota siguiente.
        if (ev.tie) {
          const nx = items[v][r.e.i + 1];
          const endX = nx && nx.sys === si ? nx.x - 0.15 * S : xEnd - 0.3 * S;
          for (const n of r.poss) arc(eg, r.x + r.headW + 0.1 * S, endX, yOf(n.pos) + (r.up ? 0.55 * S : -0.55 * S), r.up ? 1 : -1, S, 'tie');
        }
      }
    }

    // ----- símbolos que abarcan varias notas -----
    for (const sp of score.spans || []) {
      const v = sp.v || 'rh';
      const a = items[v]?.[sp.from], b = items[v]?.[sp.to];
      if (!a || !b || a.sys > si || b.sys < si) continue;
      const y = staffY[v];
      const startsHere = a.sys === si, endsHere = b.sys === si;
      const x1 = startsHere ? a.x : contentStart;
      const x2 = endsHere ? b.x + (b.headW || S) : xEnd - 0.4 * S;
      if (sp.type === 'slur') {
        const dir = a.up ? 1 : -1;
        const ya = startsHere ? (a.up ? a.yLow + 0.8 * S : a.yHigh - 0.8 * S) : y + (dir > 0 ? 5 * S : -S);
        const yb = endsHere ? (a.up ? b.yLow + 0.8 * S : b.yHigh - 0.8 * S) : ya;
        arc(g, x1 + (a.headW || S) / 2, x2 - (b.headW || S) / 2, ya, dir, S, 'slur', yb);
      } else if (sp.type === 'cresc' || sp.type === 'dim') {
        const yy = grand ? staffY.rh + 4 * S + gap / 2 : y + 4 * S + 2.6 * S;
        const open = 0.65 * S;
        const [xa, xb] = sp.type === 'cresc' ? [x1, x2] : [x2, x1];
        line(g, xa, yy, xb, yy - open, S * 0.13);
        line(g, xa, yy, xb, yy + open, S * 0.13);
      } else if (sp.type === '8va') {
        const yy = Math.min(y - 2.4 * S, ...items[v].slice(sp.from, sp.to + 1).filter((r) => r.sys === si).map((r) => r.top - 1.4 * S));
        if (startsHere) glyph(g, G.ottava, x1 - 0.2 * S, yy + 0.6 * S, '', fs * 0.9);
        svgEl('path', { d: `M${x1 + (startsHere ? 2.6 * S : 0)},${yy} H${x2 + 0.6 * S}${endsHere ? ` v${S}` : ''}`, class: 'bracket dashed' }, g);
      } else if (sp.type === 'ped') {
        const yy = sysTopBottom(top, sysH) - 0.9 * S;
        if (startsHere) glyph(g, G.ped, x1 - 0.4 * S, yy, '', fs * 0.82);
        svgEl('path', { d: `M${x1 + (startsHere ? 3 * S : 0)},${yy} H${x2 + 0.8 * S}${endsHere ? ` v${-S}` : ''}`, class: 'bracket' }, g);
      } else if (sp.type === 'volta') {
        const xa = startsHere ? mx[a.m] + 0.4 * S : contentStart;
        const xb = endsHere ? mx[b.m] + padL + repStart(b.m) + measureLen(b.m) * sys.unit + padR - 0.5 * S : xEnd;
        const yy = staffY[topV] - 2.6 * S;
        svgEl('path', { d: `M${xa},${yy + 1.8 * S} V${yy} H${xb}${sp.closed !== false && endsHere ? ` V${yy + 1.8 * S}` : ''}`, class: 'bracket' }, g);
        if (startsHere) text(g, sp.label || '1.', xa + 0.5 * S, yy + 1.5 * S, 'volta-label');
      }
    }
  });

  return { svg, items, systems: sysInfo, cursors };

  function sysTopBottom(top, h) { return top + h; }
}

const pitchKey = (p) => ['C', 'D', 'E', 'F', 'G', 'A', 'B'][p.letter] + (p.alter > 0 ? '#' : p.alter < 0 ? 'b' : '') + p.octave;

function arc(parent, x1, x2, y, dir, S, cls, y2 = y) {
  const h = Math.min(1.9 * S, 0.5 * S + (x2 - x1) * 0.09) * dir;
  const cx1 = x1 + (x2 - x1) * 0.25, cx2 = x1 + (x2 - x1) * 0.75;
  const th = 0.22 * S * dir;
  return svgEl('path', {
    d: `M${x1},${y} C${cx1},${y + h} ${cx2},${y2 + h} ${x2},${y2} C${cx2},${y2 + h + th} ${cx1},${y + h + th} ${x1},${y} Z`,
    class: cls,
  }, parent);
}

/** Símbolo musical suelto dentro de un texto: <span class="mg-inline">. */
export function glyphSpan(name, cls = '') {
  const s = document.createElement('span');
  s.className = `mg-inline ${cls}`;
  s.textContent = G[name] || name;
  s.setAttribute('aria-hidden', 'true');
  return s;
}
export const glyphHtml = (name, cls = '') => `<span class="mg-inline ${cls}" aria-hidden="true">${G[name] || name}</span>`;
