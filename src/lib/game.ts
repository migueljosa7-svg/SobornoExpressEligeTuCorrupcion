import contratos from '../data/events_contratos.json';
import redes from '../data/events_redes.json';
import justicia from '../data/events_justicia.json';

export type StatKey = 'p' | 'o' | 'j' | 'l';
export type Stats = Record<StatKey, number>;
export type Fx = Record<StatKey, number>;

export interface Choice { label: string; fx: Fx }
export interface GameEvent {
  id: string; who: string; icon: string; text: string;
  left: Choice; right: Choice;
}

export const STAT_META: Record<StatKey, { name: string; short: string; icon: string }> = {
  p: { name: 'Presupuesto Público', short: 'Pasta', icon: '💰' },
  o: { name: 'Opinión Pública', short: 'Pueblo', icon: '📣' },
  j: { name: 'Tribunales / Justicia', short: 'Jueces', icon: '⚖️' },
  l: { name: 'Lealtad del Partido', short: 'Partido', icon: '🎩' }
};
export const STAT_KEYS: StatKey[] = ['p', 'o', 'j', 'l'];

export const ALL_EVENTS: GameEvent[] = [
  ...(contratos as GameEvent[]),
  ...(redes as GameEvent[]),
  ...(justicia as GameEvent[])
];

export const START: Stats = { p: 50, o: 50, j: 50, l: 50 };

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/** Cada decisión se pondera con un factor aleatorio 0.7–1.3 para que ninguna partida sea idéntica. */
export function applyFx(stats: Stats, fx: Fx, rng: () => number = Math.random): Stats {
  const out = { ...stats };
  for (const k of STAT_KEYS) {
    if (fx[k] === 0) continue;
    out[k] = clamp(Math.round(stats[k] + fx[k] * (0.7 + rng() * 0.6)));
  }
  return out;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Ending { key: StatKey; high: boolean; title: string; text: string }

const ENDINGS: Ending[] = [
  { key: 'p', high: false, title: 'CAJA VACÍA', text: 'Las arcas están a cero. La UCO encuentra telarañas y un recibo de mariscada. Te condenan por malversación y te embargan hasta el reloj de oro.' },
  { key: 'p', high: true, title: 'DEMASIADO SUPERÁVIT', text: 'Nadie tiene tanto dinero limpio. Hacienda sospecha, el juez también y tu cuñado ya ha abierto una cuenta en Suiza. Prisión provisional con colchón de lujo.' },
  { key: 'o', high: false, title: 'EL PUEBLO HABLÓ', text: 'Manifestación frente a tu casa con cacerolas, bocinas y una charanga. Te echan hasta de tu propio partido. Dimisión a las 9, entrevista llorosa a las 10.' },
  { key: 'o', high: true, title: 'POPULISMO LETAL', text: 'Eres tan querido que el juez te investiga solo por celos. «Nadie puede caer tan bien», dice el auto. Imputado por simpatía agravada.' },
  { key: 'j', high: false, title: 'GAME OVER JUDICIAL', text: 'La jueza te cita a las 8:00 con sus mejores pruebas, escritas en Comic Sans. Sentencia: 12 años y devolver lo del AVE.' },
  { key: 'j', high: true, title: 'JUSTICIA DEMASIADO LIMPIA', text: 'Los tribunales te adoran tanto que te auditan cada euro para demostrarlo. Encuentran siete. Fin de la carrera.' },
  { key: 'l', high: false, title: 'EXPULSADO DEL PARTIDO', text: 'Tu partido ya no te conoce. «¿Quién? Nunca lo vimos». Te borran de la web y de las fotos. Acabas en el Grupo Mixto, entre fotocopiadoras.' },
  { key: 'l', high: true, title: 'TE HAN HECHO PRESIDENTE', text: 'El partido te adora tanto que te nombra presidente… y chivo expiatorio oficial. Todo lo malo será tuyo desde hoy.' }
];

export function getEnding(stats: Stats): Ending | null {
  for (const k of STAT_KEYS) {
    if (stats[k] <= 0) return ENDINGS.find(e => e.key === k && !e.high)!;
    if (stats[k] >= 100) return ENDINGS.find(e => e.key === k && e.high)!;
  }
  return null;
}

export function rankFor(turns: number): string {
  if (turns < 5) return 'Becario de la Corrupción';
  if (turns < 12) return 'Concejal de Medio Pelo';
  if (turns < 20) return 'Consejero Delegado de Nada';
  if (turns < 30) return 'Ministro con Maleta';
  if (turns < 45) return 'Barón Regional Intocable';
  return 'Presidente Vitalicio con Foro Propio';
}

const BEST_KEY = 'soborno.best';
export function loadBest(): number {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}
export function saveBest(n: number): void {
  try { localStorage.setItem(BEST_KEY, String(n)); } catch { /* storage no disponible */ }
}
