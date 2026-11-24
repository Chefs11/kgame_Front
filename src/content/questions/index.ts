import type { Question, UnitId } from "../types";
import { UNIDAD_1 } from "./unidad-1";
import { UNIDAD_2 } from "./unidad-2";
import { UNIDAD_3 } from "./unidad-3";
import { UNIDAD_4 } from "./unidad-4";

/**
 * Banco de retos de demostración. Para agregar preguntas, añade objetos al
 * archivo de la unidad correspondiente respetando el tipo `Question`.
 */
export const QUESTIONS: Question[] = [...UNIDAD_1, ...UNIDAD_2, ...UNIDAD_3, ...UNIDAD_4];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionsForUnit(unitId: UnitId): Question[] {
  return QUESTIONS.filter((q) => q.unitId === unitId);
}
