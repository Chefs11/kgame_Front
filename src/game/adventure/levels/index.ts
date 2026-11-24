import type { UnitId } from "@/content/types";
import { parseLevel, type Level, type LevelSource } from "../level";
import { LEVEL_U1 } from "./unidad-1";

/** Un nivel por unidad. */
export const LEVEL_SOURCES: Partial<Record<UnitId, LevelSource>> = {
  u1: LEVEL_U1,
};

export function levelFor(unit: UnitId): Level | null {
  const src = LEVEL_SOURCES[unit];
  return src ? parseLevel(src) : null;
}
