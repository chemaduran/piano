// Portada, mapa del curso y página de lección.
import { h, icon, stars } from '../ui.js';
import { store, trackPractice } from '../store.js';
import { MODULES, LESSONS, lessonById, lessonItem } from '../content/curriculum.js';
import { SONGS } from '../content/songs.js';
import { FIGURES, grandExplorer } from '../figures.js';
import { WIDGETS } from '../widgets.js';

const nextLesson = () => LESSONS.find((l) => !store.isDone(lessonItem(l.id))) || null;
const doneCount = (list) => list.filter((l) => store.isDone(lessonItem(l.id))).length;

// ---------- Portada ----------
export function home(main) {
  const next = nextLesson();
  const started = doneCount(LESSONS) > 0;
  const demo = h('div.hero-demo');
  const hero = h('section.hero',
    h('div.hero-text',
      h('h1', 'Aprende a tocar el piano y a leer una partitura'),
      h('p.lead', 'Un curso desde cero, en español: teclado, pentagrama, ritmo, escalas y acordes, con ejercicios que se tocan y canciones para practicar.'),
      h('div.row',
        next
          ? h('a.btn.big', { href: `/leccion/${next.id}`, 'data-link': true }, started ? `Continuar: ${next.title}` : 'Empezar la primera lección')
          : h('a.btn.big', { href: '/canciones', 'data-link': true }, 'Has superado todas las lecciones: a tocar'),
        h('a.btn.ghost.big', { href: '/lecciones', 'data-link': true }, 'Ver el temario')),
      store.user ? null : h('p.hero-note', 'Puedes empezar ya. Si ', h('a', { href: '/registro', 'data-link': true }, 'creas una cuenta'), ', tu progreso se guarda y te sigue a cualquier dispositivo.')),
    demo);
  const stop = grandExplorer(demo, { scale: 14, from: 'C3', to: 'C5', caption: 'Toca una tecla y mira cómo se escribe.', demo: ['E4', 'G4', 'C5', 'A3', 'F3', 'C3'] });

  const path = h('ol.module-path');
  MODULES.forEach((m) => {
    const d = doneCount(m.lessons);
    path.append(h('li', h('a', { href: `/lecciones#${m.id}`, 'data-link': true },
      h('h3', m.title), h('p', m.intro),
      h('span.meter-text', d ? `${d} de ${m.lessons.length} lecciones superadas` : `${m.lessons.length} lecciones`))));
  });

  const tools = h('div.tool-grid',
    toolCard('/canciones', 'Canciones', `${SONGS.length} piezas para principiantes, de «Estrellita» a «Para Elisa». Escúchalas, tócalas paso a paso o a tempo, con cada mano por separado.`),
    toolCard('/practica/lectura', 'Lectura de notas', 'Entrena la vista: aparece una nota en el pentagrama y la tocas. En clave de sol, de fa o en las dos.'),
    toolCard('/practica/ritmo', 'Ritmo', 'Marca ritmos sobre el metrónomo y comprueba tu precisión nota a nota.'),
    toolCard('/simbolos', 'Símbolos de la partitura', 'Un glosario visual con todos los signos: figuras, silencios, alteraciones, matices, repeticiones y adornos.'));

  main.append(hero,
    h('section.band', h('h2', 'El recorrido'), h('p.section-lead', 'Seis bloques, de la primera tecla a la lectura completa de una partitura. Cada lección combina una explicación breve, una figura interactiva y ejercicios.'), path),
    h('section.band', h('h2', 'Para practicar'), tools),
    h('section.band.how', h('h2', 'Cómo se toca aquí'),
      h('ul.how-list',
        h('li', h('b', 'Con un piano o teclado MIDI.'), ' Conéctalo por USB y pulsa «Conectar MIDI» en la cabecera. Es la mejor forma: practicas sobre teclas de verdad.'),
        h('li', h('b', 'Con el teclado del ordenador.'), ' La fila A S D F G H J son las teclas blancas desde Do; W E T Y U, las negras. Z y X cambian de octava.'),
        h('li', h('b', 'Con el ratón o el dedo.'), ' Todos los teclados en pantalla se pueden tocar, también en el móvil o la tableta.'))));
  return stop;
}
const toolCard = (href, title, text) => h('a.tool-card', { href, 'data-link': true }, h('h3', title), h('p', text));

// ---------- Mapa del curso ----------
export function lessonsPage(main) {
  const next = nextLesson();
  main.append(h('header.page-head', h('h1', 'Lecciones'),
    h('p.section-lead', `${doneCount(LESSONS)} de ${LESSONS.length} superadas. Puedes seguir el orden o saltar a lo que necesites: nada está bloqueado.`)));
  MODULES.forEach((m, mi) => {
    const d = doneCount(m.lessons);
    const list = h('ol.lesson-list');
    m.lessons.forEach((l) => {
      const p = store.get(lessonItem(l.id));
      const isNext = next && next.id === l.id;
      list.append(h('li' + (p?.done ? '.done' : '') + (isNext ? '.next' : ''),
        h('a', { href: `/leccion/${l.id}`, 'data-link': true },
          h('span.notehead', { 'aria-hidden': 'true' }),
          h('span.lesson-main', h('span.lesson-title', l.title), h('span.lesson-sum', l.summary)),
          h('span.lesson-meta', p?.done ? stars(p.stars, 15) : isNext ? h('span.tag', 'Siguiente') : h('span.mins', `${l.mins} min`)))));
    });
    main.append(h('section.module', { id: m.id },
      h('div.module-head', h('span.module-no', String(mi + 1)), h('div', h('h2', m.title), h('p', m.intro)),
        h('span.module-count' + (d === m.lessons.length ? '.full' : ''), `${d} / ${m.lessons.length}`)),
      list));
  });
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
  return () => {};
}

// ---------- Lección ----------
const stateKey = (id) => `piano.leccion.${id}`;
function loadState(id) {
  try { return JSON.parse(localStorage.getItem(stateKey(id))) || { at: 0, done: {} }; } catch { return { at: 0, done: {} }; }
}
function saveState(id, st) { try { localStorage.setItem(stateKey(id), JSON.stringify(st)); } catch { /* sin almacenamiento */ } }

export function lessonPage(main, id) {
  const lesson = lessonById(id);
  if (!lesson) { main.append(h('div.empty', h('h1', 'Esa lección no existe'), h('a.btn', { href: '/lecciones', 'data-link': true }, 'Ver todas las lecciones'))); return () => {}; }
  document.title = `${lesson.title} · Clases de piano`;
  trackPractice(true);
  const steps = lesson.steps;
  const exSteps = steps.map((s, i) => (s.ex ? i : -1)).filter((i) => i >= 0);
  const st = loadState(id);
  if (st.at > steps.length) st.at = 0;
  let cleanups = [];
  const clean = () => { cleanups.forEach((fn) => { try { fn?.(); } catch (e) { console.error(e); } }); cleanups = []; };

  const bar = h('ol.step-bar', { 'aria-label': 'Pasos de la lección' });
  const body = h('article.step');
  const nav = h('div.step-nav');
  main.append(h('div.lesson',
    h('header.lesson-head',
      h('a.crumb', { href: `/lecciones#${lesson.module.id}`, 'data-link': true }, icon('back', 16), lesson.module.title),
      h('h1', lesson.title), bar),
    body, nav));

  const allDone = () => exSteps.every((i) => st.done[i] != null);
  const finalize = () => {
    if (!allDone()) return null;
    const scores = exSteps.map((i) => st.done[i]);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 100;
    const nStars = avg >= 90 ? 3 : avg >= 70 ? 2 : 1;
    const already = store.get(lessonItem(id));
    if (!already?.done || already.stars < nStars || !st.recorded) {
      store.record(lessonItem(id), { done: true, stars: nStars, best: avg });
      st.recorded = true;
      saveState(id, st);
    }
    return { avg, nStars };
  };

  const drawBar = () => {
    bar.innerHTML = '';
    steps.forEach((s, i) => {
      const cls = (i === st.at ? '.cur' : '') + (s.ex ? '.ex' : '') + (s.ex && st.done[i] != null ? '.done' : '') + (i < st.at ? '.seen' : '');
      bar.append(h('li' + cls, h('button', { type: 'button', title: s.title, 'aria-label': `Paso ${i + 1}: ${s.title}`, 'aria-current': i === st.at ? 'step' : null, onclick: () => go(i) })));
    });
  };

  const go = (i) => {
    st.at = Math.max(0, Math.min(steps.length, i));
    saveState(id, st);
    draw();
    window.scrollTo({ top: 0 });
  };

  const draw = () => {
    clean();
    drawBar();
    body.innerHTML = '';
    nav.innerHTML = '';
    const i = st.at;
    if (i >= steps.length) { drawEnd(); return; }
    const s = steps[i];
    body.append(h('p.step-count', `Paso ${i + 1} de ${steps.length}${s.ex ? ' · Ejercicio' : ''}`), h('h2', s.title));
    if (s.html) body.append(h('div.prose', { html: s.html }));
    if (s.fig) {
      const figEl = h('div.figure');
      body.append(figEl);
      const fn = FIGURES[s.fig[0]];
      if (fn) cleanups.push(fn(figEl, s.fig[1] || {}));
    }
    let skip = null;
    const nextBtn = h('button.btn', { type: 'button', onclick: () => go(i + 1) }, i + 1 >= steps.length ? 'Terminar la lección' : 'Continuar', icon('next', 18));
    if (s.ex) {
      const exEl = h('div.exercise' + (st.done[i] != null ? '.was-done' : ''));
      body.append(exEl);
      const blocked = st.done[i] == null;
      nextBtn.disabled = blocked;
      cleanups.push(WIDGETS[s.ex[0]](exEl, s.ex[1], ({ score }) => {
        st.done[i] = Math.max(st.done[i] ?? 0, Math.round(score));
        saveState(id, st);
        nextBtn.disabled = false;
        nextBtn.classList.add('ready');
        skip?.remove();
        drawBar();
        finalize();
      }));
      skip = blocked ? h('button.link', { type: 'button', onclick: () => go(i + 1) }, 'Saltar por ahora') : null;
    }
    nav.append(i > 0 ? h('button.btn.ghost', { type: 'button', onclick: () => go(i - 1) }, icon('back', 18), 'Anterior') : h('span'),
      h('span.nav-right', skip, nextBtn));
  };

  const drawEnd = () => {
    const result = finalize();
    if (!result) {
      const missing = exSteps.filter((i) => st.done[i] == null);
      body.append(h('h2', 'Casi está'),
        h('p.prose', `Para superar la lección te ${missing.length === 1 ? 'queda un ejercicio' : `quedan ${missing.length} ejercicios`}:`),
        h('ul.missing', missing.map((i) => h('li', h('button.link', { type: 'button', onclick: () => go(i) }, steps[i].title)))));
      nav.append(h('button.btn.ghost', { type: 'button', onclick: () => go(steps.length - 1) }, icon('back', 18), 'Anterior'), h('span'));
      return;
    }
    const song = SONG_AFTER[id] ? SONGS.find((x) => x.id === SONG_AFTER[id]) : null;
    body.append(h('div.lesson-end',
      stars(result.nStars, 40),
      h('h2', 'Lección superada'),
      h('p', exSteps.length ? `Has acertado a la primera el ${Math.round(result.avg)} % de los ejercicios.` : 'Has completado la lección.'),
      result.nStars < 3 ? h('p.muted', 'Puedes repetir los ejercicios cuando quieras para conseguir las tres estrellas.') : null,
      store.user ? null : h('p.muted', 'Tu progreso está guardado solo en este navegador. ', h('a', { href: '/registro', 'data-link': true }, 'Crea una cuenta'), ' para no perderlo.'),
      h('div.row.center',
        lesson.next ? h('a.btn.big', { href: `/leccion/${lesson.next.id}`, 'data-link': true }, `Siguiente: ${lesson.next.title}`) : h('a.btn.big', { href: '/canciones', 'data-link': true }, 'Ir a las canciones'),
        song ? h('a.btn.ghost.big', { href: `/cancion/${song.id}`, 'data-link': true }, `Tocar «${song.title}»`) : null,
        h('button.btn.ghost.big', { type: 'button', onclick: () => { st.done = {}; st.recorded = false; go(0); } }, 'Repetir la lección'))));
    nav.append(h('button.btn.ghost', { type: 'button', onclick: () => go(steps.length - 1) }, icon('back', 18), 'Anterior'), h('span'));
  };

  draw();
  return () => { clean(); trackPractice(false); };
}

/** Canción que se propone al terminar cada lección. */
const SONG_AFTER = {
  manos: 'cinco-dedos', 'clave-sol': 'corderito', figuras: 'luz-de-la-luna', puntillo: 'oda-alegria', derecha: 'remando', corcheas: 'fray-santiago',
  izquierda: 'paseo-bajo', juntas: 'oda-dos-manos', compas: 'cumpleanos', armadura: 'minueto-sol', acordes: 'estrellita-dos-manos', anatomia: 'para-elisa',
  'clave-fa': 'paseo-bajo', sistema: 'estrellita', silencios: 'jingle-bells', 'escala-mayor': 'puente-londres',
};
