// Arranque de la aplicación: cabecera, rutas y montaje de páginas.
import { h, icon, toast } from './ui.js';
import { store } from './store.js';
import { midi, input } from './input.js';
import { allOff } from './audio.js';
import { navigate, onNavigate } from './router.js';
import { home, lessonsPage, lessonPage } from './pages/lessons.js';
import { songsPage, songPage } from './pages/songs.js';
import { practicePage } from './pages/practice.js';
import { symbolsPage, progressPage, authPage } from './pages/misc.js';

const ROUTES = [
  [/^\/$/, home, 'Clases de piano: aprende desde cero', ''],
  [/^\/lecciones$/, lessonsPage, 'Lecciones', 'lecciones'],
  [/^\/leccion\/([\w-]+)$/, lessonPage, 'Lección', 'lecciones'],
  [/^\/canciones$/, songsPage, 'Canciones', 'canciones'],
  [/^\/cancion\/([\w-]+)$/, songPage, 'Canción', 'canciones'],
  [/^\/practica(?:\/([\w-]+))?$/, practicePage, 'Práctica', 'practica'],
  [/^\/simbolos$/, symbolsPage, 'Símbolos de la partitura', 'simbolos'],
  [/^\/progreso$/, progressPage, 'Tu progreso', 'progreso'],
  [/^\/(entrar|registro)$/, authPage, 'Entrar', 'progreso'],
];
const NAV = [['/lecciones', 'Lecciones', 'lecciones'], ['/canciones', 'Canciones', 'canciones'], ['/practica', 'Práctica', 'practica'], ['/simbolos', 'Símbolos', 'simbolos']];

const header = document.getElementById('cabecera');
const main = document.getElementById('contenido');
let cleanup = null;
let section = '';
let lastPath = null;

function drawHeader() {
  const midiBtn = h('button.icon-btn' + (midi.devices.length ? '.on' : ''), {
    type: 'button', title: midi.devices.length ? `Piano conectado: ${midi.devices.join(', ')}` : 'Conectar un piano o teclado MIDI',
    'aria-label': midi.devices.length ? `Piano MIDI conectado: ${midi.devices.join(', ')}` : 'Conectar un piano o teclado MIDI',
    onclick: async () => {
      try {
        const devices = await midi.connect();
        toast(devices.length ? `Conectado: ${devices.join(', ')}` : 'No se ha encontrado ningún teclado MIDI. Conéctalo por USB y vuelve a pulsar.');
      } catch (e) {
        toast(e.name === 'SecurityError' || e.name === 'NotAllowedError' ? 'El navegador ha bloqueado el acceso MIDI. Permítelo en los ajustes del sitio.' : e.message, 'bad');
      }
    },
  }, icon('midi', 20), h('span.icon-btn-text', midi.devices.length ? 'MIDI conectado' : 'Conectar MIDI'));
  header.replaceChildren(
    h('a.brand', { href: '/', 'data-link': true, 'aria-label': 'Clases de piano, inicio' },
      h('span.brand-keys', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), h('span.brand-name', 'Clases de piano')),
    h('nav.main-nav', { 'aria-label': 'Secciones' }, NAV.map(([href, text, key]) => h('a' + (section === key ? '.on' : ''), { href, 'data-link': true, 'aria-current': section === key ? 'page' : null }, text))),
    h('div.header-right', midiBtn,
      h('a.account-link' + (section === 'progreso' ? '.on' : ''), { href: store.user ? '/progreso' : '/entrar', 'data-link': true }, icon('user', 18),
        h('span', store.user ? store.user.name : 'Entrar')),
      store.user ? null : h('a.progress-link', { href: '/progreso', 'data-link': true }, 'Mi progreso')));
}

function render() {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  // Un cambio de ancla dentro de la misma página no la vuelve a montar.
  if (path === lastPath && cleanup) {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  lastPath = path;
  try { cleanup?.(); } catch (e) { console.error(e); }
  cleanup = null;
  input.releaseAll();
  allOff();
  main.innerHTML = '';
  let match = null, route = null;
  for (const r of ROUTES) { match = r[0].exec(path); if (match) { route = r; break; } }
  if (!route) {
    section = '';
    document.title = 'Página no encontrada · Clases de piano';
    main.append(h('div.empty', h('h1', 'Esta página no existe'), h('p', 'Puede que el enlace esté mal escrito.'), h('a.btn', { href: '/', 'data-link': true }, 'Ir al inicio')));
  } else {
    section = route[3];
    document.title = route[3] ? `${route[2]} · Clases de piano` : route[2];
    main.className = `page page-${route[1].name}`;
    try {
      cleanup = route[1](main, match[1]) || (() => {});
    } catch (e) {
      console.error(e);
      main.append(h('div.empty', h('h1', 'Algo ha fallado al abrir esta página'), h('p', 'Recarga la página. Si sigue pasando, vuelve al inicio.'), h('a.btn', { href: '/', 'data-link': true }, 'Ir al inicio')));
    }
  }
  drawHeader();
  if (!location.hash) window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

onNavigate(render);
midi.onChange(drawHeader);

let lastUser;
store.onChange(() => {
  const u = store.user?.username || null;
  if (u !== lastUser) { lastUser = u; if (store.ready) drawHeader(); }
});

await Promise.all([store.init(), document.fonts.load('40px Bravura').catch(() => {})]);
lastUser = store.user?.username || null;
store.flushPending();
render();
