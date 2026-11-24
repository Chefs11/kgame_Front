/**
 * Formato de niveles (texto editable) y su conversión a tilemap.
 *
 * Leyenda (una fila de texto por fila de tiles, 14 filas de alto):
 *   .  aire              #  suelo (pasto arriba, tierra abajo; se decide solo)
 *   B  ladrillo          P  plataforma flotante con pasto
 *   ?  bloque "?" naranja (reto)     *  bloque "?" azul (reto bonus, doble puntaje)
 *   U  bloque usado      S  inicio de Sprout (aire)
 *   E  salida: tronco hueco de 3×2 tiles; la E marca su esquina inferior izquierda
 * Los fosos son columnas sin suelo.
 */
import { RENDER } from "./config";

export const Tile = {
  Air: 0,
  Ground: 1,
  Brick: 2,
  Platform: 3,
  QOrange: 4,
  QBlue: 5,
  Used: 6,
} as const;
export type TileId = (typeof Tile)[keyof typeof Tile];

export interface LevelSource {
  id: string;
  /** Texto de ayuda inicial opcional. */
  hint?: string;
  rows: string[];
}

export interface QuestionBlock {
  /** Identificador estable: "x,y" en tiles. */
  id: string;
  tx: number;
  ty: number;
  bonus: boolean;
}

export interface Level {
  id: string;
  hint: string;
  cols: number;
  rows: number;
  tiles: Uint8Array;
  blocks: QuestionBlock[];
  start: { tx: number; ty: number };
  /** Salida (tronco), en tiles. */
  exit: { tx: number; ty: number; w: number; h: number };
}

export const LEVEL_ROWS = RENDER.height / RENDER.tile; // 14
const DEFAULT_HINT = "← → mover · ESPACIO saltar · toca un ? para responder";

export function parseLevel(src: LevelSource): Level {
  const rows = src.rows.length;
  if (rows !== LEVEL_ROWS) throw new Error(`Nivel ${src.id}: debe tener ${LEVEL_ROWS} filas (tiene ${rows})`);
  const cols = Math.max(...src.rows.map((r) => r.length));
  const tiles = new Uint8Array(cols * rows);
  const blocks: QuestionBlock[] = [];
  let start: Level["start"] | null = null;
  let exit: Level["exit"] | null = null;
  for (let y = 0; y < rows; y++) {
    const line = src.rows[y].padEnd(cols, ".");
    for (let x = 0; x < cols; x++) {
      const ch = line[x];
      let t: TileId = Tile.Air;
      switch (ch) {
        case "#":
          t = Tile.Ground;
          break;
        case "B":
          t = Tile.Brick;
          break;
        case "P":
          t = Tile.Platform;
          break;
        case "?":
          t = Tile.QOrange;
          blocks.push({ id: `${x},${y}`, tx: x, ty: y, bonus: false });
          break;
        case "*":
          t = Tile.QBlue;
          blocks.push({ id: `${x},${y}`, tx: x, ty: y, bonus: true });
          break;
        case "U":
          t = Tile.Used;
          break;
        case "S":
          start = { tx: x, ty: y };
          break;
        case "E":
          exit = { tx: x, ty: y - 1, w: 3, h: 2 };
          break;
        case ".":
          break;
        default:
          throw new Error(`Nivel ${src.id}: carácter desconocido «${ch}» en (${x},${y})`);
      }
      tiles[y * cols + x] = t;
    }
  }
  if (!start) throw new Error(`Nivel ${src.id}: falta el inicio S`);
  if (!exit) throw new Error(`Nivel ${src.id}: falta la salida E`);
  return { id: src.id, hint: src.hint ?? DEFAULT_HINT, cols, rows, tiles, blocks, start, exit };
}

export function isSolid(t: number): boolean {
  return t !== Tile.Air;
}

export function isQuestion(t: number): boolean {
  return t === Tile.QOrange || t === Tile.QBlue;
}

export function tileAt(level: Level, tx: number, ty: number): number {
  if (tx < 0 || tx >= level.cols) return Tile.Ground; // paredes invisibles a los lados
  if (ty < 0) return Tile.Air;
  if (ty >= level.rows) return Tile.Air; // fosos: abajo no hay nada
  return level.tiles[ty * level.cols + tx];
}
