// Figuras animadas e interactivas para las explicaciones. Cada una: (el, cfg) → limpieza.
import { h, icon, segmented, reducedMotion } from './ui.js';
import { Keyboard, svgEl } from './keyboard.js';
import { renderScore, G, glyphHtml } from './staff.js';
import { input, pcKeyboard } from './input.js';
import { playNote, playSequence, click, Transport } from './audio.js';
import { parsePitch, midiOf, noteName, fromMidi, pitchString, scale, MAJOR_STEPS, MINOR_STEPS, KEYS, SOLFEGE, LETTERS, isBlack, keyAlterations, SHARP_ORDER, FLAT_ORDER } from './music.js';

const caption = (html) => h('p.fig-caption', { html, 'aria-live': 'polite' });
const playBtn = (label, fn) => h('button.btn.ghost', { type: 'button', onclick: fn }, icon('play'), label);

/** Ilumina teclas una a una y las hace sonar. Devuelve una función para cancelar. */
function runKeys(kb, midis, { cls = 'sel', gap = 260, sound = true, keep = true, onStep } = {}) {
  let cancelled = false;
  const timers = midis.map((m, i) => setTimeout(() => {
    if (cancelled) return;
    kb.mark(m, cls);
    if (sound) playNote(m, 0.4, 0.6);
    if (!keep) setTimeout(() => kb.unmark(m, cls), gap * 0.9);
    onStep?.(m, i);
  }, i * gap));
  return () => { cancelled = true; timers.forEach(clearTimeout); };
}

// ---------- El teclado: grupos de negras y nombres ----------
function keyboardGroups(el) {
  const stage = h('div.stage');
  const cap = caption('');
  const kb = new Keyboard(stage, { from: 'C3', to: 'B4', labels: 'none', maxKey: 44 });
  let cancel = () => {};
  const MODES = {
    dos: { pcs: [1, 3], cls: 'hint', text: 'Las teclas negras van en grupos. Estos son los <b>grupos de dos</b>.' },
    tres: { pcs: [6, 8, 10], cls: 'hint', text: 'Y estos, los <b>grupos de tres</b>. Dos, tres, dos, tres… a lo largo de todo el teclado.' },
    do: { pcs: [0], cls: 'ok', text: 'Justo a la izquierda de cada grupo de dos negras hay un <b>Do</b>.' },
    fa: { pcs: [5], cls: 'ok', text: 'Y a la izquierda de cada grupo de tres negras, un <b>Fa</b>.' },
  };
  const show = (mode) => {
    cancel();
    kb.clear('hint ok sel');
    const m = MODES[mode];
    cap.innerHTML = m.text;
    const list = [];
    for (let k = kb.lo; k <= kb.hi; k++) if (m.pcs.includes(k % 12)) list.push(k);
    cancel = runKeys(kb, list, { cls: m.cls, gap: reducedMotion() ? 0 : 150, sound: false });
  };
  const seg = segmented([['dos', 'Grupos de dos'], ['tres', 'Grupos de tres'], ['do', 'Los Do'], ['fa', 'Los Fa']], 'dos', show, 'Qué resaltar');
  el.append(seg, stage, cap);
  show('dos');
  return () => { cancel(); kb.destroy(); };
}

function noteNames(el) {
  const stage = h('div.stage');
  let kb = null;
  const build = (letters) => {
    kb?.destroy();
    kb = new Keyboard(stage, { from: 'C4', to: 'E5', labels: 'all', letters: letters === 'abc', pcHints: true, maxKey: 56 });
    pcKeyboard.setBase(60);
  };
  el.append(segmented([['do', 'Do Re Mi'], ['abc', 'C D E (cifrado)']], 'do', build, 'Nombres de las notas'), stage,
    caption('Toca las teclas blancas de izquierda a derecha: <b>Do, Re, Mi, Fa, Sol, La, Si</b>… y vuelta a empezar en el siguiente Do.'));
  build('do');
  return () => kb?.destroy();
}

function octaves(el) {
  const stage = h('div.stage');
  const kb = new Keyboard(stage, { from: 'A0', to: 'C8', labels: 'none', maxKey: 22 });
  const cap = caption('Un piano tiene 88 teclas. El mismo dibujo de 12 teclas se repite siete veces: cada repetición es una <b>octava</b>. El <b>Do central</b> (en rojo) queda delante de ti al sentarte.');
  for (let o = 1; o <= 8; o++) { const m = 12 * (o + 1); kb.mark(m, m === 60 ? 'bad' : 'sel'); kb.bubble(m, m === 60 ? '4' : String(o), m === 60 ? 'accent' : 'light'); }
  let cancel = () => {};
  const sweep = (dir) => () => {
    cancel();
    const list = [];
    for (let o = 1; o <= 8; o++) list.push(12 * (o + 1));
    if (dir < 0) list.reverse();
    cancel = runKeys(kb, list, { cls: 'ok', gap: 330, keep: false });
  };
  el.append(h('div.axis', h('span', '← más grave'), h('span', 'más agudo →')), stage,
    h('div.row', playBtn('Todos los Do, de grave a agudo', sweep(1)), playBtn('De agudo a grave', sweep(-1))), cap);
  return () => { cancel(); kb.destroy(); };
}

// ---------- Manos y dedos ----------
const FINGER_NAMES = ['pulgar', 'índice', 'corazón', 'anular', 'meñique'];
function handSvg(side) {
  const svg = svgEl('svg', { viewBox: '0 0 200 215', class: `hand ${side}`, role: 'img', 'aria-label': side === 'rh' ? 'Mano derecha' : 'Mano izquierda' });
  const mx = (x) => (side === 'rh' ? x : 200 - x);
  svgEl('rect', { x: mx(50) - (side === 'rh' ? 0 : 126), y: 108, width: 126, height: 96, rx: 42, class: 'palm' }, svg);
  const fingers = [[0, 0, 0], [64, 30, 100], [95, 14, 116], [126, 26, 104], [154, 58, 76]];
  const tips = [];
  // Pulgar: sale del lateral de la palma, inclinado.
  const tx = mx(60), ty = 168;
  const ang = side === 'rh' ? -52 : 52;
  svgEl('rect', { x: tx - 14, y: ty - 78, width: 28, height: 90, rx: 14, class: 'finger', 'data-f': 1, transform: `rotate(${ang} ${tx} ${ty})` }, svg);
  const rad = (ang * Math.PI) / 180;
  tips.push([tx + Math.sin(rad) * 62, ty - Math.cos(rad) * 62]);
  for (let f = 1; f < 5; f++) {
    const [x, y, len] = fingers[f];
    svgEl('rect', { x: mx(x) - 13, y, width: 26, height: len + 30, rx: 13, class: 'finger', 'data-f': f + 1 }, svg);
    tips.push([mx(x), y + 17]);
  }
  tips.forEach(([x, y], i) => {
    const g = svgEl('g', { class: 'tip', 'data-f': i + 1 }, svg);
    svgEl('circle', { cx: x, cy: y, r: 11 }, g);
    svgEl('text', { x, y: y + 0.5 }, g).textContent = i + 1;
  });
  return svg;
}
function hands(el, cfg = {}) {
  const sides = cfg.only ? [cfg.only] : ['lh', 'rh'];
  const cap = caption('Los dedos se numeran igual en las dos manos: el <b>pulgar es el 1</b> y el <b>meñique el 5</b>. Toca un dedo para ver su número.');
  const row = h('div.hands-row');
  const svgs = sides.map((s) => {
    const svg = handSvg(s);
    row.append(h('figure.hand-fig', svg, h('figcaption', s === 'rh' ? 'Mano derecha' : 'Mano izquierda')));
    return svg;
  });
  const light = (f) => {
    svgs.forEach((svg) => svg.querySelectorAll('[data-f]').forEach((n) => n.classList.toggle('on', Number(n.dataset.f) === f)));
    cap.innerHTML = `Dedo <b>${f}</b>: ${FINGER_NAMES[f - 1]}.`;
  };
  svgs.forEach((svg) => svg.addEventListener('pointerdown', (e) => { const f = e.target.closest('[data-f]'); if (f) light(Number(f.dataset.f)); }));
  el.append(row, cap);
  let timers = [];
  if (!reducedMotion()) timers = [1, 2, 3, 4, 5].map((f) => setTimeout(() => light(f), 500 + f * 480));
  return () => timers.forEach(clearTimeout);
}

function handPosition(el, cfg) {
  const side = cfg.hand || 'rh';
  const stage = h('div.stage');
  const pitches = cfg.pitches || (side === 'rh' ? ['C4', 'D4', 'E4', 'F4', 'G4'] : ['C3', 'D3', 'E3', 'F3', 'G3']);
  const fingersOf = side === 'rh' ? [1, 2, 3, 4, 5] : [5, 4, 3, 2, 1];
  const kb = new Keyboard(stage, { from: cfg.from || (side === 'rh' ? 'A3' : 'A2'), to: cfg.to || (side === 'rh' ? 'B4' : 'B3'), labels: 'all', pcHints: true, maxKey: 56 });
  pcKeyboard.setBase(midiOf(pitches[0]));
  const svg = handSvg(side);
  pitches.forEach((p, i) => { kb.mark(midiOf(p), side); kb.bubble(p, fingersOf[i], side); });
  let cancel = () => {};
  const demo = () => {
    cancel();
    cancel = runKeys(kb, [...pitches, ...[...pitches].reverse().slice(1)].map(midiOf), { cls: 'ok', gap: 380, keep: false, onStep: (m) => {
      const f = fingersOf[pitches.findIndex((p) => midiOf(p) === m)];
      svg.querySelectorAll('[data-f]').forEach((n) => n.classList.toggle('on', Number(n.dataset.f) === f));
    } });
  };
  el.append(h('div.position-row', h('figure.hand-fig.small', svg), stage), h('div.row', playBtn('Ver cómo se toca', demo)),
    caption(cfg.caption || `Un dedo por tecla, sin mover la mano: es la <b>posición de Do</b> de la mano ${side === 'rh' ? 'derecha' : 'izquierda'}.`));
  return () => { cancel(); kb.destroy(); };
}

// ---------- Pentagrama ----------
function staffLines(el) {
  const S = 16, W = 520, top = 46;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} 170`, class: 'fig-svg staff-fig' });
  for (let l = 0; l < 5; l++) {
    const y = top + l * S;
    svgEl('line', { x1: 70, x2: W - 20, y1: y, y2: y, class: 'staff-line' }, svg);
    svgEl('text', { x: 54, y: y + 4.5, class: 'line-no' }, svg).textContent = `${5 - l}ª`;
  }
  for (let s = 0; s < 4; s++) svgEl('text', { x: W - 10, y: top + s * S + S / 2 + 4.5, class: 'space-no' }, svg).textContent = `${4 - s}º`;
  svgEl('text', { x: 20, y: top + 2 * S + 4, class: 'side-label', transform: `rotate(-90 20 ${top + 2 * S})` }, svg).textContent = 'líneas';
  const head = svgEl('text', { class: 'mg big-head', 'font-size': 4 * S }, svg);
  head.textContent = G.whole;
  const hl = svgEl('line', { x1: 70, x2: W - 20, class: 'hl-line', visibility: 'hidden' }, svg);
  const pitches = ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
  const cap = caption('');
  let pos = 0;
  const place = (sound = true) => {
    const y = top + 4 * S - (pos * S) / 2;
    head.setAttribute('x', 250); head.setAttribute('y', y);
    const onLine = pos % 2 === 0;
    hl.setAttribute('visibility', onLine ? 'visible' : 'hidden');
    hl.setAttribute('y1', y); hl.setAttribute('y2', y);
    cap.innerHTML = onLine ? `La nota está <b>atravesada por la ${pos / 2 + 1}ª línea</b>.` : `La nota está <b>en el ${(pos + 1) / 2}º espacio</b>, entre dos líneas.`;
    if (sound) playNote(midiOf(pitches[pos]), 0.5, 0.6);
  };
  const up = h('button.btn.ghost', { type: 'button', onclick: () => { pos = Math.min(8, pos + 1); place(); } }, 'Subir un paso');
  const down = h('button.btn.ghost', { type: 'button', onclick: () => { pos = Math.max(0, pos - 1); place(); } }, 'Bajar un paso');
  let cancel = false;
  const climb = async () => {
    cancel = false;
    for (pos = 0; pos <= 8 && !cancel; pos++) { place(); await new Promise((r) => setTimeout(r, 420)); }
    pos = 8;
  };
  el.append(svg, h('div.row', down, up, playBtn('Subir toda la escalera', climb)), cap,
    caption('Las líneas y los espacios se cuentan <b>de abajo arriba</b>. Cuanto más arriba está la nota, más aguda suena.'));
  place(false);
  return () => { cancel = true; };
}

function clefAnchor(el, cfg) {
  const bass = cfg.clef === 'bass';
  const S = 18, top = 60, W = 420;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} 200`, class: 'fig-svg staff-fig' });
  const anchorLine = bass ? 1 : 3; // índice desde arriba: 4ª línea (fa) o 2ª línea (sol)
  for (let l = 0; l < 5; l++) svgEl('line', { x1: 20, x2: W - 20, y1: top + l * S, y2: top + l * S, class: l === anchorLine ? 'staff-line anchor' : 'staff-line' }, svg);
  const ay = top + anchorLine * S;
  const clef = svgEl('text', { x: 40, y: ay, class: 'mg', 'font-size': 4 * S }, svg);
  clef.textContent = bass ? G.fClef : G.gClef;
  const ring = svgEl('circle', { cx: bass ? 60 : 66, cy: ay, r: S * 0.95, class: 'anchor-ring' }, svg);
  void ring;
  const note = svgEl('text', { x: 230, y: ay, class: 'mg anchor-note', 'font-size': 4 * S }, svg);
  note.textContent = G.whole;
  svgEl('text', { x: 245, y: top + 4 * S + 44, class: 'anchor-label' }, svg).textContent = bass ? 'Fa' : 'Sol';
  svgEl('path', { d: `M245,${top + 4 * S + 26} V${ay + S * 0.9}`, class: 'anchor-arrow' }, svg);
  const pitch = bass ? 'F3' : 'G4';
  el.append(svg, h('div.row', playBtn(`Escuchar ese ${bass ? 'Fa' : 'Sol'}`, () => playNote(midiOf(pitch), 1, 0.7))),
    caption(bass
      ? 'La clave de fa empieza con un punto grueso sobre la <b>4ª línea</b> y la abraza con sus dos puntitos. Toda nota escrita en esa línea es un <b>Fa</b> (el que está por debajo del Do central).'
      : 'El rizo de la clave de sol se enrosca alrededor de la <b>2ª línea</b>. Toda nota escrita en esa línea es un <b>Sol</b> (el que está por encima del Do central).'));
  return () => {};
}

function clefNotes(el, cfg) {
  const bass = cfg.clef === 'bass';
  const v = bass ? 'lh' : 'rh';
  const sets = bass
    ? { lineas: ['G2', 'B2', 'D3', 'F3', 'A3'], espacios: ['A2', 'C3', 'E3', 'G3'], todas: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'] }
    : { lineas: ['E4', 'G4', 'B4', 'D5', 'F5'], espacios: ['F4', 'A4', 'C5', 'E5'], todas: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] };
  const tips = bass
    ? { lineas: 'Líneas, de abajo arriba: <b>Sol, Si, Re, Fa, La</b>.', espacios: 'Espacios, de abajo arriba: <b>La, Do, Mi, Sol</b>.', todas: 'Línea, espacio, línea, espacio… las notas suben de una en una.' }
    : { lineas: 'Líneas, de abajo arriba: <b>Mi, Sol, Si, Re, Fa</b>.', espacios: 'Espacios, de abajo arriba: <b>Fa, La, Do, Mi</b>.', todas: 'Línea, espacio, línea, espacio… las notas suben de una en una.' };
  const paper = h('div.paper');
  const cap = caption('');
  let sc = null, tr = null, cur = 'lineas';
  const show = (k) => {
    cur = k;
    tr?.stop();
    sc?.destroy();
    sc = renderScore(paper, { clef: bass ? 'bass' : 'treble', [v]: sets[k].map((p) => ({ p, d: 4 })) }, { scale: 12, names: true, step: 5 });
    cap.innerHTML = tips[k];
  };
  const play = () => {
    tr?.stop();
    sc.clear();
    tr = playSequence(sets[cur].map((p, i) => ({ t: i, d: 1, midi: midiOf(p), i })), { bpm: 120, onNote: (n, on) => sc.set(v, n.i, 'cur', on) });
  };
  el.append(segmented([['lineas', 'En las líneas'], ['espacios', 'En los espacios'], ['todas', 'Todas seguidas']], 'lineas', show, 'Notas'), paper, h('div.row', playBtn('Escuchar', play)), cap);
  show('lineas');
  return () => { tr?.stop(); sc?.destroy(); };
}

/** Sistema de piano enlazado con el teclado: cada tecla aparece escrita en su sitio. */
export function grandExplorer(el, cfg = {}) {
  const paper = h('div.paper.center');
  const stage = h('div.stage');
  const cap = caption(cfg.caption || 'Toca cualquier tecla y mira dónde se escribe.');
  el.append(paper, cap, stage);
  const kb = new Keyboard(stage, { from: cfg.from || 'C2', to: cfg.to || 'C6', labels: 'c', maxKey: 34 });
  let sc = null;
  const show = (midi) => {
    const n = fromMidi(midi);
    const p = pitchString(n);
    const score = { clef: 'grand', rh: [{ p: 'B4', d: 4, hide: true }], lh: [{ p: 'D3', d: 4, hide: true }] };
    if (midi >= 60) score.rh = [{ p, d: 4 }];
    if (midi <= 60) score.lh = [{ p, d: 4 }];
    sc?.destroy();
    sc = renderScore(paper, score, { scale: cfg.scale || 11, width: 230, fit: true, color: true, step: 5, padTop: 5.5 });
    sc.set(midi >= 60 ? 'rh' : 'lh', 0, 'pulse');
    kb.clear('rh lh');
    kb.mark(midi, midi >= 60 ? 'rh' : 'lh');
    const where = midi === 60
      ? 'el <b>Do central</b>: se escribe igual de cerca de los dos pentagramas, con una línea adicional. Es la misma tecla.'
      : midi > 60 ? 'se escribe en <b>clave de sol</b> (pentagrama de arriba, mano derecha).' : 'se escribe en <b>clave de fa</b> (pentagrama de abajo, mano izquierda).';
    cap.innerHTML = `<b>${noteName(midi)}</b> — ${where}`;
  };
  const off = input.on((ev) => { if (ev.type === 'on' && el.isConnected && kb.has(ev.midi)) { stopDemo(); show(ev.midi); } });
  // Demostración inicial: un paseo de grave a agudo pasando por el Do central.
  let timers = [];
  const stopDemo = () => { timers.forEach(clearTimeout); timers = []; };
  const demo = cfg.demo || ['C3', 'E3', 'G3', 'B3', 'C4', 'D4', 'F4', 'A4', 'C5'];
  show(60);
  if (!reducedMotion() && cfg.autoplay !== false) {
    timers = demo.map((p, i) => setTimeout(() => { show(midiOf(p)); if (cfg.sound) playNote(midiOf(p), 0.4, 0.5); }, 900 + i * 750));
    timers.push(setTimeout(() => show(60), 900 + demo.length * 750));
  }
  return () => { stopDemo(); off(); kb.destroy(); sc?.destroy(); };
}

function ledgerLines(el) {
  const paper = h('div.paper');
  const cap = caption('Cuando una nota no cabe en el pentagrama, se le añaden <b>líneas adicionales</b>: trocitos de línea solo para esa nota. Se cuentan igual: línea, espacio, línea…');
  const sets = {
    arriba: { clef: 'treble', v: 'rh', notes: ['F5', 'G5', 'A5', 'B5', 'C6'] },
    abajo: { clef: 'treble', v: 'rh', notes: ['E4', 'D4', 'C4', 'B3', 'A3'] },
    fa: { clef: 'bass', v: 'lh', notes: ['A3', 'B3', 'C4', 'D4', 'E4'] },
  };
  let sc = null, tr = null, cur = sets.arriba;
  const show = (k) => {
    cur = sets[k]; tr?.stop(); sc?.destroy();
    sc = renderScore(paper, { clef: cur.clef, [cur.v]: cur.notes.map((p) => ({ p, d: 4 })) }, { scale: 12, names: true, step: 5.5 });
  };
  el.append(segmented([['arriba', 'Por encima (clave de sol)'], ['abajo', 'Por debajo (clave de sol)'], ['fa', 'Por encima (clave de fa)']], 'arriba', show, 'Dónde'), paper,
    h('div.row', playBtn('Escuchar', () => { tr?.stop(); sc.clear(); tr = playSequence(cur.notes.map((p, i) => ({ t: i, d: 1, midi: midiOf(p), i })), { bpm: 110, onNote: (n, on) => sc.set(cur.v, n.i, 'cur', on) }); })), cap);
  show('arriba');
  return () => { tr?.stop(); sc?.destroy(); };
}

// ---------- Ritmo ----------
const TEMPO_TERMS = [[40, 'Largo', 'muy lento'], [60, 'Adagio', 'lento'], [76, 'Andante', 'andando'], [100, 'Moderato', 'moderado'], [120, 'Allegro', 'rápido'], [160, 'Vivace', 'vivo'], [184, 'Presto', 'muy rápido']];
export function metronome(el, cfg = {}) {
  let bpm = cfg.bpm || 80, beats = cfg.beats || 4, tr = null, n = 0;
  const arm = h('div.metro-arm');
  const face = h('div.metro', arm);
  const num = h('output.metro-bpm');
  const term = h('span.metro-term');
  const dotsEl = h('div.beat-dots');
  const label = () => {
    const t = [...TEMPO_TERMS].reverse().find((x) => bpm >= x[0]) || TEMPO_TERMS[0];
    num.textContent = `${bpm}`;
    term.innerHTML = `<i>${t[1]}</i> (${t[2]})`;
  };
  const drawDots = () => { dotsEl.innerHTML = ''; for (let i = 0; i < beats; i++) dotsEl.append(h('i')); };
  const stop = () => { tr?.stop(); tr = null; btn.replaceChildren(icon('play'), 'Poner en marcha'); arm.style.transform = ''; [...dotsEl.children].forEach((d) => d.classList.remove('on')); };
  const start = () => {
    stop();
    n = 0;
    const tick = () => {
      // Se replanifica compás a compás para poder cambiar el tempo en marcha.
      const events = [];
      for (let b = 0; b < beats; b++) events.push({ t: b, audio: (at) => click(b === 0, at), fn: () => {
        [...dotsEl.children].forEach((d, i) => d.classList.toggle('on', i === b));
        arm.style.transitionDuration = `${60 / bpm}s`;
        arm.style.transform = `rotate(${n++ % 2 ? -24 : 24}deg)`;
      } });
      events.push({ t: beats - 0.02 });
      tr = new Transport({ bpm, events, startDelay: 0.02, onEnd: tick });
      tr.start();
    };
    tick();
    btn.replaceChildren(icon('stop'), 'Parar');
  };
  const btn = h('button.btn', { type: 'button', onclick: () => (tr ? stop() : start()) }, icon('play'), 'Poner en marcha');
  const slider = h('input', { type: 'range', min: 40, max: 200, value: bpm, 'aria-label': 'Tempo en pulsos por minuto', oninput: () => { bpm = Number(slider.value); label(); } });
  drawDots(); label();
  el.append(h('div.metro-box', face, h('div.metro-info', h('div.metro-read', num, h('span', ' pulsos por minuto')), term, slider, dotsEl, btn)));
  if (cfg.caption !== false) el.append(caption(cfg.caption || 'El metrónomo marca el <b>pulso</b>. Mueve el control: el pulso sigue siendo regular, solo cambia la velocidad, es decir, el <b>tempo</b>.'));
  return stop;
}

function durations(el, cfg = {}) {
  const rows = [
    { d: 4, name: 'Redonda', g: 'nWhole', n: 1 }, { d: 2, name: 'Blanca', g: 'nHalf', n: 2 }, { d: 1, name: 'Negra', g: 'nQuarter', n: 4 },
    { d: 0.5, name: 'Corchea', g: 'n8', n: 8 }, { d: 0.25, name: 'Semicorchea', g: 'n16', n: 16 },
  ].filter((r) => (cfg.max ? r.d <= cfg.max : true) && (cfg.min ? r.d >= cfg.min : r.d >= 0.5));
  const grid = h('div.dur-grid');
  const cap = caption('Cada fila dura lo mismo: cuatro pulsos. Pulsa una fila para oírla sobre el metrónomo.');
  let tr = null;
  rows.forEach((r) => {
    const cells = h('div.dur-cells');
    for (let i = 0; i < r.n; i++) cells.append(h('span.dur-cell', { style: { flex: r.d }, html: glyphHtml(r.g) }));
    const row = h('button.dur-row', { type: 'button', onclick: () => {
      tr?.stop();
      grid.querySelectorAll('.on').forEach((x) => x.classList.remove('on'));
      const events = [];
      for (let b = 0; b < 4; b++) events.push({ t: b, audio: (at) => click(b === 0, at) });
      for (let i = 0; i < r.n; i++) {
        events.push({ t: i * r.d, audio: (at) => playNote(72, r.d * 0.6, 0.7, at), fn: () => cells.children[i].classList.add('on') });
        events.push({ t: (i + 1) * r.d - 0.02, fn: () => cells.children[i].classList.remove('on') });
      }
      events.push({ t: 4 });
      tr = new Transport({ bpm: 72, events });
      tr.start();
      cap.innerHTML = `<b>${r.name}</b>: dura ${String(r.d).replace('.', ',')} ${r.d === 1 ? 'pulso' : 'pulsos'}. En cuatro pulsos caben ${r.n}.`;
    } }, h('span.dur-name', r.name, h('small', `${String(r.d).replace('.', ',')} ${r.d === 1 ? 'pulso' : 'pulsos'}`)), cells);
    grid.append(row);
  });
  el.append(grid, cap);
  return () => tr?.stop();
}

function restsTable(el) {
  const rows = [['Redonda', 'nWhole', 'restWhole', '4 pulsos', 'cuelga de la 4ª línea'], ['Blanca', 'nHalf', 'restHalf', '2 pulsos', 'se apoya sobre la 3ª línea'],
    ['Negra', 'nQuarter', 'restQuarter', '1 pulso', 'un garabato vertical'], ['Corchea', 'n8', 'rest8', 'medio pulso', 'un gancho'], ['Semicorchea', 'n16', 'rest16', 'un cuarto de pulso', 'dos ganchos']];
  const t = h('table.sym-table', h('thead', h('tr', h('th', 'Figura'), h('th', 'Nota'), h('th', 'Silencio'), h('th', 'Duración'), h('th', 'Cómo reconocerlo'))));
  const tb = h('tbody');
  rows.forEach(([n, a, b, d, tip]) => {
    const sil = h('td.glyph-cell');
    renderScore(sil, { clef: 'treble', time: [4, 4], rh: [{ p: null, d: { restWhole: 4, restHalf: 2, restQuarter: 1, rest8: 0.5, rest16: 0.25 }[b] }] }, { scale: 7, width: 120, fit: true, open: true });
    tb.append(h('tr', h('th', { scope: 'row' }, n), h('td.glyph-cell', { html: glyphHtml(a, 'xl') }), sil, h('td', d), h('td', tip)));
  });
  t.append(tb);
  el.append(h('div.table-wrap', t));
  return () => {};
}

function timeSignature(el) {
  const SIGS = {
    '2/4': { n: 2, d: 4, acc: [0], text: 'Dos pulsos de negra por compás: <b>fuerte</b>, débil. Es el compás de las marchas y los pasodobles.' },
    '3/4': { n: 3, d: 4, acc: [0], text: 'Tres pulsos de negra: <b>fuerte</b>, débil, débil. Es el compás del vals.' },
    '4/4': { n: 4, d: 4, acc: [0, 2], text: 'Cuatro pulsos de negra: <b>fuerte</b>, débil, semifuerte, débil. El más habitual; a veces se escribe con una C.' },
    '6/8': { n: 6, d: 8, acc: [0, 3], text: 'Seis corcheas agrupadas de tres en tres: se sienten <b>dos</b> pulsos grandes. Suena a balanceo.' },
  };
  let cur = '4/4', tr = null;
  const big = h('div.ts-big');
  const dotsEl = h('div.beat-dots.large');
  const cap = caption('');
  const stop = () => { tr?.stop(); tr = null; btn.replaceChildren(icon('play'), 'Escuchar el compás'); };
  const show = (k) => {
    stop(); cur = k;
    const s = SIGS[k];
    big.innerHTML = `<span class="mg-inline">${String.fromCharCode(0xe080 + s.n)}</span><span class="mg-inline">${String.fromCharCode(0xe080 + s.d)}</span>`;
    dotsEl.innerHTML = '';
    for (let i = 0; i < s.n; i++) dotsEl.append(h('i' + (s.acc.includes(i) ? '.acc' : ''), String(i + 1)));
    cap.innerHTML = `${s.text}<br>Número de arriba: <b>cuántos pulsos</b> entran en cada compás. Número de abajo: <b>qué figura vale un pulso</b> (4 = negra, 8 = corchea).`;
  };
  const start = () => {
    stop();
    const s = SIGS[cur];
    const unit = 4 / s.d;
    const loop = () => {
      const events = [];
      for (let b = 0; b < s.n; b++) events.push({ t: b * unit, audio: (at) => click(s.acc.includes(b), at), fn: () => [...dotsEl.children].forEach((d, i) => d.classList.toggle('on', i === b)) });
      events.push({ t: s.n * unit - 0.02 });
      tr = new Transport({ bpm: s.d === 8 ? 96 : 100, events, startDelay: 0.02, onEnd: loop });
      tr.start();
    };
    loop();
    btn.replaceChildren(icon('stop'), 'Parar');
  };
  const btn = h('button.btn', { type: 'button', onclick: () => (tr ? stop() : start()) }, icon('play'), 'Escuchar el compás');
  el.append(segmented(Object.keys(SIGS).map((k) => [k, k]), cur, show, 'Compás'), h('div.ts-row', big, dotsEl), h('div.row', btn), cap);
  show(cur);
  return stop;
}

function dotTie(el) {
  const base = { 2: ['Blanca', 'nHalf'], 1: ['Negra', 'nQuarter'], 0.5: ['Corchea', 'n8'] };
  let d = 2, dotted = true;
  const bars = h('div.dot-bars');
  const cap = caption('');
  const draw = () => {
    const [name, g] = base[d];
    const total = dotted ? d * 1.5 : d;
    bars.innerHTML = '';
    bars.append(h('div.dot-line', h('span.dot-glyph', { html: glyphHtml(g, 'xl') + (dotted ? glyphHtml('dot', 'xl') : '') }),
      h('div.dot-track', h('span.seg.base', { style: { flex: d } }, `${String(d).replace('.', ',')}`), dotted ? h('span.seg.extra', { style: { flex: d / 2 } }, `+ ${String(d / 2).replace('.', ',')}`) : null, h('span.seg.void', { style: { flex: 3 - total } }))));
    cap.innerHTML = dotted
      ? `<b>${name} con puntillo</b>: ${String(d).replace('.', ',')} + ${String(d / 2).replace('.', ',')} = <b>${String(total).replace('.', ',')} pulsos</b>. El puntillo añade la mitad de lo que vale la figura.`
      : `<b>${name}</b> sin puntillo: ${String(d).replace('.', ',')} ${d === 1 ? 'pulso' : 'pulsos'}.`;
  };
  const listen = () => {
    const total = dotted ? d * 1.5 : d;
    const events = [];
    for (let b = 0; b < 4; b++) events.push({ t: b, audio: (at) => click(b === 0, at) });
    events.push({ t: 0, audio: (at) => playNote(72, total * (60 / 80) * 0.97, 0.75, at) }, { t: 4 });
    new Transport({ bpm: 80, events }).start();
  };
  el.append(h('div.row', segmented([[2, 'Blanca'], [1, 'Negra'], [0.5, 'Corchea']], d, (v) => { d = Number(v); draw(); }, 'Figura'),
    segmented([['1', 'Con puntillo'], ['0', 'Sin puntillo']], '1', (v) => { dotted = v === '1'; draw(); }, 'Puntillo')), bars, h('div.row', playBtn('Escuchar sobre el pulso', listen)), cap);
  draw();
  return () => {};
}

// ---------- Alteraciones, escalas, acordes ----------
function semitones(el) {
  const stage = h('div.stage');
  const kb = new Keyboard(stage, { from: 'C4', to: 'C5', labels: 'all', maxKey: 58, pcHints: true });
  pcKeyboard.setBase(60);
  const cap = caption('Toca dos teclas, una después de otra, y cuenta la distancia entre ellas.');
  let first = null;
  const pair = (a, b) => {
    kb.clear('sel ok');
    kb.mark(a, 'sel'); kb.mark(b, 'ok');
    const semis = Math.abs(b - a);
    const tones = semis / 2;
    const txt = semis === 0 ? 'Es la misma tecla.' : semis === 1 ? '<b>1 semitono</b>: son teclas vecinas, no hay ninguna en medio. Es la distancia más pequeña del piano.'
      : semis === 2 ? '<b>1 tono</b> = 2 semitonos: hay exactamente una tecla en medio.'
        : `<b>${semis} semitonos</b> (${String(tones).replace('.', ',')} tonos).`;
    cap.innerHTML = `De ${noteName(a)} a ${noteName(b)}: ${txt}`;
  };
  const off = input.on((ev) => {
    if (ev.type !== 'on' || !el.isConnected || !kb.has(ev.midi)) return;
    if (first == null) { first = ev.midi; kb.clear('sel ok'); kb.mark(first, 'sel'); cap.innerHTML = `${noteName(first)}… toca otra tecla.`; }
    else { pair(first, ev.midi); first = null; }
  });
  const preset = (a, b, label) => h('button.btn.ghost.small', { type: 'button', onclick: () => { first = null; pair(a, b); playNote(a, 0.4); setTimeout(() => playNote(b, 0.5), 380); } }, label);
  el.append(stage, h('div.row', preset(60, 61, 'Do → Do♯'), preset(64, 65, 'Mi → Fa'), preset(60, 62, 'Do → Re'), preset(71, 72, 'Si → Do')), cap,
    caption('Entre <b>Mi y Fa</b> y entre <b>Si y Do</b> no hay tecla negra: están a un semitono aunque las dos sean blancas.'));
  return () => { off(); kb.destroy(); };
}

function accidentals(el) {
  const paper = h('div.paper.center');
  const stage = h('div.stage');
  const kb = new Keyboard(stage, { from: 'B3', to: 'C5', labels: 'all', interactive: true, maxKey: 52 });
  const cap = caption('');
  let letter = 3, alter = 1, sc = null;
  const draw = (sound = true) => {
    const p = LETTERS[letter] + (alter > 0 ? '#' : alter < 0 ? 'b' : '') + '4';
    const midi = parsePitch(p).midi;
    sc?.destroy();
    sc = renderScore(paper, { clef: 'treble', rh: [{ p, d: 4, acc: alter === 0 }] }, { scale: 13, width: 220, fit: true, step: 5.5 });
    kb.clear('ok');
    kb.mark(midi, 'ok');
    const base = SOLFEGE[letter];
    const other = alter > 0 ? noteName(midi, true) : noteName(midi, false);
    cap.innerHTML = alter > 0 ? `<b>${base} sostenido (${base}♯)</b>: un semitono más agudo que ${base}, la tecla inmediata a la derecha.${isBlack(midi) ? ` Es la misma tecla que ${other}.` : ` ¡Aquí no hay tecla negra! ${base}♯ se toca en la tecla blanca ${noteName(midi)}.`}`
      : alter < 0 ? `<b>${base} bemol (${base}♭)</b>: un semitono más grave que ${base}, la tecla inmediata a la izquierda.${isBlack(midi) ? ` Es la misma tecla que ${other}.` : ` ¡Aquí no hay tecla negra! ${base}♭ se toca en la tecla blanca ${noteName(midi)}.`}`
        : `<b>${base} natural</b>: el becuadro (♮) anula un sostenido o bemol anterior y devuelve la nota a su tecla blanca.`;
    if (sound) playNote(midi, 0.6, 0.7);
  };
  el.append(h('div.row', segmented(SOLFEGE.map((s, i) => [i, s]), letter, (v) => { letter = Number(v); draw(); }, 'Nota'),
    segmented([[-1, '♭ bemol'], [0, '♮ becuadro'], [1, '♯ sostenido']], alter, (v) => { alter = Number(v); draw(); }, 'Alteración')), paper, stage, cap);
  draw(false);
  return () => { kb.destroy(); sc?.destroy(); };
}

function scaleBuilder(el, cfg = {}) {
  const paper = h('div.paper');
  const stage = h('div.stage');
  const strip = h('div.step-strip');
  const cap = caption('');
  const kb = new Keyboard(stage, { from: 'C3', to: 'C5', labels: 'none', maxKey: 40 });
  let key = KEYS.find((k) => k.name === (cfg.tonic || 'Do')), mode = cfg.mode || 'mayor', sc = null, tr = null, notes = [];
  const draw = () => {
    tr?.stop();
    const steps = mode === 'mayor' ? MAJOR_STEPS : MINOR_STEPS;
    let tonic = key.tonic;
    if (mode === 'menor') { // relativa menor: una tercera menor por debajo
      const t = scale(key.tonic, MAJOR_STEPS)[5];
      tonic = pitchString({ ...t, octave: t.octave - 1 });
      if (parsePitch(tonic).midi < 48) tonic = pitchString({ ...parsePitch(tonic), octave: parsePitch(tonic).octave + 1 });
    }
    notes = scale(tonic, steps);
    kb.clear('sel ok'); kb.clearBubbles();
    notes.forEach((n, i) => { kb.mark(n.midi, 'sel'); kb.bubble(n.midi, i === 7 ? '8' : String(i + 1), i === 0 || i === 7 ? 'accent' : ''); });
    sc?.destroy();
    sc = renderScore(paper, { clef: 'treble', rh: notes.map((n) => ({ p: pitchString(n), d: 4 })) }, { scale: 11, names: true, step: 5 });
    strip.innerHTML = '';
    steps.forEach((s) => strip.append(h('span' + (s === 1 ? '.semi' : ''), s === 2 ? 'Tono' : 'Semitono')));
    const altered = notes.slice(0, 7).filter((n) => n.alter).map((n) => noteName(pitchString(n)));
    const name = mode === 'mayor' ? `${key.name} mayor` : `${key.minor} menor`;
    cap.innerHTML = `<b>Escala de ${name}</b>. ${altered.length ? `Para respetar el patrón necesita ${altered.length === 1 ? 'una nota alterada' : `${altered.length} notas alteradas`}: <b>${altered.join(', ')}</b>.` : 'Solo usa teclas blancas.'}`;
  };
  const play = () => {
    tr?.stop(); sc.clear(); kb.clear('ok');
    tr = playSequence(notes.map((n, i) => ({ t: i * 0.5, d: 0.5, midi: n.midi, i })), { bpm: 76, onNote: (n, on) => { sc.set('rh', n.i, 'cur', on); on ? kb.mark(n.midi, 'ok') : kb.unmark(n.midi, 'ok'); } });
  };
  const sel = h('select.select', { 'aria-label': 'Tonalidad', onchange: () => { key = KEYS[sel.value]; draw(); } },
    [0, 1, 2, 3, 4, 11, 10, 9].map((i) => h('option', { value: i }, `${KEYS[i].name} mayor / ${KEYS[i].minor} menor`)));
  sel.value = KEYS.indexOf(key);
  el.append(h('div.row', sel, cfg.lockMode ? null : segmented([['mayor', 'Mayor'], ['menor', 'Menor']], mode, (v) => { mode = v; draw(); }, 'Modo'), playBtn('Escuchar', play)), strip, stage, paper, cap);
  draw();
  return () => { tr?.stop(); kb.destroy(); sc?.destroy(); };
}

function chordBuilder(el) {
  const paper = h('div.paper.center');
  const stage = h('div.stage');
  const kb = new Keyboard(stage, { from: 'C4', to: 'B5', labels: 'all', maxKey: 44 });
  const cap = caption('');
  let root = 0, type = 'mayor', sc = null, midis = [];
  const draw = (sound = true) => {
    const tonic = LETTERS[root] + '4';
    const sc7 = scale(tonic, MAJOR_STEPS);
    const notes = [sc7[0], sc7[2], sc7[4]].map((n) => ({ ...n }));
    if (type === 'menor') { notes[1].midi -= 1; notes[1].alter -= 1; }
    midis = notes.map((n) => n.midi);
    kb.clear('sel'); kb.clearBubbles();
    notes.forEach((n, i) => { kb.mark(n.midi, 'sel'); kb.bubble(n.midi, ['1ª', '3ª', '5ª'][i], i === 0 ? 'accent' : ''); });
    sc?.destroy();
    const ps = notes.map(pitchString);
    sc = renderScore(paper, { clef: 'treble', rh: [{ p: ps[0], d: 1 }, { p: ps[1], d: 1 }, { p: ps[2], d: 1 }, { p: ps, d: 4 }] }, { scale: 12, width: 330, fit: true, step: 5.5 });
    cap.innerHTML = `<b>${SOLFEGE[root]} ${type}</b>: ${notes.map((n) => noteName(pitchString(n))).join(' – ')}. De la 1ª a la 3ª hay <b>${type === 'mayor' ? '4' : '3'} semitonos</b>; de la 3ª a la 5ª, <b>${type === 'mayor' ? '3' : '4'}</b>. ${type === 'mayor' ? 'Suena luminoso.' : 'Suena más sombrío.'}`;
    if (sound) listen();
  };
  const listen = () => {
    playSequence([...midis.map((m, i) => ({ t: i * 0.5, d: 0.5, midi: m })), { t: 1.75, d: 2, midis }], { bpm: 80 });
  };
  el.append(h('div.row', segmented(SOLFEGE.map((s, i) => [i, s]), root, (v) => { root = Number(v); draw(); }, 'Nota fundamental'),
    segmented([['mayor', 'Mayor'], ['menor', 'Menor']], type, (v) => { type = v; draw(); }, 'Tipo')), stage, paper, h('div.row', playBtn('Escuchar', listen)), cap);
  draw(false);
  return () => { kb.destroy(); sc?.destroy(); };
}

function intervals(el) {
  const NAMES = ['', 'unísono', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava'];
  const paper = h('div.paper.center');
  const stage = h('div.stage');
  const kb = new Keyboard(stage, { from: 'C4', to: 'C5', labels: 'all', maxKey: 54 });
  const cap = caption('');
  let n = 3, sc = null;
  const draw = (sound = true) => {
    const sc7 = scale('C4', MAJOR_STEPS);
    const top = sc7[n - 1];
    sc?.destroy();
    sc = renderScore(paper, { clef: 'treble', rh: [{ p: 'C4', d: 1 }, { p: pitchString(top), d: 1 }, { p: ['C4', pitchString(top)], d: 4 }] }, { scale: 12, width: 300, fit: true, step: 6 });
    kb.clear('sel ok');
    kb.mark(60, 'sel'); kb.mark(top.midi, 'ok');
    cap.innerHTML = `De Do a ${noteName(top.midi)} hay una <b>${NAMES[n]}</b>: se cuentan ${n} notas, incluyendo la primera y la última (${sc7.slice(0, n).map((x) => noteName(x.midi)).join(', ')}).`;
    if (sound) playSequence([{ t: 0, d: 0.75, midi: 60 }, { t: 0.75, d: 0.75, midi: top.midi }, { t: 1.75, d: 1.5, midis: [60, top.midi] }], { bpm: 90 });
  };
  el.append(segmented([2, 3, 4, 5, 6, 7, 8].map((k) => [k, `${k}ª`]), n, (v) => { n = Number(v); draw(); }, 'Intervalo'), paper, stage, cap,
    caption('En el pentagrama se ve enseguida: de línea a la línea siguiente (o de espacio a espacio) hay una tercera; de línea al espacio vecino, una segunda.'));
  draw(false);
  return () => { kb.destroy(); sc?.destroy(); };
}

function circleOfFifths(el) {
  const R = 150, C = 180;
  const svg = svgEl('svg', { viewBox: '0 0 360 360', class: 'fig-svg circle5' });
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const paper = h('div.paper.center');
  const cap = caption('');
  let sc = null;
  const sectors = [];
  const pick = (i, sound = true) => {
    const k = KEYS[i];
    sectors.forEach((s, j) => s.classList.toggle('on', j === i));
    sc?.destroy();
    sc = renderScore(paper, { clef: 'grand', key: k.sig, rh: [{ p: 'B4', d: 4, hide: true }], lh: [{ p: 'D3', d: 4, hide: true }] }, { scale: 11, width: 220, fit: true, step: 3 });
    const n = Math.abs(k.sig);
    const list = (k.sig > 0 ? SHARP_ORDER : FLAT_ORDER).slice(0, n).map((l) => SOLFEGE[l]).join(', ');
    cap.innerHTML = `<b>${k.name} mayor</b> (y su relativa, ${k.minor} menor): ${n === 0 ? 'sin alteraciones en la armadura.' : `${n} ${k.sig > 0 ? (n === 1 ? 'sostenido' : 'sostenidos') : (n === 1 ? 'bemol' : 'bemoles')} — <b>${list}</b>.`}`;
    if (sound) { const sc8 = scale(k.tonic, MAJOR_STEPS); playSequence(sc8.map((x, j) => ({ t: j * 0.4, d: 0.4, midi: x.midi })), { bpm: 110 }); }
  };
  order.forEach((i, pos) => {
    const a0 = ((pos - 0.5) * 30 - 90) * (Math.PI / 180), a1 = ((pos + 0.5) * 30 - 90) * (Math.PI / 180), am = (pos * 30 - 90) * (Math.PI / 180);
    const r0 = 62;
    const g = svgEl('g', { class: 'sector', tabindex: 0, role: 'button', 'aria-label': `${KEYS[i].name} mayor` }, svg);
    svgEl('path', { d: `M${C + R * Math.cos(a0)},${C + R * Math.sin(a0)} A${R},${R} 0 0 1 ${C + R * Math.cos(a1)},${C + R * Math.sin(a1)} L${C + r0 * Math.cos(a1)},${C + r0 * Math.sin(a1)} A${r0},${r0} 0 0 0 ${C + r0 * Math.cos(a0)},${C + r0 * Math.sin(a0)} Z` }, g);
    svgEl('text', { x: C + 118 * Math.cos(am), y: C + 118 * Math.sin(am) + 2, class: 'maj' }, g).textContent = KEYS[i].name;
    svgEl('text', { x: C + 84 * Math.cos(am), y: C + 84 * Math.sin(am) + 2, class: 'min' }, g).textContent = `${KEYS[i].minor} m`;
    const sig = KEYS[i].sig;
    svgEl('text', { x: C + 164 * Math.cos(am), y: C + 164 * Math.sin(am) + 3, class: 'cnt' }, svg).textContent = sig === 0 ? '0' : `${Math.abs(sig)}${sig > 0 ? '♯' : '♭'}`;
    g.addEventListener('click', () => pick(i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    sectors[i] = g;
  });
  el.append(h('div.circle-row', svg, h('div', paper, cap)),
    caption('Girando hacia la derecha, cada tonalidad empieza una <b>quinta</b> más arriba y añade un sostenido. Hacia la izquierda, un bemol más.'));
  pick(0, false);
  return () => sc?.destroy();
}

// ---------- Expresión ----------
function dynamics(el) {
  const LEVELS = [['pp', 'pianissimo', 'muy suave', 0.16], ['p', 'piano', 'suave', 0.3], ['mp', 'mezzo piano', 'medio suave', 0.46], ['mf', 'mezzo forte', 'medio fuerte', 0.64], ['f', 'forte', 'fuerte', 0.84], ['ff', 'fortissimo', 'muy fuerte', 1]];
  const phrase = [60, 64, 67, 72, 67, 64, 60];
  const cap = caption('Pulsa cada matiz para oír la misma frase con distinta intensidad.');
  const row = h('div.dyn-row');
  LEVELS.forEach(([g, it, es, vel]) => {
    row.append(h('button.dyn-btn', { type: 'button', onclick: () => {
      playSequence(phrase.map((m, i) => ({ t: i * 0.5, d: 0.5, midi: m, vel })), { bpm: 110 });
      cap.innerHTML = `<span class="mg-inline">${G[g]}</span> <b><i>${it}</i></b>: ${es}.`;
    } }, h('span.mg-inline', G[g]), h('span.dyn-bar', { style: { height: `${10 + vel * 46}px` } }), h('small', es)));
  });
  const ramp = (up) => () => {
    const seq = [60, 62, 64, 65, 67, 69, 71, 72];
    playSequence(seq.map((m, i) => ({ t: i * 0.5, d: 0.5, midi: m, vel: up ? 0.15 + i * 0.12 : 1 - i * 0.12 })), { bpm: 110 });
    cap.innerHTML = up ? '<b><i>Crescendo</i></b>: cada nota un poco más fuerte que la anterior. Se dibuja como un ángulo que se abre.' : '<b><i>Diminuendo</i></b> (o <i>decrescendo</i>): cada nota un poco más suave. Se dibuja como un ángulo que se cierra.';
  };
  const hair = h('div.paper');
  renderScore(hair, { clef: 'treble', time: [4, 4], rh: [{ p: 'C4', d: 1, dyn: 'p' }, { p: 'D4', d: 1 }, { p: 'E4', d: 1 }, { p: 'F4', d: 1 }, { p: 'G4', d: 1, dyn: 'f' }, { p: 'F4', d: 1 }, { p: 'E4', d: 1 }, { p: 'D4', d: 1 }, { p: 'C4', d: 4, dyn: 'p' }],
    spans: [{ type: 'cresc', from: 1, to: 3 }, { type: 'dim', from: 5, to: 7 }] }, { scale: 10 });
  el.append(row, cap, hair, h('div.row', playBtn('Crescendo', ramp(true)), playBtn('Diminuendo', ramp(false))));
  return () => {};
}

function articulation(el) {
  const base = ['C4', 'D4', 'E4', 'F4', 'G4'];
  const MODES = {
    legato: { ev: (p) => ({ p, d: 1 }), spans: [{ type: 'slur', from: 0, to: 4 }], seq: (m, i) => ({ t: i, d: 1.08, midi: m }), text: '<b>Legato</b> (ligado): las notas se unen sin dejar hueco entre ellas. Se indica con un arco, la <i>ligadura de expresión</i>.' },
    staccato: { ev: (p) => ({ p, d: 1, stacc: true }), seq: (m, i) => ({ t: i, d: 1, midi: m, short: true }), text: '<b>Staccato</b> (picado): notas cortas y separadas, como si la tecla quemara. Se indica con un punto encima o debajo de la cabeza.' },
    acento: { ev: (p, i) => ({ p, d: 1, accent: i % 2 === 0 }), seq: (m, i) => ({ t: i, d: 0.9, midi: m, vel: i % 2 === 0 ? 1 : 0.45 }), text: '<b>Acento</b>: esa nota se ataca con más fuerza que las de alrededor. Se indica con el signo &gt;.' },
    tenuto: { ev: (p) => ({ p, d: 1, tenuto: true }), seq: (m, i) => ({ t: i, d: 1, midi: m }), text: '<b>Tenuto</b>: mantén la nota todo su valor, con un pelín de peso. Se indica con una rayita.' },
    calderon: { ev: (p, i) => ({ p, d: 1, fermata: i === 4 }), seq: (m, i) => ({ t: i, d: i === 4 ? 3 : 1, midi: m }), text: '<b>Calderón</b>: detén el pulso y alarga esa nota a tu gusto antes de seguir.' },
  };
  const paper = h('div.paper');
  const cap = caption('');
  let sc = null, tr = null, cur = 'legato';
  const show = (k, sound = true) => {
    cur = k; tr?.stop(); sc?.destroy();
    const m = MODES[k];
    sc = renderScore(paper, { clef: 'treble', time: [4, 4], rh: [...base.map(m.ev), { p: null, d: 3 }], spans: m.spans }, { scale: 11, open: true });
    cap.innerHTML = m.text;
    if (sound) listen();
  };
  const listen = () => {
    tr?.stop(); sc.clear();
    tr = playSequence(base.map((p, i) => ({ ...MODES[cur].seq(midiOf(p), i), i })), { bpm: 104, legato: 1, onNote: (n, on) => sc.set('rh', n.i, 'cur', on) });
  };
  el.append(segmented([['legato', 'Legato'], ['staccato', 'Staccato'], ['acento', 'Acento'], ['tenuto', 'Tenuto'], ['calderon', 'Calderón']], cur, (v) => show(v), 'Articulación'), paper, h('div.row', playBtn('Escuchar otra vez', listen)), cap);
  show(cur, false);
  return () => { tr?.stop(); sc?.destroy(); };
}

// ---------- Repeticiones: recorrido animado ----------
function repeatMap(el) {
  const MOTIFS = { A: [60, 64, 67, 64], B: [65, 69, 72, 69], C: [67, 71, 74, 71], D: [62, 65, 69, 65], E: [72, 67, 64, 60] };
  const KINDS = {
    barras: { bars: ['A', 'B', 'C'], order: 'ABABC', marks: { 0: { l: '' }, 1: { r: '' } }, text: 'Entre las <b>barras de repetición</b> (dos puntos junto a una doble barra) todo se toca dos veces.' },
    casillas: { bars: ['A', 'B', 'C', 'D'], order: 'ABCABD', marks: { 0: { l: '' }, 2: { r: '', top: '1.' }, 3: { top: '2.' } }, text: 'La <b>1ª casilla</b> se toca solo la primera vez. Al repetir, se salta y se pasa directamente a la <b>2ª casilla</b>.' },
    dacapo: { bars: ['A', 'B', 'C', 'D'], order: 'ABCDAB', marks: { 1: { under: 'Fine' }, 3: { under: 'D.C. al Fine' } }, text: '<b>D.C.</b> (<i>da capo</i>, «desde la cabeza»): vuelve al principio. <b>al Fine</b>: y termina donde pone <i>Fine</i>.' },
    coda: { bars: ['A', 'B', 'C', 'D', 'E'], order: 'ABCDBE', marks: { 1: { topG: G.segno }, 2: { under: 'al Coda', r2: G.coda }, 3: { under: 'D.S. al Coda' }, 4: { topG: G.coda } }, text: '<b>D.S.</b> (<i>dal segno</i>): vuelve al signo <span class="mg-inline">' + G.segno + '</span>. <b>al Coda</b>: al llegar a la indicación, salta a la coda <span class="mg-inline">' + G.coda + '</span>, el trozo final.' },
  };
  const track = h('div.rep-track');
  const orderEl = h('div.rep-order');
  const cap = caption('');
  let cur = 'barras', tr = null;
  const show = (k) => {
    tr?.stop(); cur = k;
    const K = KINDS[k];
    track.innerHTML = '';
    K.bars.forEach((b, i) => {
      const m = K.marks[i] || {};
      track.append(h('div.rep-bar' + (m.top ? '.volta' : ''), { 'data-b': b },
        m.top ? h('span.rep-volta', m.top) : null, m.topG ? h('span.rep-top.mg-inline', m.topG) : null,
        m.l ? h('span.rep-sign.l.mg-inline', m.l) : null, h('b', b), m.r ? h('span.rep-sign.r.mg-inline', m.r) : null, m.r2 ? h('span.rep-top.right.mg-inline', m.r2) : null,
        m.under ? h('span.rep-under', m.under) : null));
    });
    orderEl.innerHTML = '';
    [...K.order].forEach((c) => orderEl.append(h('span', c)));
    cap.innerHTML = K.text;
  };
  const run = () => {
    tr?.stop();
    const K = KINDS[cur];
    const events = [];
    [...K.order].forEach((c, i) => {
      events.push({ t: i * 2, fn: () => {
        track.querySelectorAll('.rep-bar').forEach((x) => x.classList.toggle('on', x.dataset.b === c));
        [...orderEl.children].forEach((x, j) => x.classList.toggle('on', j === i));
      } });
      MOTIFS[c].forEach((m, j) => events.push({ t: i * 2 + j * 0.5, audio: (at) => playNote(m, 0.22, 0.6, at) }));
    });
    events.push({ t: K.order.length * 2, fn: () => { track.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); } });
    tr = new Transport({ bpm: 132, events });
    tr.start();
  };
  el.append(segmented([['barras', 'Barras de repetición'], ['casillas', '1ª y 2ª casilla'], ['dacapo', 'D.C. al Fine'], ['coda', 'D.S. al Coda']], cur, show, 'Tipo de repetición'),
    track, h('div.row', playBtn('Seguir el recorrido', run), h('span.rep-order-label', 'Orden en que suena:'), orderEl), cap);
  show(cur);
  return () => tr?.stop();
}

// ---------- Anatomía de una partitura ----------
function scoreAnatomy(el) {
  const score = {
    clef: 'grand', time: [3, 4], key: 1, tempo: 'Andante',
    rh: [{ p: 'D5', d: 1, f: 5, dyn: 'mf' }, { p: 'B4', d: 1, stacc: true }, { p: 'G4', d: 1, stacc: true }, { p: 'A4', d: 2, tie: true }, { p: 'A4', d: 0.5 }, { p: 'B4', d: 0.5 },
      { p: 'C5', d: 1, accent: true }, { p: 'A4', d: 1 }, { p: 'F#4', d: 1 }, { p: 'G4', d: 3, fermata: true }],
    lh: [{ p: 'G3', d: 3, f: 1 }, { p: 'D3', d: 3 }, { p: ['D3', 'F#3'], d: 2 }, { p: null, d: 1 }, { p: ['G2', 'D3'], d: 3 }],
    spans: [{ type: 'slur', from: 6, to: 8 }, { type: 'dim', from: 6, to: 8 }],
    repeats: [{ from: 0, to: 3 }],
  };
  const SPOTS = [
    ['.brace', 'Llave', 'Une los dos pentagramas: se leen y se tocan a la vez. Arriba suele ir la mano derecha y abajo la izquierda.'],
    ['.clef', 'Clave', 'Dice qué nota es cada línea. Arriba, clave de sol; abajo, clave de fa.'],
    ['.keysig', 'Armadura', 'Un sostenido en la línea de Fa: todos los Fa de la pieza son Fa♯, salvo que un becuadro diga lo contrario.'],
    ['.timesig', 'Compás', '3/4: cada compás tiene tres pulsos de negra.'],
    ['.score-tempo', 'Tempo', 'Velocidad y carácter. «Andante» es un paso tranquilo. A veces se añade una cifra de metrónomo: negra = 76 significa 76 pulsos de negra por minuto.'],
    ['.dyn', 'Matiz', '<i>mezzo forte</i>: medio fuerte. Vale hasta que aparezca otro matiz.'],
    ['.finger', 'Digitación', 'El número indica qué dedo usar: 1 es el pulgar y 5 el meñique.'],
    ['.ev[data-i="1"] .mid', 'Staccato', 'El punto pide una nota corta y separada.'],
    ['.tie', 'Ligadura de unión', 'Une dos notas iguales: se toca solo la primera y se mantiene la suma de las dos.'],
    ['.slur', 'Ligadura de expresión', 'El arco sobre notas distintas pide tocarlas legato, unidas.'],
    ['.ev[data-i="6"] .mid', 'Acento', 'Esta nota se toca con más fuerza que las vecinas.'],
    ['.ev[data-i="9"] .mid', 'Calderón', 'Alarga la nota a tu gusto: el pulso se detiene un instante.'],
    ['.repeat', 'Barra de repetición', 'Al llegar aquí, vuelve al principio y toca todo otra vez.'],
  ];
  const paper = h('div.paper.anatomy');
  const panel = h('div.anatomy-panel', { 'aria-live': 'polite' }, h('b', 'Toca un número'), h('p', 'Cada número señala un elemento de la partitura.'));
  el.append(paper, panel);
  const sc = renderScore(paper, score, { scale: 11, color: true });
  const place = () => {
    const svg = sc.svg;
    svg.querySelectorAll('.hotspot').forEach((n) => n.remove());
    SPOTS.forEach(([sel, title, text], i) => {
      const target = svg.querySelector(sel);
      if (!target) return;
      // Los símbolos de la tipografía musical tienen una caja enorme: se usa su punto de anclaje.
      const isGlyph = target.tagName === 'text' && target.classList.contains('mg');
      const bb = target.getBBox();
      const g = svgEl('g', { class: 'hotspot', tabindex: 0, role: 'button', 'aria-label': title }, svg);
      let cx = bb.x - 4, cy = bb.y - 4;
      if (target.classList.contains('slur') || target.classList.contains('tie')) { cx = bb.x + bb.width / 2; cy = bb.y + (target.classList.contains('tie') ? bb.height + 8 : -8); }
      if (isGlyph) {
        cx = Number(target.getAttribute('x')) - 5; cy = Number(target.getAttribute('y')) - 14;
        if (target.classList.contains('mid')) { cx += 14; cy += 4; }
        if (target.classList.contains('brace')) { cx += 2; cy -= 60; }
        if (target.classList.contains('clef')) cy -= 22;
        if (target.classList.contains('dyn')) { cx -= 6; cy += 8; }
      }
      cx = Math.max(10, cx); cy = Math.max(10, cy);
      svgEl('circle', { cx, cy, r: 9 }, g);
      svgEl('text', { x: cx, y: cy + 0.5 }, g).textContent = i + 1;
      const pick = () => {
        svg.querySelectorAll('.hotspot').forEach((n) => n.classList.remove('on'));
        g.classList.add('on');
        panel.replaceChildren(h('b', `${i + 1}. ${title}`), h('p', { html: text }));
      };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  };
  const orig = sc.redraw;
  sc.redraw = () => { orig(); place(); };
  document.fonts.ready.then(() => el.isConnected && place());
  const ro = new ResizeObserver(() => setTimeout(() => el.isConnected && place(), 160));
  ro.observe(paper);
  return () => { ro.disconnect(); sc.destroy(); };
}

/** Partitura de ejemplo dentro de una explicación, con botón para escucharla. */
function example(el, cfg) {
  const paper = h('div.paper' + (cfg.center ? '.center' : ''));
  const sc = renderScore(paper, cfg.score, { scale: cfg.scale || 11, names: cfg.names, color: cfg.score.clef === 'grand', ...(cfg.opts || {}) });
  el.append(paper);
  let tr = null;
  if (cfg.listen !== false) {
    const notes = [];
    for (const v of ['rh', 'lh']) {
      let t = 0;
      (cfg.score[v] || []).forEach((ev, i) => {
        const ps = ev.p == null ? [] : Array.isArray(ev.p) ? ev.p : [ev.p];
        if (ps.length && !ev.hide) notes.push({ t, d: ev.d, midis: ps.map(midiOf), i, v, short: ev.stacc, vel: ev.accent ? 1 : 0.7 });
        t += ev.d;
      });
    }
    el.append(h('div.row', playBtn('Escuchar', () => {
      tr?.stop(); sc.clear();
      tr = playSequence(notes, { bpm: cfg.bpm || 96, onNote: (n, on) => sc.set(n.v, n.i, 'cur', on) });
    })));
  }
  if (cfg.caption) el.append(caption(cfg.caption));
  return () => { tr?.stop(); sc.destroy(); };
}

export const FIGURES = {
  keyboardGroups, noteNames, octaves, hands, handPosition, staffLines, clefAnchor, clefNotes, grandExplorer, ledgerLines,
  metronome, durations, restsTable, timeSignature, dotTie, semitones, accidentals, scaleBuilder, chordBuilder, intervals,
  circleOfFifths, dynamics, articulation, repeatMap, scoreAnatomy, example,
};
void keyAlterations;
