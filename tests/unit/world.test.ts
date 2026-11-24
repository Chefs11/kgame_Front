import { describe, expect, it } from "vitest";
import { PHYSICS, RENDER } from "@/game/adventure/config";
import { parseLevel, Tile } from "@/game/adventure/level";
import { World, type InputState, type WorldEventType } from "@/game/adventure/world";

const DT = 1 / 60;
const T = RENDER.tile;

function input(partial: Partial<InputState> = {}): InputState {
  return { left: false, right: false, down: false, jumpHeld: false, jumpPressed: false, ...partial };
}

/** Nivel plano de 30 columnas con suelo en las filas 11–13. */
function flat(overrides: Record<number, string> = {}, width = 30) {
  const rows = Array.from({ length: 14 }, () => ".".repeat(width));
  rows[10] = "..S" + ".".repeat(width - 6) + "E..";
  rows[11] = rows[12] = rows[13] = "#".repeat(width);
  for (const [y, line] of Object.entries(overrides)) {
    const n = Number(y);
    rows[n] = n === 10 ? line.padEnd(width - 3, ".") + "E.." : line.padEnd(width, ".");
  }
  return parseLevel({ id: "test", rows });
}

function run(world: World, frames: number, inp: InputState = input()) {
  for (let i = 0; i < frames; i++) world.update(DT, inp);
}

describe("física", () => {
  it("cae por gravedad y se apoya sobre el suelo", () => {
    const w = new World(flat());
    w.y -= 40;
    run(w, 90);
    expect(w.onGround).toBe(true);
    expect(w.y + PHYSICS.hitbox.h).toBeCloseTo(11 * T, 3);
    expect(w.vy).toBe(0);
  });

  it("no atraviesa paredes (colisión en X)", () => {
    const level = flat({ 10: "..S.....B" , 9: "........B" });
    const w = new World(level);
    run(w, 120, input({ right: true }));
    expect(w.x + PHYSICS.hitbox.w).toBeLessThanOrEqual(8 * T + 0.001);
  });

  it("la velocidad horizontal no supera el máximo", () => {
    const w = new World(flat({}, 60));
    run(w, 120, input({ right: true }));
    expect(Math.abs(w.vx)).toBeLessThanOrEqual(PHYSICS.maxRunSpeed);
  });

  it("el salto completo sube ≈ 54 px y soltar la tecla lo acorta", () => {
    const peak = (hold: boolean) => {
      const w = new World(flat());
      run(w, 5);
      const ground = w.y;
      const inp = input({ jumpPressed: true, jumpHeld: true });
      let top = w.y;
      for (let i = 0; i < 60; i++) {
        w.update(DT, inp);
        if (!hold && i === 3) inp.jumpHeld = false;
        top = Math.min(top, w.y);
      }
      return ground - top;
    };
    const full = peak(true);
    expect(full).toBeGreaterThan(48);
    expect(full).toBeLessThan(58);
    expect(peak(false)).toBeLessThan(full * 0.6);
  });
});

describe("coyote time y buffer de salto", () => {
  it("permite saltar poco después de salir del borde", () => {
    // Suelo solo hasta la columna 5; Sprout corre y sale del borde
    const rows = Array.from({ length: 14 }, () => ".".repeat(30));
    rows[10] = "..S.......................E...";
    rows[11] = rows[12] = rows[13] = "######........................";
    const w = new World(parseLevel({ id: "borde", rows }));
    let frames = 0;
    while (w.onGround || frames < 5) {
      w.update(DT, input({ right: true }));
      frames++;
      if (frames > 200) break;
    }
    expect(w.onGround).toBe(false);
    // 3 frames (50 ms) después de caer, todavía dentro del coyote time (100 ms)
    run(w, 3, input({ right: true }));
    w.update(DT, input({ right: true, jumpPressed: true, jumpHeld: true }));
    expect(w.vy).toBeLessThan(0);
  });

  it("recuerda el salto pulsado justo antes de aterrizar", () => {
    const w = new World(flat());
    w.y -= 10;
    w.vy = 200;
    // Pulsa saltar en el aire, a pocos píxeles del suelo
    w.update(DT, input({ jumpPressed: true, jumpHeld: true }));
    let jumped = false;
    for (let i = 0; i < 6; i++) {
      w.update(DT, input({ jumpHeld: true }));
      if (w.vy < 0) jumped = true;
    }
    expect(jumped).toBe(true);
  });
});

describe("bloques ? y salida", () => {
  it('un "?" dispara la pregunta UNA sola vez', () => {
    const events: Array<[WorldEventType, number]> = [];
    const w = new World(flat({ 10: "..S..?" }), (t, v) => events.push([t, v]));
    run(w, 90, input({ right: true }));
    const q = events.filter(([t]) => t === "question");
    expect(q).toHaveLength(1);
    expect(q[0][1]).toBe(0);
    // Sigue empujando contra el bloque: no se repite
    run(w, 60, input({ right: true }));
    expect(events.filter(([t]) => t === "question")).toHaveLength(1);
  });

  it("se activa al golpearlo con la cabeza", () => {
    const events: WorldEventType[] = [];
    const w = new World(flat({ 7: "..?" }), (t) => events.push(t));
    run(w, 3);
    run(w, 40, input({ jumpPressed: true, jumpHeld: true }));
    expect(events).toContain("question");
  });

  it("el bloque respondido queda usado y la salida abre solo al terminar todos", () => {
    const events: WorldEventType[] = [];
    const w = new World(flat({ 7: ".....?....?" }), (t) => events.push(t));
    expect(w.exitOpen).toBe(false);
    w.markAnswered(0, true);
    expect(w.tile(5, 7)).toBe(Tile.Used);
    expect(w.exitOpen).toBe(false);
    w.markAnswered(1, false);
    expect(w.exitOpen).toBe(true);
    expect(events).toContain("exitOpened");
  });

  it("al restaurar una partida los bloques respondidos aparecen usados", () => {
    const level = flat({ 7: ".....?....?" });
    const w = new World(level);
    w.restoreUsed(["5,7"]);
    expect(w.tile(5, 7)).toBe(Tile.Used);
    expect(w.tile(10, 7)).toBe(Tile.QOrange);
    expect(w.answered).toBe(1);
  });

  it("la salida cerrada avisa cuántos faltan y no completa el nivel", () => {
    const events: Array<[WorldEventType, number]> = [];
    const w = new World(flat({ 7: ".....?" }, 16), (t, v) => events.push([t, v]));
    run(w, 240, input({ right: true }));
    expect(events.some(([t, v]) => t === "exitBlocked" && v === 1)).toBe(true);
    expect(events.some(([t]) => t === "complete")).toBe(false);
  });

  it("caer en un foso devuelve al último suelo seguro sin penalización", () => {
    const rows = Array.from({ length: 14 }, () => ".".repeat(30));
    rows[10] = "..S.......................E...";
    rows[11] = rows[12] = rows[13] = "########......################";
    const events: WorldEventType[] = [];
    const w = new World(parseLevel({ id: "foso", rows }), (t) => events.push(t));
    run(w, 200, input({ right: true }));
    expect(events).toContain("respawn");
    expect(w.answered).toBe(0);
  });
});
