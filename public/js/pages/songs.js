// Lista de canciones y reproductor.
import { h, icon, stars, segmented, toggle } from '../ui.js';
import { store, trackPractice } from '../store.js';
import { SONGS, songById } from '../content/songs.js';
import { renderScore } from '../staff.js';
import { Keyboard } from '../keyboard.js';
import { pcKeyboard } from '../input.js';
import { chime } from '../audio.js';
import { noteName } from '../music.js';
import { Performer, Waterfall, keyboardRange, starsFor } from '../player.js';

const LEVELS = { 1: ['Primeras melodías', 'Una mano, posición de Do, ritmos sencillos.'], 2: ['Un paso más', 'Corcheas, puntillos, compás de 3/4 y la mano izquierda.'], 3: ['A dos manos', 'Las dos manos juntas, armadura y piezas clásicas.'] };
const handsLabel = (s) => (s.clef === 'grand' ? 'Dos manos' : s.clef === 'bass' ? 'Mano izquierda' : 'Mano derecha');

export function songsPage(main) {
  const done = SONGS.filter((s) => store.isDone(`s:${s.id}`)).length;
  main.append(h('header.page-head', h('h1', 'Canciones'),
    h('p.section-lead', `${done} de ${SONGS.length} tocadas. Cada pieza se puede escuchar, tocar paso a paso (la partitura te espera) o a tempo con metrónomo.`)));
  for (const lv of [1, 2, 3]) {
    const list = h('ul.song-list');
    SONGS.filter((s) => s.level === lv).forEach((s) => {
      const p = store.get(`s:${s.id}`);
      list.append(h('li' + (p?.done ? '.done' : ''), h('a', { href: `/cancion/${s.id}`, 'data-link': true },
        h('span.song-main', h('span.song-title', s.title), h('span.song-by', s.by)),
        h('span.song-meta', h('span.tag.' + (s.clef === 'grand' ? 'both' : s.clef === 'bass' ? 'lh' : 'rh'), handsLabel(s)), h('span.mins', `${s.time[0]}/${s.time[1]}`), stars(p?.stars || 0, 15)))));
    });
    main.append(h('section.module', h('div.module-head', h('span.module-no', String(lv)), h('div', h('h2', LEVELS[lv][0]), h('p', LEVELS[lv][1]))), list));
  }
  return () => {};
}

export function songPage(main, id) {
  const song = songById(id);
  if (!song) { main.append(h('div.empty', h('h1', 'Esa canción no existe'), h('a.btn', { href: '/canciones', 'data-link': true }, 'Ver todas las canciones'))); return () => {}; }
  document.title = `${song.title} · Clases de piano`;
  trackPractice(true);
  const item = `s:${song.id}`;
  const both = song.clef === 'grand';
  const score = { clef: song.clef, time: song.time, key: song.key || 0, pickup: song.pickup || 0, rh: song.rh, lh: song.lh, bpm: song.bpm };

  let mode = 'wait', hands = 'both', speed = 100, hints = true, names = false, metro = true;
  const paper = h('div.paper.song-paper');
  const stage = h('div.stage.song-stage');
  const fb = h('div.feedback', { role: 'status', 'aria-live': 'polite' });
  const result = h('div.song-result', { hidden: true });
  const count = h('div.count-in');
  const best = h('span.song-best');
  const drawBest = () => { const p = store.get(item); best.replaceChildren(p?.done ? stars(p.stars, 18) : '', p?.done ? ` Mejor resultado: ${p.best} %` : 'Aún no la has tocado'); };

  const sc = renderScore(paper, score, { scale: 10, color: both });
  const perf = new Performer(score, {});
  const range = keyboardRange(perf.tl, 2);
  let kb = null, wf = null;
  const buildKb = () => {
    wf?.destroy(); kb?.destroy();
    stage.innerHTML = '';
    const tmp = h('div');
    kb = new Keyboard(tmp, { from: range.from, to: range.to, labels: names ? 'all' : 'c', pcHints: true, maxKey: 46 });
    wf = new Waterfall(stage, kb, perf.tl, () => perf.beat);
    stage.append(count, kb.el);
    pcKeyboard.setBase(Math.max(kb.lo, Math.min(Math.floor((hands === 'lh' ? perf.tl.lo : Math.max(perf.tl.lo, 48)) / 12) * 12, kb.hi - 12)));
  };
  buildKb();

  const startBtn = h('button.btn.big', { type: 'button' });
  const setIdle = () => {
    startBtn.replaceChildren(icon('play'), mode === 'listen' ? 'Escuchar' : mode === 'wait' ? 'Empezar paso a paso' : 'Empezar a tempo');
    startBtn.classList.remove('stop');
    count.classList.remove('show');
  };
  const setRunning = () => { startBtn.replaceChildren(icon('stop'), 'Parar'); startBtn.classList.add('stop'); };
  const resetView = () => { sc.clear(); sc.cursor(null); wf.reset(); kb.clear('rh lh ok bad hint'); kb.clearBubbles(); fb.className = 'feedback'; fb.textContent = ''; result.hidden = true; };

  Object.assign(perf.on, {
    step: (st) => {
      kb.clear('rh lh'); kb.clearBubbles();
      sc.clear('cur');
      if (!st) { sc.cursor(null); return; }
      sc.cursor(st.notes[0].v, st.notes[0].i);
      for (const n of st.notes) {
        sc.set(n.v, n.i, 'cur');
        if (perf.mode === 'wait' && hints && perf.mine(n)) n.midis.forEach((m) => { kb.mark(m, n.v); if (n.f) kb.bubble(m, n.f, n.v); });
      }
    },
    note: (n, state) => {
      if (state === 'ok') { sc.set(n.v, n.i, 'cur', false); sc.set(n.v, n.i, 'ok'); n.extra.forEach((x) => sc.set(n.v, x, 'ok')); wf.mark(n, 'ok'); }
      else if (state === 'miss') { sc.set(n.v, n.i, 'dim'); wf.mark(n, 'miss'); }
      else if (perf.mode !== 'wait') n.midis.forEach((m) => (state === 'on' ? kb.mark(m, n.v) : kb.unmark(m, n.v)));
    },
    wrong: (m) => {
      kb.flash(m, 'bad');
      if (perf.mode === 'wait') { fb.className = 'feedback bad'; fb.innerHTML = `Eso es <b>${noteName(m)}</b>. ${hints ? 'Busca la tecla coloreada.' : 'Vuelve a mirar la partitura.'}`; }
    },
    beat: (num, accent, lead) => { count.textContent = lead ? String(num) : ''; count.classList.toggle('show', !!lead); },
    end: ({ mode: m, accuracy }) => {
      setIdle();
      kb.clear('rh lh'); kb.clearBubbles();
      if (m === 'listen') return;
      const pct = Math.round(accuracy * 100);
      // A tempo hace falta un mínimo de acierto; paso a paso siempre se completa.
      const passed = m === 'wait' || accuracy >= 0.6;
      let st = starsFor(accuracy);
      // Las tres estrellas se reservan para la pieza completa a velocidad real.
      const full = speed >= 100 && (!both || hands === 'both');
      if (!full && st === 3) st = 2;
      if (m === 'wait' && st === 3) st = 2;
      result.hidden = false;
      if (passed) {
        chime(true);
        store.record(item, { done: true, stars: st, best: pct });
        result.replaceChildren(stars(st, 34), h('h2', m === 'wait' ? 'Pieza completada' : 'Bien tocada'),
          h('p', m === 'wait' ? `${pct} % de las notas a la primera.` : `${pct} % de las notas a tiempo.`),
          h('p.muted', st === 3 ? 'Tres estrellas: la pieza completa, a tempo y a su velocidad.' : m === 'wait' ? 'Cuando te salga con soltura, prueba el modo a tempo: ahí se consigue la tercera estrella.' : full ? 'Sube del 95 % para conseguir la tercera estrella.' : 'La tercera estrella se consigue a tempo, con la pieza completa y al 100 % de velocidad.'));
      } else {
        result.replaceChildren(h('h2', 'Todavía no'), h('p', `${pct} % de las notas a tiempo. Baja la velocidad o practica antes paso a paso.`));
      }
      drawBest();
    },
  });

  const start = () => {
    if (perf.running) { perf.stop(); resetView(); setIdle(); return; }
    resetView();
    perf.hands = both ? hands : (song.clef === 'bass' ? 'lh' : 'rh');
    perf.bpm = Math.round((song.bpm * speed) / 100);
    perf.metronome = metro;
    setRunning();
    perf[mode]();
  };
  startBtn.onclick = start;
  const stopAnd = (fn) => (v) => { if (perf.running) { perf.stop(); resetView(); } fn(v); setIdle(); };

  const speedOut = h('output', `${song.bpm} ppm`);
  const speedIn = h('input', { type: 'range', min: 40, max: 130, step: 5, value: 100, 'aria-label': 'Velocidad', oninput: () => { speed = Number(speedIn.value); speedOut.textContent = `${Math.round((song.bpm * speed) / 100)} ppm${speed === 100 ? '' : ` (${speed} %)`}`; if (perf.running) { perf.stop(); resetView(); setIdle(); } } });

  const controls = h('div.song-controls',
    h('div.ctrl', h('span.ctrl-label', 'Modo'), segmented([['listen', 'Escuchar'], ['wait', 'Paso a paso'], ['tempo', 'A tempo']], mode, stopAnd((v) => { mode = v; }), 'Modo')),
    both ? h('div.ctrl', h('span.ctrl-label', 'Manos'), segmented([['rh', 'Derecha'], ['lh', 'Izquierda'], ['both', 'Las dos']], hands, stopAnd((v) => { hands = v; }), 'Manos')) : null,
    h('div.ctrl', h('span.ctrl-label', 'Velocidad'), h('div.speed', speedIn, speedOut)),
    h('div.ctrl.toggles',
      toggle('Marcar las teclas', hints, (v) => { hints = v; }),
      toggle('Nombres en las teclas', names, (v) => { names = v; if (perf.running) { perf.stop(); setIdle(); } buildKb(); resetView(); }),
      toggle('Metrónomo a tempo', metro, (v) => { metro = v; })));

  main.append(h('div.song',
    h('header.lesson-head',
      h('a.crumb', { href: '/canciones', 'data-link': true }, icon('back', 16), 'Canciones'),
      h('h1', song.title), h('p.song-sub', song.by, ' · ', handsLabel(song), ' · ', `${song.time[0]}/${song.time[1]}`), best),
    h('p.tip', icon('info', 18), h('span', song.tip)),
    controls,
    h('div.row.start-row', startBtn, fb),
    paper, result, stage,
    h('p.kbd-help', 'Teclado del ordenador: A S D F G H J K para las blancas, W E T Y U para las negras; Z y X cambian de octava. Los colores indican la mano: ',
      h('b.rh-text', 'azul, derecha'), '; ', h('b.lh-text', 'naranja, izquierda'), '.')));
  setIdle();
  drawBest();
  return () => { perf.destroy(); wf.destroy(); kb.destroy(); sc.destroy(); trackPractice(false); };
}
