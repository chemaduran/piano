// Utilidades de interfaz.

/** Crea un elemento: h('div.clase', { onclick }, hijo, 'texto', …). `html` inserta HTML de confianza. */
export function h(spec, attrs, ...children) {
  const [tag, ...classes] = spec.split('.');
  const el = document.createElement(tag || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { children.unshift(attrs); attrs = null; }
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += (el.className ? ' ' : '') + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k in el && k !== 'list' && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}
function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

const ICONS = {
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
  restart: '<path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M3 4.5 5.6 10l5.3-2.6z"/>',
  check: '<path d="m4.5 12.5 5 5 10-11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  next: '<path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  back: '<path d="M19 12H6m5-6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z"/>',
  sound: '<path d="M4 9.5v5h3.5l5 4v-13l-5 4z"/><path d="M16 8.5a5 5 0 0 1 0 7m2.5-9.800a8.500 8.500 0 0 1 0 12.600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c.6-4 3.800-6 8-6s7.400 2 8 6z"/>',
  midi: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7.500" cy="12" r="1.300"/><circle cx="16.500" cy="12" r="1.300"/><circle cx="9" cy="8.300" r="1.300"/><circle cx="15" cy="8.300" r="1.300"/><circle cx="12" cy="16.200" r="1.300"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  metronome: '<path d="M8.500 3h7l3.500 18H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m12 16 5-10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  hand: '<path d="M8 13V5.500a1.500 1.500 0 0 1 3 0V11V4a1.500 1.500 0 0 1 3 0v7V5.500a1.500 1.500 0 0 1 3 0V12v-2a1.500 1.500 0 0 1 3 0v5c0 4-2.500 6.500-6.500 6.500-3 0-4.700-1.200-6.300-3.700L4.500 15a1.600 1.600 0 0 1 2.600-1.800z" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linejoin="round"/>',
  info: '<circle cx="12" cy="12" r="9.500" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><circle cx="12" cy="7.500" r="1.400"/>',
};
export function icon(name, size = 20) {
  const s = document.createElement('span');
  s.className = 'icon';
  s.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  return s;
}

/** Tres estrellas, con las conseguidas rellenas. */
export function stars(n, size = 18) {
  const el = h('span.stars', { role: 'img', 'aria-label': `${n} de 3 estrellas` });
  for (let i = 0; i < 3; i++) {
    const s = icon('star', size);
    if (i < n) s.classList.add('on');
    el.append(s);
  }
  return el;
}

let toastTimer = null;
export function toast(msg, kind = '') {
  let el = document.getElementById('toast');
  if (!el) { el = h('div', { id: 'toast', role: 'status' }); document.body.append(el); }
  el.textContent = msg;
  el.className = `show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3200);
}

/** Selector de opciones exclusivas (botones contiguos). */
export function segmented(options, value, onChange, label = '') {
  const el = h('div.segmented', { role: 'radiogroup', 'aria-label': label });
  const set = (v, fire = true) => {
    value = v;
    for (const b of el.children) {
      const on = b.dataset.v === String(v);
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on);
    }
    if (fire) onChange(v);
  };
  for (const [v, text] of options) {
    el.append(h('button', { type: 'button', role: 'radio', 'data-v': v, onclick: () => set(v) }, text));
  }
  set(value, false);
  el.set = (v) => set(v, false);
  return el;
}

export function toggle(text, value, onChange) {
  const input = h('input', { type: 'checkbox', checked: value, onchange: () => onChange(input.checked) });
  return h('label.toggle', input, h('span.toggle-track'), h('span', text));
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
