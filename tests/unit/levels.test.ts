import { describe, expect, it } from "vitest";
import { LEVEL_SOURCES } from "@/game/adventure/levels";
import { parseLevel } from "@/game/adventure/level";
import { validateLevel } from "@/game/adventure/validate";
import { sessionLength } from "@/lib/game-engine";
import type { UnitId } from "@/content/types";

describe("validador de niveles", () => {
  for (const [unit, src] of Object.entries(LEVEL_SOURCES)) {
    it(`${unit}: cada "?" y la salida son alcanzables y hay tantos "?" como preguntas`, () => {
      const level = parseLevel(src!);
      const res = validateLevel(level, sessionLength(unit as UnitId));
      expect(res.errors).toEqual([]);
      expect(res.ok).toBe(true);
    });
  }

  it("detecta un bloque inalcanzable y un conteo incorrecto", () => {
    const rows = Array.from({ length: 14 }, () => ".".repeat(20));
    rows[1] = "..........?.........";
    rows[10] = "..S..............E..";
    rows[11] = rows[12] = rows[13] = "#".repeat(20);
    const res = validateLevel(parseLevel({ id: "malo", rows }), 2);
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("no es alcanzable"))).toBe(true);
    expect(res.errors.some((e) => e.includes("se esperan 2"))).toBe(true);
  });

  it("detecta un foso demasiado ancho", () => {
    const rows = Array.from({ length: 14 }, () => ".".repeat(30));
    rows[10] = "..S......................E....";
    const ground = "##########......##############";
    rows[11] = rows[12] = rows[13] = ground;
    const res = validateLevel(parseLevel({ id: "foso", rows }), 0);
    expect(res.errors.some((e) => e.includes("salida"))).toBe(true);
  });
});
