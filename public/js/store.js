// Estado del alumno: cuenta, progreso y actividad. Sin cuenta, el progreso se guarda en el navegador.
import { input } from './input.js';

const LS_PROGRESS = 'piano.progreso';
const LS_ACTIVITY = 'piano.actividad';
const listeners = new Set();

const ls = {
  get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* almacenamiento no disponible */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* nada */ } },
};

async function api(path, body) {
  let res;
  try {
    res = await fetch(`/api/${path}`, body === undefined ? { credentials: 'same-origin' } : {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No hay conexión con el servidor. Comprueba tu conexión a internet.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Algo ha fallado. Inténtalo de nuevo.');
  return data;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const store = {
  user: null,
  progress: new Map(),
  activity: [], // [{ day, seconds, notes }] del más reciente al más antiguo
  ready: false,

  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  _notify() { listeners.forEach((fn) => fn()); },

  _load(snapshot) {
    this.user = snapshot.user || null;
    this.progress = new Map();
    if (this.user) {
      for (const p of snapshot.progress || []) this.progress.set(p.item, p);
      this.activity = snapshot.activity || [];
    } else {
      for (const p of ls.get(LS_PROGRESS, [])) this.progress.set(p.item, p);
      this.activity = ls.get(LS_ACTIVITY, []);
    }
    this._notify();
  },

  async init() {
    try { this._load(await api('me')); } catch { this._load({ user: null }); }
    this.ready = true;
    this._notify();
  },

  /** Progreso guardado sin cuenta, para fusionarlo al registrarse o entrar. */
  _guestProgress() { return ls.get(LS_PROGRESS, []).map((p) => ({ ...p, attempts: p.attempts || 0 })); },

  async register(username, password, name) {
    const snap = await api('register', { username, password, name, progress: this._guestProgress() });
    ls.del(LS_PROGRESS); ls.del(LS_ACTIVITY);
    this._load(snap);
  },
  async login(username, password) {
    const snap = await api('login', { username, password, progress: this._guestProgress() });
    ls.del(LS_PROGRESS); ls.del(LS_ACTIVITY);
    this._load(snap);
  },
  async logout() {
    await api('logout', {});
    this._load({ user: null });
  },
  async updateAccount(changes) {
    const { user } = await api('account', changes);
    this.user = user;
    this._notify();
  },
  async deleteAccount(password) {
    await api('account/delete', { password });
    this._load({ user: null });
  },

  get(item) { return this.progress.get(item) || null; },
  isDone(item) { return !!this.progress.get(item)?.done; },

  /** Registra un resultado. Se queda siempre con lo mejor conseguido. */
  record(item, { done = true, stars = 0, best = 0 } = {}) {
    const prev = this.progress.get(item) || { item, done: 0, stars: 0, best: 0, attempts: 0 };
    const next = {
      item, done: Math.max(prev.done, done ? 1 : 0), stars: Math.max(prev.stars, stars),
      best: Math.max(prev.best, Math.round(best)), attempts: prev.attempts + 1, updated_at: Date.now(),
    };
    this.progress.set(item, next);
    if (this.user) {
      api('progress', { item, done, stars, best: Math.round(best), attempts: 1 }).catch(() => {
        // Sin conexión: se reintenta en la siguiente visita.
        const pending = ls.get('piano.pendiente', []);
        pending.push({ item, done, stars, best: Math.round(best), attempts: 1 });
        ls.set('piano.pendiente', pending.slice(-200));
      });
    } else {
      ls.set(LS_PROGRESS, [...this.progress.values()]);
    }
    this._notify();
    return next;
  },

  async flushPending() {
    const pending = ls.get('piano.pendiente', []);
    if (!this.user || !pending.length) return;
    try { await api('progress', { items: pending }); ls.del('piano.pendiente'); } catch { /* se reintentará */ }
  },

  addActivity(seconds, notes) {
    if (seconds <= 0 && notes <= 0) return;
    const day = today();
    let row = this.activity.find((a) => a.day === day);
    if (!row) { row = { day, seconds: 0, notes: 0 }; this.activity.unshift(row); }
    row.seconds += seconds; row.notes += notes;
    if (this.user) api('activity', { day, seconds, notes }).catch(() => {});
    else ls.set(LS_ACTIVITY, this.activity.slice(0, 400));
  },

  /** Días seguidos con práctica (contando hoy o ayer como último día). */
  streak() {
    const days = new Set(this.activity.filter((a) => a.seconds >= 30 || a.notes > 0).map((a) => a.day));
    const d = new Date();
    const fmt = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    if (!days.has(fmt(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (days.has(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
};

// ----- Registro del tiempo de práctica -----
// Cuenta el tiempo solo mientras la pestaña está visible y ha habido actividad reciente.
let lastAction = 0;
let acc = 0;
let tracking = false;
for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, () => { lastAction = Date.now(); }, { passive: true, capture: true });
input.on(() => { lastAction = Date.now(); });
setInterval(() => {
  if (tracking && !document.hidden && Date.now() - lastAction < 60000) acc += 5;
  if (acc >= 30) flushActivity();
}, 5000);
function flushActivity() {
  const notes = input.takeNoteCount();
  store.addActivity(acc, notes);
  acc = 0;
}
window.addEventListener('pagehide', flushActivity);
/** Las páginas de estudio (lección, canción, práctica) activan el contador. */
export function trackPractice(on) {
  if (!on && tracking) flushActivity();
  tracking = on;
}
