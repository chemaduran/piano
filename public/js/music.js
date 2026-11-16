// Teoría básica: alturas, nombres de notas y escalas.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const LETTER_SEMIS = [0, 2, 4, 5, 7, 9, 11];
const SHARP_NAMES = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const FLAT_NAMES = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
const SHARP_LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/** "F#4" | "Bb3" | "C4" -> { midi, letter (0-6), octave, alter (-1|0|1), dia } */
export function parsePitch(p) {
  if (typeof p === 'number') return fromMidi(p);
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(p);
  if (!m) throw new Error(`Nota no válida: ${p}`);
  const letter = LETTERS.indexOf(m[1]);
  const alter = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const octave = Number(m[3]);
  return { midi: 12 * (octave + 1) + LETTER_SEMIS[letter] + alter, letter, octave, alter, dia: octave * 7 + letter };
}

/** Deletreo por defecto de un número MIDI (con sostenidos, o bemoles si preferFlat). */
export function fromMidi(midi, preferFlat = false) {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  let letter = LETTER_SEMIS.indexOf(pc);
  let alter = 0;
  if (letter < 0) {
    if (preferFlat) { letter = LETTER_SEMIS.indexOf(pc + 1); alter = -1; }
    else { letter = LETTER_SEMIS.indexOf(pc - 1); alter = 1; }
  }
  return { midi, letter, octave, alter, dia: octave * 7 + letter };
}

export const midiOf = (p) => (typeof p === 'number' ? p : parsePitch(p).midi);
export const isBlack = (midi) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

/** Nombre en español de una nota: "Do", "Fa♯"… */
export function noteName(p, preferFlat = false) {
  if (typeof p === 'number') return (preferFlat ? FLAT_NAMES : SHARP_NAMES)[((p % 12) + 12) % 12];
  const n = parsePitch(p);
  return SOLFEGE[n.letter] + (n.alter > 0 ? '♯' : n.alter < 0 ? '♭' : '');
}
/** Cifrado anglosajón: "C", "F♯"… */
export const letterName = (midi) => SHARP_LETTERS[((midi % 12) + 12) % 12];

export function pitchString(n) {
  return LETTERS[n.letter] + (n.alter > 0 ? '#' : n.alter < 0 ? 'b' : '') + n.octave;
}

export const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1];
export const MINOR_STEPS = [2, 1, 2, 2, 1, 2, 2];

/** Escala deletreada correctamente (una letra por grado) a partir de la tónica. */
export function scale(tonic, steps = MAJOR_STEPS) {
  const t = parsePitch(tonic);
  const out = [t];
  let midi = t.midi;
  for (let i = 0; i < steps.length; i++) {
    midi += steps[i];
    const dia = t.dia + i + 1;
    const letter = dia % 7;
    const octave = Math.floor(dia / 7);
    const natural = 12 * (octave + 1) + LETTER_SEMIS[letter];
    out.push({ midi, letter, octave, alter: midi - natural, dia });
  }
  return out;
}

// Armaduras: número de sostenidos (+) o bemoles (-) de cada tonalidad mayor.
export const KEYS = [
  { name: 'Do', tonic: 'C4', sig: 0, minor: 'La' }, { name: 'Sol', tonic: 'G3', sig: 1, minor: 'Mi' },
  { name: 'Re', tonic: 'D4', sig: 2, minor: 'Si' }, { name: 'La', tonic: 'A3', sig: 3, minor: 'Fa♯' },
  { name: 'Mi', tonic: 'E4', sig: 4, minor: 'Do♯' }, { name: 'Si', tonic: 'B3', sig: 5, minor: 'Sol♯' },
  { name: 'Fa♯', tonic: 'F#3', sig: 6, minor: 'Re♯' }, { name: 'Re♭', tonic: 'Db4', sig: -5, minor: 'Si♭' },
  { name: 'La♭', tonic: 'Ab3', sig: -4, minor: 'Fa' }, { name: 'Mi♭', tonic: 'Eb4', sig: -3, minor: 'Do' },
  { name: 'Si♭', tonic: 'Bb3', sig: -2, minor: 'Sol' }, { name: 'Fa', tonic: 'F3', sig: -1, minor: 'Re' },
];
export const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]; // Fa Do Sol Re La Mi Si (índices de letra)
export const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3]; // Si Mi La Re Sol Do Fa

/** Alteración que la armadura impone a cada letra: array de 7 valores (-1, 0, 1). */
export function keyAlterations(sig) {
  const a = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.abs(sig); i++) a[(sig > 0 ? SHARP_ORDER : FLAT_ORDER)[i]] = sig > 0 ? 1 : -1;
  return a;
}

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Notas naturales entre dos alturas (ambas incluidas), como cadenas "C4". */
export function naturalsBetween(from, to) {
  const a = parsePitch(from).dia, b = parsePitch(to).dia;
  const out = [];
  for (let d = a; d <= b; d++) out.push(LETTERS[d % 7] + Math.floor(d / 7));
  return out;
}
