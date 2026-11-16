// Ejercicios interactivos. Cada uno: (el, cfg, done) → función de limpieza.
// done({ score }) se llama al superar el ejercicio (score de 0 a 100).
import { h, icon } from './ui.js';
import { Keyboard } from './keyboard.js';
import { renderScore } from './staff.js';
import { input, pcKeyboard } from './input.js';
import { playNote, playSequence, chime, click, Transport, audioContext } from './audio.js';
import { parsePitch, midiOf, noteName, shuffle, SOLFEGE } from './music.js';
import { Performer, timeline, keyboardRange } from './player.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function feedbackBox() {
  const el = h('div.feedback', { role: 'status', 'aria-live': 'polite' });
  el.say = (kind, html) => { el.className = `feedback ${kind}`; el.innerHTML = html || ''; };
  return el;
}
function counter(total) {
  const el = h('div.dots', { 'aria-hidden': 'true' });
  for (let i = 0; i < total; i++) el.append(h('i'));
  el.set = (i, cls) => { if (el.children[i]) el.children[i].className = cls; };
  return el;
}

/** Botón que reproduce una serie de notas. */
export function listenButton(pitches, { bpm = 100, label = 'Escuchar', onNote } = {}) {
  let tr = null;
  const btn = h('button.btn.ghost', { type: 'button', onclick: () => {
    tr?.stop();
    let t = 0;
    const notes = pitches.map((p) => {
      const item = typeof p === 'object' && !Array.isArray(p) ? p : { p, d: 1 };
      const n = { t, d: item.d || 1, midis: (Array.isArray(item.p) ? item.p : [item.p]).filter(Boolean).map(midiOf), short: item.short, vel: item.vel };
      t += n.d;
      return n;
    });
    tr = playSequence(notes, { bpm, onNote });
  } }, icon('sound'), label);
  btn.stop = () => tr?.stop();
  return btn;
}

/** Dibuja la figura de apoyo de una pregunta (partitura, teclado, símbolo o audio). */
export function miniFigure(fig) {
  const box = h('div.mini-fig');
  if (fig.score) renderScore(box, fig.score, { scale: 11, fit: true, width: fig.width || 420, ...(fig.opts || {}) });
  if (fig.kbd) {
    const kb = new Keyboard(box, { from: 'C4', to: 'C5', labels: 'none', interactive: false, maxKey: 40, ...fig.kbd });
    for (const m in fig.kbd.marks || {}) kb.mark(isNaN(m) ? m : Number(m), fig.kbd.marks[m]);
    for (const m in fig.kbd.bubbles || {}) kb.bubble(isNaN(m) ? m : Number(m), fig.kbd.bubbles[m], 'accent');
  }
  if (fig.glyph) box.append(h('div.big-glyph', { html: fig.glyph }));
  if (fig.listen) box.append(listenButton(fig.listen, { bpm: fig.bpm || 100, label: fig.label || 'Escuchar' }));
  return box;
}

// ---------- Preguntas de opción múltiple ----------
export function quiz(el, cfg, done) {
  const qs = cfg.questions;
  const dots = counter(qs.length);
  const body = h('div.quiz-body');
  const fb = feedbackBox();
  el.append(dots, body, fb);
  let i = 0, firstTry = 0;
  const show = () => {
    const q = qs[i];
    body.innerHTML = '';
    fb.say('', '');
    dots.set(i, 'cur');
    body.append(h('p.question', { html: q.q }));
    if (q.fig) body.append(miniFigure(q.fig));
    const opts = h('div.options' + (q.options.every((o) => o.length < 14) ? '.short' : ''));
    let missed = false;
    const order = q.keepOrder ? q.options.map((_, k) => k) : shuffle(q.options.map((_, k) => k));
    for (const k of order) {
      const b = h('button.option', { type: 'button', html: q.options[k], onclick: async () => {
        if (b.disabled) return;
        if (k === q.answer) {
          b.classList.add('ok');
          opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
          chime(true);
          if (!missed) firstTry++;
          dots.set(i, missed ? 'half' : 'ok');
          fb.say('ok', `<b>Correcto.</b> ${q.why || ''}`);
          const nextBtn = h('button.btn.small', { type: 'button', onclick: () => {
            i++;
            if (i < qs.length) show();
            else { body.innerHTML = ''; fb.say('ok', `<b>Preguntas completadas.</b> ${firstTry} de ${qs.length} a la primera.`); done({ score: (firstTry / qs.length) * 100 }); }
          } }, i + 1 < qs.length ? 'Siguiente pregunta' : 'Terminar');
          fb.append(' ', nextBtn);
          nextBtn.focus({ preventScroll: true });
        } else {
          missed = true;
          b.classList.add('bad');
          b.disabled = true;
          chime(false);
          fb.say('bad', q.hint ? `<b>No es esa.</b> ${q.hint}` : '<b>No es esa.</b> Prueba otra opción.');
        }
      } });
      opts.append(b);
    }
    body.append(opts);
  };
  show();
  return () => {};
}

// ---------- Encontrar teclas ----------
// cfg: { from, to, labels, prompts: [{ say, pc: [..] | midi: [..] | seq: [alturas], all, bubble }] }
export function keys(el, cfg, done) {
  const prompt = h('p.question');
  const fb = feedbackBox();
  const dots = counter(cfg.prompts.length);
  const stage = h('div.stage');
  el.append(dots, prompt, stage, fb);
  const kb = new Keyboard(stage, { from: cfg.from || 'C3', to: cfg.to || 'C5', labels: cfg.labels || 'none', pcHints: true });
  pcKeyboard.setBase(Math.max(kb.lo, Math.min(60, kb.hi - 12)));
  let i = -1, misses = 0, clean = 0, cur = null, found, seqPos, locked = false;

  const next = () => {
    i++;
    kb.clear('ok bad hint sel'); kb.clearBubbles();
    if (i >= cfg.prompts.length) {
      prompt.textContent = '';
      fb.say('ok', '<b>Ejercicio completado.</b>');
      done({ score: (clean / cfg.prompts.length) * 100 });
      return;
    }
    cur = cfg.prompts[i];
    misses = 0; found = new Set(); seqPos = 0; locked = false;
    dots.set(i, 'cur');
    prompt.innerHTML = cur.say;
    fb.say('', '');
    if (cur.seq && cur.showFirst) kb.mark(midiOf(cur.seq[0]), 'hint');
  };
  const targets = () => {
    if (cur.midi) return cur.midi.map(midiOf);
    const out = [];
    for (let m = kb.lo; m <= kb.hi; m++) if (cur.pc.includes(m % 12)) out.push(m);
    return out;
  };
  const succeed = async () => {
    locked = true;
    if (!misses) clean++;
    dots.set(i, misses ? 'half' : 'ok');
    chime(true);
    fb.say('ok', `<b>Bien.</b> ${cur.why || ''}`);
    await wait(cur.why ? 1900 : 900);
    if (el.isConnected) next();
  };
  const off = input.on((ev) => {
    if (ev.type !== 'on' || !cur || locked || !el.isConnected) return;
    const m = ev.midi;
    if (cur.seq) {
      const want = midiOf(cur.seq[seqPos]);
      if (m === want) {
        kb.unmark(m, 'hint'); kb.mark(m, 'ok');
        if (cur.bubble) kb.bubble(m, cur.bubble[seqPos] ?? String(seqPos + 1), 'accent');
        seqPos++;
        if (seqPos >= cur.seq.length) succeed();
      } else {
        misses++;
        kb.flash(m, 'bad');
        fb.say('bad', misses >= 2 ? `Ahora toca <b>${noteName(cur.seq[seqPos])}</b>: está marcada en amarillo.` : '<b>Esa no.</b> Vuelve a intentarlo.');
        if (misses >= 2) kb.mark(want, 'hint');
      }
      return;
    }
    const t = targets();
    if (t.includes(m)) {
      kb.mark(m, 'ok');
      found.add(m);
      if (!cur.all || found.size === t.length) succeed();
      else fb.say('ok', `Llevas ${found.size} de ${t.length}. Sigue buscando.`);
    } else {
      misses++;
      kb.flash(m, 'bad');
      fb.say('bad', `Eso es <b>${noteName(m)}</b>. ${cur.hint || 'Prueba otra tecla.'}`);
      if (misses >= 3) t.filter((x) => !found.has(x)).slice(0, 1).forEach((x) => kb.mark(x, 'hint'));
    }
  });
  next();
  return () => { off(); kb.destroy(); };
}

// ---------- Leer notas en el pentagrama ----------
// cfg: { clef, pool: [alturas], count, answer: 'key' | 'name', from, to, labels, key }
export function read(el, cfg, done) {
  const count = cfg.count || 10;
  const dots = counter(count);
  const prompt = h('p.question', cfg.answer === 'name' ? '¿Qué nota es?' : 'Toca en el teclado la nota que ves.');
  const paper = h('div.paper.center');
  const fb = feedbackBox();
  const stage = h('div.stage');
  el.append(dots, prompt, paper, fb, stage);
  let queue = [];
  let last = null;
  while (queue.length < count) {
    const p = shuffle(cfg.pool).find((x) => x !== last) || cfg.pool[0];
    queue.push(p); last = p;
  }
  let kb = null;
  let off = () => {};
  let idx = 0, clean = 0, misses = 0, cur = null, sc = null, locked = false, extra = 0;
  const started = Date.now();

  const showNote = () => {
    paper.innerHTML = '';
    const p = parsePitch(cur);
    const ev = { p: cur, d: 4 };
    const clef = cfg.clef === 'grand' ? 'grand' : cfg.clef;
    const score = { clef, key: cfg.key || 0 };
    if (clef === 'grand') {
      const upper = cfg.split ? p.midi >= midiOf(cfg.split) : p.midi >= 60;
      score.rh = upper ? [ev] : [{ p: 'B4', d: 4, hide: true }];
      score.lh = upper ? [{ p: 'D3', d: 4, hide: true }] : [ev];
      sc = renderScore(paper, score, { scale: 13, width: 250, fit: true, step: 5 });
      sc.which = upper ? 'rh' : 'lh';
    } else {
      score[clef === 'bass' ? 'lh' : 'rh'] = [ev];
      sc = renderScore(paper, score, { scale: 13, width: 250, fit: true, step: 5 });
      sc.which = clef === 'bass' ? 'lh' : 'rh';
    }
    sc.set(sc.which, 0, 'pulse');
  };
  const next = () => {
    if (idx >= queue.length) {
      const secs = Math.round((Date.now() - started) / 1000);
      paper.innerHTML = '';
      prompt.textContent = '';
      fb.say('ok', `<b>Lectura completada.</b> ${clean} de ${count} a la primera, en ${secs} segundos.`);
      done({ score: (clean / count) * 100, seconds: secs });
      return;
    }
    cur = queue[idx];
    misses = 0; locked = false;
    dots.set(Math.min(idx, count - 1), 'cur');
    kb?.clear('ok bad hint');
    fb.say('', '');
    showNote();
  };
  const answer = async (ok, saidName) => {
    if (locked) return;
    if (ok) {
      locked = true;
      if (!misses) clean++;
      if (idx < count) dots.set(idx, misses ? 'half' : 'ok');
      sc.set(sc.which, 0, 'ok');
      fb.say('ok', `<b>${noteName(cur)}</b>, correcto.`);
      if (cfg.answer === 'name') playNote(midiOf(cur), 0.6);
      idx++;
      await wait(650);
      if (el.isConnected) next();
    } else {
      misses++;
      sc.set(sc.which, 0, 'bad');
      setTimeout(() => sc.set(sc.which, 0, 'bad', false), 350);
      if (misses === 1 && extra < 3) { queue.push(cur); extra++; } // se repasa al final
      const tip = cfg.answer === 'name' || misses < 2 ? '' : ` Es <b>${noteName(cur)}</b>: mira la tecla en amarillo.`;
      fb.say('bad', `Has respondido <b>${saidName}</b>.${tip || ' Fíjate en qué línea o espacio está.'}`);
      if (kb && misses >= 2) kb.mark(midiOf(cur), 'hint');
    }
  };

  if (cfg.answer === 'name') {
    const opts = h('div.options.short.names');
    SOLFEGE.forEach((name, letter) => {
      opts.append(h('button.option', { type: 'button', onclick: () => answer(parsePitch(cur).letter === letter, name) }, name));
    });
    stage.replaceWith(opts);
  } else {
    const lo = cfg.from || 'C3', hi = cfg.to || 'C5';
    kb = new Keyboard(stage, { from: lo, to: hi, labels: cfg.labels || 'c', pcHints: true });
    pcKeyboard.setBase(Math.max(kb.lo, Math.min(midiOf(cfg.pool[0]) - (midiOf(cfg.pool[0]) % 12), kb.hi - 12)));
    off = input.on((ev) => {
      if (ev.type !== 'on' || locked || !el.isConnected) return;
      const ok = ev.midi === midiOf(cur);
      if (ok) kb.mark(ev.midi, 'ok'); else kb.flash(ev.midi, 'bad');
      answer(ok, noteName(ev.midi) + (ev.midi % 12 === midiOf(cur) % 12 && !ok ? ' de otra octava' : ''));
    });
  }
  next();
  return () => { off(); kb?.destroy(); };
}

// ---------- Marcar un ritmo ----------
// cfg: { time: [4,4], bpm, pattern: [duraciones; negativas = silencio] }
export function rhythm(el, cfg, done) {
  const time = cfg.time || [4, 4];
  const bpmz = (time[0] * 4) / time[1];
  const bpm = cfg.bpm || 76;
  const evs = [];
  const onsets = [];
  let t = 0;
  for (const d of cfg.pattern) {
    const dur = Math.abs(d);
    const inBar = t % bpmz;
    const lab = Math.abs(inBar - Math.round(inBar)) < 1e-6 ? String(Math.round(inBar) + 1) : Math.abs((inBar * 2) % 1) < 1e-6 ? 'y' : '·';
    if (d > 0) { onsets.push({ t, i: evs.length, state: null }); evs.push({ p: 'B4', d: dur, stem: 'up', label: lab }); }
    else evs.push({ p: null, d: dur });
    t += dur;
  }
  const total = t;
  const paper = h('div.paper');
  const sc = renderScore(paper, { clef: 'treble', time, rh: evs }, { scale: 11 });
  const countEl = h('div.count-in', { 'aria-live': 'off' });
  const fb = feedbackBox();
  const tapBtn = h('button.tap-pad', { type: 'button' }, 'Pulsa aquí al ritmo', h('small', 'o usa la barra espaciadora o cualquier tecla del piano'));
  const startBtn = h('button.btn', { type: 'button' }, icon('play'), 'Empezar');
  const demoBtn = h('button.btn.ghost', { type: 'button' }, icon('sound'), 'Escuchar cómo suena');
  el.append(h('p.question', { html: cfg.say || 'Marca este ritmo. Oirás un compás de claqueta antes de empezar.' }), paper, countEl,
    h('div.row', startBtn, demoBtn), tapBtn, fb);
  let tr = null, running = false, extras = 0;

  const beats = (withDemo) => {
    const events = [];
    for (let b = 0; b < bpmz + total; b++) {
      const inBar = b % bpmz, lead = b < bpmz;
      events.push({ t: b, audio: (at) => click(inBar === 0, at), fn: () => {
        countEl.textContent = lead ? String(inBar + 1) : '';
        countEl.classList.toggle('show', lead);
      } });
    }
    for (const o of onsets) {
      events.push({ t: bpmz + o.t, fn: () => sc.cursor('rh', o.i, false), audio: withDemo ? (at) => playNote(71, 0.18, 0.8, at) : null });
    }
    events.push({ t: bpmz + total + 0.4 });
    return events;
  };
  const reset = () => { sc.clear(); sc.cursor(null); onsets.forEach((o) => { o.state = null; }); extras = 0; fb.say('', ''); };
  const finish = (judge) => {
    running = false;
    startBtn.disabled = demoBtn.disabled = false;
    countEl.classList.remove('show');
    sc.cursor(null);
    if (!judge) return;
    let ok = 0;
    for (const o of onsets) { if (o.state === 'ok') ok++; else sc.set('rh', o.i, 'bad'); }
    const score = Math.max(0, (ok - extras * 0.5) / onsets.length) * 100;
    if (score >= 75) {
      chime(true);
      fb.say('ok', `<b>Buen ritmo.</b> Has acertado ${ok} de ${onsets.length} notas.`);
      done({ score });
    } else {
      fb.say('bad', `Has acertado ${ok} de ${onsets.length} notas${extras ? ` y has dado ${extras} golpes de más` : ''}. Escucha el ritmo y vuelve a intentarlo.`);
    }
  };
  const run = (demo) => {
    tr?.stop();
    reset();
    running = !demo;
    startBtn.disabled = demoBtn.disabled = true;
    tr = new Transport({ bpm, events: beats(demo), onEnd: () => finish(!demo) });
    tr.start();
  };
  const tap = () => {
    playNote(71, 0.15, 0.8);
    if (!running || !tr?.playing) return;
    const ac = audioContext();
    const beat = tr.beat - bpmz - ((ac.outputLatency || 0) * bpm) / 60;
    const w = Math.max(0.3, (0.17 * bpm) / 60);
    let best = null;
    for (const o of onsets) if (!o.state && Math.abs(o.t - beat) <= w && (!best || Math.abs(o.t - beat) < Math.abs(best.t - beat))) best = o;
    if (best) { best.state = 'ok'; sc.set('rh', best.i, 'ok'); }
    else if (beat > -0.4) extras++;
    tapBtn.classList.add('hit');
    setTimeout(() => tapBtn.classList.remove('hit'), 90);
  };
  startBtn.onclick = () => run(false);
  demoBtn.onclick = () => run(true);
  tapBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(); });
  const onKey = (e) => {
    if (e.code !== 'Space' || e.repeat || !el.isConnected) return;
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    e.preventDefault();
    tap();
  };
  window.addEventListener('keydown', onKey);
  input.setMuted(true);
  const off = input.on((ev) => { if (ev.type === 'on' && el.isConnected) tap(); });
  return () => { tr?.stop(); off(); input.setMuted(false); window.removeEventListener('keydown', onKey); sc.destroy(); };
}

// ---------- Completar compases ----------
// cfg: { time: [4,4], measures: 2, palette: [4, 2, 1, 0.5], say }
export function measure(el, cfg, done) {
  const time = cfg.time || [4, 4];
  const bpmz = (time[0] * 4) / time[1];
  const nM = cfg.measures || 2;
  const palette = cfg.palette || [4, 2, 1, 0.5];
  const NAMES = { 4: 'Redonda', 3: 'Blanca con puntillo', 2: 'Blanca', 1.5: 'Negra con puntillo', 1: 'Negra', 0.5: 'Corchea', 0.25: 'Semicorchea' };
  const GLY = { 4: 'nWhole', 3: 'nHalf', 2: 'nHalf', 1.5: 'nQuarter', 1: 'nQuarter', 0.5: 'n8', 0.25: 'n16' };
  const paper = h('div.paper');
  const fb = feedbackBox();
  const bar = h('div.row.palette');
  const status = h('p.meter');
  let notes = [];
  let sc = null;
  let finished = false;
  const sum = () => notes.reduce((a, b) => a + b, 0);
  const draw = () => {
    sc?.destroy();
    const filled = sum();
    const evs = notes.map((d) => ({ p: 'B4', d, stem: 'up' }));
    // El hueco que falta se muestra con silencios atenuados.
    let rest = nM * bpmz - filled;
    let pos = filled;
    while (rest > 1e-6) {
      const room = bpmz - (pos % bpmz);
      const d = [4, 2, 1, 0.5, 0.25].find((x) => x <= Math.min(rest, room) + 1e-6);
      evs.push({ p: null, d, ghost: true });
      rest -= d; pos += d;
    }
    sc = renderScore(paper, { clef: 'treble', time, rh: evs }, { scale: 11 });
    evs.forEach((e, i) => { if (e.ghost) sc.set('rh', i, 'dim'); });
    const inBar = filled % bpmz;
    const mIdx = Math.min(nM, Math.floor(filled / bpmz) + 1);
    status.innerHTML = filled >= nM * bpmz ? '' : `Compás ${mIdx} de ${nM}: llevas <b>${fmt(inBar)}</b> de ${fmt(bpmz)} pulsos.`;
    for (const b of bar.querySelectorAll('[data-d]')) b.disabled = finished || Number(b.dataset.d) > bpmz - inBar + 1e-6 || filled >= nM * bpmz;
  };
  const fmt = (x) => String(x).replace('.', ',');
  for (const d of palette) {
    bar.append(h('button.fig-btn', { type: 'button', 'data-d': d, title: NAMES[d], onclick: () => {
      notes.push(d);
      playNote(71, 0.25, 0.7);
      draw();
      if (sum() >= nM * bpmz - 1e-6) {
        finished = true;
        draw();
        chime(true);
        fb.say('ok', '<b>Compases completos.</b> Cada uno suma exactamente lo que indica el compás. Así suena lo que has escrito:');
        let t = 0;
        const seq = notes.map((dd) => { const n = { t, d: dd, midi: 71 }; t += dd; return n; });
        fb.append(' ', h('button.btn.small.ghost', { type: 'button', onclick: () => playSequence(seq, { bpm: 96 }) }, icon('sound'), 'Escuchar'));
        done({ score: 100 });
      }
    } }, h('span.fig-glyph', { html: `<span class="mg-inline">${glyphChar(GLY[d])}</span>${[3, 1.5].includes(d) ? '<span class="mg-inline"></span>' : ''}` }), h('small', `${NAMES[d]} · ${fmt(d)}`)));
  }
  bar.append(h('button.btn.ghost.small', { type: 'button', onclick: () => { if (finished) return; notes.pop(); draw(); } }, 'Borrar la última'));
  el.append(h('p.question', { html: cfg.say || `Rellena ${nM} compases de ${time[0]}/${time[1]} con las figuras que quieras.` }), paper, status, bar, fb);
  draw();
  return () => sc?.destroy();
}
const GLYPH_CHARS = { nWhole: '', nHalf: '', nQuarter: '', n8: '', n16: '' };
const glyphChar = (name) => GLYPH_CHARS[name];

// ---------- Tocar una melodía paso a paso ----------
// cfg: { score, from, to, hints (true), names, say, labels }
export function play(el, cfg, done) {
  const score = cfg.score;
  const tl = timeline(score);
  const range = cfg.from ? { from: cfg.from, to: cfg.to } : keyboardRange(tl, 2);
  const paper = h('div.paper');
  const sc = renderScore(paper, score, { scale: 11, color: score.clef === 'grand', names: cfg.names });
  const stage = h('div.stage');
  const fb = feedbackBox();
  const hintsOn = cfg.hints !== false;
  const listenBtn = h('button.btn.ghost', { type: 'button' }, icon('sound'), 'Escuchar primero');
  const againBtn = h('button.btn.ghost', { type: 'button' }, icon('restart'), 'Empezar de nuevo');
  el.append(h('p.question', { html: cfg.say || 'Toca la melodía nota a nota. La partitura te espera.' }), paper, h('div.row', listenBtn, againBtn), stage, fb);
  const kb = new Keyboard(stage, { from: range.from, to: range.to, labels: cfg.labels || 'c', pcHints: true });
  pcKeyboard.setBase(Math.max(kb.lo, Math.min(Math.floor(tl.lo / 12) * 12, kb.hi - 12)));
  let finishedOnce = false;

  const perf = new Performer(score, {
    step: (st) => {
      kb.clear('hint rh lh'); kb.clearBubbles();
      sc.clear('cur');
      if (!st) { sc.cursor(null); return; }
      const first = st.notes[0];
      sc.cursor(first.v, first.i);
      for (const n of st.notes) {
        sc.set(n.v, n.i, 'cur');
        if (perf.mode === 'wait' && hintsOn && perf.mine(n)) n.midis.forEach((m) => { kb.mark(m, n.v); if (n.f) kb.bubble(m, n.f, n.v); });
      }
    },
    note: (n, state) => {
      if (state === 'ok') { sc.set(n.v, n.i, 'cur', false); sc.set(n.v, n.i, 'ok'); n.extra.forEach((x) => sc.set(n.v, x, 'ok')); }
      if (perf.mode === 'listen') n.midis.forEach((m) => (state === 'on' ? kb.mark(m, n.v) : kb.unmark(m, n.v)));
    },
    wrong: (m) => { kb.flash(m, 'bad'); fb.say('bad', `Eso es <b>${noteName(m)}</b>. Busca la tecla ${hintsOn ? 'coloreada' : 'correcta'}.`); },
    end: ({ mode, accuracy }) => {
      if (mode === 'listen') { start(); return; }
      chime(true);
      const pct = Math.round(accuracy * 100);
      fb.say('ok', `<b>Melodía completada</b> con un ${pct} % de notas a la primera.`);
      if (!finishedOnce) { finishedOnce = true; done({ score: pct }); }
    },
  });
  perf.bpm = score.bpm || 84;
  const start = () => { sc.clear(); fb.say('', ''); perf.wait(); };
  listenBtn.onclick = () => { sc.clear(); fb.say('', ''); perf.listen(); };
  againBtn.onclick = start;
  start();
  return () => { perf.destroy(); kb.destroy(); sc.destroy(); };
}

export const WIDGETS = { quiz, keys, read, rhythm, measure, play };
