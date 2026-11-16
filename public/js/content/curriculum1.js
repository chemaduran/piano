// Temario, primera parte: el piano, el pentagrama y el ritmo.
import { n } from './dsl.js';
import { naturalsBetween } from '../music.js';

const DO = 0, RE = 2, MI = 4, FA = 5, SOL = 7, LA = 9, SI = 11;

export const PART1 = [
  {
    id: 'piano', title: 'Conoce el piano',
    intro: 'Antes de leer una sola nota, aprende a orientarte en el teclado y a colocar las manos.',
    lessons: [
      {
        id: 'teclado', title: 'El teclado: grupos de dos y de tres', mins: 5,
        summary: 'Cómo orientarte entre 88 teclas usando las teclas negras como mapa.',
        steps: [
          { title: 'Un dibujo que se repite', html: `<p>A primera vista el teclado parece una fila interminable de teclas iguales. No lo es: las <b>teclas negras</b> están agrupadas de <b>dos en dos</b> y de <b>tres en tres</b>, y ese dibujo se repite de un extremo al otro.</p><p>Las negras son tu mapa. Mirándolas sabrás siempre dónde estás, sin contar teclas.</p>`, fig: ['keyboardGroups'] },
          { title: 'Encuentra los grupos', ex: ['keys', { from: 'C3', to: 'B4', prompts: [
            { say: 'Toca una tecla negra de <b>un grupo de dos</b>.', pc: [1, 3], hint: 'Busca dos negras juntas, sin una tercera al lado.' },
            { say: 'Ahora, una tecla negra de <b>un grupo de tres</b>.', pc: [6, 8, 10], hint: 'Busca tres negras seguidas.' },
            { say: 'Toca la tecla blanca que está <b>justo a la izquierda de un grupo de dos negras</b>.', pc: [DO], why: 'Esa tecla es siempre un Do.', hint: 'Localiza dos negras juntas y baja a la blanca de su izquierda.' },
            { say: 'Toca la tecla blanca que está <b>justo a la izquierda de un grupo de tres negras</b>.', pc: [FA], why: 'Esa tecla es siempre un Fa.', hint: 'Localiza tres negras juntas y baja a la blanca de su izquierda.' },
          ] }] },
          { title: 'Grave y agudo', html: `<p>Hacia la <b>izquierda</b> el sonido es cada vez más <b>grave</b> (profundo, como un trueno). Hacia la <b>derecha</b>, cada vez más <b>agudo</b> (fino, como un pájaro).</p><p>En música «subir» significa ir hacia lo agudo, es decir, hacia la derecha; «bajar», hacia la izquierda.</p>`,
            ex: ['quiz', { questions: [
              { q: 'Escucha dos notas. ¿La segunda es más aguda o más grave que la primera?', fig: { listen: [{ p: 'C4', d: 1.5 }, { p: 'G4', d: 1.5 }], bpm: 80 }, options: ['Más aguda', 'Más grave'], answer: 0, keepOrder: true, why: 'La segunda está más a la derecha en el teclado.' },
              { q: '¿Y ahora?', fig: { listen: [{ p: 'A4', d: 1.5 }, { p: 'D4', d: 1.5 }], bpm: 80 }, options: ['Más aguda', 'Más grave'], answer: 1, keepOrder: true, why: 'La segunda está más a la izquierda.' },
              { q: 'Si mueves la mano hacia la <b>derecha</b> del teclado, el sonido…', options: ['Sube: se hace más agudo', 'Baja: se hace más grave', 'No cambia'], answer: 0 },
              { q: '¿Cómo se agrupan las teclas negras?', options: ['De dos en dos y de tres en tres', 'Todas de dos en dos', 'De cuatro en cuatro'], answer: 0 },
            ] }] },
        ],
      },
      {
        id: 'nombres', title: 'Los nombres de las notas', mins: 6,
        summary: 'Do, Re, Mi, Fa, Sol, La, Si: siete nombres para las teclas blancas.',
        steps: [
          { title: 'Siete notas', html: `<p>Las teclas blancas se llaman <b>Do, Re, Mi, Fa, Sol, La, Si</b>. Después del Si vuelve a haber un Do y la serie empieza otra vez.</p><p>En muchos métodos, aplicaciones y partituras de música moderna verás letras en lugar de sílabas. Es el <b>cifrado anglosajón</b>: <b>C</b> = Do, <b>D</b> = Re, <b>E</b> = Mi, <b>F</b> = Fa, <b>G</b> = Sol, <b>A</b> = La, <b>B</b> = Si.</p>`, fig: ['noteNames'] },
          { title: 'Puntos de referencia', html: `<p>No hace falta memorizar siete posiciones. Con dos referencias basta:</p><ul><li><b>Do</b>: a la izquierda del grupo de <b>dos</b> negras.</li><li><b>Fa</b>: a la izquierda del grupo de <b>tres</b> negras.</li></ul><p>Las demás salen contando: Re y Mi rodean las dos negras; Sol, La y Si acompañan a las tres.</p>` },
          { title: 'Encuentra cada nota', ex: ['keys', { from: 'C3', to: 'B4', prompts: [
            { say: 'Toca <b>todos los Do</b> que veas.', pc: [DO], all: true, hint: 'A la izquierda de las dos negras.' },
            { say: 'Toca un <b>Fa</b>.', pc: [FA], hint: 'A la izquierda de las tres negras.' },
            { say: 'Toca un <b>Mi</b>.', pc: [MI], hint: 'A la derecha del grupo de dos negras.' },
            { say: 'Toca un <b>Sol</b>.', pc: [SOL], hint: 'Entre la primera y la segunda negra del grupo de tres.' },
            { say: 'Toca un <b>Re</b>.', pc: [RE], hint: 'Justo entre las dos negras.' },
            { say: 'Toca un <b>La</b>.', pc: [LA], hint: 'Entre la segunda y la tercera negra del grupo de tres.' },
            { say: 'Toca un <b>Si</b>.', pc: [SI], hint: 'A la derecha del grupo de tres negras.' },
          ] }] },
          { title: 'En orden', ex: ['keys', { from: 'C4', to: 'C5', prompts: [
            { say: 'Toca la serie completa subiendo: <b>Do, Re, Mi, Fa, Sol, La, Si, Do</b>.', seq: naturalsBetween('C4', 'C5'), bubble: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'], showFirst: true },
            { say: 'Y ahora bajando: <b>Do, Si, La, Sol, Fa, Mi, Re, Do</b>.', seq: naturalsBetween('C4', 'C5').reverse(), bubble: ['Do', 'Si', 'La', 'Sol', 'Fa', 'Mi', 'Re', 'Do'], showFirst: true },
          ] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué nota es la tecla marcada?', fig: { kbd: { from: 'C4', to: 'B4', marks: { 64: 'ok' } } }, options: ['Mi', 'Re', 'Fa', 'Sol'], answer: 0 },
            { q: '¿Qué nota es la tecla marcada?', fig: { kbd: { from: 'C4', to: 'B4', marks: { 69: 'ok' } } }, options: ['La', 'Sol', 'Si', 'Fa'], answer: 0 },
            { q: 'En el cifrado anglosajón, la letra <b>G</b> es…', options: ['Sol', 'Mi', 'La', 'Do'], answer: 0, hint: 'C es Do; cuenta desde ahí: C, D, E, F, G.' },
            { q: 'Después del Si viene…', options: ['Otro Do', 'Otro La', 'Una nota nueva'], answer: 0, why: 'La serie de siete notas se repite una y otra vez.' },
          ] }] },
        ],
      },
      {
        id: 'octavas', title: 'El Do central y las octavas', mins: 5,
        summary: 'Por qué hay muchos Do y cuál es el punto de partida.',
        steps: [
          { title: 'La octava', html: `<p>De un Do al Do siguiente hay <b>ocho</b> notas contando las dos de los extremos: por eso esa distancia se llama <b>octava</b>. Dos notas a distancia de octava suenan tan parecidas que llevan el mismo nombre: una es simplemente más aguda que la otra.</p><p>Para distinguirlas se numeran. El Do más cercano al centro del piano es el <b>Do central</b>, o <b>Do4</b>. Será tu punto de partida para casi todo.</p>`, fig: ['octaves'] },
          { title: 'Encuentra el Do central', html: `<p>En un piano de 88 teclas el Do central es el cuarto Do contando desde la izquierda, y suele quedar frente a la marca del fabricante. En teclados más pequeños, busca el Do que esté más al centro.</p><p class="note">En algunos libros españoles verás que lo llaman Do3: es otro modo de contar. La tecla es la misma.</p>`,
            ex: ['keys', { from: 'C2', to: 'C6', labels: 'none', prompts: [
              { say: 'Aquí tienes cuatro octavas. Toca el <b>Do central</b>: es el que queda en el medio.', midi: [60], hint: 'Hay cinco Do; el central es el tercero.' },
              { say: 'Toca el Do que está <b>una octava por encima</b> del Do central.', midi: [72] },
              { say: 'Toca el Do que está <b>una octava por debajo</b> del Do central.', midi: [48] },
              { say: 'Toca el <b>Sol que está justo por encima</b> del Do central.', midi: [67], hint: 'Sube desde el Do central: Do, Re, Mi, Fa, Sol.' },
              { say: 'Toca el <b>Fa que está justo por debajo</b> del Do central.', midi: [53], hint: 'Baja desde el Do central: Do, Si, La, Sol, Fa.' },
            ] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: 'Escucha: ¿qué relación hay entre estas dos notas?', fig: { listen: [{ p: 'C4', d: 1.5 }, { p: 'C5', d: 1.5 }], bpm: 80 }, options: ['Son la misma nota, a una octava de distancia', 'Son dos notas vecinas', 'Es dos veces la misma tecla'], answer: 0 },
            { q: '¿Cuántas teclas blancas hay de un Do al siguiente Do, contando los dos?', options: ['8', '7', '12', '5'], answer: 0, why: 'Do, Re, Mi, Fa, Sol, La, Si, Do: ocho. De ahí «octava».' },
            { q: 'El Do central también se llama…', options: ['Do4', 'Do1', 'Do8'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'manos', title: 'Postura, manos y dedos', mins: 7,
        summary: 'Cómo sentarte, la forma de la mano y los números de los dedos.',
        steps: [
          { title: 'Cómo sentarte', html: `<ul><li><b>En el centro</b>, frente al Do central, en la mitad delantera de la banqueta.</li><li><b>A la distancia justa</b>: con los brazos relajados, los codos quedan un poco por delante del cuerpo.</li><li><b>A la altura justa</b>: el antebrazo más o menos horizontal, en línea con el teclado.</li><li><b>Espalda larga, hombros sueltos</b>. Los pies, apoyados en el suelo.</li></ul><p>La mano se coloca <b>redondeada</b>, como si sujetara una naranja pequeña. Los dedos tocan con la yema, curvados; el pulgar, de lado. La muñeca, ni hundida ni levantada.</p><p class="note">Si notas tensión en hombros o muñecas, para, sacude las manos y vuelve a empezar. Tocar no debe doler nunca.</p>` },
          { title: 'Los dedos tienen número', html: `<p>Las partituras indican qué dedo usar con un número pequeño junto a la nota. A eso se le llama <b>digitación</b>.</p>`, fig: ['hands'] },
          { title: 'Posición de Do, mano derecha', html: `<p>Coloca el <b>pulgar derecho (1) en el Do central</b> y deja caer cada dedo sobre la tecla blanca siguiente. Sin mover la mano tienes cinco notas bajo los dedos.</p>`, fig: ['handPosition', { hand: 'rh' }] },
          { title: 'Tócalo tú', ex: ['play', { say: 'Sube y baja con la mano derecha, un dedo por tecla. El número de cada tecla es el dedo que debes usar.', from: 'A3', to: 'B4', labels: 'all', names: true,
            score: { clef: 'treble', time: [4, 4], bpm: 80, rh: n('C4q@1 D4@2 E4@3 F4@4 | G4h@5 G4 | G4q@5 F4@4 E4@3 D4@2 | C4w@1') } }] },
          { title: 'Posición de Do, mano izquierda', html: `<p>La mano izquierda es el espejo de la derecha. Para tocar las mismas cinco notas una octava más abajo, el <b>meñique (5) va en el Do</b> y el <b>pulgar (1) en el Sol</b>.</p>`, fig: ['handPosition', { hand: 'lh' }] },
          { title: 'Tócalo con la izquierda', ex: ['play', { say: 'Ahora con la mano izquierda. Empieza con el meñique (5) en el Do.', from: 'A2', to: 'B3', labels: 'all', names: true,
            score: { clef: 'bass', time: [4, 4], bpm: 80, lh: n('C3q@5 D3@4 E3@3 F3@2 | G3h@1 G3 | G3q@1 F3@2 E3@3 D3@4 | C3w@5') } }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué número tiene el pulgar?', options: ['1', '5', 'Depende de la mano'], answer: 0, why: 'En las dos manos: pulgar 1, meñique 5.' },
            { q: 'En la posición de Do de la mano <b>izquierda</b>, ¿qué dedo toca el Do?', options: ['El meñique (5)', 'El pulgar (1)', 'El corazón (3)'], answer: 0 },
            { q: '¿Qué dedo es el 3?', options: ['El corazón', 'El índice', 'El anular'], answer: 0 },
            { q: '¿Qué forma debe tener la mano al tocar?', options: ['Redondeada, con los dedos curvados', 'Plana, con los dedos estirados', 'Con la muñeca caída por debajo de las teclas'], answer: 0 },
          ] }] },
        ],
      },
    ],
  },
  {
    id: 'pentagrama', title: 'El pentagrama y las claves',
    intro: 'La música se escribe sobre cinco líneas. Aprende a leer en clave de sol, en clave de fa y en las dos a la vez.',
    lessons: [
      {
        id: 'lineas', title: 'Cinco líneas y cuatro espacios', mins: 4,
        summary: 'Cómo se escribe la altura de un sonido.',
        steps: [
          { title: 'Una escalera para las notas', html: `<p>El <b>pentagrama</b> son cinco líneas horizontales con cuatro espacios entre ellas. Funciona como una escalera: cada nota se dibuja <b>sobre una línea</b> (la línea la atraviesa por el centro) o <b>en un espacio</b> (entre dos líneas).</p><p>Subir un peldaño —de línea a espacio, o de espacio a línea— es pasar a la tecla blanca siguiente.</p>`, fig: ['staffLines'] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Desde dónde se cuentan las líneas del pentagrama?', options: ['De abajo arriba', 'De arriba abajo', 'Da igual'], answer: 0 },
            { q: '¿Cuál de las dos notas es más aguda?', fig: { score: { clef: 'treble', rh: [{ p: 'G4', d: 4, label: '1ª' }, { p: 'D5', d: 4, label: '2ª' }] }, opts: { step: 6 } }, options: ['La segunda', 'La primera'], answer: 0, keepOrder: true, why: 'Está dibujada más arriba.' },
            { q: '¿Dónde está esta nota?', fig: { score: { clef: 'treble', rh: [{ p: 'A4', d: 4 }] } }, options: ['En el 2º espacio', 'En la 2ª línea', 'En el 3er espacio', 'En la 3ª línea'], answer: 0, hint: 'Cuenta los espacios desde abajo.' },
            { q: '¿Dónde está esta nota?', fig: { score: { clef: 'treble', rh: [{ p: 'D5', d: 4 }] } }, options: ['En la 4ª línea', 'En la 2ª línea', 'En el 4º espacio', 'En el 3er espacio'], answer: 0, hint: 'Cuenta las líneas desde abajo.' },
            { q: 'Si una nota pasa de una línea al espacio que tiene justo encima, en el teclado…', options: ['Sube una tecla blanca', 'Sube dos teclas blancas', 'Baja una tecla blanca'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'clave-sol', title: 'La clave de sol', mins: 8,
        summary: 'La clave de las notas agudas, las de la mano derecha.',
        steps: [
          { title: 'Para qué sirve una clave', html: `<p>Cinco líneas, por sí solas, no dicen qué nota es cada una. Hace falta una <b>clave</b>: un signo al principio del pentagrama que fija el nombre de <b>una</b> línea. A partir de ella se deducen todas las demás.</p><p>La <b>clave de sol</b> se usa para los sonidos medios y agudos. En el piano es, casi siempre, la de la <b>mano derecha</b>.</p>`, fig: ['clefAnchor', { clef: 'treble' }] },
          { title: 'Las notas en clave de sol', html: `<p>Partiendo del Sol de la 2ª línea, sube o baja peldaño a peldaño y tendrás todas las notas.</p><p>Hay quien memoriza las líneas (<b>Mi, Sol, Si, Re, Fa</b>) y los espacios (<b>Fa, La, Do, Mi</b>) por separado. Úsalo como apoyo, pero acostúmbrate a leer por <b>distancia</b> desde una nota que ya conoces: es más rápido.</p>`, fig: ['clefNotes', { clef: 'treble' }] },
          { title: 'El Do central en clave de sol', html: `<p>El <b>Do central</b> queda justo por debajo del pentagrama: no cabe, así que se escribe con una rayita propia, una <b>línea adicional</b>. El Re cuelga de la primera línea y el Mi ya está sobre ella.</p>`,
            fig: ['example', { names: true, bpm: 100, score: { clef: 'treble', rh: n('C4w D4 E4 F4 G4') }, opts: { step: 5.5 }, caption: 'Las cinco notas de la posición de Do de la mano derecha.' }] },
          { title: 'Ponles nombre', ex: ['read', { clef: 'treble', pool: ['C4', 'D4', 'E4', 'F4', 'G4'], count: 8, answer: 'name' }] },
          { title: 'Del papel al teclado', html: `<p>Ahora sin nombres: mira la nota y tócala directamente.</p>`, ex: ['read', { clef: 'treble', pool: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], count: 10, answer: 'key', from: 'C4', to: 'C5', labels: 'c' }] },
          { title: 'Todo el pentagrama', ex: ['read', { clef: 'treble', pool: naturalsBetween('C4', 'G5'), count: 12, answer: 'key', from: 'C4', to: 'G5', labels: 'c' }] },
        ],
      },
      {
        id: 'clave-fa', title: 'La clave de fa', mins: 8,
        summary: 'La clave de las notas graves, las de la mano izquierda.',
        steps: [
          { title: 'Otra clave, otros nombres', html: `<p>Las notas graves quedarían muy por debajo del pentagrama en clave de sol. Para escribirlas cómodamente se usa la <b>clave de fa</b>, que en el piano corresponde casi siempre a la <b>mano izquierda</b>.</p><p>Ojo: el pentagrama es el mismo, pero <b>las líneas cambian de nombre</b>. La nota de la 2ª línea ya no es Sol.</p>`, fig: ['clefAnchor', { clef: 'bass' }] },
          { title: 'Las notas en clave de fa', html: `<p>Desde el Fa de la 4ª línea se deduce el resto. Líneas: <b>Sol, Si, Re, Fa, La</b>. Espacios: <b>La, Do, Mi, Sol</b>.</p><p>Un truco: cada nota en clave de fa se llama como la que estaría <b>un peldaño más arriba</b> en clave de sol… dos octavas más grave. Si ves la 1ª línea (Mi en clave de sol), en clave de fa es Sol.</p>`, fig: ['clefNotes', { clef: 'bass' }] },
          { title: 'La posición de Do en clave de fa', html: `<p>El Do de la mano izquierda está en el <b>2º espacio</b>. Las cinco notas de su posición suben desde ahí.</p>`,
            fig: ['example', { names: true, bpm: 100, score: { clef: 'bass', lh: n('C3w D3 E3 F3 G3') }, opts: { step: 5.5 }, caption: 'Do, Re, Mi, Fa, Sol para la mano izquierda.' }] },
          { title: 'Ponles nombre', ex: ['read', { clef: 'bass', pool: ['C3', 'D3', 'E3', 'F3', 'G3'], count: 8, answer: 'name' }] },
          { title: 'Del papel al teclado', ex: ['read', { clef: 'bass', pool: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'], count: 10, answer: 'key', from: 'C3', to: 'C4', labels: 'c' }] },
          { title: 'Todo el pentagrama', ex: ['read', { clef: 'bass', pool: naturalsBetween('F2', 'C4'), count: 12, answer: 'key', from: 'F2', to: 'C4', labels: 'c' }] },
        ],
      },
      {
        id: 'sistema', title: 'Clave de sol y clave de fa: el sistema de piano', mins: 9,
        summary: 'En qué se diferencian, por qué hay dos y cómo se leen juntas.',
        steps: [
          { title: 'Dos pentagramas, un instrumento', html: `<p>El piano abarca tantas notas que un pentagrama se queda corto. Por eso su música se escribe en <b>dos pentagramas unidos por una llave</b>: el de arriba en clave de sol y el de abajo en clave de fa. El conjunto se llama <b>sistema</b> o <i>gran pentagrama</i>.</p><table class="compare"><thead><tr><th></th><th>Clave de sol</th><th>Clave de fa</th></tr></thead><tbody><tr><th>Sonidos</th><td>Medios y agudos</td><td>Medios y graves</td></tr><tr><th>Zona del teclado</th><td>Del Do central hacia la derecha</td><td>Del Do central hacia la izquierda</td></tr><tr><th>Mano habitual</th><td>Derecha</td><td>Izquierda</td></tr><tr><th>Nota que fija</th><td>Sol, en la 2ª línea</td><td>Fa, en la 4ª línea</td></tr><tr><th>Líneas</th><td>Mi, Sol, Si, Re, Fa</td><td>Sol, Si, Re, Fa, La</td></tr><tr><th>Espacios</th><td>Fa, La, Do, Mi</td><td>La, Do, Mi, Sol</td></tr></tbody></table>` },
          { title: 'El Do central lo une todo', html: `<p>Las dos claves no son mundos distintos: son <b>dos trozos de una misma escalera</b>. Entre el pentagrama de arriba y el de abajo falta exactamente una línea, y en esa línea imaginaria vive el <b>Do central</b>.</p><p>Por eso el Do central se puede escribir de dos formas —una línea adicional por debajo de la clave de sol, o por encima de la clave de fa— y es <b>la misma tecla</b>. Toca el teclado y compruébalo.</p>`, fig: ['grandExplorer', { sound: true }] },
          { title: 'La misma posición, nota distinta', html: `<p>Este es el error más frecuente al empezar: leer la clave de fa como si fuera de sol. Compara: la misma posición en el pentagrama da notas diferentes según la clave.</p>`,
            fig: ['example', { names: true, listen: false, score: { clef: 'grand', rh: n('E4w G4 B4 D5 F5'), lh: n('G2w B2 D3 F3 A3') }, opts: { step: 5.5 }, caption: 'Las cinco líneas en cada clave. Antes de leer una nota, mira siempre en qué pentagrama está.' }] },
          { title: '¿Qué clave manda?', ex: ['quiz', { questions: [
            { q: '¿Qué nota es?', fig: { score: { clef: 'treble', rh: [{ p: 'G4', d: 4 }] } }, options: ['Sol', 'Si', 'Mi', 'Re'], answer: 0, hint: 'Es clave de sol: la 2ª línea es Sol.' },
            { q: 'La misma posición, ahora en clave de fa. ¿Qué nota es?', fig: { score: { clef: 'bass', lh: [{ p: 'B2', d: 4 }] } }, options: ['Si', 'Sol', 'Re', 'Fa'], answer: 0, hint: 'En clave de fa las líneas son Sol, Si, Re, Fa, La.' },
            { q: '¿Qué nota es?', fig: { score: { clef: 'bass', lh: [{ p: 'F3', d: 4 }] } }, options: ['Fa', 'Re', 'La', 'Do'], answer: 0, hint: 'Es la línea que queda entre los dos puntos de la clave.' },
            { q: 'Estas dos notas, ¿son la misma tecla?', fig: { score: { clef: 'grand', rh: [{ p: 'C4', d: 4 }], lh: [{ p: 'C4', d: 4 }] } }, options: ['Sí: las dos son el Do central', 'No: la de abajo es más grave', 'No: la de arriba es un La'], answer: 0 },
            { q: '¿Con qué mano se toca normalmente lo escrito en el pentagrama de abajo?', options: ['Con la izquierda', 'Con la derecha', 'Con cualquiera'], answer: 0 },
          ] }] },
          { title: 'Lee en las dos claves', html: `<p>Las notas aparecerán en uno u otro pentagrama. Mira primero la clave y después la posición.</p>`, ex: ['read', { clef: 'grand', pool: ['C3', 'E3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'G4', 'C5'], count: 12, answer: 'key', from: 'C3', to: 'C5', labels: 'c' }] },
        ],
      },
      {
        id: 'adicionales', title: 'Líneas adicionales', mins: 5,
        summary: 'Cómo se escriben las notas que se salen del pentagrama.',
        steps: [
          { title: 'Más allá de las cinco líneas', html: `<p>Ya conoces una: la del Do central. Cualquier nota que quede por encima o por debajo del pentagrama lleva las <b>líneas adicionales</b> que necesite, cortitas y solo para ella.</p>`, fig: ['ledgerLines'] },
          { title: 'Cómo leerlas sin contar desde cero', html: `<p>Apréndete estas referencias y cuenta desde ellas:</p><ul><li>Clave de sol, <b>una línea por debajo</b>: Do central.</li><li>Clave de sol, <b>una línea por encima</b>: La. <b>Dos líneas por encima</b>: Do agudo.</li><li>Clave de fa, <b>una línea por encima</b>: Do central.</li><li>Clave de fa, <b>una línea por debajo</b>: Mi. <b>Dos líneas por debajo</b>: Do grave.</li></ul>`,
            fig: ['example', { names: true, listen: false, score: { clef: 'grand', rh: n('C4w A5 C6'), lh: n('C4w E2 C2') }, opts: { step: 6.5 } }] },
          { title: 'Practica', ex: ['read', { clef: 'treble', pool: ['A3', 'B3', 'C4', 'D4', 'G5', 'A5', 'B5', 'C6'], count: 10, answer: 'key', from: 'A3', to: 'C6', labels: 'c' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué nota es?', fig: { score: { clef: 'treble', rh: [{ p: 'A5', d: 4 }] } }, options: ['La', 'Do', 'Fa', 'Sol'], answer: 0, hint: 'Una línea adicional por encima en clave de sol.' },
            { q: '¿Qué nota es?', fig: { score: { clef: 'bass', lh: [{ p: 'E2', d: 4 }] } }, options: ['Mi', 'Do', 'Sol', 'La'], answer: 0, hint: 'Una línea adicional por debajo en clave de fa.' },
            { q: '¿Qué nota es?', fig: { score: { clef: 'bass', lh: [{ p: 'C4', d: 4 }] } }, options: ['Do central', 'Mi', 'La', 'Do grave'], answer: 0 },
          ] }] },
        ],
      },
    ],
  },
  {
    id: 'ritmo', title: 'El ritmo',
    intro: 'La forma de cada nota dice cuánto dura. Aprende a contar, a medir y a tocar a tiempo.',
    lessons: [
      {
        id: 'pulso', title: 'Pulso y tempo', mins: 4,
        summary: 'El latido regular de la música y su velocidad.',
        steps: [
          { title: 'El latido de la música', html: `<p>Cuando sigues una canción con el pie estás marcando su <b>pulso</b>: un latido regular, como el de un reloj. Sobre ese latido se construye todo el ritmo.</p><p>El <b>tempo</b> es la velocidad del pulso. Se mide en <b>pulsos por minuto</b> (ppm, o <i>bpm</i> en inglés): 60 es un pulso por segundo. Las partituras suelen indicarlo con una palabra italiana al principio.</p>`, fig: ['metronome', { bpm: 72 }] },
          { title: 'Mantén el pulso', ex: ['rhythm', { bpm: 72, pattern: [1, 1, 1, 1, 1, 1, 1, 1], say: 'Marca ocho pulsos seguidos, justo con el metrónomo. Oirás un compás de claqueta (cuatro golpes) antes de empezar.' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Qué es el tempo?', options: ['La velocidad del pulso', 'Lo fuerte que se toca', 'El número de notas de una canción'], answer: 0 },
            { q: 'Un tempo de 60 pulsos por minuto significa…', options: ['Un pulso cada segundo', 'Sesenta pulsos cada segundo', 'Un pulso cada minuto'], answer: 0 },
            { q: '¿Cuál de estas indicaciones es la más rápida?', options: ['<i>Allegro</i>', '<i>Adagio</i>', '<i>Andante</i>'], answer: 0, why: '<i>Adagio</i> es lento, <i>Andante</i> es un paso tranquilo y <i>Allegro</i>, rápido.' },
          ] }] },
        ],
      },
      {
        id: 'figuras', title: 'Redonda, blanca y negra', mins: 7,
        summary: 'Las figuras: cómo se escribe la duración de un sonido.',
        steps: [
          { title: 'La forma dice cuánto dura', html: `<p>La <b>altura</b> de una nota se lee por su posición en el pentagrama. Su <b>duración</b> se lee por su forma, la <b>figura</b>.</p><ul><li><b>Redonda</b>: un óvalo hueco, sin palo. Dura <b>4 pulsos</b>.</li><li><b>Blanca</b>: óvalo hueco con palo (<i>plica</i>). Dura <b>2 pulsos</b>.</li><li><b>Negra</b>: óvalo relleno con palo. Dura <b>1 pulso</b>.</li></ul><p>Cada figura vale la mitad que la anterior.</p>`, fig: ['durations', { min: 1 }] },
          { title: 'Las partes de una nota', html: `<p>Una nota tiene <b>cabeza</b> (el óvalo), <b>plica</b> (el palo) y, las más cortas, <b>corchete</b> (la banderita). La plica va hacia arriba si la nota está en la mitad inferior del pentagrama y hacia abajo si está en la superior: es solo para que el dibujo quede compacto, no cambia nada del sonido.</p>`,
            fig: ['example', { bpm: 92, score: { clef: 'treble', time: [4, 4], rh: n('C4w | E4h G4h | C5q B4 A4 G4 | E4h C4h') }, caption: 'Cuenta «un, dos, tres, cua» en cada compás mientras escuchas.' }] },
          { title: 'Marca el ritmo: negras y blancas', ex: ['rhythm', { bpm: 76, pattern: [1, 1, 2, 1, 1, 2], say: 'Da un golpe por nota y deja que las blancas duren sus dos pulsos. Los números de debajo indican el pulso en que empieza cada nota.' }] },
          { title: 'Añade la redonda', ex: ['rhythm', { bpm: 80, pattern: [2, 2, 1, 1, 1, 1, 4] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuántos pulsos dura esta figura?', fig: { glyph: '<span class="mg-inline"></span>' }, options: ['2', '1', '4', 'Medio'], answer: 0, why: 'Es una blanca.' },
            { q: '¿Cómo se llama esta figura?', fig: { glyph: '<span class="mg-inline"></span>' }, options: ['Redonda', 'Blanca', 'Negra'], answer: 0 },
            { q: '¿Cuántas negras caben en una redonda?', options: ['4', '2', '8'], answer: 0 },
            { q: '¿Cuántas blancas caben en una redonda?', options: ['2', '4', '1'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'corcheas', title: 'Corcheas y semicorcheas', mins: 6,
        summary: 'Notas más rápidas que el pulso.',
        steps: [
          { title: 'Dividir el pulso', html: `<p>La <b>corchea</b> dura <b>medio pulso</b>: caben dos en cada negra. Se dibuja como una negra con un corchete. Para contarlas se añade una «y» entre los pulsos: «<b>un</b>-y-<b>dos</b>-y-<b>tres</b>-y-<b>cua</b>-y».</p><p>La <b>semicorchea</b> dura la mitad que la corchea: un cuarto de pulso. Lleva dos corchetes y caben cuatro en una negra.</p><p>Cuando hay varias seguidas, los corchetes se sustituyen por una <b>barra</b> que las une en grupos de un pulso. Así el ojo ve los pulsos de un vistazo.</p>`, fig: ['durations', { min: 0.25 }] },
          { title: 'Sueltas y agrupadas', fig: ['example', { bpm: 84, score: { clef: 'treble', time: [4, 4], rh: n('G4q G4e G4 G4q G4e G4 | G4e G4 G4 G4 G4h | G4s G4 G4 G4 G4e G4 G4q G4 | G4w') }, caption: 'El mismo sonido con ritmos distintos. Escucha cómo las corcheas y semicorcheas caben dentro del pulso.' }] },
          { title: 'Marca el ritmo', ex: ['rhythm', { bpm: 72, pattern: [1, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 2], say: 'Negras y corcheas. Las «y» caen justo a mitad de camino entre dos pulsos.' }] },
          { title: 'Un poco más difícil', ex: ['rhythm', { bpm: 76, pattern: [0.5, 0.5, 1, 0.5, 0.5, 1, 1, 0.5, 0.5, 2] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuántas corcheas caben en una negra?', options: ['2', '4', '1'], answer: 0 },
            { q: '¿Cuántas semicorcheas caben en una negra?', options: ['4', '2', '8'], answer: 0 },
            { q: '¿Para qué sirve la barra que une varias corcheas?', options: ['Para agruparlas por pulsos y leerlas mejor', 'Para tocarlas más fuerte', 'Para tocarlas a la vez'], answer: 0 },
            { q: '¿Cuánto dura esta figura?', fig: { glyph: '<span class="mg-inline"></span>' }, options: ['Medio pulso', 'Un pulso', 'Un cuarto de pulso'], answer: 0, why: 'Es una corchea: un solo corchete.' },
          ] }] },
        ],
      },
      {
        id: 'silencios', title: 'Los silencios', mins: 5,
        summary: 'El silencio también se escribe y se cuenta.',
        steps: [
          { title: 'Cada figura tiene su silencio', html: `<p>En música callar es tan importante como sonar. Cada figura tiene un <b>silencio</b> que dura lo mismo que ella: durante ese tiempo no se toca, pero <b>el pulso sigue corriendo</b> y hay que contarlo.</p>`, fig: ['restsTable'] },
          { title: 'No los confundas', html: `<p>Los silencios de redonda y de blanca son el mismo rectángulo en sitios distintos. Un truco: el de <b>redonda</b> pesa más y <b>cuelga</b> de la línea; el de <b>blanca</b> pesa menos y <b>flota</b> encima.</p><p>El silencio de redonda sirve además para indicar <b>un compás entero en silencio</b>, tenga el compás los pulsos que tenga.</p>`,
            fig: ['example', { bpm: 92, score: { clef: 'treble', time: [4, 4], rh: n('C4q rq E4q rq | G4h rh | re G4e re G4e C5q rq | rw') }, caption: 'Escucha los huecos: ahí también pasa el tiempo.' }] },
          { title: 'Marca el ritmo con silencios', ex: ['rhythm', { bpm: 76, pattern: [1, -1, 1, -1, 1, 1, -2], say: 'Toca solo en las notas. En los silencios, levanta la mano y sigue contando.' }] },
          { title: 'Otro más', ex: ['rhythm', { bpm: 80, pattern: [1, 1, -1, 1, -1, 0.5, 0.5, 2] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuánto dura este silencio?', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: null, d: 1 }] }, opts: { open: true } }, options: ['1 pulso', '2 pulsos', 'Medio pulso', '4 pulsos'], answer: 0, why: 'Es el silencio de negra.' },
            { q: '¿Cuánto dura este silencio?', fig: { score: { clef: 'treble', time: [4, 4], rh: [{ p: null, d: 2 }, { p: 'B4', d: 2, hide: true }] }, opts: { open: true } }, options: ['2 pulsos', '4 pulsos', '1 pulso'], answer: 0, why: 'Se apoya sobre la línea: silencio de blanca.' },
            { q: 'Durante un silencio…', options: ['No se toca, pero se sigue contando', 'Se para el pulso', 'Se mantiene la nota anterior'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'compas', title: 'El compás', mins: 7,
        summary: 'Las barras, los dos números del principio y los pulsos fuertes.',
        steps: [
          { title: 'Cajas del mismo tamaño', html: `<p>Los pulsos se agrupan en <b>compases</b>: cajas con el mismo número de pulsos, separadas por <b>barras de compás</b> (líneas verticales). El primer pulso de cada compás se siente un poco más <b>fuerte</b>; ese acento es lo que hace que un vals suene a vals.</p><p>Los dos números que aparecen después de la clave son el <b>compás</b> o <i>indicación de compás</i>. No son una fracción: cada número dice una cosa.</p>`, fig: ['timeSignature'] },
          { title: 'Barras que verás', html: `<p>Una <b>barra simple</b> separa compases. La <b>doble barra</b> fina marca el final de una sección. La <b>doble barra final</b> (fina + gruesa) indica que la pieza ha terminado.</p>`,
            fig: ['example', { bpm: 96, score: { clef: 'treble', time: [3, 4], rh: n('C4q E4 G4 | C5h. | B4q G4 E4 | C4h.'), double: [1] }, caption: 'Un compás de 3/4: cada caja suma tres negras.' }] },
          { title: 'Completa los compases', ex: ['measure', { time: [4, 4], measures: 2, palette: [4, 2, 1, 0.5], say: 'Rellena dos compases de <b>4/4</b>. Cada uno debe sumar exactamente cuatro pulsos.' }] },
          { title: 'Ahora en 3/4', ex: ['measure', { time: [3, 4], measures: 3, palette: [2, 1, 0.5], say: 'Rellena tres compases de <b>3/4</b>. Cada uno debe sumar tres pulsos.' }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: 'En un compás de <b>3/4</b>, ¿qué indica el 3?', options: ['Que cada compás tiene tres pulsos', 'Que el pulso es una corchea', 'Que hay que tocar tres veces'], answer: 0 },
            { q: 'En un compás de <b>3/4</b>, ¿qué indica el 4?', options: ['Que cada pulso es una negra', 'Que hay cuatro compases', 'Que cada compás tiene cuatro pulsos'], answer: 0 },
            { q: '¿Qué compás tiene esta música?', fig: { listen: [{ p: 'C4', d: 1, vel: 1 }, { p: 'G4', d: 1, vel: 0.45 }, { p: 'G4', d: 1, vel: 0.45 }, { p: 'C4', d: 1, vel: 1 }, { p: 'G4', d: 1, vel: 0.45 }, { p: 'G4', d: 1, vel: 0.45 }, { p: 'C4', d: 1, vel: 1 }, { p: 'G4', d: 1, vel: 0.45 }, { p: 'G4', d: 1, vel: 0.45 }], bpm: 150 }, options: ['3/4', '4/4', '2/4'], answer: 0, hint: 'Cuenta cada cuántos pulsos vuelve el acento fuerte.' },
            { q: '¿Dónde cae el pulso más fuerte de un compás?', options: ['En el primero', 'En el último', 'En el del medio'], answer: 0 },
            { q: '¿Qué significa la doble barra con la segunda línea gruesa?', options: ['Que la pieza ha terminado', 'Que hay que repetir', 'Que cambia la clave'], answer: 0 },
          ] }] },
        ],
      },
      {
        id: 'puntillo', title: 'Puntillo y ligadura de unión', mins: 6,
        summary: 'Dos maneras de alargar una nota.',
        steps: [
          { title: 'El puntillo', html: `<p>Un punto a la derecha de la cabeza de una nota es un <b>puntillo</b>: le añade <b>la mitad de su valor</b>.</p><ul><li>Blanca con puntillo: 2 + 1 = <b>3 pulsos</b>.</li><li>Negra con puntillo: 1 + ½ = <b>1 pulso y medio</b>.</li></ul><p>No lo confundas con el punto que va <i>encima o debajo</i> de la cabeza: ese es el staccato, que verás más adelante.</p>`, fig: ['dotTie'] },
          { title: 'La ligadura de unión', html: `<p>Una <b>ligadura de unión</b> es un arco que conecta <b>dos notas iguales</b>. La segunda no se vuelve a tocar: se mantiene la primera durante la suma de las dos.</p><p>Sirve para escribir duraciones que no existen como figura, y para alargar una nota <b>por encima de la barra de compás</b>, cosa que el puntillo no puede hacer.</p>`,
            fig: ['example', { bpm: 96, score: { clef: 'treble', time: [4, 4], rh: n('C4q. D4e E4h | G4h. E4q~ | E4h C4h~ | C4w') }, caption: 'Negra con puntillo + corchea, blanca con puntillo, y dos ligaduras que cruzan la barra.' }] },
          { title: 'Marca el ritmo', ex: ['rhythm', { bpm: 72, pattern: [1.5, 0.5, 2, 1.5, 0.5, 2], say: 'Negra con puntillo y corchea: «laaargo-corto». La corchea cae en la «y» del segundo pulso.' }] },
          { title: 'En 3/4', ex: ['rhythm', { time: [3, 4], bpm: 96, pattern: [1, 1, 1, 3, 2, 1, 3] }] },
          { title: 'Repaso', ex: ['quiz', { questions: [
            { q: '¿Cuánto dura una blanca con puntillo?', options: ['3 pulsos', '2 pulsos y medio', '4 pulsos'], answer: 0 },
            { q: '¿Cuánto dura una negra con puntillo?', options: ['1 pulso y medio', '2 pulsos', '1 pulso'], answer: 0 },
            { q: '¿Cuántas veces se pulsa la tecla aquí?', fig: { score: { clef: 'treble', time: [4, 4], rh: n('G4h~ G4h') }, opts: { open: true } }, options: ['Una, y se mantiene cuatro pulsos', 'Dos', 'Ninguna'], answer: 0 },
            { q: 'La ligadura de unión conecta…', options: ['Dos notas de la misma altura', 'Dos notas distintas', 'Dos compases cualesquiera'], answer: 0, why: 'Si las notas son distintas, el arco es una ligadura de expresión (legato).' },
          ] }] },
        ],
      },
    ],
  },
];
