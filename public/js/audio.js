// Sonido: piano sintetizado con Web Audio, metrónomo y secuenciador.

let ctx = null;
let master = null;
let wave = null;
const voices = new Map(); // midi -> lista de voces activas
let volume = 0.8;

export function audioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(comp).connect(ctx.destination);
    // Timbre: armónicos decrecientes, parecido a una cuerda percutida.
    const n = 16, real = new Float32Array(n), imag = new Float32Array(n);
    for (let i = 1; i < n; i++) imag[i] = (1 / Math.pow(i, 1.35)) * (i % 2 ? 1 : 0.75);
    wave = ctx.createPeriodicWave(real, imag);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// Los navegadores exigen un gesto del usuario para arrancar el audio.
for (const ev of ['pointerdown', 'keydown']) {
  window.addEventListener(ev, () => audioContext(), { capture: true, passive: true });
}

export const now = () => audioContext().currentTime;
export function setVolume(v) { volume = v; if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.02); }

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export function noteOn(midi, vel = 0.8, when = 0) {
  const ac = audioContext();
  const t = Math.max(when, ac.currentTime);
  const f = freq(midi);
  const g = ac.createGain();
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.6;
  const bright = Math.min(12000, f * (5 + 9 * vel));
  lp.frequency.setValueAtTime(bright, t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.6, 350), t + 0.9);
  // Las notas graves suenan más tiempo que las agudas.
  const decay = Math.max(0.35, 3.2 - (midi - 36) * 0.045);
  const peak = 0.34 * vel * Math.min(1.25, Math.max(0.55, 1.15 - (midi - 60) * 0.008));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
  g.gain.exponentialRampToValueAtTime(peak * 0.42, t + 0.14);
  g.gain.setTargetAtTime(0.0001, t + 0.14, decay / 2.2);
  const oscs = [0, 4].map((cents, i) => {
    const o = ac.createOscillator();
    o.setPeriodicWave(wave);
    o.frequency.value = f;
    o.detune.value = cents;
    const og = ac.createGain();
    og.gain.value = i ? 0.45 : 1;
    o.connect(og).connect(lp);
    o.start(t);
    return o;
  });
  lp.connect(g).connect(master);
  const voice = { g, oscs, ended: false };
  const stopAt = t + decay * 2.6 + 0.5;
  oscs.forEach((o) => o.stop(stopAt));
  oscs[0].onended = () => {
    voice.ended = true;
    g.disconnect();
    const list = voices.get(midi);
    if (list) { const i = list.indexOf(voice); if (i >= 0) list.splice(i, 1); }
  };
  if (!voices.has(midi)) voices.set(midi, []);
  voices.get(midi).push(voice);
  return voice;
}

function release(voice, when = 0) {
  if (voice.ended) return;
  const t = Math.max(when, ctx.currentTime);
  voice.g.gain.cancelScheduledValues(t);
  voice.g.gain.setTargetAtTime(0.0001, t, 0.06);
  voice.oscs.forEach((o) => { try { o.stop(t + 0.5); } catch { /* ya detenido */ } });
}

export function noteOff(midi, when = 0) {
  const list = voices.get(midi);
  if (list) list.forEach((v) => release(v, when));
}

/** Toca una nota de duración fija (segundos). */
export function playNote(midi, dur = 0.6, vel = 0.8, when = 0) {
  const ac = audioContext();
  const t = Math.max(when, ac.currentTime);
  const v = noteOn(midi, vel, t);
  release(v, t + dur);
  return v;
}

export function allOff() {
  for (const list of voices.values()) list.forEach((v) => release(v));
}

/** Clic de metrónomo. */
export function click(accent = false, when = 0) {
  const ac = audioContext();
  const t = Math.max(when, ac.currentTime);
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'square';
  o.frequency.value = accent ? 1560 : 1040;
  g.gain.setValueAtTime(accent ? 0.22 : 0.14, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.06);
}

/** Sonidos breves de acierto y fallo. */
export function chime(ok) {
  const t = now();
  if (ok) { playNote(84, 0.12, 0.35, t); playNote(88, 0.25, 0.35, t + 0.09); }
  else { playNote(41, 0.25, 0.5, t); }
}

/**
 * Reloj musical. Planifica con antelación sobre el reloj del audio y avisa a la
 * interfaz en el instante exacto de cada evento.
 *   events: [{ t (pulsos), fn(audioTime) }]  ·  bpm: pulsos por minuto
 */
export class Transport {
  constructor({ bpm = 90, events = [], onEnd = null, startDelay = 0.12 } = {}) {
    this.bpm = bpm;
    this.events = [...events].sort((a, b) => a.t - b.t);
    this.onEnd = onEnd;
    this.startDelay = startDelay;
    this.playing = false;
    this.timer = null;
    this.timeouts = new Set();
  }
  get spb() { return 60 / this.bpm; }
  /** Pulso actual (puede ser fraccionario). */
  get beat() {
    if (!this.playing) return this.pausedBeat || 0;
    return (ctx.currentTime - this.t0) / this.spb;
  }
  timeOf(beat) { return this.t0 + beat * this.spb; }
  start(fromBeat = 0) {
    const ac = audioContext();
    this.stop();
    this.playing = true;
    this.t0 = ac.currentTime + this.startDelay - fromBeat * this.spb;
    this.idx = this.events.findIndex((e) => e.t >= fromBeat - 1e-6);
    if (this.idx < 0) this.idx = this.events.length;
    const tick = () => {
      const horizon = ac.currentTime + 0.12;
      while (this.idx < this.events.length && this.timeOf(this.events[this.idx].t) < horizon) {
        const e = this.events[this.idx++];
        const at = this.timeOf(e.t);
        if (e.audio) e.audio(at);
        if (e.fn) {
          const id = setTimeout(() => { this.timeouts.delete(id); if (this.playing) e.fn(at); },
            Math.max(0, (at - ac.currentTime) * 1000));
          this.timeouts.add(id);
        }
      }
      if (this.idx >= this.events.length) {
        clearInterval(this.timer);
        this.timer = null;
        const last = this.events.length ? this.events[this.events.length - 1].t : 0;
        const id = setTimeout(() => {
          this.timeouts.delete(id);
          if (this.playing) { this.playing = false; this.onEnd?.(); }
        }, Math.max(0, (this.timeOf(last) - ac.currentTime) * 1000) + 30);
        this.timeouts.add(id);
      }
    };
    this.timer = setInterval(tick, 25);
    tick();
  }
  stop() {
    if (this.playing) this.pausedBeat = this.beat;
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
  }
}

/**
 * Atajo: reproduce una lista de notas [{ t, midi | midis, d, vel }] (en pulsos).
 * onNote(nota, encendida) permite animar la interfaz. Devuelve el Transport.
 */
export function playSequence(notes, { bpm = 90, onNote = null, onEnd = null, legato = 0.92 } = {}) {
  const events = [];
  let end = 0;
  const tr = new Transport({ bpm, onEnd: () => onEnd?.() });
  for (const n of notes) {
    const midis = n.midis || (n.midi != null ? [n.midi] : []);
    const durSec = () => n.d * tr.spb * (n.short ? 0.35 : legato);
    events.push({
      t: n.t,
      audio: (at) => midis.forEach((m) => playNote(m, durSec(), n.vel ?? 0.75, at)),
      fn: () => onNote?.(n, true),
    });
    events.push({ t: n.t + n.d * (n.short ? 0.4 : 0.95), fn: () => onNote?.(n, false) });
    end = Math.max(end, n.t + n.d);
  }
  events.push({ t: end });
  tr.events = events.sort((a, b) => a.t - b.t);
  tr.start();
  return tr;
}
