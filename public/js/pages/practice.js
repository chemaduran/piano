// Herramientas de práctica libre: lectura de notas, ritmo y piano libre.
import { h, segmented, toggle } from '../ui.js';
import { store, trackPractice } from '../store.js';
import { read, rhythm } from '../widgets.js';
import { grandExplorer, metronome } from '../figures.js';
import { naturalsBetween, pick } from '../music.js';

const TOOLS = [['lectura', 'Lectura de notas'], ['ritmo', 'Ritmo'], ['piano', 'Piano libre']];

export function practicePage(main, tool = 'lectura') {
  if (!TOOLS.some((t) => t[0] === tool)) tool = 'lectura';
  document.title = `${TOOLS.find((t) => t[0] === tool)[1]} · Clases de piano`;
  trackPractice(true);
  const tabs = h('nav.tabs', { 'aria-label': 'Herramientas de práctica' }, TOOLS.map(([id, name]) => h('a' + (id === tool ? '.on' : ''), { href: `/practica/${id}`, 'data-link': true, 'aria-current': id === tool ? 'page' : null }, name)));
  const body = h('div.practice-body');
  main.append(h('header.page-head', h('h1', 'Práctica'), tabs), body);
  const stop = { lectura: reading, ritmo: rhythmTool, piano: freePiano }[tool](body);
  return () => { stop?.(); trackPractice(false); };
}

// ---------- Lectura de notas ----------
const READ_LEVELS = {
  treble: { 1: ['C4', 'G4'], 2: ['C4', 'C5'], 3: ['C4', 'G5'], 4: ['A3', 'C6'] },
  bass: { 1: ['C3', 'G3'], 2: ['C3', 'C4'], 3: ['F2', 'C4'], 4: ['C2', 'E4'] },
  grand: { 1: ['C3', 'G4'], 2: ['C3', 'C5'], 3: ['F2', 'G5'], 4: ['C2', 'C6'] },
};
const LEVEL_NAMES = { 1: 'Cinco notas', 2: 'Una octava', 3: 'Todo el pentagrama', 4: 'Con líneas adicionales' };
const CLEF_NAMES = { treble: 'Clave de sol', bass: 'Clave de fa', grand: 'Las dos claves' };

function reading(el) {
  let clef = 'treble', level = 1, answer = 'key', sharps = false, stop = null;
  const cfgBox = h('div.practice-config');
  const run = h('div.exercise.practice-run');
  const records = h('div.records');
  const item = () => `p:lectura-${clef}-${level}${sharps ? '-alt' : ''}`;

  const drawRecords = () => {
    const rows = [];
    for (const c of Object.keys(CLEF_NAMES)) for (const lv of [1, 2, 3, 4]) {
      const p = store.get(`p:lectura-${c}-${lv}`) || store.get(`p:lectura-${c}-${lv}-alt`);
      if (p) rows.push(h('tr', h('th', { scope: 'row' }, `${CLEF_NAMES[c]}: ${LEVEL_NAMES[lv].toLowerCase()}`), h('td', `${p.best} %`), h('td', `${p.attempts} ${p.attempts === 1 ? 'vez' : 'veces'}`)));
    }
    records.replaceChildren(rows.length ? h('table.sym-table', h('thead', h('tr', h('th', 'Ejercicio'), h('th', 'Mejor acierto'), h('th', 'Practicado'))), h('tbody', rows)) : h('p.muted', 'Aquí aparecerán tus mejores resultados.'));
  };
  const start = () => {
    stop?.();
    run.innerHTML = '';
    const [lo, hi] = READ_LEVELS[clef][level];
    let pool = naturalsBetween(lo, hi);
    if (sharps) pool = pool.concat(pool.filter((p) => 'CDFGA'.includes(p[0])).map((p) => `${p[0]}#${p.slice(1)}`), pool.filter((p) => 'DEGAB'.includes(p[0])).map((p) => `${p[0]}b${p.slice(1)}`)).filter((p, i, a) => a.indexOf(p) === i);
    stop = read(run, { clef, pool, count: 15, answer: sharps ? 'key' : answer, from: lo, to: hi, labels: 'c' }, ({ score }) => {
      store.record(item(), { done: true, best: score, stars: score >= 95 ? 3 : score >= 80 ? 2 : 1 });
      drawRecords();
      run.append(h('div.row', h('button.btn', { type: 'button', onclick: start }, 'Otra tanda')));
    });
  };
  cfgBox.append(
    h('div.ctrl', h('span.ctrl-label', 'Clave'), segmented(Object.entries(CLEF_NAMES), clef, (v) => { clef = v; start(); }, 'Clave')),
    h('div.ctrl', h('span.ctrl-label', 'Notas'), segmented(Object.entries(LEVEL_NAMES), level, (v) => { level = Number(v); start(); }, 'Dificultad')),
    h('div.ctrl', h('span.ctrl-label', 'Respondo'), segmented([['key', 'Tocando la tecla'], ['name', 'Con el nombre']], answer, (v) => { answer = v; start(); }, 'Forma de responder')),
    h('div.ctrl.toggles', toggle('Incluir sostenidos y bemoles', sharps, (v) => { sharps = v; start(); })));
  el.append(h('p.section-lead', 'Quince notas por tanda. Las que falles vuelven a salir al final.'), cfgBox, run, h('h2', 'Tus marcas'), records);
  start();
  drawRecords();
  return () => stop?.();
}

// ---------- Ritmo ----------
const RHYTHM_LEVELS = {
  1: { name: 'Negras y blancas', cells: [[1, 1], [2], [1, 1], [2]], bpm: 80 },
  2: { name: 'Con corcheas', cells: [[1, 1], [2], [0.5, 0.5, 1], [1, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]], bpm: 76 },
  3: { name: 'Con silencios', cells: [[1, 1], [1, -1], [-1, 1], [0.5, 0.5, 1], [2], [1, 0.5, 0.5]], bpm: 76 },
  4: { name: 'Con puntillos', cells: [[1.5, 0.5], [1, 1], [0.5, 0.5, 1], [2], [1.5, 0.5], [1, -1], [0.5, 0.5, 0.5, 0.5]], bpm: 72 },
};
function makePattern(level) {
  const { cells } = RHYTHM_LEVELS[level];
  const out = [];
  for (let m = 0; m < 4; m++) {
    for (let half = 0; half < 2; half++) {
      // El último medio compás termina siempre en una nota larga.
      if (m === 3 && half === 1) { out.push(2); continue; }
      let c = pick(cells);
      if (m === 0 && half === 0) while (c[0] < 0) c = pick(cells);
      out.push(...c);
    }
  }
  return out;
}
function rhythmTool(el) {
  let level = 1, stop = null;
  const run = h('div.exercise.practice-run');
  const record = h('p.muted');
  const drawRecord = () => {
    const parts = Object.keys(RHYTHM_LEVELS).map((lv) => { const p = store.get(`p:ritmo-${lv}`); return p ? `${RHYTHM_LEVELS[lv].name}: ${p.attempts} superados, mejor ${p.best} %` : null; }).filter(Boolean);
    record.textContent = parts.length ? parts.join(' · ') : 'Aquí aparecerán los ritmos que superes.';
  };
  const start = () => {
    stop?.();
    run.innerHTML = '';
    stop = rhythm(run, { bpm: RHYTHM_LEVELS[level].bpm, pattern: makePattern(level), say: 'Cuatro compases. Escucha la claqueta y marca cada nota.' }, ({ score }) => {
      store.record(`p:ritmo-${level}`, { done: true, best: score, stars: score >= 95 ? 3 : score >= 85 ? 2 : 1 });
      drawRecord();
      run.append(h('div.row', h('button.btn', { type: 'button', onclick: start }, 'Otro ritmo')));
    });
  };
  el.append(h('p.section-lead', 'Cada vez sale un ritmo distinto. Se supera con un 75 % de notas a tiempo.'),
    h('div.practice-config', h('div.ctrl', h('span.ctrl-label', 'Dificultad'), segmented(Object.entries(RHYTHM_LEVELS).map(([k, v]) => [k, v.name]), level, (v) => { level = Number(v); start(); }, 'Dificultad')),
      h('button.btn.ghost', { type: 'button', onclick: () => start() }, 'Cambiar de ritmo')),
    run, h('h2', 'Tus marcas'), record);
  start();
  drawRecord();
  return () => stop?.();
}

// ---------- Piano libre ----------
function freePiano(el) {
  const piano = h('div.figure');
  const metro = h('div.figure');
  el.append(h('p.section-lead', 'Toca lo que quieras: cada nota aparece escrita en el sistema de piano. Con un teclado MIDI conectado, tienes todo el rango.'), piano, h('h2', 'Metrónomo'), metro);
  const a = grandExplorer(piano, { from: 'C2', to: 'C6', autoplay: false, caption: 'Toca una tecla.' });
  const b = metronome(metro, { caption: false });
  return () => { a(); b(); };
}
