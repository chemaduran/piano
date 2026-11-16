// Glosario de símbolos de una partitura.
import { n } from './dsl.js';

const one = (score, opts = {}) => ({ score, opts: { open: true, ...opts } });
const T = (rh, extra = {}) => one({ clef: 'treble', time: [4, 4], rh: n(rh), ...extra });
const g = (ch) => ({ glyph: `<span class="mg-inline">${ch}</span>` });

export const SYMBOLS = [
  { id: 'pentagrama', title: 'Pentagrama y claves', items: [
    { name: 'Pentagrama', desc: 'Cinco líneas y cuatro espacios donde se escriben las notas. Cuanto más arriba, más agudo.', fig: one({ clef: 'treble', rh: [{ p: 'B4', d: 4, hide: true }] }, { step: 3 }), lesson: 'lineas' },
    { name: 'Clave de sol', desc: 'Fija el Sol en la 2ª línea. Para sonidos medios y agudos; en el piano, la mano derecha.', fig: one({ clef: 'treble', rh: [{ p: 'G4', d: 4 }] }), lesson: 'clave-sol' },
    { name: 'Clave de fa', desc: 'Fija el Fa en la 4ª línea. Para sonidos graves; en el piano, la mano izquierda.', fig: one({ clef: 'bass', lh: [{ p: 'F3', d: 4 }] }), lesson: 'clave-fa' },
    { name: 'Sistema de piano', desc: 'Dos pentagramas unidos por una llave que se leen a la vez. También se llama gran pentagrama.', fig: one({ clef: 'grand', rh: [{ p: 'C4', d: 4 }], lh: [{ p: 'C4', d: 4 }] }), lesson: 'sistema' },
    { name: 'Líneas adicionales', desc: 'Pequeñas líneas para las notas que no caben en el pentagrama.', fig: one({ clef: 'treble', rh: n('C4w A5') }), lesson: 'adicionales' },
    { name: 'Barra de compás', desc: 'Línea vertical que separa un compás del siguiente.', fig: one({ clef: 'treble', time: [2, 4], rh: n('C4q E4 | G4h | E4q C4') }, { unit: 2.4 }), lesson: 'compas' },
    { name: 'Doble barra final', desc: 'Barra fina y barra gruesa: la pieza termina aquí.', fig: { score: { clef: 'treble', time: [4, 4], rh: n('E4h C4h') }, opts: {} }, lesson: 'compas' },
  ] },
  { id: 'figuras', title: 'Figuras y silencios', items: [
    { name: 'Redonda', desc: '4 pulsos.', fig: T('B4w'), lesson: 'figuras' },
    { name: 'Blanca', desc: '2 pulsos.', fig: T('B4h rh'), lesson: 'figuras' },
    { name: 'Negra', desc: '1 pulso.', fig: T('B4q rq rh'), lesson: 'figuras' },
    { name: 'Corchea', desc: 'Medio pulso. Lleva un corchete; varias seguidas se unen con una barra.', fig: T('B4e re B4e B4 rh'), lesson: 'corcheas' },
    { name: 'Semicorchea', desc: 'Un cuarto de pulso. Dos corchetes o dos barras.', fig: T('B4s rs re B4s B4 B4 B4 rh'), lesson: 'corcheas' },
    { name: 'Silencio de redonda', desc: '4 pulsos de silencio, o un compás entero. Cuelga de la 4ª línea.', fig: T('rw'), lesson: 'silencios' },
    { name: 'Silencio de blanca', desc: '2 pulsos de silencio. Se apoya sobre la 3ª línea.', fig: T('rh B4h'), lesson: 'silencios' },
    { name: 'Silencio de negra', desc: '1 pulso de silencio.', fig: T('rq B4q B4h'), lesson: 'silencios' },
    { name: 'Silencio de corchea', desc: 'Medio pulso de silencio.', fig: T('re B4e B4q B4h'), lesson: 'silencios' },
    { name: 'Puntillo', desc: 'Añade a la figura la mitad de su valor: blanca con puntillo = 3 pulsos.', fig: T('B4h. B4q'), lesson: 'puntillo' },
    { name: 'Ligadura de unión', desc: 'Une dos notas iguales: se toca la primera y se mantiene la suma de las dos.', fig: T('A4h~ A4h'), lesson: 'puntillo' },
  ] },
  { id: 'compas', title: 'Compás y tempo', items: [
    { name: 'Compás de 4/4', desc: 'Cuatro pulsos de negra por compás.', fig: T('C4q E4 G4 E4'), lesson: 'compas' },
    { name: 'Compás de 3/4', desc: 'Tres pulsos de negra por compás: el del vals.', fig: one({ clef: 'treble', time: [3, 4], rh: n('C4q E4 G4') }), lesson: 'compas' },
    { name: 'Compás de 2/4', desc: 'Dos pulsos de negra por compás.', fig: one({ clef: 'treble', time: [2, 4], rh: n('C4q G4') }), lesson: 'compas' },
    { name: 'Compás de 6/8', desc: 'Seis corcheas en dos grupos de tres: dos pulsos grandes.', fig: one({ clef: 'treble', time: [6, 8], rh: n('C4e E4 G4 C5 G4 E4') }), lesson: 'compas' },
    { name: 'Anacrusa', desc: 'Notas sueltas antes del primer compás completo: la música empieza «en el aire».', fig: one({ clef: 'treble', time: [3, 4], pickup: 1, rh: n('G4e G4 | A4q G4 C5') }) },
    { name: 'Indicación de tempo', desc: 'Palabra sobre el primer compás que da la velocidad: Adagio, Andante, Allegro…', fig: T('E4q G4 C5h', { tempo: 'Allegro' }), lesson: 'tempo' },
    { name: 'Ritardando', desc: 'rit. o rall.: ve frenando poco a poco. «A tempo» recupera la velocidad.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: 'G4', d: 1, text: 'rit.' }, { p: 'F4', d: 1 }, { p: 'E4', d: 2 }] }, opts: { open: true } }, lesson: 'tempo' },
    { name: 'Calderón', desc: 'Detén el pulso y alarga la nota o el silencio a tu gusto.', fig: T('E4h C4h^'), lesson: 'articulacion' },
  ] },
  { id: 'alteraciones', title: 'Alteraciones y armadura', items: [
    { name: 'Sostenido', desc: 'Sube la nota un semitono: la tecla inmediata a la derecha.', fig: T('F#4w'), lesson: 'alteraciones' },
    { name: 'Bemol', desc: 'Baja la nota un semitono: la tecla inmediata a la izquierda.', fig: T('Bb4w'), lesson: 'alteraciones' },
    { name: 'Becuadro', desc: 'Anula un sostenido o un bemol anterior.', fig: T('F#4h F4h'), lesson: 'alteraciones' },
    { name: 'Armadura con sostenidos', desc: 'Sostenidos junto a la clave: valen para toda la pieza. Orden: Fa, Do, Sol, Re, La, Mi, Si.', fig: one({ clef: 'treble', key: 3, rh: [{ p: 'B4', d: 4, hide: true }] }, { step: 2 }), lesson: 'armadura' },
    { name: 'Armadura con bemoles', desc: 'Bemoles junto a la clave. Orden: Si, Mi, La, Re, Sol, Do, Fa.', fig: one({ clef: 'treble', key: -3, rh: [{ p: 'B4', d: 4, hide: true }] }, { step: 2 }), lesson: 'armadura' },
  ] },
  { id: 'dinamica', title: 'Matices', items: [
    { name: 'Pianissimo', desc: 'Muy suave.', fig: g(''), lesson: 'dinamica' },
    { name: 'Piano', desc: 'Suave.', fig: g(''), lesson: 'dinamica' },
    { name: 'Mezzo piano', desc: 'Medio suave.', fig: g(''), lesson: 'dinamica' },
    { name: 'Mezzo forte', desc: 'Medio fuerte.', fig: g(''), lesson: 'dinamica' },
    { name: 'Forte', desc: 'Fuerte.', fig: g(''), lesson: 'dinamica' },
    { name: 'Fortissimo', desc: 'Muy fuerte.', fig: g(''), lesson: 'dinamica' },
    { name: 'Sforzando', desc: 'Un golpe fuerte y repentino en una sola nota o acorde.', fig: g(''), lesson: 'dinamica' },
    { name: 'Crescendo', desc: 'Regulador que se abre: cada vez más fuerte.', fig: T('C4q D4 E4 F4', { spans: [{ type: 'cresc', from: 0, to: 3 }] }), lesson: 'dinamica' },
    { name: 'Diminuendo', desc: 'Regulador que se cierra: cada vez más suave.', fig: T('F4q E4 D4 C4', { spans: [{ type: 'dim', from: 0, to: 3 }] }), lesson: 'dinamica' },
  ] },
  { id: 'articulacion', title: 'Articulación', items: [
    { name: 'Ligadura de expresión', desc: 'Arco sobre notas distintas: tócalas legato, unidas en una sola frase.', fig: T('C4q E4 G4 E4', { spans: [{ type: 'slur', from: 0, to: 3 }] }), lesson: 'articulacion' },
    { name: 'Staccato', desc: 'Punto sobre o bajo la cabeza: nota corta y separada.', fig: T('C4q! E4! G4! E4!'), lesson: 'articulacion' },
    { name: 'Acento', desc: 'Ataca esa nota con más fuerza que las vecinas.', fig: T('C4q> E4 G4> E4'), lesson: 'articulacion' },
    { name: 'Tenuto', desc: 'Raya sobre o bajo la cabeza: mantén la nota todo su valor, con algo de peso.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: 'C4', d: 2, tenuto: true }, { p: 'E4', d: 2, tenuto: true }] }, opts: { open: true } }, lesson: 'articulacion' },
    { name: 'Digitación', desc: 'Números del 1 (pulgar) al 5 (meñique) que indican qué dedo usar.', fig: T('C4q@1 D4@2 E4@3 F4@4'), lesson: 'manos' },
    { name: 'Respiración', desc: 'Una coma sobre el pentagrama: levanta un instante, como para tomar aire.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: 'G4', d: 2, mark: 'breath' }, { p: 'E4', d: 2 }] }, opts: { open: true } }, lesson: 'otros-signos' },
  ] },
  { id: 'repeticiones', title: 'Repeticiones y saltos', items: [
    { name: 'Barras de repetición', desc: 'Lo que queda entre ellas se toca dos veces. Sin barra de inicio, se vuelve al principio.', fig: { score: { clef: 'treble', time: [4, 4], rh: n('C4q E4 G4 E4 | D4 F4 A4 F4 | C4w'), repeats: [{ from: 1, to: 1 }] }, opts: {} }, lesson: 'repeticiones' },
    { name: 'Casillas de 1ª y 2ª vez', desc: 'La 1ª casilla se toca la primera vez; al repetir, se salta a la 2ª.', fig: { score: { clef: 'treble', time: [4, 4], rh: n('C4h E4h | G4h E4h | C4w'), repeats: [{ from: 0, to: 1 }], spans: [{ type: 'volta', from: 2, to: 3, label: '1.' }, { type: 'volta', from: 4, to: 4, label: '2.', closed: false }] }, opts: {} }, lesson: 'repeticiones' },
    { name: 'Segno', desc: 'El signo al que manda volver la indicación D.S. (dal segno).', fig: g(''), lesson: 'repeticiones' },
    { name: 'Coda', desc: 'Marca el salto a la coda, la sección final.', fig: g(''), lesson: 'repeticiones' },
    { name: 'D.C. al Fine', desc: 'Da capo al Fine: vuelve al principio y termina donde pone Fine.', fig: { glyph: '<i class="txt-sym">D.C. al Fine</i>' }, lesson: 'repeticiones' },
    { name: 'D.S. al Coda', desc: 'Dal segno al Coda: vuelve al segno y, al llegar al signo de coda, salta al final.', fig: { glyph: '<i class="txt-sym">D.S. al Coda</i>' }, lesson: 'repeticiones' },
  ] },
  { id: 'piano', title: 'Pedal, octavas y adornos', items: [
    { name: 'Pedal', desc: 'Pisa el pedal derecho donde aparece «Ped.» y mantenlo mientras dure la línea.', fig: { score: { clef: 'bass', time: [4, 4], lh: n('C3q G3 E3 G3'), spans: [{ type: 'ped', v: 'lh', from: 0, to: 3 }] }, opts: { open: true } }, lesson: 'otros-signos' },
    { name: 'Octava alta (8va)', desc: 'Toca las notas bajo la línea de puntos una octava más agudas de lo escrito.', fig: T('C5q E5 G5 E5', { spans: [{ type: '8va', from: 0, to: 3 }] }), lesson: 'otros-signos' },
    { name: 'Trino', desc: 'Alterna rápidamente la nota escrita con la inmediata superior.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: 'D5', d: 4, mark: 'trill' }] }, opts: { open: true } }, lesson: 'otros-signos' },
    { name: 'Mordente', desc: 'Nota escrita, vecina y de vuelta, muy deprisa.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: 'B4', d: 4, mark: 'mordent' }] }, opts: { open: true } }, lesson: 'otros-signos' },
    { name: 'Acorde arpegiado', desc: 'Toca las notas del acorde una tras otra, de abajo arriba.', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: ['C4', 'E4', 'G4', 'C5'], d: 4, mark: 'arp' }] }, opts: { open: true } }, lesson: 'otros-signos' },
    { name: 'Acorde', desc: 'Notas apiladas en vertical: suenan a la vez.', fig: T('C4+E4+G4w'), lesson: 'acordes' },
  ] },
];
