/**
 * Progreso del Modo aventura en localStorage (TS puro). Guarda, por unidad, el
 * orden de preguntas de la partida, los bloques ya respondidos y sus respuestas,
 * para que al volver los bloques aparezcan usados. No toca el formato del
 * progreso clásico (kgame.progress.v1): los resultados finales se guardan ahí
 * con `variant: "aventura"`.
 */
import type { UnitId } from "@/content/types";
import type { AnswerRecord } from "@/lib/game-engine";

export const ADVENTURE_STORAGE_KEY = "kgame.adventure.v1";

export interface UnitAdventure {
  /** Ids de pregunta en el orden de esta partida (mezclado una vez). */
  order: string[];
  /** Bloque "x,y" → id de pregunta asignada. */
  assigned: Record<string, string>;
  /** Bloques ya respondidos. */
  used: string[];
  answers: AnswerRecord[];
  completed: boolean;
}

export interface AdventureData {
  version: 1;
  units: Partial<Record<UnitId, UnitAdventure>>;
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

const EMPTY: AdventureData = { version: 1, units: {} };

function isUnit(v: unknown): v is UnitAdventure {
  if (!v || typeof v !== "object") return false;
  const u = v as Record<string, unknown>;
  return Array.isArray(u.order) && Array.isArray(u.used) && Array.isArray(u.answers) && typeof u.assigned === "object";
}

export function readAdventure(store: KeyValueStore | null = defaultStore()): AdventureData {
  if (!store) return { version: 1, units: {} };
  try {
    const raw = store.getItem(ADVENTURE_STORAGE_KEY);
    if (!raw) return { version: 1, units: {} };
    const parsed = JSON.parse(raw) as { version?: unknown; units?: Record<string, unknown> };
    if (parsed.version !== 1 || !parsed.units) return { version: 1, units: {} };
    const units: AdventureData["units"] = {};
    for (const [k, v] of Object.entries(parsed.units)) {
      if ((k === "u1" || k === "u2" || k === "u3" || k === "u4") && isUnit(v)) {
        units[k] = { ...v, completed: v.completed === true };
      }
    }
    return { version: 1, units };
  } catch {
    return { ...EMPTY, units: {} };
  }
}

export function writeAdventure(data: AdventureData, store: KeyValueStore | null = defaultStore()): void {
  if (!store) return;
  try {
    store.setItem(ADVENTURE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* almacenamiento lleno o bloqueado: el juego sigue en memoria */
  }
}

export function updateUnit(
  unit: UnitId,
  fn: (prev: UnitAdventure | undefined) => UnitAdventure,
  store: KeyValueStore | null = defaultStore(),
): UnitAdventure {
  const data = readAdventure(store);
  const next = fn(data.units[unit]);
  data.units[unit] = next;
  writeAdventure(data, store);
  return next;
}

export function resetUnit(unit: UnitId, store: KeyValueStore | null = defaultStore()): void {
  const data = readAdventure(store);
  delete data.units[unit];
  writeAdventure(data, store);
}

export function clearAdventure(store: KeyValueStore | null = defaultStore()): void {
  try {
    store?.removeItem(ADVENTURE_STORAGE_KEY);
  } catch {
    /* sin acceso al almacenamiento */
  }
}
