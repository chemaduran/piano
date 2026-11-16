// Notación compacta para escribir melodías:
//   "E4q@3 E4 F4 G4 | E4q. D4e D4h"
//   altura (C4, F#4, Bb3), acorde (C4+E4+G4) o silencio (r)
//   duración: w redonda, h blanca, q negra, e corchea, s semicorchea; con "." = puntillo. Si se omite, se repite la anterior.
//   @3 dedo · ~ ligadura de unión · ! staccato · > acento · ^ calderón · {mf} matiz · | barra (solo para leer mejor)
const DUR = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 };
const TOKEN = /^((?:[A-G][#b]?\d)(?:\+[A-G][#b]?\d)*|r)([whqes]\.?)?((?:@\d|[~!>^]|\{\w+\})*)$/;

export function n(str) {
  let d = 1;
  return str.split(/\s+/).filter((t) => t && t !== '|').map((tok) => {
    const m = TOKEN.exec(tok);
    if (!m) throw new Error(`Nota mal escrita: «${tok}»`);
    if (m[2]) d = DUR[m[2][0]] * (m[2].length > 1 ? 1.5 : 1);
    const ev = { p: m[1] === 'r' ? null : m[1].includes('+') ? m[1].split('+') : m[1], d };
    for (const f of m[3].matchAll(/@(\d)|([~!>^])|\{(\w+)\}/g)) {
      if (f[1]) ev.f = Number(f[1]);
      else if (f[2] === '~') ev.tie = true;
      else if (f[2] === '!') ev.stacc = true;
      else if (f[2] === '>') ev.accent = true;
      else if (f[2] === '^') ev.fermata = true;
      else if (f[3]) ev.dyn = f[3];
    }
    return ev;
  });
}
