import type { UnitId } from "@/content/types";
import { parseLevel, type Level, type LevelSource } from "../level";
import { LEVEL_U1 } from "./unidad-1";
import { LEVEL_U2 } from "./unidad-2";
import { LEVEL_U3 } from "./unidad-3";
import { LEVEL_U4 } from "./unidad-4";

/** Un nivel por unidad. */
export const LEVEL_SOURCES: Partial<Record<UnitId, LevelSource>> = {
  u1: LEVEL_U1,
  u2: LEVEL_U2,
  u3: LEVEL_U3,
  u4: LEVEL_U4,
};

export function levelFor(unit: UnitId): Level | null {
  const src = LEVEL_SOURCES[unit];
  return src ? parseLevel(src) : null;
}
