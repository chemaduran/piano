// Glosario de símbolos, progreso del alumno y cuenta.
import { h, icon, stars, toast } from '../ui.js';
import { store, today } from '../store.js';
import { MODULES, LESSONS, lessonById, lessonItem } from '../content/curriculum.js';
import { SONGS } from '../content/songs.js';
import { SYMBOLS } from '../content/symbols.js';
import { miniFigure } from '../widgets.js';
import { navigate } from '../router.js';

// ---------- Símbolos ----------
export function symbolsPage(main) {
  const search = h('input.search', { type: 'search', placeholder: 'Buscar un símbolo: «calderón», «bemol», «pedal»…', 'aria-label': 'Buscar un símbolo' });
  const jump = h('nav.chips', { 'aria-label': 'Categorías' }, SYMBOLS.map((c) => h('a', { href: `#${c.id}` }, c.title)));
  const empty = h('p.muted', { hidden: true }, 'No hay ningún símbolo con ese nombre. Prueba con otra palabra.');
  main.append(h('header.page-head', h('h1', 'Símbolos de la partitura'),
    h('p.section-lead', 'Todos los signos que aparecen en una partitura para principiantes, con lo que significan y la lección donde se explican.'), search, jump), empty);
  const cards = [];
  SYMBOLS.forEach((cat) => {
    const grid = h('div.sym-grid');
    cat.items.forEach((it) => {
      const les = it.lesson ? lessonById(it.lesson) : null;
      const card = h('article.sym-card', miniFigure({ ...it.fig, width: 230, opts: { scale: 9, ...(it.fig.opts || {}) } }),
        h('h3', it.name), h('p', it.desc),
        les ? h('a.sym-link', { href: `/leccion/${les.id}`, 'data-link': true }, `Lección: ${les.title}`) : null);
      cards.push({ card, text: `${it.name} ${it.desc}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), section: null });
      grid.append(card);
    });
    const section = h('section.sym-section', { id: cat.id }, h('h2', cat.title), grid);
    cards.slice(-cat.items.length).forEach((c) => { c.section = section; });
    main.append(section);
  });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let any = false;
    const visible = new Map();
    cards.forEach((c) => {
      const show = !q || c.text.includes(q);
      c.card.hidden = !show;
      if (show) { any = true; visible.set(c.section, true); }
    });
    main.querySelectorAll('.sym-section').forEach((s) => { s.hidden = !visible.get(s); });
    empty.hidden = any;
  });
  jump.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth' });
  });
  return () => {};
}

// ---------- Mi progreso ----------
const fmtTime = (secs) => {
  const m = Math.round(secs / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
};

export function progressPage(main) {
  const lessonsDone = LESSONS.filter((l) => store.isDone(lessonItem(l.id))).length;
  const songsDone = SONGS.filter((s) => store.isDone(`s:${s.id}`)).length;
  const totalStars = [...store.progress.values()].filter((p) => /^[ls]:/.test(p.item)).reduce((a, p) => a + p.stars, 0);
  const maxStars = (LESSONS.length + SONGS.length) * 3;
  const totalSecs = store.activity.reduce((a, d) => a + d.seconds, 0);
  const streak = store.streak();

  main.append(h('header.page-head',
    h('h1', store.user ? `El progreso de ${store.user.name}` : 'Tu progreso'),
    store.user ? null : h('div.callout', h('p', h('b', 'Estás practicando sin cuenta.'), ' Lo que avances se guarda solo en este navegador y puede perderse. Crea una cuenta y se conservará todo lo que llevas.'),
      h('div.row', h('a.btn', { href: '/registro', 'data-link': true }, 'Crear una cuenta'), h('a.btn.ghost', { href: '/entrar', 'data-link': true }, 'Ya tengo cuenta')))));

  main.append(h('dl.stats',
    stat('Lecciones superadas', `${lessonsDone}`, `de ${LESSONS.length}`),
    stat('Canciones tocadas', `${songsDone}`, `de ${SONGS.length}`),
    stat('Estrellas', `${totalStars}`, `de ${maxStars}`),
    stat('Días seguidos', `${streak}`, streak === 1 ? 'día' : 'días'),
    stat('Tiempo de práctica', fmtTime(totalSecs), 'en total')));

  // Calendario de actividad: últimas 15 semanas, una columna por semana.
  const byDay = new Map(store.activity.map((a) => [a.day, a]));
  const cal = h('div.calendar', { role: 'img', 'aria-label': 'Calendario de práctica de las últimas semanas' });
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 7 * 14 - ((end.getDay() + 6) % 7));
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const a = byDay.get(key(d));
    const mins = a ? a.seconds / 60 : 0;
    const lv = !a ? 0 : mins >= 30 ? 4 : mins >= 15 ? 3 : mins >= 5 ? 2 : 1;
    cal.append(h(`i.lv${lv}`, { title: `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}: ${a ? fmtTime(a.seconds) : 'sin práctica'}` }));
  }
  main.append(h('section.band', h('h2', 'Práctica diaria'),
    h('div.cal-wrap', h('div.cal-days', { 'aria-hidden': 'true' }, ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => h('span', d))), cal),
    h('p.cal-legend', 'Menos', h('i.lv0'), h('i.lv1'), h('i.lv2'), h('i.lv3'), h('i.lv4'), 'Más', h('span.muted', byDay.get(today()) ? ` · Hoy llevas ${fmtTime(byDay.get(today()).seconds)}.` : ' · Hoy todavía no has practicado.'))));

  const mods = h('div.mod-progress');
  MODULES.forEach((m) => {
    const d = m.lessons.filter((l) => store.isDone(lessonItem(l.id))).length;
    mods.append(h('a.mod-row', { href: `/lecciones#${m.id}`, 'data-link': true },
      h('span.mod-name', m.title), h('span.bar', { role: 'img', 'aria-label': `${d} de ${m.lessons.length}` }, h('i', { style: { width: `${(d / m.lessons.length) * 100}%` } })), h('span.mod-count', `${d} / ${m.lessons.length}`)));
  });
  main.append(h('section.band', h('h2', 'Lecciones por bloque'), mods));

  const songList = h('ul.song-list.compact');
  SONGS.forEach((s) => {
    const p = store.get(`s:${s.id}`);
    songList.append(h('li' + (p?.done ? '.done' : ''), h('a', { href: `/cancion/${s.id}`, 'data-link': true }, h('span.song-main', h('span.song-title', s.title)),
      h('span.song-meta', p?.done ? h('span.mins', `${p.best} %`) : h('span.mins', 'Sin tocar'), stars(p?.stars || 0, 15)))));
  });
  main.append(h('section.band', h('h2', 'Canciones'), songList));

  if (store.user) main.append(accountSection());
  return () => {};
}
const stat = (label, value, unit) => h('div.stat', h('dt', label), h('dd', h('b', value), ' ', h('span', unit)));

function accountSection() {
  const err = h('p.form-error', { role: 'alert' });
  const name = h('input', { type: 'text', value: store.user.name, maxLength: 40, autocomplete: 'nickname', required: true });
  const cur = h('input', { type: 'password', autocomplete: 'current-password', required: true });
  const nw = h('input', { type: 'password', autocomplete: 'new-password', minLength: 8, required: true });
  const wrap = (fn) => async (e) => {
    e.preventDefault();
    err.textContent = '';
    try { await fn(); } catch (ex) { err.textContent = ex.message; }
  };
  return h('section.band.account', h('h2', 'Tu cuenta'),
    h('p.muted', `Usuario: ${store.user.username} · Cuenta creada el ${new Date(store.user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`),
    err,
    h('div.account-grid',
      h('form', { onsubmit: wrap(async () => { await store.updateAccount({ name: name.value }); toast('Nombre guardado'); }) },
        h('h3', 'Nombre'), h('label', 'Cómo quieres que te llamemos', name), h('button.btn.ghost', { type: 'submit' }, 'Guardar nombre')),
      h('form', { onsubmit: wrap(async () => { await store.updateAccount({ password: cur.value, newPassword: nw.value }); cur.value = nw.value = ''; toast('Contraseña cambiada'); }) },
        h('h3', 'Contraseña'), h('label', 'Contraseña actual', cur), h('label', 'Contraseña nueva (mínimo 8 caracteres)', nw), h('button.btn.ghost', { type: 'submit' }, 'Cambiar contraseña'))),
    h('div.row',
      h('button.btn.ghost', { type: 'button', onclick: async () => { await store.logout(); toast('Sesión cerrada'); navigate('/'); } }, 'Cerrar sesión'),
      h('button.link.danger', { type: 'button', onclick: async () => {
        const pw = prompt('Se borrarán tu cuenta y todo tu progreso. No se puede deshacer.\nEscribe tu contraseña para confirmar:');
        if (!pw) return;
        try { await store.deleteAccount(pw); toast('Cuenta eliminada'); navigate('/'); } catch (ex) { err.textContent = ex.message; }
      } }, 'Eliminar mi cuenta')));
}

// ---------- Entrar / crear cuenta ----------
export function authPage(main, mode) {
  if (store.user) { navigate('/progreso', true); return () => {}; }
  const register = mode === 'registro';
  document.title = `${register ? 'Crear una cuenta' : 'Entrar'} · Clases de piano`;
  const err = h('p.form-error', { role: 'alert' });
  const user = h('input', { type: 'text', name: 'username', autocomplete: 'username', required: true, minLength: 3, maxLength: 24, pattern: '[A-Za-z0-9_.\\-]+', autocapitalize: 'none', spellcheck: false });
  const name = h('input', { type: 'text', name: 'name', autocomplete: 'nickname', maxLength: 40 });
  const pass = h('input', { type: 'password', name: 'password', autocomplete: register ? 'new-password' : 'current-password', required: true, minLength: register ? 8 : 1 });
  const submit = h('button.btn.big', { type: 'submit' }, register ? 'Crear la cuenta' : 'Entrar');
  const guest = [...store.progress.values()].filter((p) => p.done).length;
  const form = h('form.auth-form', { onsubmit: async (e) => {
    e.preventDefault();
    err.textContent = '';
    submit.disabled = true;
    try {
      if (register) await store.register(user.value.trim(), pass.value, name.value.trim());
      else await store.login(user.value.trim(), pass.value);
      toast(register ? 'Cuenta creada. Tu progreso ya se guarda.' : `Hola de nuevo, ${store.user.name}`);
      navigate(new URLSearchParams(location.search).get('volver') || '/lecciones');
    } catch (ex) {
      err.textContent = ex.message;
      submit.disabled = false;
    }
  } },
  h('label', 'Nombre de usuario', user, register ? h('small', 'Entre 3 y 24 caracteres: letras, números, punto o guion. Lo usarás para entrar.') : null),
  register ? h('label', 'Tu nombre (opcional)', name, h('small', 'Solo para saludarte.')) : null,
  h('label', 'Contraseña', pass, register ? h('small', 'Mínimo 8 caracteres. Apúntala: no pedimos correo, así que no se puede recuperar automáticamente.') : null),
  err, submit);
  main.append(h('div.auth',
    h('h1', register ? 'Crea tu cuenta' : 'Entra en tu cuenta'),
    h('p.section-lead', register ? 'Con una cuenta, cada lección superada, cada canción y tu tiempo de práctica quedan guardados y disponibles en cualquier dispositivo.' : 'Continúa donde lo dejaste.'),
    register && guest ? h('p.callout', icon('check', 18), ` Lo que ya has avanzado en este navegador (${guest} ${guest === 1 ? 'elemento' : 'elementos'}) se añadirá a tu cuenta.`) : null,
    form,
    h('p.auth-switch', register ? '¿Ya tienes cuenta? ' : '¿Todavía no tienes cuenta? ', h('a', { href: register ? '/entrar' : '/registro', 'data-link': true }, register ? 'Entrar' : 'Crear una cuenta'))));
  user.focus();
  return () => {};
}
