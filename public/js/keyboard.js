// Teclado de piano en pantalla (SVG). Se toca con ratón, dedo, teclado del ordenador o MIDI.
import { input, pcKeyboard, KEY_LABELS } from './input.js';
import { midiOf, isBlack, noteName, letterName } from './music.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 24, H = 104, BW = 14, BH = 64;

export const svgEl = (tag, attrs = {}, parent = null) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
};

export class Keyboard {
  /**
   * opts: from, to (alturas), labels ('none' | 'c' | 'all'), letters (cifrado C D E),
   *       interactive, pcHints (letras del teclado del ordenador), maxKey (ancho máx. por tecla en px)
   */
  constructor(parent, opts = {}) {
    this.opts = { from: 'C3', to: 'C5', labels: 'c', letters: false, interactive: true, pcHints: false, maxKey: 52, ...opts };
    let lo = midiOf(this.opts.from), hi = midiOf(this.opts.to);
    if (isBlack(lo)) lo--;
    if (isBlack(hi)) hi++;
    this.lo = lo; this.hi = hi;
    this.keys = new Map();
    this.el = document.createElement('div');
    this.el.className = 'kbd';
    parent.appendChild(this.el);
    this.build();
    this.offInput = input.on((ev) => this.el.isConnected && this.setDown(ev.midi, ev.type === 'on'));
    if (this.opts.pcHints) this.offBase = pcKeyboard.onBase(() => this.drawPcHints());
  }

  build() {
    const whites = [];
    for (let m = this.lo; m <= this.hi; m++) if (!isBlack(m)) whites.push(m);
    const width = whites.length * W;
    this.width = width;
    this.el.style.maxWidth = `${whites.length * this.opts.maxKey}px`;
    const svg = svgEl('svg', { viewBox: `0 0 ${width} ${H + 6}`, class: 'kbd-svg', role: 'group', 'aria-label': 'Teclado de piano' }, this.el);
    this.svg = svg;
    svgEl('rect', { x: 0, y: 0, width, height: 5, class: 'kbd-felt' }, svg);
    const gW = svgEl('g', { transform: 'translate(0,5)' }, svg);
    const gB = svgEl('g', { transform: 'translate(0,5)' }, svg);
    this.gLabels = svgEl('g', { transform: 'translate(0,5)', class: 'kbd-labels' }, svg);
    whites.forEach((m, i) => {
      const g = svgEl('g', { class: 'key white', 'data-midi': m }, gW);
      svgEl('rect', { x: i * W + 0.6, y: 0, width: W - 1.2, height: H, rx: 2.6 }, g);
      this.keys.set(m, { g, x: i * W, w: W, cx: i * W + W / 2, black: false });
      const pc = m % 12;
      const show = this.opts.labels === 'all' || (this.opts.labels === 'c' && pc === 0);
      if (show) {
        const t = svgEl('text', { x: i * W + W / 2, y: H - 8, class: 'key-name' + (m === 60 ? ' middle' : '') }, g);
        t.textContent = this.opts.letters ? letterName(m) : noteName(m);
      }
      if (m === 60) svgEl('circle', { cx: i * W + W / 2, cy: H - 24, r: 2.2, class: 'key-middle-dot' }, g);
      // Tecla negra a la derecha de esta blanca (salvo Mi y Si).
      if (![4, 11].includes(pc) && m + 1 <= this.hi) {
        const bx = (i + 1) * W - BW / 2 + (pc === 0 || pc === 5 ? -1.4 : pc === 2 || pc === 9 ? 1.4 : 0);
        const gb = svgEl('g', { class: 'key black', 'data-midi': m + 1 }, gB);
        svgEl('rect', { x: bx, y: 0, width: BW, height: BH, rx: 2 }, gb);
        this.keys.set(m + 1, { g: gb, x: bx, w: BW, cx: bx + BW / 2, black: true });
      }
    });
    if (this.opts.pcHints) this.drawPcHints();
    if (this.opts.interactive) this.bindPointer();
    else this.el.classList.add('static');
  }

  drawPcHints() {
    this.gLabels.querySelectorAll('.pc-hint').forEach((n) => n.remove());
    for (const off in KEY_LABELS) {
      const k = this.keys.get(pcKeyboard.base + Number(off));
      if (!k) continue;
      const t = svgEl('text', { x: k.cx, y: k.black ? BH - 8 : H - 34, class: 'pc-hint' + (k.black ? ' on-black' : '') }, this.gLabels);
      t.textContent = KEY_LABELS[off];
    }
  }

  bindPointer() {
    const active = new Map(); // pointerId -> midi
    const keyAt = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.key');
      return el && this.svg.contains(el) ? Number(el.dataset.midi) : null;
    };
    const press = (id, m) => {
      const prev = active.get(id);
      if (prev === m) return;
      if (prev != null) input.emit({ type: 'off', midi: prev, source: 'screen' });
      if (m != null) { active.set(id, m); input.emit({ type: 'on', midi: m, vel: 0.8, source: 'screen' }); }
      else active.delete(id);
    };
    this.svg.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      try { this.svg.setPointerCapture(e.pointerId); } catch { /* puntero ya liberado */ }
      press(e.pointerId, keyAt(e));
    });
    this.svg.addEventListener('pointermove', (e) => { if (active.has(e.pointerId)) press(e.pointerId, keyAt(e)); });
    const up = (e) => { if (active.has(e.pointerId)) press(e.pointerId, null); };
    this.svg.addEventListener('pointerup', up);
    this.svg.addEventListener('pointercancel', up);
    this.svg.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  has(midi) { return this.keys.has(midi); }
  setDown(midi, down) { this.keys.get(midi)?.g.classList.toggle('down', down); }
  mark(midi, cls) { this.keys.get(midiOf(midi))?.g.classList.add(...cls.split(' ')); return this; }
  unmark(midi, cls) { this.keys.get(midiOf(midi))?.g.classList.remove(...cls.split(' ')); return this; }
  clear(cls) {
    for (const k of this.keys.values()) k.g.classList.remove(...cls.split(' '));
    return this;
  }
  flash(midi, cls, ms = 450) {
    this.mark(midi, cls);
    setTimeout(() => this.unmark(midi, cls), ms);
  }
  /** Burbuja de texto sobre una tecla (número de dedo, nombre…). null la quita. */
  bubble(midi, text, cls = '') {
    const m = midiOf(midi);
    const k = this.keys.get(m);
    if (!k) return;
    this.gLabels.querySelector(`[data-b="${m}"]`)?.remove();
    if (text == null) return;
    const g = svgEl('g', { 'data-b': m, class: `key-bubble ${cls}` }, this.gLabels);
    const cy = k.black ? BH - 13 : H - 44;
    svgEl('circle', { cx: k.cx, cy, r: k.black ? 6 : 7.6 }, g);
    const t = svgEl('text', { x: k.cx, y: cy + 0.4 }, g);
    t.textContent = text;
    if (String(text).length > 2) t.setAttribute('class', 'small');
  }
  clearBubbles() { this.gLabels.querySelectorAll('.key-bubble').forEach((n) => n.remove()); }
  /** Geometría horizontal de una tecla como fracciones del ancho (para la cascada de notas). */
  keyFrac(midi) {
    const k = this.keys.get(midi);
    return k ? { x: k.x / this.width, w: k.w / this.width, black: k.black } : null;
  }
  destroy() { this.offInput?.(); this.offBase?.(); this.el.remove(); }
}
