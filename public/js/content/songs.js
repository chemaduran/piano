// Repertorio para empezar. Todas las melodías son tradicionales o de dominio público.
import { n } from './dsl.js';

const ODA_RH = 'E4q@3 E4 F4@4 G4@5 | G4 F4 E4 D4@2 | C4@1 C4 D4 E4 | E4q. D4e D4h | E4q@3 E4 F4 G4 | G4 F4 E4 D4 | C4@1 C4 D4 E4 | D4q. C4e C4h';
const ESTRELLITA_RH = 'C4q@1 C4 G4@4 G4 | A4@5 A4 G4h@4 | F4q@4 F4 E4@3 E4 | D4@2 D4 C4h@1 | G4q@5 G4 F4@4 F4 | E4@3 E4 D4h@2 | G4q@5 G4 F4 F4 | E4 E4 D4h | C4q@1 C4 G4@4 G4 | A4@5 A4 G4h@4 | F4q@4 F4 E4 E4 | D4 D4 C4h';

export const SONGS = [
  {
    id: 'cinco-dedos', title: 'Subir y bajar', by: 'Ejercicio de cinco dedos', level: 1, bpm: 84, time: [4, 4], clef: 'treble',
    tip: 'Un dedo para cada tecla, del pulgar (1) en Do al meñique (5) en Sol. No muevas la mano: solo los dedos.',
    rh: n('C4q@1 D4@2 E4@3 F4@4 | G4h@5 G4 | G4q@5 F4@4 E4@3 D4@2 | C4w@1'),
  },
  {
    id: 'corderito', title: 'María tenía un corderito', by: 'Tradicional', level: 1, bpm: 100, time: [4, 4], clef: 'treble',
    tip: 'Solo usa cuatro notas: Do, Re, Mi y Sol. Fíjate en las blancas: duran dos pulsos.',
    rh: n('E4q@3 D4@2 C4@1 D4 | E4 E4 E4h | D4q D4 D4h | E4q G4@5 G4h | E4q@3 D4 C4 D4 | E4 E4 E4 E4 | D4 D4 E4 D4 | C4w'),
  },
  {
    id: 'luz-de-la-luna', title: 'A la luz de la luna', by: 'Tradicional francesa (Au clair de la lune)', level: 1, bpm: 96, time: [4, 4], clef: 'treble',
    tip: 'Tres dedos bastan: 1, 2 y 3. Cuenta en voz alta «un, dos, tres, cua» y deja sonar las blancas y la redonda.',
    rh: n('C4q@1 C4 C4 D4@2 | E4h@3 D4h | C4q E4 D4 D4 | C4w | C4q C4 C4 D4 | E4h D4h | C4q E4 D4 D4 | C4w'),
  },
  {
    id: 'oda-alegria', title: 'Oda a la alegría', by: 'Ludwig van Beethoven', level: 1, bpm: 100, time: [4, 4], clef: 'treble',
    tip: 'Aparece la negra con puntillo seguida de corchea: «laaargo-corto». La corchea se toca justo antes del pulso siguiente.',
    rh: n(ODA_RH),
  },
  {
    id: 'remando', title: 'Remando suave', by: 'Tradicional alemana (Lightly Row)', level: 1, bpm: 104, time: [4, 4], clef: 'treble',
    tip: 'La melodía salta de Sol a Mi y de Fa a Re: son terceras, de un dedo al de dos más allá.',
    rh: n('G4q@5 E4@3 E4h | F4q@4 D4@2 D4h | C4q@1 D4 E4 F4 | G4 G4 G4h | G4q E4 E4h | F4q D4 D4h | C4q E4 G4 G4 | C4w'),
  },
  {
    id: 'estrellita', title: 'Estrellita, ¿dónde estás?', by: 'Tradicional francesa', level: 1, bpm: 100, time: [4, 4], clef: 'treble',
    tip: 'Para llegar al La hay que abrir un poco la mano: el meñique se estira una tecla más allá del Sol.',
    rh: n(ESTRELLITA_RH),
  },
  {
    id: 'fray-santiago', title: 'Fray Santiago', by: 'Tradicional francesa (Frère Jacques)', level: 2, bpm: 104, time: [4, 4], clef: 'treble',
    tip: 'En «suenan las campanas» llegan las corcheas: dos por pulso. Al final el pulgar baja hasta el Sol grave.',
    rh: n('C4q@1 D4 E4 C4 | C4 D4 E4 C4 | E4@3 F4 G4h | E4q F4 G4h | G4e@4 A4@5 G4 F4 E4q@2 C4@1 | G4e@4 A4 G4 F4 E4q C4 | C4q@2 G3@1 C4h@2 | C4q G3 C4h'),
  },
  {
    id: 'puente-londres', title: 'El puente de Londres', by: 'Tradicional inglesa', level: 2, bpm: 104, time: [4, 4], clef: 'treble',
    tip: 'La mano se coloca una tecla más a la derecha: el pulgar en Re. Así el meñique llega al La sin estirarse.',
    rh: n('G4q.@4 A4e@5 G4q F4@3 | E4@2 F4 G4h | D4q@1 E4 F4h | E4q F4 G4h | G4q. A4e G4q F4 | E4 F4 G4h | D4h@1 G4h@4 | E4q@2 C4h.@1'),
  },
  {
    id: 'cumpleanos', title: 'Cumpleaños feliz', by: 'Tradicional', level: 2, bpm: 92, time: [3, 4], pickup: 1, clef: 'treble',
    tip: 'Compás de 3/4 y comienzo en anacrusa: las dos primeras corcheas van antes del primer pulso fuerte. Cuenta «un, dos, TRES-y | UN…».',
    rh: n('G4e@1 G4 | A4q@2 G4@1 C5@4 | B4h@3 G4e@1 G4 | A4q@2 G4@1 D5@5 | C5h@4 G4e@1 G4 | G5q@5 E5@3 C5@1 | B4@2 A4@1 F5e@4 F5 | E5q@3 C5@1 D5@2 | C5h.@1'),
  },
  {
    id: 'jingle-bells', title: 'Jingle Bells', by: 'James Pierpont', level: 2, bpm: 112, time: [4, 4], clef: 'treble',
    tip: 'Todo cabe en la posición de Do. Vigila el ritmo «negra con puntillo–corchea» y el par de corcheas del sexto compás.',
    rh: n('E4q@3 E4 E4h | E4q E4 E4h | E4q G4@5 C4q.@1 D4e@2 | E4w@3 | F4q@4 F4 F4q. F4e | F4q E4 E4 E4e E4 | E4q D4 D4 E4 | D4h@2 G4h@5 | E4q@3 E4 E4h | E4q E4 E4h | E4q G4 C4q. D4e | E4w | F4q F4 F4q. F4e | F4q E4 E4 E4e E4 | G4q@5 G4 F4 D4 | C4w@1'),
  },
  {
    id: 'paseo-bajo', title: 'Paseo del bajo', by: 'Estudio para la mano izquierda', level: 2, bpm: 88, time: [4, 4], clef: 'bass',
    tip: 'Ahora lee en clave de fa y toca con la mano izquierda. El meñique (5) va en el Do grave y el pulgar (1) en el Sol.',
    lh: n('C3q@5 D3@4 E3@3 F3@2 | G3h@1 E3h@3 | F3q@2 E3 D3 C3 | G3h@1 C3h@5 | C3q E3 G3 E3 | F3h D3h | E3q D3 C3 D3 | C3w'),
  },
  {
    id: 'oda-dos-manos', title: 'Oda a la alegría, a dos manos', by: 'Ludwig van Beethoven', level: 3, bpm: 88, time: [4, 4], clef: 'grand',
    tip: 'La izquierda solo toca una nota larga por compás. Practica primero cada mano por separado y júntalas despacio.',
    rh: n(ODA_RH),
    lh: n('C3w@5 | G3w@1 | C3w | G3w | C3w | G3w | C3w | G3h C3h'),
  },
  {
    id: 'estrellita-dos-manos', title: 'Estrellita, a dos manos', by: 'Tradicional francesa', level: 3, bpm: 88, time: [4, 4], clef: 'grand',
    tip: 'La mano izquierda cambia cada dos pulsos entre Do, Fa y Sol: son las tres notas de bajo más usadas en Do mayor.',
    rh: n(ESTRELLITA_RH),
    lh: n('C3w@5 | F3h@2 C3h@5 | F3h C3h | G3h@1 C3h | C3h F3h | C3h G3h | C3h F3h | C3h G3h | C3w | F3h C3h | F3h C3h | G3h C3h'),
  },
  {
    id: 'minueto-sol', title: 'Minueto en Sol', by: 'Christian Petzold (cuaderno de Anna Magdalena Bach)', level: 3, bpm: 96, time: [3, 4], key: 1, clef: 'grand',
    tip: 'La armadura tiene un sostenido: todos los Fa son Fa♯ (tecla negra). La izquierda toca una nota por compás casi todo el tiempo.',
    rh: n('D5q@5 G4e@1 A4 B4 C5 | D5q@5 G4@2 G4 | E5q@3 C5e@1 D5 E5 F#5 | G5q@5 G4@1 G4 | C5q@4 D5e C5 B4 A4 | B4q@3 C5e B4 A4 G4 | F#4q@2 G4e A4 B4 G4 | B4q@4 A4h@3'),
    lh: n('G3h.@2 | B3h.@1 | C4h.@1 | B3h. | A3h.@2 | G3h.@3 | D4q@1 B3@2 G3@4 | D4q@1 D3h@5'),
  },
  {
    id: 'para-elisa', title: 'Para Elisa (tema)', by: 'Ludwig van Beethoven', level: 3, bpm: 56, time: [3, 8], pickup: 0.5, clef: 'grand',
    tip: 'Compás de 3/8 con semicorcheas. Las manos se van pasando la música: la izquierda sube y la derecha continúa. Empieza muy despacio.',
    rh: n('E5s@5 D#5@4 | E5@5 D#5@4 E5@5 B4@2 D5@4 C5@3 | A4e@1 rs C4s@1 E4@2 A4@5 | B4e@1 rs E4s@1 G#4@2 B4@5 | C5e@1 rs E4s@1 E5@5 D#5@4 | E5 D#5 E5 B4 D5 C5 | A4e rs C4s E4 A4 | B4e rs E4s C5@3 B4@2 | A4q.@1'),
    lh: n('re | rq. | A2s@5 E3@2 A3@1 rs re | E2s@5 E3@2 G#3@1 rs re | A2s E3 A3 rs re | rq. | A2s E3 A3 rs re | E2s E3 G#3 rs re | A2s E3 A3 rs re'),
  },
];

export const songById = (id) => SONGS.find((s) => s.id === id);
