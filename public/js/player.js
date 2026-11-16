// Intérprete de partituras: escucha, práctica paso a paso y práctica a tempo.
import { Transport, playNote, click, allOff, audioContext } from './audio.js';
import { input } from './input.js';
import { parsePitch } from './music.js';

const asArray = (p) => (p == null ? [] : Array.isArray(p) ? p : [p]);

/** Convierte una partitura en una línea de tiempo de «pasos» (notas que suenan a la vez). */
export function timeline(score) {
  const notes = [];
  for (const v of ['rh', 'lh']) {
    let t = 0;
    let tiedFrom = null;
    (score[v] || []).forEach((ev, i) => {
      const midis = asArray(ev.p).map((p) => parsePitch(p).midi);
      if (tiedFrom && midis.length) {
        tiedFrom.d += ev.d; // nota ligada: se alarga la anterior, no se vuelve a pulsar
        tiedFrom.extra.push(i);
      } else if (midis.length) {
        const n = { v, i, t, d: ev.d, midis, f: ev.f, short: !!ev.stacc, vel: ev.accent ? 0.95 : 0.75, extra: [] };
        notes.push(n);
        tiedFrom = n;
      }
      if (!ev.tie) tiedFrom = null;
      t += ev.d;
    });
  }
  notes.sort((a, b) => a.t - b.t || (a.v < b.v ? 1 : -1));
  const steps = [];
  for (const n of notes) {
    const last = steps[steps.length - 1];
    if (last && Math.abs(last.t - n.t) < 1e-6) last.notes.push(n);
    else steps.push({ t: n.t, notes: [n] });
  }
  const end = Math.max(0, ...notes.map((n) => n.t + n.d));
  const lo = Math.min(...notes.flatMap((n) => n.midis)), hi = Math.max(...notes.flatMap((n) => n.midis));
  return { notes, steps, end, lo, hi };
}

/**
 * Motor de interpretación. No dibuja nada: avisa mediante callbacks.
 *   on.step(paso | null)        el paso que toca ahora (modo espera) o que suena (escucha)
 *   on.note(nota, estado)       'on' | 'off' | 'ok' | 'miss'
 *   on.wrong(midi)              tecla equivocada
 *   on.beat(n, acento)          clic del metrónomo
 *   on.end({ accuracy, mode })  final de la interpretación
 */
export class Performer {
  constructor(score, on = {}) {
    this.score = score;
    this.tl = timeline(score);
    this.on = on;
    this.mode = null;
    this.hands = 'both';
    this.bpm = score.bpm || 90;
    this.metronome = false;
    this.beatsPerMeasure = score.time ? (score.time[0] * 4) / score.time[1] : 4;
    this.offInput = input.on((ev) => this.handleInput(ev));
  }

  mine(n) { return this.hands === 'both' || n.v === this.hands; }
  get running() { return this.mode != null; }
  /** Pulso mostrado (para la cascada). */
  get beat() {
    if (this.tr?.playing) return this.tr.beat - this.lead;
    if (this.mode === 'wait') return this.waitBeat;
    return this.restBeat ?? 0;
  }

  stop(silent = false) {
    this.tr?.stop();
    this.tr = null;
    const was = this.mode;
    this.mode = null;
    allOff();
    if (was && !silent) this.on.step?.(null);
  }

  // ----- Escuchar -----
  listen() {
    this.stop(true);
    this.mode = 'listen';
    this.lead = 0;
    const events = [];
    const spb = 60 / this.bpm;
    for (const step of this.tl.steps) {
      events.push({ t: step.t, fn: () => this.on.step?.(step) });
      for (const n of step.notes) {
        events.push({
          t: n.t,
          audio: (at) => n.midis.forEach((m) => playNote(m, n.d * spb * (n.short ? 0.4 : 0.95), n.vel * (this.mine(n) ? 1 : 0.6), at)),
          fn: () => this.on.note?.(n, 'on'),
        });
        events.push({ t: n.t + n.d * (n.short ? 0.4 : 0.92), fn: () => this.on.note?.(n, 'off') });
      }
    }
    events.push({ t: this.tl.end });
    this.tr = new Transport({ bpm: this.bpm, events, onEnd: () => { this.restBeat = 0; this.mode = null; this.on.end?.({ mode: 'listen' }); } });
    this.tr.start();
  }

  // ----- Paso a paso: espera a que toques la nota correcta -----
  wait() {
    this.stop(true);
    this.mode = 'wait';
    this.k = -1;
    this.clean = 0;
    this.total = 0;
    this.advance();
  }
  advance() {
    const { steps } = this.tl;
    // Lo que no toca el alumno (la otra mano) suena solo al avanzar.
    do {
      this.k++;
      const st = steps[this.k];
      if (!st) break;
      this.pending = new Set(st.notes.filter((n) => this.mine(n)).flatMap((n) => n.midis));
      const spb = 60 / this.bpm;
      st.notes.filter((n) => !this.mine(n)).forEach((n) => n.midis.forEach((m) => playNote(m, Math.min(2.5, n.d * spb), 0.5)));
    } while (this.pending.size === 0);
    const st = steps[this.k];
    if (!st) {
      this.mode = null;
      this.on.step?.(null);
      this.on.end?.({ mode: 'wait', accuracy: this.total ? this.clean / this.total : 1 });
      return;
    }
    this.waitBeat = st.t;
    this.stepClean = true;
    this.total++;
    this.on.step?.(st);
  }

  // ----- A tempo: con metrónomo, sin esperar -----
  tempo() {
    this.stop(true);
    this.mode = 'tempo';
    const bpmz = this.beatsPerMeasure;
    const pickup = this.score.pickup || 0;
    // Entrada: un compás completo de claqueta (más el trozo que falte hasta la anacrusa).
    let lead = pickup ? 2 * bpmz - pickup : bpmz;
    if (bpmz < 3) lead += bpmz;
    this.lead = lead;
    this.hits = 0;
    this.wrongs = 0;
    const mineNotes = this.tl.notes.filter((n) => this.mine(n));
    this.expected = mineNotes.flatMap((n) => n.midis.map((m) => ({ n, midi: m, state: null })));
    this.totalExpected = this.expected.length;
    const events = [];
    const spb = 60 / this.bpm;
    const unit = this.score.time && this.score.time[1] === 8 ? 0.5 : 1; // en compases de x/8 se marca la corchea
    for (let k = 0; -lead + k * unit < this.tl.end - 1e-6; k++) {
      const b = -lead + k * unit;
      const inBar = (((b - pickup) % bpmz) + bpmz + 1e-6) % bpmz;
      const accent = inBar < 1e-3;
      const isLead = b < -1e-6;
      if (isLead || this.metronome) {
        events.push({ t: b + lead, audio: (at) => click(accent, at), fn: () => this.on.beat?.(Math.round(inBar / unit) + 1, accent, isLead) });
      }
    }
    events.push({ t: lead, fn: () => this.on.beat?.(0, false, false) });
    for (const step of this.tl.steps) {
      events.push({ t: step.t + lead, fn: () => this.on.step?.(step) });
      for (const n of step.notes) {
        if (this.mine(n)) continue;
        events.push({
          t: n.t + lead,
          audio: (at) => n.midis.forEach((m) => playNote(m, n.d * spb * 0.95, 0.55, at)),
          fn: () => this.on.note?.(n, 'on'),
        });
        events.push({ t: n.t + n.d * 0.92 + lead, fn: () => this.on.note?.(n, 'off') });
      }
    }
    // Las notas que pasan sin tocarse cuentan como falladas.
    for (const e of this.expected) {
      events.push({ t: e.n.t + lead + this.window(), fn: () => { if (!e.state) { e.state = 'miss'; this.on.note?.(e.n, 'miss'); } } });
    }
    events.push({ t: this.tl.end + lead + 0.5 });
    this.tr = new Transport({
      bpm: this.bpm, events,
      onEnd: () => {
        this.mode = null;
        this.restBeat = 0;
        const acc = this.totalExpected ? Math.max(0, this.hits - this.wrongs * 0.5) / this.totalExpected : 1;
        this.on.step?.(null);
        this.on.end?.({ mode: 'tempo', accuracy: Math.max(0, Math.min(1, acc)) });
      },
    });
    this.tr.start();
  }
  /** Margen de acierto en pulsos (como mínimo 170 ms). */
  window() { return Math.max(0.3, 0.17 / (60 / this.bpm)); }

  handleInput(ev) {
    if (ev.type !== 'on' || !this.mode) return;
    if (this.mode === 'wait') {
      if (this.pending.has(ev.midi)) {
        this.pending.delete(ev.midi);
        const st = this.tl.steps[this.k];
        st.notes.filter((n) => n.midis.includes(ev.midi)).forEach((n) => this.on.note?.(n, 'ok'));
        if (this.pending.size === 0) {
          if (this.stepClean) this.clean++;
          this.advance();
        }
      } else if (!this.tl.steps[this.k].notes.some((n) => this.mine(n) && n.midis.includes(ev.midi))) {
        this.stepClean = false;
        this.on.wrong?.(ev.midi);
      }
    } else if (this.mode === 'tempo') {
      const beat = this.tr.beat - this.lead - outputLatencyBeats(this.bpm);
      const w = this.window();
      let best = null;
      for (const e of this.expected) {
        if (e.state || e.midi !== ev.midi) continue;
        const d = Math.abs(e.n.t - beat);
        if (d <= w && (!best || d < Math.abs(best.n.t - beat))) best = e;
      }
      if (best) { best.state = 'ok'; this.hits++; this.on.note?.(best.n, 'ok'); }
      else if (beat > -0.5) { this.wrongs++; this.on.wrong?.(ev.midi); }
    }
  }

  destroy() { this.stop(true); this.offInput(); }
}

function outputLatencyBeats(bpm) {
  const ac = audioContext();
  return ((ac.outputLatency || ac.baseLatency || 0) * bpm) / 60;
}

export const starsFor = (accuracy) => (accuracy >= 0.95 ? 3 : accuracy >= 0.8 ? 2 : 1);

/** Cascada de notas que caen sobre el teclado. */
export class Waterfall {
  constructor(parent, keyboard, tl, getBeat) {
    this.kb = keyboard;
    this.tl = tl;
    this.getBeat = getBeat;
    this.states = new Map(); // nota -> 'ok' | 'miss'
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'waterfall';
    this.canvas.setAttribute('aria-hidden', 'true');
    parent.appendChild(this.canvas);
    this.shown = 0;
    this.pxPerBeat = 70;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
    this.resize();
    const css = getComputedStyle(document.documentElement);
    this.colors = { rh: css.getPropertyValue('--rh').trim() || '#2463D1', lh: css.getPropertyValue('--lh').trim() || '#D9661A' };
    const loop = () => { this.raf = requestAnimationFrame(loop); this.draw(); };
    loop();
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = r.width; this.h = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.dpr = dpr;
    // Las piezas con notas muy breves necesitan más recorrido por pulso para que se distingan.
    const minDur = Math.min(1, ...this.tl.notes.map((n) => n.d));
    this.pxPerBeat = Math.max(46, this.h / 4.2, 24 / minDur);
  }
  mark(n, state) { state ? this.states.set(n, state) : this.states.delete(n); }
  reset() { this.states.clear(); }
  draw() {
    const g = this.canvas.getContext('2d');
    const { w, h, dpr } = this;
    if (!w || !h) return;
    // El desplazamiento sigue al pulso con suavidad (en modo espera salta de paso en paso).
    const target = this.getBeat();
    this.shown += (target - this.shown) * (Math.abs(target - this.shown) > 4 ? 1 : 0.28);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // El teclado puede ser más estrecho que el lienzo (va centrado).
    const kw = this.kb.el.getBoundingClientRect().width || w;
    const ox = (w - kw) / 2;
    g.strokeStyle = 'rgba(255,255,255,.07)';
    g.lineWidth = 1;
    for (const [midi] of this.kb.keys) {
      if (midi % 12 !== 0) continue;
      const f = this.kb.keyFrac(midi);
      g.beginPath(); g.moveTo(ox + f.x * kw + 0.5, 0); g.lineTo(ox + f.x * kw + 0.5, h); g.stroke();
    }
    for (const n of this.tl.notes) {
      const yBottom = h - (n.t - this.shown) * this.pxPerBeat;
      const hh = Math.max(8, n.d * this.pxPerBeat - 3);
      if (yBottom < -4 || yBottom - hh > h) continue;
      const st = this.states.get(n);
      for (const m of n.midis) {
        const f = this.kb.keyFrac(m);
        if (!f) continue;
        const pad = f.black ? 0.5 : kw * f.w * 0.14;
        const x = ox + f.x * kw + pad, ww = f.w * kw - pad * 2;
        g.globalAlpha = st === 'ok' ? 0.35 : st === 'miss' ? 0.3 : 1;
        g.fillStyle = st === 'miss' ? '#8d90a3' : this.colors[n.v];
        roundRect(g, x, yBottom - hh, ww, hh, Math.min(5, ww / 2));
        g.fill();
        if (n.f && hh > 16 && ww > 9 && !st) {
          g.globalAlpha = 1;
          g.fillStyle = '#fff';
          g.font = `700 ${Math.min(13, ww * 0.8)}px sans-serif`;
          g.textAlign = 'center';
          g.fillText(String(n.f), x + ww / 2, yBottom - 6);
        }
      }
    }
    g.globalAlpha = 1;
  }
  destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.canvas.remove(); }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Rango de teclado adecuado para una partitura: octavas completas alrededor de sus notas. */
export function keyboardRange(tl, minOctaves = 2) {
  let lo = Math.floor(tl.lo / 12) * 12;
  let hi = Math.ceil((tl.hi + 1) / 12) * 12;
  while (hi - lo < minOctaves * 12) { if (lo > 36 && (tl.lo - lo < hi - tl.hi || hi >= 96)) lo -= 12; else hi += 12; }
  return { from: lo, to: hi };
}
