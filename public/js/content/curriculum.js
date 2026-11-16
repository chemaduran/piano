// Índice del temario.
import { PART1 } from './curriculum1.js';
import { PART2 } from './curriculum2.js';

export const MODULES = [...PART1, ...PART2];
export const LESSONS = MODULES.flatMap((m, mi) => m.lessons.map((l) => ({ ...l, module: m, moduleIndex: mi })));
LESSONS.forEach((l, i) => { l.index = i; l.prev = LESSONS[i - 1] || null; });
LESSONS.forEach((l, i) => { l.next = LESSONS[i + 1] || null; });

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const lessonItem = (id) => `l:${id}`;
