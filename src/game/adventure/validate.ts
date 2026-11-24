/**
 * Validador de niveles: construye un grafo de superficies donde Sprout puede
 * estar de pie y comprueba con el salto máximo de la configuración que cada
 * "?" y la salida son alcanzables, y que hay tantos "?" como preguntas.
 */
import { PHYSICS, RENDER } from "./config";
import { isSolid, tileAt, type Level } from "./level";

const T = RENDER.tile;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  reachableCells: number;
}

/** Tiempo en el aire para terminar `rise` px más arriba (negativo = más abajo) tras un salto completo. */
function airTime(risePx: number): number {
  const v = PHYSICS.jumpSpeed;
  const g = PHYSICS.gravity;
  const disc = v * v - 2 * g * risePx;
  if (disc < 0) return -1;
  return (v + Math.sqrt(disc)) / g;
}

/** Máxima distancia horizontal (en tiles, conservadora) para un cambio de altura en tiles. */
export function maxGapTiles(riseTiles: number): number {
  const t = airTime(riseTiles * T);
  if (t < 0) return -1;
  return Math.floor((PHYSICS.maxRunSpeed * t - PHYSICS.hitbox.w) / T);
}

/** Altura máxima de salto en tiles (pies). */
export const MAX_RISE_TILES = Math.floor((PHYSICS.jumpSpeed * PHYSICS.jumpSpeed) / (2 * PHYSICS.gravity) / T);

export function validateLevel(level: Level, expectedQuestions: number): ValidationResult {
  const errors: string[] = [];
  const solid = (x: number, y: number) => isSolid(tileAt(level, x, y));
  // Celda de pie: aire en (x,y) y (x,y-1), sólido debajo
  const standable = (x: number, y: number) =>
    y >= 1 && y < level.rows && !solid(x, y) && !solid(x, y - 1) && y + 1 < level.rows && solid(x, y + 1);

  const key = (x: number, y: number) => y * level.cols + x;
  const reach = new Uint8Array(level.cols * level.rows);
  const queue: number[] = [];
  const s = level.start;
  // El inicio cae al suelo más cercano
  let sy = s.ty;
  while (sy < level.rows - 1 && !standable(s.tx, sy)) sy++;
  if (!standable(s.tx, sy)) errors.push("El inicio no está sobre suelo firme");
  else {
    reach[key(s.tx, sy)] = 1;
    queue.push(key(s.tx, sy));
  }

  const cells: Array<[number, number]> = [];
  for (let y = 0; y < level.rows; y++) for (let x = 0; x < level.cols; x++) if (standable(x, y)) cells.push([x, y]);

  while (queue.length) {
    const k = queue.shift() as number;
    const ax = k % level.cols;
    const ay = Math.floor(k / level.cols);
    for (const [bx, by] of cells) {
      if (reach[key(bx, by)]) continue;
      const rise = ay - by; // positivo = más arriba
      const dx = Math.abs(bx - ax);
      let ok = false;
      if (by === ay && dx === 1) ok = true; // caminar
      else if (rise <= MAX_RISE_TILES) {
        const gap = maxGapTiles(rise);
        ok = gap >= 0 && dx <= gap + 1;
      }
      if (ok) {
        reach[key(bx, by)] = 1;
        queue.push(key(bx, by));
      }
    }
  }

  // Cabeza: altura alcanzable sobre los pies (en tiles) al saltar
  const headTiles = Math.floor((PHYSICS.hitbox.h + (PHYSICS.jumpSpeed * PHYSICS.jumpSpeed) / (2 * PHYSICS.gravity)) / T);
  level.blocks.forEach((b) => {
    let ok = false;
    for (const [x, y] of cells) {
      if (!reach[key(x, y)]) continue;
      const dx = Math.abs(b.tx - x);
      const up = y - b.ty; // filas por encima de la celda de pie
      // por debajo (cabezazo), de lado o encima
      if ((dx <= 1 && up >= 0 && up <= headTiles) || (dx === 0 && b.ty === y + 1)) {
        ok = true;
        break;
      }
    }
    if (!ok) errors.push(`El bloque ${b.bonus ? "azul" : "naranja"} en (${b.tx},${b.ty}) no es alcanzable`);
  });

  const e = level.exit;
  const exitRow = e.ty + e.h - 1;
  let exitOk = false;
  for (let x = e.tx; x < e.tx + e.w; x++) if (reach[key(x, exitRow)]) exitOk = true;
  if (!exitOk) errors.push(`La salida en (${e.tx},${exitRow}) no es alcanzable`);

  if (level.blocks.length !== expectedQuestions)
    errors.push(`Hay ${level.blocks.length} bloques "?" y se esperan ${expectedQuestions} preguntas`);
  const bonus = level.blocks.filter((b) => b.bonus).length;
  if (bonus > 1) errors.push(`Hay ${bonus} bloques azules; se espera como máximo uno`);

  return { ok: errors.length === 0, errors, reachableCells: reach.reduce((n, v) => n + v, 0) };
}
