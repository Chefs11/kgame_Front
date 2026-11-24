/**
 * Sesión de preguntas del Modo aventura: reutiliza las reglas del modo clásico
 * (pickQuestions, scoreAnswer y la duración por defecto) sin modificarlas.
 */
import { QUESTION_BY_ID } from "@/content/questions";
import type { UnitId } from "@/content/types";
import { pickQuestions, scoreAnswer, sessionLength, type AnswerRecord } from "@/lib/game-engine";
import { GAMEPLAY } from "./config";
import type { UnitAdventure } from "./progress";

export function newUnitState(unit: UnitId, random: () => number = Math.random): UnitAdventure {
  const order = pickQuestions(
    { unit, length: sessionLength(unit), difficulty: "todas", mode: "individual", players: 1, timerSeconds: 0 },
    random,
  ).map((q) => q.id);
  return { order, assigned: {}, used: [], answers: [], completed: false };
}

/** Pregunta para un bloque: la ya asignada o la siguiente del orden sin repetir. */
export function questionForBlock(state: UnitAdventure, blockId: string): string | null {
  const existing = state.assigned[blockId];
  if (existing) return existing;
  const taken = new Set(Object.values(state.assigned));
  return state.order.find((id) => !taken.has(id)) ?? null;
}

/** Puntaje de una respuesta; el bloque azul (bonus) vale el doble solo en su propio registro. */
export function scoreAdventureAnswer(questionId: string, optionId: string | null, bonus: boolean): AnswerRecord {
  const q = QUESTION_BY_ID[questionId];
  const s = scoreAnswer(q, optionId);
  const k = bonus ? GAMEPLAY.bonusMultiplier : 1;
  return {
    questionId: q.id,
    unitId: q.unitId,
    topic: q.topic,
    optionId,
    outcome: s.outcome,
    points: s.points * k,
    maxPoints: s.maxPoints * k,
    player: 1,
  };
}
