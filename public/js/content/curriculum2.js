// Temario, segunda parte: primeras melodías, tonalidad y lectura completa de partituras.
import { n } from './dsl.js';

const G = (ch) => `<span class="mg-inline">${ch}</span>`;

export const PART2 = [
  {
    id: 'melodias', title: 'Primeras melodías',
    intro: 'Junta lo aprendido: lee altura y ritmo a la vez, primero con una mano y luego con las dos.',
    lessons: [
      {
        id: 'derecha', title: 'Leer y tocar con la mano derecha', mins: 8,
        summary: 'Tus primeras melodías en la posición de Do.',
        steps: [
          { title: 'Cómo leer una melodía', html: `<p>Leer música es hacer dos cosas a la vez: <b>qué tecla</b> (la posición en el pentagrama) y <b>cuánto dura</b> (la figura). Al principio, hazlo por pasos:</p><ol><li>Mira el compás y cuenta un compás en vacío.</li><li>Di el ritmo en voz alta, sin tocar.</li><li>Nombra las notas despacio.</li><li>Toca, muy lento, sin parar el pulso aunque te equivoques.</li></ol><p>Fíjate sobre todo en <b>cómo se mueve</b> la melodía: sube un peldaño, baja un peldaño, salta o repite nota. Leer por movimiento es mucho más rápido que nombrar nota a nota.</p>`,
            fig: ['example', { bpm: 92, score: { clef: 'treble', time: [4, 4], rh: n('C4q@1 D4 E4 E4 | E4 D4 C4h | E4q@3 F4 G4 G4 | G4 F4 E4h') }, caption: 'Paso, paso, repite… Escucha mientras sigues las notas con la vista.' }] },
          { title: 'Por pasos', ex: ['play', { say: 'La partitura te espera en cada nota. Los números son los dedos.', from: 'A3', to: 'B4',
            score: { clef: 'treble', time: [4, 4], bpm: 84, rh: n('C4q@1 D4 E4 E4 | E4 D4 C4h | E4q@3 F4 G4 G4 | G4 F4 E4h | C4q D4 E4 F4 | G4h E4h | D4q E4 D4 D4 | C4w') } }] },
          { title: 'Con saltos', html: `<p>Cuando la melodía pasa de una línea a la línea siguiente (o de espacio a espacio) hay un <b>salto de tercera</b>: te saltas una tecla y un dedo.</p>`,
            ex: ['play', { from: 'A3', to: 'B4', score: { clef: 'treble', time: [4, 4], bpm: 84, rh: n('C4q@1 E4@3 G4@5 E4 | D4@2 F4@4 D4h | E4q@3 G4 E4 C4 | D4h C4h') } }] },
          { title: 'Sin ayuda en el teclado', html: `<p>Ahora las teclas no se iluminan: lee tú la partitura. Es <i>María tenía un corderito</i>.</p>`,
            ex: ['play', { from: 'A3', to: 'B4', hints: false, score: { clef: 'treble', time: [4, 4], bpm: 96, rh: n('E4q@3 D4 C4 D4 | E4 E4 E4h | D4q D4 D4h | E4q G4 G4h | E4q D4 C4 D4 | E4 E4 E4 E4 | D4 D4 E4 D4 | C4w') } }] },
        ],
      },
      {
        id: 'izquierda', title: 'La mano izquierda en clave de fa', mins: 7,
        summary: 'Melodías y notas de bajo para la mano izquierda.',
        steps: [
          { title: 'El papel de la izquierda', html: `<p>En la mayoría de la música para piano, la mano derecha lleva la <b>melodía</b> y la izquierda el <b>acompañamiento</b>: notas graves, a menudo largas, que sostienen la armonía. Pero para acompañar bien, primero tiene que leer con soltura.</p><p>Recuerda: meñique (5) en el Do del 2º espacio, pulgar (1) en el Sol.</p>`, fig: ['handPosition', { hand: 'lh' }] },
          { title: 'Por pasos', ex: ['play', { from: 'A2', to: 'B3', score: { clef: 'bass', time: [4, 4], bpm: 80, lh: n('C3q@5 D3 E3 F3 | G3h@1 E3h | F3q@2 E3 D3 C3 | D3h C3h') } }] },
          { title: 'Notas de bajo', html: `<p>Do, Fa y Sol son las tres notas de bajo que más vas a usar en Do mayor. Apréndete dónde están sin mirar: 5, 2 y 1.</p>`,
            ex: ['play', { from: 'A2', to: 'B3', score: { clef: 'bass', time: [4, 4], bpm: 84, lh: n('C3w@5 | F3w@2 | G3w@1 | C3w@5 | C3h@5 G3h@1 | F3h@2 G3h | C3h G3h | C3w') } }] },
          { title: 'Sin ayuda en el teclado', ex: ['play', { from: 'A2', to: 'B3', hints: false, score: { clef: 'bass', time: [4, 4], bpm: 84, lh: n('C3q@5 E3 G3 E3 | F3h D3h | E3q D3 C3 D3 | C3w') } }] },
        ],
      },
      {
        id: 'juntas', title: 'Manos juntas', mins: 9,
        summary: 'Coordinar las dos manos, paso a paso.',
        steps: [
          { title: 'Leer en vertical', html: `<p>En el sistema de piano, lo que está <b>alineado en vertical suena a la vez</b>. Tu vista tiene que moverse de abajo arriba en cada pulso, y luego avanzar.</p><p>El método que funciona siempre:</p><ol><li>Aprende <b>cada mano por separado</b> hasta que salga sin pensar.</li><li>Junta las manos <b>mucho más despacio</b> de lo que crees necesario.</li><li>Trabaja <b>trozos pequeños</b>: dos compases, repetidos.</li><li>Sube la velocidad solo cuando no haya tropiezos.</li></ol>`,
            fig: ['example', { bpm: 80, score: { clef: 'grand', time: [4, 4], rh: n('E4q@3 E4 F4 G4 | G4 F4 E4 D4'), lh: n('C3w@5 | G3w@1') }, caption: 'La derecha (azul) lleva la melodía; la izquierda (naranja) toca una nota larga al empezar cada compás.' }] },
          { title: 'Primero, a la vez', html: `<p>Lo más fácil para empezar: las dos manos tocan en el mismo momento.</p>`,
            ex: ['play', { say: 'Toca las dos notas de cada paso. No hace falta que sean exactamente simultáneas: la partitura espera a que estén las dos.', from: 'C3', to: 'B4',
              score: { clef: 'grand', time: [4, 4], bpm: 72, rh: n('E4h@3 G4h@5 | F4h@4 D4h@2 | E4h G4h | C4w@1'), lh: n('C3h@5 E3h@3 | D3h@4 G3h@1 | C3h E3h | C3w') } }] },
          { title: 'Una mano espera', html: `<p>Ahora la izquierda mantiene una nota larga mientras la derecha se mueve. <b>No sueltes la tecla de la izquierda</b> hasta que termine su valor.</p>`,
            ex: ['play', { from: 'C3', to: 'B4', score: { clef: 'grand', time: [4, 4], bpm: 76, rh: n('C4q@1 D4 E4 F4 | G4h E4h | F4q E4 D4 E4 | C4w'), lh: n('C3w@5 | C3w | G3w@1 | C3w') } }] },
          { title: 'Oda a la alegría, a dos manos', html: `<p>Los cuatro primeros compases. Cuando te salgan, tienes la pieza completa en <a href="/cancion/oda-dos-manos" data-link>Canciones</a>, con modo a tempo y manos separadas.</p>`,
            ex: ['play', { from: 'C3', to: 'B4', score: { clef: 'grand', time: [4, 4], bpm: 80, rh: n('E4q@3 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | E4q. D4e D4h'), lh: n('C3w@5 | G3w@1 | C3w | G3w') } }] },
        ],
      },
    ],
  },
  {
    id: 'tonalidad', title: 'Alteraciones, escalas y acordes',
    intro: 'Las teclas negras, la lógica de las escalas y por qué algunas partituras empiezan con sostenidos o bemoles.',
    lessons: [
      {
        id: 'semitonos', title: 'Tonos y semitonos', mins: 5,
        summary: 'La unidad con la que se miden las distancias entre notas.',
        steps: [
          { title: 'La distancia más pequeña', html: `<p>El <b>semitono</b> es la distancia entre una tecla y la <b>inmediatamente vecina</b>, sea blanca o negra. Dos semitonos hacen un <b>tono</b>.</p><p>Contando así, una octava tiene 12 semitonos: las 7 teclas blancas y las 5 negras.</p>`, fig: ['semitones'] },
          { title: 'Compruébalo', ex: ['keys', { from: 'C4', to: 'C5', labels: 'all', prompts: [
            { say: 'Toca la tecla que está <b>un semitono por encima de Do</b>.', midi: [61], hint: 'La vecina inmediata por la derecha: es negra.' },
            { say: 'Toca la tecla que está <b>un tono por encima de Do</b>.', midi: [62], hint: 'Dos semitonos: sáltate una tecla.' },
            { say: 'Toca la tecla que está <b>un semitono por encima de Mi</b>.', midi: [65], why: 'Entre Mi y Fa no hay tecla negra.', hint: 'La vecina inmediata por la derecha… que aquí es blanca.' },
            { say: 'Toca la tecla que está <b>un tono por encima de Mi</b>.', midi: [66], why: 'Un tono desde Mi cae en tecla negra.', hint: 'Dos semitonos: Mi → Fa → la negra siguiente.' },
            { say: 'Toca la tecla que está <b>un semitono por debajo de Do agudo</b>.', midi: [71], hint: 'La vecina inmediata por la izquierda.' },
          ] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuántos semitonos tiene un tono?', options: ['2', '1', '3'], answer: 0 },
            { q: '¿Entre qué pares de notas blancas hay solo un semitono?', options: ['Mi–Fa y Si–Do', 'Do–Re y Fa–Sol', 'Re–Mi y La–Si'], answer: 0, why: 'Son los dos sitios donde no hay tecla negra en medio.' },
            { q: '¿Cuántos semitonos hay en una octava?', options: ['12', '8', '7'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'alteraciones', title: 'Sostenidos, bemoles y becuadros', mins: 7,
        summary: 'Los signos que suben o bajan una nota un semitono.',
        steps: [
          { title: 'Tres signos', html: `<p>Las <b>alteraciones</b> se escriben justo delante de la cabeza de la nota:</p><ul><li>${G('')} <b>Sostenido</b>: sube la nota un semitono (tecla vecina por la derecha).</li><li>${G('')} <b>Bemol</b>: baja la nota un semitono (tecla vecina por la izquierda).</li><li>${G('')} <b>Becuadro</b>: anula un sostenido o bemol y devuelve la nota a su estado natural.</li></ul><p>Así, cada tecla negra tiene <b>dos nombres</b>: la que está entre Fa y Sol es Fa♯ o Sol♭, según el contexto. A eso se le llama <i>enarmonía</i>.</p>`, fig: ['accidentals'] },
          { title: 'Cuánto dura una alteración', html: `<p>Una alteración escrita delante de una nota —una <b>alteración accidental</b>— vale para <b>esa nota y todas las iguales que vengan después en el mismo compás</b>. La barra de compás la borra.</p>`,
            fig: ['example', { bpm: 88, names: true, score: { clef: 'treble', time: [4, 4], rh: n('F4q F#4 F#4 G4 | F4q G4 Bb4 B4 | C5w') }, caption: 'Primer compás: el segundo Fa♯ no repite el signo. Segundo compás: el Fa vuelve a ser natural sin necesidad de becuadro; el Si♭ sí necesita becuadro para volver a Si dentro del compás.' }] },
          { title: 'Encuéntralas en el teclado', ex: ['keys', { from: 'C4', to: 'C5', labels: 'all', prompts: [
            { say: 'Toca <b>Fa♯</b> (Fa sostenido).', midi: [66], hint: 'Desde Fa, un semitono a la derecha.' },
            { say: 'Toca <b>Si♭</b> (Si bemol).', midi: [70], hint: 'Desde Si, un semitono a la izquierda.' },
            { say: 'Toca <b>Do♯</b>.', midi: [61] },
            { say: 'Toca <b>Mi♭</b>.', midi: [63], hint: 'Desde Mi, un semitono a la izquierda.' },
            { say: 'Toca <b>La♭</b>.', midi: [68], why: 'Es la misma tecla que Sol♯.' },
            { say: 'Toca <b>Mi♯</b>. Piénsalo: un semitono por encima de Mi.', midi: [65], why: 'Mi♯ se toca en la tecla de Fa. Las alteraciones no siempre caen en tecla negra.' },
          ] }] },
          { title: 'Léelas en el pentagrama', ex: ['read', { clef: 'treble', pool: ['F#4', 'Bb4', 'C#4', 'Eb4', 'G#4', 'F4', 'B4', 'C#5'], count: 10, answer: 'key', from: 'C4', to: 'D5', labels: 'c' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué hace este signo? ' + G(''), options: ['Baja la nota un semitono', 'Sube la nota un semitono', 'Anula las alteraciones'], answer: 0, why: 'Es un bemol.' },
            { q: '¿Qué otro nombre tiene la tecla de Do♯?', options: ['Re♭', 'Re♯', 'Si♭'], answer: 0 },
            { q: 'Un sostenido accidental afecta…', options: ['A esa nota hasta el final del compás', 'Solo a la nota que lo lleva', 'A toda la pieza'], answer: 0 },
            { q: '¿Qué tecla suena en la <b>última</b> nota?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('F#4q G4 A4 F4') }, opts: { open: true } }, options: ['Fa♯ (negra)', 'Fa (blanca)'], answer: 0, keepOrder: true, why: 'El sostenido del principio sigue valiendo en el mismo compás.' },
          ] }] },
        ],
      },
      {
        id: 'escala-mayor', title: 'La escala mayor', mins: 8,
        summary: 'El patrón de tonos y semitonos que está detrás de casi toda la música.',
        steps: [
          { title: 'Un patrón, no una lista', html: `<p>Una <b>escala</b> es una serie de notas ordenadas por altura. La <b>escala mayor</b> —la del «Do, Re, Mi…»— no se define por sus notas, sino por las <b>distancias</b> entre ellas:</p><p class="formula">Tono – Tono – Semitono – Tono – Tono – Tono – Semitono</p><p>Si empiezas en Do, el patrón sale usando solo teclas blancas. Si empiezas en cualquier otra nota, necesitas alguna tecla negra para respetarlo. Pruébalo.</p>`, fig: ['scaleBuilder', { lockMode: true }] },
          { title: 'Construye Do mayor', ex: ['keys', { from: 'C4', to: 'C5', prompts: [
            { say: 'Toca la escala de <b>Do mayor</b> subiendo, de Do a Do.', seq: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], showFirst: true, why: 'Los semitonos están entre la 3ª y la 4ª nota (Mi–Fa) y entre la 7ª y la 8ª (Si–Do).' },
          ] }] },
          { title: 'Construye Sol mayor', html: `<p>Empieza en Sol y aplica el patrón: T – T – S – T – T – T – S. Hay una nota que tendrás que subir.</p>`,
            ex: ['keys', { from: 'G3', to: 'G4', prompts: [
              { say: 'Toca la escala de <b>Sol mayor</b>, de Sol a Sol. Cuidado con la séptima nota.', seq: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'], showFirst: true, why: 'Para que entre la 6ª y la 7ª haya un tono, el Fa tiene que ser Fa♯.' },
            ] }] },
          { title: 'Construye Fa mayor', ex: ['keys', { from: 'F3', to: 'F4', prompts: [
            { say: 'Toca la escala de <b>Fa mayor</b>, de Fa a Fa. Esta vez la nota especial es la cuarta.', seq: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'], showFirst: true, why: 'Entre la 3ª y la 4ª tiene que haber un semitono: el Si baja a Si♭.' },
          ] }] },
          { title: 'La digitación de la escala', html: `<p>Ocho notas y cinco dedos: hay que recolocar la mano. En Do mayor, la mano derecha sube con <b>1 2 3</b>, pasa el <b>pulgar por debajo</b> y sigue <b>1 2 3 4 5</b>. Al bajar, el dedo 3 pasa por encima del pulgar.</p>`,
            ex: ['play', { from: 'C4', to: 'C5', score: { clef: 'treble', time: [4, 4], bpm: 76, rh: n('C4q@1 D4@2 E4@3 F4@1 | G4@2 A4@3 B4@4 C5@5 | C5@5 B4@4 A4@3 G4@2 | F4@1 E4@3 D4@2 C4@1') } }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuál es el patrón de la escala mayor?', options: ['T – T – S – T – T – T – S', 'T – S – T – T – S – T – T', 'T – T – T – S – T – T – S'], answer: 0 },
            { q: '¿Qué nota alterada tiene la escala de Sol mayor?', options: ['Fa♯', 'Si♭', 'Do♯'], answer: 0 },
            { q: '¿Qué nota alterada tiene la escala de Fa mayor?', options: ['Si♭', 'Fa♯', 'Mi♭'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'armadura', title: 'La armadura y la tonalidad', mins: 7,
        summary: 'Los sostenidos o bemoles que aparecen junto a la clave.',
        steps: [
          { title: 'Alteraciones para toda la pieza', html: `<p>Una pieza escrita con las notas de la escala de Sol mayor está en la <b>tonalidad</b> de Sol mayor: todos sus Fa serán Fa♯. En vez de escribir el sostenido cada vez, se pone <b>una sola vez al principio de cada pentagrama</b>, justo después de la clave. Eso es la <b>armadura</b>.</p><p>La armadura vale para <b>todas las notas de ese nombre, en cualquier octava, durante toda la pieza</b>. Solo un becuadro puede anularla, y solo hasta el final del compás.</p>`,
            fig: ['example', { bpm: 96, names: true, score: { clef: 'treble', time: [4, 4], key: 1, rh: n('G4q A4 B4 C5 | D5 E5 F#5 G5 | F#4q G4 F4 G4 | G4w') }, caption: 'Armadura de un sostenido (Fa♯). En el tercer compás un becuadro pide Fa natural; después vuelve a mandar la armadura.' }] },
          { title: 'El círculo de quintas', html: `<p>Las armaduras siguen un orden fijo. Los sostenidos aparecen siempre como <b>Fa, Do, Sol, Re, La, Mi, Si</b>; los bemoles, justo al revés: <b>Si, Mi, La, Re, Sol, Do, Fa</b>.</p><p>Cada armadura sirve para una tonalidad mayor y para su <b>relativa menor</b>, que usa las mismas notas pero empieza en otra.</p>`, fig: ['circleOfFifths'] },
          { title: 'Tocar con armadura', html: `<p>Un sostenido en la armadura: recuerda que <b>todos</b> los Fa son Fa♯, aunque no lleven ningún signo delante.</p>`,
            ex: ['play', { hints: false, from: 'G3', to: 'G5', score: { clef: 'treble', time: [4, 4], key: 1, bpm: 84, rh: n('G4q@1 A4 B4 G4 | A4@2 B4 C5 A4 | B4@3 A4 G4 F#4@2 | G4w@3') } }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: 'Con esta armadura, ¿qué notas están alteradas en toda la pieza?', fig: { score: { clef: 'treble', key: 2, rh: [{ p: 'B4', d: 4, hide: true }] }, opts: { step: 2 } }, options: ['Fa♯ y Do♯', 'Fa♯ y Sol♯', 'Si♭ y Mi♭'], answer: 0, hint: 'El orden de los sostenidos es Fa, Do, Sol…' },
            { q: 'Con esta armadura, ¿qué notas están alteradas?', fig: { score: { clef: 'treble', key: -2, rh: [{ p: 'B4', d: 4, hide: true }] }, opts: { step: 2 } }, options: ['Si♭ y Mi♭', 'Si♭ y La♭', 'Fa♯ y Do♯'], answer: 0, hint: 'El orden de los bemoles es Si, Mi, La…' },
            { q: 'La armadura afecta a…', options: ['Todas las notas de ese nombre, en cualquier octava', 'Solo las notas de esa línea o espacio', 'Solo el primer compás'], answer: 0 },
            { q: '¿Qué tonalidad mayor no tiene alteraciones en la armadura?', options: ['Do mayor', 'Sol mayor', 'Fa mayor'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'escala-menor', title: 'La escala menor', mins: 5,
        summary: 'El otro color de la música: más oscuro, más melancólico.',
        steps: [
          { title: 'Mismo material, otro centro', html: `<p>Toca las teclas blancas de <b>La a La</b> en lugar de Do a Do. Las notas son las mismas que en Do mayor, pero suena distinto: has tocado la escala de <b>La menor</b>.</p><p>El patrón de la escala menor natural es <b>T – S – T – T – S – T – T</b>. Lo que más la distingue es la <b>tercera nota</b>, que queda un semitono más baja que en la escala mayor: de ahí su color más sombrío.</p><p>Cada tonalidad mayor tiene una <b>relativa menor</b> que comparte armadura. Se encuentra bajando tres semitonos desde la tónica mayor: Do → La, Sol → Mi, Fa → Re.</p>`, fig: ['scaleBuilder', { mode: 'menor' }] },
          { title: 'Toca La menor', ex: ['keys', { from: 'A3', to: 'A4', prompts: [
            { say: 'Toca la escala de <b>La menor</b> subiendo: todas blancas, de La a La.', seq: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'], showFirst: true },
          ] }] },
          { title: '¿Mayor o menor?', ex: ['quiz', { questions: [
            { q: 'Escucha. ¿La escala es mayor o menor?', fig: { listen: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((p) => ({ p, d: 0.5 })), bpm: 90 }, options: ['Mayor', 'Menor'], answer: 0, keepOrder: true },
            { q: '¿Y esta?', fig: { listen: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'].map((p) => ({ p, d: 0.5 })), bpm: 90 }, options: ['Mayor', 'Menor'], answer: 1, keepOrder: true },
            { q: '¿Y esta melodía?', fig: { listen: [{ p: 'D4', d: 1 }, { p: 'F4', d: 1 }, { p: 'A4', d: 1 }, { p: 'F4', d: 1 }, { p: 'E4', d: 1 }, { p: 'D4', d: 2 }], bpm: 100 }, options: ['Mayor', 'Menor'], answer: 1, keepOrder: true, why: 'Gira alrededor de Re–Fa–La, el acorde de Re menor.' },
            { q: '¿Cuál es la relativa menor de Do mayor?', options: ['La menor', 'Mi menor', 'Do menor'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'intervalos', title: 'Intervalos', mins: 6,
        summary: 'Cómo se llama la distancia entre dos notas y cómo reconocerla de un vistazo.',
        steps: [
          { title: 'Contar de nota a nota', html: `<p>Un <b>intervalo</b> es la distancia entre dos notas. Su nombre sale de contar los nombres de nota que abarca, <b>incluidas la primera y la última</b>: de Do a Mi hay Do–Re–Mi, tres notas: una <b>tercera</b>.</p><p>Si las notas suenan una después de otra, el intervalo es <b>melódico</b>; si suenan a la vez, <b>armónico</b>.</p>`, fig: ['intervals'] },
          { title: 'Leer por intervalos', html: `<p>Los buenos lectores no leen nota a nota: leen la <b>forma</b>. Estas son las pistas visuales:</p><ul><li><b>Segunda</b>: de línea al espacio vecino. Teclas contiguas.</li><li><b>Tercera</b>: de línea a línea, o de espacio a espacio. Te saltas una tecla.</li><li><b>Quinta</b>: de línea a línea saltándote una línea. En posición de cinco dedos, de pulgar a meñique.</li><li><b>Octava</b>: mismo nombre de nota; una en línea y otra en espacio.</li></ul>`,
            fig: ['example', { bpm: 90, score: { clef: 'treble', time: [4, 4], rh: n('C4q D4 C4 E4 | C4 F4 C4 G4 | C4+G4h C4+E4h | C4+C5w') }, caption: 'Segunda, tercera, cuarta y quinta desde Do; después, quinta, tercera y octava armónicas.' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué intervalo hay entre estas dos notas?', fig: { score: { clef: 'treble', rh: [{ p: 'E4', d: 4 }, { p: 'G4', d: 4 }] } }, options: ['Tercera', 'Segunda', 'Quinta', 'Cuarta'], answer: 0, hint: 'De línea a la línea siguiente.' },
            { q: '¿Y entre estas?', fig: { score: { clef: 'treble', rh: [{ p: 'F4', d: 4 }, { p: 'G4', d: 4 }] } }, options: ['Segunda', 'Tercera', 'Cuarta'], answer: 0 },
            { q: '¿Y entre estas?', fig: { score: { clef: 'treble', rh: [{ p: 'C4', d: 4 }, { p: 'G4', d: 4 }] } }, options: ['Quinta', 'Tercera', 'Sexta', 'Cuarta'], answer: 0, hint: 'Cuenta: Do, Re, Mi, Fa, Sol.' },
            { q: 'Escucha: ¿qué intervalo es?', fig: { listen: [{ p: 'C4', d: 1.5 }, { p: 'C5', d: 1.5 }], bpm: 80 }, options: ['Una octava', 'Una segunda', 'Una tercera'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'acordes', title: 'Acordes', mins: 8,
        summary: 'Tres notas a la vez: la base del acompañamiento.',
        steps: [
          { title: 'Tercera sobre tercera', html: `<p>Un <b>acorde</b> son tres o más notas que suenan a la vez. El más básico es la <b>tríada</b>: una nota (<b>fundamental</b>), su <b>tercera</b> y su <b>quinta</b>. En el teclado: una tecla sí, una no, una sí, una no, una sí. En el pentagrama: tres notas apiladas, todas en líneas o todas en espacios, como un muñeco de nieve.</p><p>Que el acorde sea <b>mayor</b> o <b>menor</b> depende solo de la nota del medio.</p>`, fig: ['chordBuilder'] },
          { title: 'Los tres acordes de Do mayor', html: `<p>Con solo tres acordes se acompañan miles de canciones. En Do mayor son los que se construyen sobre la 1ª, la 4ª y la 5ª nota de la escala:</p><ul><li><b>Do mayor</b> (I): Do – Mi – Sol</li><li><b>Fa mayor</b> (IV): Fa – La – Do</li><li><b>Sol mayor</b> (V): Sol – Si – Re</li></ul><p>En las partituras de música moderna se indican con cifrado: <b>C</b>, <b>F</b>, <b>G</b>. Una «m» minúscula indica menor: <b>Am</b> es La menor.</p>`,
            fig: ['example', { bpm: 72, score: { clef: 'treble', time: [4, 4], rh: n('C4+E4+G4w | F4+A4+C5w | G4+B4+D5w | C4+E4+G4w') }, caption: 'Do – Fa – Sol – Do: la progresión más usada de la música occidental.' }] },
          { title: 'Toca los acordes', html: `<p>Mano derecha, dedos <b>1, 3 y 5</b>. Toca las tres notas de cada acorde; da igual el orden, pero procura que suenen juntas.</p>`,
            ex: ['play', { say: 'Tres notas por paso. La mano mantiene la misma forma y se desplaza entera.', from: 'C4', to: 'E5', score: { clef: 'treble', time: [4, 4], bpm: 60, rh: n('C4+E4+G4w | F4+A4+C5w | G4+B4+D5w | C4+E4+G4w') } }] },
          { title: 'Acorde partido', html: `<p>Las notas de un acorde también se pueden tocar de una en una: es un <b>arpegio</b>. Es uno de los acompañamientos más habituales para la mano izquierda.</p>`,
            ex: ['play', { from: 'C3', to: 'C4', score: { clef: 'bass', time: [4, 4], bpm: 80, lh: n('C3q@5 E3@3 G3@1 E3 | C3 E3 G3 E3 | B2@5 D3@3 G3@1 D3 | C3w@5') } }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué notas forman el acorde de Do mayor?', options: ['Do – Mi – Sol', 'Do – Re – Mi', 'Do – Fa – La'], answer: 0 },
            { q: 'Escucha: ¿el acorde es mayor o menor?', fig: { listen: [{ p: ['C4', 'E4', 'G4'], d: 3 }], bpm: 80 }, options: ['Mayor', 'Menor'], answer: 0, keepOrder: true },
            { q: '¿Y este?', fig: { listen: [{ p: ['A3', 'C4', 'E4'], d: 3 }], bpm: 80 }, options: ['Mayor', 'Menor'], answer: 1, keepOrder: true },
            { q: '¿Qué acorde es?', fig: { score: { clef: 'treble', rh: [{ p: ['G4', 'B4', 'D5'], d: 4 }] } }, options: ['Sol mayor', 'Do mayor', 'Fa mayor'], answer: 0, hint: 'La nota de abajo da nombre al acorde.' },
            { q: 'En cifrado, <b>Am</b> significa…', options: ['La menor', 'La mayor', 'Sol menor'], answer: 0 },
          ] }] },
        ],
      },
    ],
  },
  {
    id: 'partitura', title: 'Leer una partitura completa',
    intro: 'Todo lo que rodea a las notas: intensidad, carácter, repeticiones y el resto de signos.',
    lessons: [
      {
        id: 'dinamica', title: 'Matices: de piano a forte', mins: 5,
        summary: 'Los signos que indican con qué intensidad tocar.',
        steps: [
          { title: 'Fuerte y suave', html: `<p>Los <b>matices</b> o <b>dinámicas</b> indican la intensidad. Se escriben con abreviaturas italianas, casi siempre <b>entre los dos pentagramas</b>, y valen hasta que aparezca otra indicación.</p><p>En el piano la intensidad depende de la <b>velocidad</b> con la que baja la tecla, no de la fuerza con que la aprietas una vez abajo. De hecho, el nombre completo del instrumento es <i>pianoforte</i>: «suave-fuerte».</p>`, fig: ['dynamics'] },
          { title: 'Cambios graduales', html: `<p>Además de los ángulos (<i>reguladores</i>), los cambios graduales se pueden escribir con palabras: <i>cresc.</i> (creciendo), <i>dim.</i> o <i>decresc.</i> (disminuyendo). Un cambio brusco en una sola nota se marca con <b><i>sfz</i></b> (<i>sforzando</i>): un golpe fuerte y repentino.</p>` },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: `¿Qué significa ${G('')}?`, options: ['Suave', 'Fuerte', 'Rápido', 'Lento'], answer: 0, why: 'Es <i>piano</i>.' },
            { q: `¿Qué significa ${G('')}?`, options: ['Medio fuerte', 'Muy fuerte', 'Medio suave'], answer: 0, why: 'Es <i>mezzo forte</i>.' },
            { q: 'Ordena de más suave a más fuerte.', options: [`${G('')} ${G('')} ${G('')} ${G('')}`, `${G('')} ${G('')} ${G('')} ${G('')}`, `${G('')} ${G('')} ${G('')} ${G('')}`], answer: 0 },
            { q: '¿Qué indica el signo que hay bajo las notas?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('C4q D4 E4 F4'), spans: [{ type: 'cresc', from: 0, to: 3 }] }, opts: { open: true } }, options: ['<i>Crescendo</i>: cada vez más fuerte', '<i>Diminuendo</i>: cada vez más suave', 'Un acento en cada nota'], answer: 0 },
            { q: 'Escucha: ¿qué ocurre con la intensidad?', fig: { listen: [72, 71, 69, 67, 65, 64, 62, 60].map((m, i) => ({ p: m, d: 0.5, vel: 1 - i * 0.12 })), bpm: 100 }, options: ['<i>Diminuendo</i>', '<i>Crescendo</i>', 'No cambia'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'articulacion', title: 'Articulación: legato, staccato y acentos', mins: 6,
        summary: 'Cómo se ataca y se conecta cada nota.',
        steps: [
          { title: 'La pronunciación de la música', html: `<p>Si los matices son el volumen, la <b>articulación</b> es la pronunciación: si las notas van unidas o separadas, cuáles se subrayan, dónde se respira.</p>`, fig: ['articulation'] },
          { title: 'Dos arcos que no son lo mismo', html: `<p>Los dos se dibujan igual, pero:</p><ul><li>La <b>ligadura de unión</b> conecta dos notas <b>iguales</b>: no se repite la segunda.</li><li>La <b>ligadura de expresión</b> abarca notas <b>distintas</b>: se tocan todas, <i>legato</i>, como una sola frase. Al final del arco, la mano se levanta ligeramente, como al respirar.</li></ul>`,
            fig: ['example', { bpm: 92, score: { clef: 'treble', time: [4, 4], rh: n('E4q F4 G4 A4 | G4h~ G4q rq | E4q! F4! G4! A4! | G4w^'), spans: [{ type: 'slur', from: 0, to: 3 }] }, caption: 'Un compás legato, una ligadura de unión, un compás staccato y un calderón.' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cómo se tocan estas notas?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('C4q! D4! E4! F4!') }, opts: { open: true } }, options: ['Cortas y separadas (<i>staccato</i>)', 'Unidas (<i>legato</i>)', 'Más fuertes'], answer: 0 },
            { q: '¿Qué indica el arco?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('C4q D4 E4 F4'), spans: [{ type: 'slur', from: 0, to: 3 }] }, opts: { open: true } }, options: ['Tocar las notas unidas, <i>legato</i>', 'Tocar solo la primera nota', 'Repetir el compás'], answer: 0 },
            { q: '¿Y este otro arco?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('G4h~ G4h') }, opts: { open: true } }, options: ['Mantener la nota sin repetirla', 'Tocar <i>legato</i> dos notas distintas', 'Tocar más suave'], answer: 0, why: 'Une dos notas iguales: es una ligadura de unión.' },
            { q: `¿Qué pide este signo sobre una nota? ${G('')}`, options: ['Alargarla a voluntad (calderón)', 'Tocarla muy corta', 'Acentuarla'], answer: 0 },
            { q: 'Escucha: ¿cómo está articulada esta frase?', fig: { listen: ['C4', 'D4', 'E4', 'F4', 'G4'].map((p) => ({ p, d: 1, short: true })), bpm: 110 }, options: ['<i>Staccato</i>', '<i>Legato</i>'], answer: 0, keepOrder: true },
          ] }] },
        ],
      },
      {
        id: 'tempo', title: 'Tempo y carácter', mins: 5,
        summary: 'Las palabras italianas que indican velocidad y expresión.',
        steps: [
          { title: 'La indicación de tempo', html: `<p>Encima del primer compás suele haber una palabra, casi siempre en italiano, que indica la velocidad y a menudo también el carácter. A veces la acompaña una <b>cifra de metrónomo</b>: «negra = 96» quiere decir 96 pulsos de negra por minuto.</p>`, fig: ['metronome', { bpm: 96, caption: 'Mueve el control y observa cómo cambia el término italiano.' }] },
          { title: 'Vocabulario imprescindible', html: `<table class="compare"><thead><tr><th>Término</th><th>Significado</th></tr></thead><tbody><tr><th><i>Largo, Lento</i></th><td>Muy lento</td></tr><tr><th><i>Adagio</i></th><td>Lento, tranquilo</td></tr><tr><th><i>Andante</i></th><td>Al paso, caminando</td></tr><tr><th><i>Moderato</i></th><td>Moderado</td></tr><tr><th><i>Allegretto</i></th><td>Algo rápido</td></tr><tr><th><i>Allegro</i></th><td>Rápido, alegre</td></tr><tr><th><i>Vivace, Presto</i></th><td>Muy rápido</td></tr></tbody></table><p>Y los cambios sobre la marcha:</p><table class="compare"><tbody><tr><th><i>rit.</i> (<i>ritardando</i>), <i>rall.</i></th><td>Cada vez más lento</td></tr><tr><th><i>accel.</i> (<i>accelerando</i>)</th><td>Cada vez más rápido</td></tr><tr><th><i>a tempo</i></th><td>Vuelve a la velocidad anterior</td></tr><tr><th><i>poco a poco</i></th><td>Gradualmente</td></tr><tr><th><i>cantabile</i></th><td>Cantando, con la melodía bien destacada</td></tr><tr><th><i>dolce</i></th><td>Dulce</td></tr></tbody></table>` },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '<i>Adagio</i> significa…', options: ['Lento', 'Rápido', 'Fuerte'], answer: 0 },
            { q: '¿Qué pide la indicación <i>rit.</i>?', options: ['Ir cada vez más lento', 'Ir cada vez más rápido', 'Repetir'], answer: 0 },
            { q: 'Después de un <i>ritardando</i>, <i>a tempo</i> indica…', options: ['Recuperar la velocidad anterior', 'Seguir frenando', 'Parar'], answer: 0 },
            { q: 'Escucha el pulso. ¿Qué indicación le va mejor?', fig: { listen: Array.from({ length: 8 }, () => ({ p: 'G4', d: 1, short: true })), bpm: 168 }, options: ['<i>Vivace</i>', '<i>Adagio</i>', '<i>Andante</i>'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'repeticiones', title: 'Repeticiones y saltos', mins: 7,
        summary: 'Barras de repetición, casillas, D.C., D.S. y coda: el mapa de carreteras.',
        steps: [
          { title: 'Para no escribir dos veces lo mismo', html: `<p>La música repite mucho. Para ahorrar papel se usan signos que te mandan <b>volver atrás</b> o <b>saltar adelante</b>. Antes de tocar una pieza nueva, recórrela con el dedo siguiendo estos signos: así sabrás por dónde va el camino.</p>`, fig: ['repeatMap'] },
          { title: 'Así se ven en la partitura', html: `<p>La <b>barra de repetición</b> es una doble barra con dos puntos. Los puntos miran hacia la música que hay que repetir. Si no hay barra de inicio, se vuelve al principio.</p>`,
            fig: ['example', { bpm: 108, score: { clef: 'treble', time: [4, 4], rh: n('C4q E4 G4 E4 | D4 F4 A4 F4 | E4 G4 E4 D4 | C4w'), repeats: [{ from: 0, to: 2 }], spans: [{ type: 'volta', from: 8, to: 11, label: '1.' }, { type: 'volta', from: 12, to: 12, label: '2.', closed: false }] }, caption: 'Primera vez: compases 1, 2 y 3 (1ª casilla) y vuelta al principio. Segunda vez: compases 1, 2 y directamente el 4 (2ª casilla).' }] },
          { title: 'Glosario de saltos', html: `<table class="compare"><tbody><tr><th><i>D.C.</i> (<i>Da Capo</i>)</th><td>Vuelve al principio</td></tr><tr><th><i>D.S.</i> (<i>Dal Segno</i>)</th><td>Vuelve al signo ${G('')}</td></tr><tr><th><i>Fine</i></th><td>Final (cuando llegas tras un D.C. o D.S.)</td></tr><tr><th><i>al Fine</i></th><td>…y sigue hasta donde pone <i>Fine</i></td></tr><tr><th><i>al Coda</i></th><td>…y al llegar a ${G('')} salta a la coda</td></tr><tr><th><i>Coda</i> ${G('')}</th><td>Sección final añadida</td></tr></tbody></table>` },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: 'Una pieza tiene los compases <b>A B</b> entre barras de repetición y después <b>C</b>. ¿En qué orden suena?', options: ['A B A B C', 'A B C A B C', 'A A B B C'], answer: 0 },
            { q: 'Compases <b>A B</b>, 1ª casilla <b>C</b> con repetición, 2ª casilla <b>D</b>. ¿En qué orden suena?', options: ['A B C A B D', 'A B C D A B', 'A B C A B C D'], answer: 0, hint: 'La segunda vez se salta la 1ª casilla.' },
            { q: '¿Qué significa <i>D.C. al Fine</i>?', options: ['Vuelve al principio y termina en <i>Fine</i>', 'Salta a la coda', 'Repite el último compás'], answer: 0 },
            { q: `¿A dónde manda la indicación <i>D.S.</i>?`, options: [`Al signo ${G('')}`, 'Al principio de la pieza', `A la coda ${G('')}`], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'otros-signos', title: 'Pedal, octavas y adornos', mins: 6,
        summary: 'El resto de signos que te encontrarás en una partitura de piano.',
        steps: [
          { title: 'El pedal', html: `<p>El pedal de la <b>derecha</b> (pedal de resonancia) levanta los apagadores: las notas siguen sonando aunque sueltes las teclas. Se pisa con el pie derecho, con el talón en el suelo.</p><p>Se indica con ${G('')} donde se pisa y un asterisco o el final de una línea donde se suelta. La línea horizontal bajo el pentagrama muestra cuánto dura; un pico hacia arriba en la línea indica <b>cambio de pedal</b>: soltar y volver a pisar enseguida.</p><p>El pedal de la <b>izquierda</b> (<i>una corda</i>) suaviza el sonido. El del centro, si existe, varía según el piano.</p>`,
            fig: ['example', { bpm: 80, listen: false, score: { clef: 'grand', time: [4, 4], rh: n('E4q G4 C5 G4 | F4 A4 C5 A4'), lh: n('C3w | F3w'), spans: [{ type: 'ped', v: 'lh', from: 0, to: 1 }] }, caption: 'La línea bajo el sistema indica que el pedal se mantiene pisado.' }] },
          { title: 'Octava alta', html: `<p>Para no llenar la partitura de líneas adicionales, <b><i>8va</i></b> con una línea de puntos sobre las notas indica que se tocan <b>una octava más aguda</b> de lo escrito. Bajo el pentagrama, <b><i>8vb</i></b> pide una octava más grave. Al terminar la línea se vuelve a leer normal (a veces se escribe <i>loco</i>).</p>`,
            fig: ['example', { bpm: 96, listen: false, score: { clef: 'treble', time: [4, 4], rh: n('C5q E5 G5 E5 | C5 E5 G5 E5'), spans: [{ type: '8va', from: 4, to: 7 }] }, caption: 'Los dos compases se escriben igual; el segundo suena una octava más arriba.' }] },
          { title: 'Adornos y otros signos', html: `<table class="compare"><tbody><tr><th>${G('')} Trino</th><td>Alterna rápidamente la nota escrita con la superior.</td></tr><tr><th>${G('')} Mordente</th><td>Nota escrita, vecina y de vuelta, muy rápido.</td></tr><tr><th>Arpegiado (línea ondulada vertical)</th><td>Toca las notas del acorde una tras otra, de abajo arriba, en lugar de a la vez.</td></tr><tr><th>Nota pequeña tachada (<i>acciaccatura</i>)</th><td>Una nota de adorno rapidísima justo antes de la principal.</td></tr><tr><th>${G('')} Respiración</th><td>Una pequeña pausa, como para tomar aire.</td></tr><tr><th><i>m.d.</i> / <i>m.i.</i> (o <i>m.s.</i>)</th><td>Mano derecha / mano izquierda, cuando no es la habitual.</td></tr></tbody></table>`,
            fig: ['example', { listen: false, score: { clef: 'treble', time: [4, 4], rh: [{ p: 'D5', d: 2, mark: 'trill' }, { p: 'B4', d: 1, mark: 'mordent' }, { p: 'G4', d: 1, mark: 'breath' }, { p: ['C4', 'E4', 'G4', 'C5'], d: 4, mark: 'arp' }] }, caption: 'Trino, mordente, respiración y acorde arpegiado.' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: `¿Qué indica ${G('')}?`, options: ['Pisar el pedal derecho', 'Tocar suave', 'Parar'], answer: 0 },
            { q: '¿Qué significa <i>8va</i> sobre unas notas?', options: ['Tocarlas una octava más agudas', 'Tocarlas ocho veces', 'Usar ocho dedos'], answer: 0 },
            { q: `¿Qué es ${G('')}?`, options: ['Un trino', 'Un acento', 'Un silencio'], answer: 0 },
            { q: 'Una línea ondulada vertical delante de un acorde indica…', options: ['Tocar sus notas una tras otra, de abajo arriba', 'Tocarlo muy fuerte', 'Mantenerlo con el pedal'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'anatomia', title: 'El mapa de una partitura', mins: 6,
        summary: 'Repaso final: todo junto, en una partitura real.',
        steps: [
          { title: 'Todo en su sitio', html: `<p>Una partitura se lee como un plano: hay que saber dónde mirar. Toca cada número para repasar qué es y qué te pide.</p>`, fig: ['scoreAnatomy'] },
          { title: 'Antes de tocar una pieza nueva', html: `<p>Los músicos con experiencia nunca empiezan a tocar directamente. Dedican un minuto a mirar, siempre en este orden:</p><ol><li><b>Claves</b>: ¿sol y fa, como siempre?</li><li><b>Armadura</b>: ¿qué notas están alteradas?</li><li><b>Compás</b>: ¿cuántos pulsos, y de qué figura?</li><li><b>Tempo y carácter</b>.</li><li><b>Recorrido</b>: repeticiones, casillas, D.C., coda.</li><li><b>Lo difícil</b>: los ritmos raros, los saltos, las alteraciones accidentales.</li><li><b>Posición de las manos</b> y digitación del principio.</li></ol><p>Con esto ya puedes leer la gran mayoría de las partituras para principiantes. Lo siguiente es lo más importante: <b>tocar un poco cada día</b>.</p>` },
          { title: 'Examen final', ex: ['quiz', { questions: [
            { q: '¿En qué tonalidad mayor está esta pieza?', fig: { score: { clef: 'grand', key: 1, time: [3, 4], rh: n('D5q B4 G4'), lh: n('G3h.') }, opts: { open: true } }, options: ['Sol mayor', 'Do mayor', 'Fa mayor'], answer: 0, hint: 'Un sostenido en la armadura.' },
            { q: '¿Cuántos pulsos tiene cada compás de esa misma pieza?', fig: { score: { clef: 'grand', key: 1, time: [3, 4], rh: n('D5q B4 G4'), lh: n('G3h.') }, opts: { open: true } }, options: ['Tres', 'Cuatro', 'Dos'], answer: 0 },
            { q: '¿Qué nota toca la mano izquierda?', fig: { score: { clef: 'grand', rh: [{ p: 'B4', d: 4, hide: true }], lh: [{ p: 'D3', d: 4 }] } }, options: ['Re', 'Si', 'Fa', 'Do'], answer: 0, hint: 'Clave de fa: la línea del medio.' },
            { q: '¿Cuánto dura en total la nota ligada?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('E4q F4 G4h~ | G4q E4 C4h') }, opts: { open: true } }, options: ['3 pulsos', '2 pulsos', '4 pulsos'], answer: 0, why: 'Blanca (2) + negra (1), unidas por la ligadura.' },
            { q: '¿Qué tecla es la segunda nota?', fig: { score: { clef: 'treble', time: [4, 4], key: -1, rh: n('A4q Bb4 C5 A4') }, opts: { open: true } }, options: ['Si♭ (negra)', 'Si (blanca)'], answer: 0, keepOrder: true, why: 'La armadura tiene un bemol: Si♭.' },
            { q: `Te encuentras ${G('')}${G('')} seguido de un regulador que se cierra y después ${G('')}. ¿Qué haces?`, options: ['Empiezo medio fuerte y voy bajando hasta suave', 'Empiezo suave y voy subiendo', 'Toco todo igual de fuerte'], answer: 0 },
          ] }] },
        ],
      },
    ],
  },
];
