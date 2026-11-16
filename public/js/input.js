// Bus de entrada: une el teclado en pantalla, el teclado del ordenador y un piano MIDI.
import { noteOn, noteOff } from './audio.js';

const listeners = new Set();
const held = new Set();
let muted = false;
let noteCount = 0;

export const input = {
  /** fn({ type: 'on' | 'off', midi, vel, source }) → devuelve la función para dejar de escuchar. */
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  emit(ev) {
    if (ev.type === 'on') {
      if (held.has(ev.midi) && ev.source !== 'midi') return;
      held.add(ev.midi);
      noteCount++;
      if (!muted) noteOn(ev.midi, ev.vel ?? 0.8);
    } else {
      held.delete(ev.midi);
      noteOff(ev.midi);
    }
    for (const fn of [...listeners]) fn(ev);
  },
  held,
  /** Silencia el sonido automático de las teclas (lo usa el modo de ritmo). */
  setMuted(v) { muted = v; },
  /** Notas tocadas desde la última consulta (para el registro de actividad). */
  takeNoteCount() { const n = noteCount; noteCount = 0; return n; },
  releaseAll() { for (const m of [...held]) input.emit({ type: 'off', midi: m, source: 'sys' }); },
};

// ----- Teclado del ordenador -----
const KEYMAP = {
  KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
  KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16,
};
/** Letra que se muestra sobre cada tecla (distribución española/QWERTY). */
export const KEY_LABELS = { 0: 'A', 1: 'W', 2: 'S', 3: 'E', 4: 'D', 5: 'F', 6: 'T', 7: 'G', 8: 'Y', 9: 'H', 10: 'U', 11: 'J', 12: 'K', 13: 'O', 14: 'L', 15: 'P', 16: 'Ñ' };
let base = 60;
const baseListeners = new Set();
const pcDown = new Map(); // code -> midi

export const pcKeyboard = {
  get base() { return base; },
  setBase(midi) { base = midi; baseListeners.forEach((fn) => fn(base)); },
  onBase(fn) { baseListeners.add(fn); return () => baseListeners.delete(fn); },
};

const typing = (e) => {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
};
window.addEventListener('keydown', (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || typing(e)) return;
  if (e.code === 'KeyZ') { pcKeyboard.setBase(Math.max(24, base - 12)); return; }
  if (e.code === 'KeyX') { pcKeyboard.setBase(Math.min(84, base + 12)); return; }
  if (!(e.code in KEYMAP) || pcDown.has(e.code)) return;
  const midi = base + KEYMAP[e.code];
  pcDown.set(e.code, midi);
  input.emit({ type: 'on', midi, vel: 0.8, source: 'pc' });
});
window.addEventListener('keyup', (e) => {
  if (!pcDown.has(e.code)) return;
  input.emit({ type: 'off', midi: pcDown.get(e.code), source: 'pc' });
  pcDown.delete(e.code);
});
window.addEventListener('blur', () => { pcDown.clear(); input.releaseAll(); });

// ----- MIDI -----
const midiListeners = new Set();
export const midi = {
  supported: 'requestMIDIAccess' in navigator,
  devices: [],
  onChange(fn) { midiListeners.add(fn); return () => midiListeners.delete(fn); },
  async connect() {
    if (!midi.supported) throw new Error('Este navegador no admite MIDI. Prueba con Chrome, Edge o Firefox.');
    const access = await navigator.requestMIDIAccess();
    const refresh = () => {
      midi.devices = [];
      for (const port of access.inputs.values()) {
        midi.devices.push(port.name || 'Dispositivo MIDI');
        port.onmidimessage = (m) => {
          const [status, note, vel] = m.data;
          const cmd = status & 0xf0;
          if (cmd === 0x90 && vel > 0) input.emit({ type: 'on', midi: note, vel: 0.35 + (vel / 127) * 0.65, source: 'midi' });
          else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) input.emit({ type: 'off', midi: note, source: 'midi' });
        };
      }
      midiListeners.forEach((fn) => fn(midi.devices));
    };
    access.onstatechange = refresh;
    refresh();
    try { localStorage.setItem('piano.midi', '1'); } catch { /* sin almacenamiento */ }
    return midi.devices;
  },
};
// Si ya se concedió permiso en otra visita, se reconecta sin preguntar.
try { if (midi.supported && localStorage.getItem('piano.midi') === '1') midi.connect().catch(() => {}); } catch { /* nada */ }
