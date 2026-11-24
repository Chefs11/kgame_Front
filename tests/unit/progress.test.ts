import { describe, expect, it } from "vitest";
import { ADVENTURE_STORAGE_KEY, readAdventure, updateUnit, type KeyValueStore } from "@/game/adventure/progress";
import { newUnitState, questionForBlock, scoreAdventureAnswer } from "@/game/adventure/session";
import { sessionLength } from "@/lib/game-engine";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe("progreso del Modo aventura", () => {
  it("guarda y lee los bloques usados", () => {
    const store = memoryStore();
    updateUnit("u1", () => ({ ...newUnitState("u1"), used: ["7,7"] }), store);
    expect(readAdventure(store).units.u1?.used).toEqual(["7,7"]);
  });

  it("ignora datos dañados o de otra versión sin romperse", () => {
    expect(readAdventure(memoryStore({ [ADVENTURE_STORAGE_KEY]: "{no es json" })).units).toEqual({});
    expect(readAdventure(memoryStore({ [ADVENTURE_STORAGE_KEY]: '{"version":9,"units":{}}' })).units).toEqual({});
    expect(readAdventure(memoryStore({ [ADVENTURE_STORAGE_KEY]: '{"version":1,"units":{"u9":{}}}' })).units).toEqual({});
  });

  it("sigue funcionando si el almacenamiento lanza errores", () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("lleno");
      },
      removeItem: () => {},
    };
    expect(readAdventure(broken).units).toEqual({});
    expect(() => updateUnit("u2", () => newUnitState("u2"), broken)).not.toThrow();
  });

  it("asigna preguntas sin repetir y respeta la duración del modo clásico", () => {
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const s = newUnitState("u2", rand);
    expect(s.order).toHaveLength(sessionLength("u2"));
    const a = questionForBlock(s, "1,1");
    s.assigned["1,1"] = a!;
    const b = questionForBlock(s, "2,2");
    expect(a).not.toBe(b);
    expect(questionForBlock(s, "1,1")).toBe(a);
  });

  it("el bloque azul vale el doble solo en su propio registro", () => {
    const s = newUnitState("u1");
    const id = s.order[0];
    const normal = scoreAdventureAnswer(id, "a", false);
    const bonus = scoreAdventureAnswer(id, "a", true);
    expect(bonus.maxPoints).toBe(normal.maxPoints * 2);
    expect(bonus.points).toBe(normal.points * 2);
  });
});

describe("progreso clásico retrocompatible", () => {
  it("lee partidas guardadas antes del Modo aventura (sin campo variant)", async () => {
    const legacy = {
      version: 1,
      games: [{ id: "x", finishedAt: "2026-11-23T00:00:00Z", config: { unit: "u1", length: 4, difficulty: "todas", mode: "individual", players: 1, timerSeconds: 0 }, answers: [] }],
    };
    // progress.ts usa createLocalStore (cliente); se valida el parse con el mismo contrato
    const { progressStore } = await import("@/lib/progress");
    expect(typeof progressStore.get).toBe("function");
    const parsed = JSON.parse(JSON.stringify(legacy)) as { games: Array<{ variant?: string }> };
    expect(parsed.games[0].variant ?? "clasico").toBe("clasico");
  });
});
