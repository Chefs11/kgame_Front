/**
 * Lógica del juego sin interfaz: armado de partidas, puntaje y resúmenes.
 * Es independiente de React para poder probarla o moverla a un backend.
 */
import { QUESTIONS, QUESTION_BY_ID } from "@/content/questions";
import type { Difficulty, OptionQuality, Question, UnitId } from "@/content/types";

export type UnitChoice = UnitId | "mixta";
export type DifficultyChoice = Difficulty | "todas";
export type GameMode = "individual" | "pasa";
export type Outcome = "correcta" | "parcial" | "incorrecta" | "sin-respuesta";

export interface GameConfig {
  unit: UnitChoice;
  length: number;
  difficulty: DifficultyChoice;
  mode: GameMode;
  /** Número de jugadores en "pasa el dispositivo" (1 en individual). */
  players: number;
  /** 0 = sin temporizador. */
  timerSeconds: number;
}

export interface SessionItem {
  questionId: string;
  optionOrder: string[];
  player: number;
}

export interface AnswerRecord {
  questionId: string;
  unitId: UnitId;
  topic: string;
  optionId: string | null;
  outcome: Outcome;
  points: number;
  maxPoints: number;
  player: number;
}

export type SessionPhase = "handoff" | "question" | "feedback";

export interface GameSession {
  id: string;
  config: GameConfig;
  items: SessionItem[];
  index: number;
  phase: SessionPhase;
  selected: string | null;
  answers: AnswerRecord[];
}

export interface GameResult {
  id: string;
  finishedAt: string;
  config: GameConfig;
  answers: AnswerRecord[];
  /** Modo de juego. Opcional para leer partidas guardadas antes del Modo aventura (= clásico). */
  variant?: "clasico" | "aventura";
}

/* ---------- Puntaje ---------- */

export const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  basico: 100,
  intermedio: 150,
  avanzado: 200,
};

/** En escenarios, una decisión parcial vale la mitad. */
export const QUALITY_FACTOR: Record<OptionQuality, number> = {
  responsable: 1,
  parcial: 0.5,
  riesgosa: 0,
};

/** Duración por defecto de una sesión (retos); el Modo aventura usa la misma regla. */
export const DEFAULT_SESSION_LENGTH = 8;

/** Número de retos de una sesión de `unit` con la duración por defecto. */
export function sessionLength(unit: UnitChoice): number {
  return Math.min(DEFAULT_SESSION_LENGTH, availableQuestions(unit, "todas").length);
}

export const LENGTH_OPTIONS = [
  { value: 4, label: "Rápida", desc: "4 retos, unos 5 minutos" },
  { value: 8, label: "Normal", desc: "8 retos, unos 10 minutos" },
  { value: 12, label: "Completa", desc: "12 retos, unos 15 minutos" },
] as const;

export const TIMER_OPTIONS = [
  { value: 0, label: "Sin límite", desc: "Lee con calma" },
  { value: 90, label: "90 segundos", desc: "Por reto" },
  { value: 45, label: "45 segundos", desc: "Por reto, para quien ya domina el tema" },
] as const;

export function scoreAnswer(question: Question, optionId: string | null): {
  outcome: Outcome;
  points: number;
  maxPoints: number;
} {
  const maxPoints = POINTS_BY_DIFFICULTY[question.difficulty];
  if (optionId === null) return { outcome: "sin-respuesta", points: 0, maxPoints };

  if (question.kind === "opcion-multiple") {
    const opt = question.options.find((o) => o.id === optionId);
    return opt?.correct
      ? { outcome: "correcta", points: maxPoints, maxPoints }
      : { outcome: "incorrecta", points: 0, maxPoints };
  }
  const opt = question.options.find((o) => o.id === optionId);
  const quality = opt?.quality ?? "riesgosa";
  const outcome: Outcome =
    quality === "responsable" ? "correcta" : quality === "parcial" ? "parcial" : "incorrecta";
  return { outcome, points: Math.round(maxPoints * QUALITY_FACTOR[quality]), maxPoints };
}

/* ---------- Armado de partidas ---------- */

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function availableQuestions(unit: UnitChoice, difficulty: DifficultyChoice): Question[] {
  return QUESTIONS.filter(
    (q) => (unit === "mixta" || q.unitId === unit) && (difficulty === "todas" || q.difficulty === difficulty),
  );
}

/**
 * Selecciona los retos. En partida mixta se alternan unidades
 * (I, II, III, IV, I, …) para asegurar una cobertura equilibrada.
 */
export function pickQuestions(config: GameConfig, random: () => number = Math.random): Question[] {
  const pool = availableQuestions(config.unit, config.difficulty);
  if (config.unit !== "mixta") return shuffle(pool, random).slice(0, config.length);

  const byUnit: Record<UnitId, Question[]> = { u1: [], u2: [], u3: [], u4: [] };
  for (const q of shuffle(pool, random)) byUnit[q.unitId].push(q);
  const order = shuffle(["u1", "u2", "u3", "u4"] as UnitId[], random);
  const picked: Question[] = [];
  while (picked.length < config.length && order.some((u) => byUnit[u].length > 0)) {
    for (const u of order) {
      const next = byUnit[u].shift();
      if (next && picked.length < config.length) picked.push(next);
    }
  }
  return picked;
}

export function createSession(config: GameConfig, random: () => number = Math.random): GameSession {
  const questions = pickQuestions(config, random);
  const players = config.mode === "pasa" ? Math.max(2, config.players) : 1;
  return {
    id: `${Date.now().toString(36)}-${Math.floor(random() * 1e6).toString(36)}`,
    config: { ...config, players },
    items: questions.map((q, i) => ({
      questionId: q.id,
      optionOrder: shuffle(
        q.options.map((o) => o.id),
        random,
      ),
      player: (i % players) + 1,
    })),
    index: 0,
    phase: players > 1 ? "handoff" : "question",
    selected: null,
    answers: [],
  };
}

/* ---------- Transiciones ---------- */

export type GameAction =
  | { type: "ready" }
  | { type: "select"; optionId: string }
  | { type: "confirm" }
  | { type: "timeout" }
  | { type: "next" };

export function reduceSession(session: GameSession, action: GameAction): GameSession {
  const item = session.items[session.index];
  if (!item) return session;
  const question = QUESTION_BY_ID[item.questionId];

  switch (action.type) {
    case "ready":
      return session.phase === "handoff" ? { ...session, phase: "question" } : session;
    case "select":
      return session.phase === "question" ? { ...session, selected: action.optionId } : session;
    case "confirm":
    case "timeout": {
      if (session.phase !== "question") return session;
      const optionId = action.type === "timeout" ? null : session.selected;
      if (action.type === "confirm" && optionId === null) return session;
      const score = scoreAnswer(question, optionId);
      const record: AnswerRecord = {
        questionId: question.id,
        unitId: question.unitId,
        topic: question.topic,
        optionId,
        player: item.player,
        ...score,
      };
      return { ...session, phase: "feedback", selected: optionId, answers: [...session.answers, record] };
    }
    case "next": {
      if (session.phase !== "feedback") return session;
      const index = session.index + 1;
      const multi = session.config.players > 1;
      return { ...session, index, selected: null, phase: multi ? "handoff" : "question" };
    }
  }
}

export function isFinished(session: GameSession): boolean {
  return session.index >= session.items.length;
}

/* ---------- Resúmenes ---------- */

export interface Tally {
  points: number;
  maxPoints: number;
  correct: number;
  partial: number;
  incorrect: number;
  total: number;
}

const emptyTally = (): Tally => ({ points: 0, maxPoints: 0, correct: 0, partial: 0, incorrect: 0, total: 0 });

function add(t: Tally, a: AnswerRecord) {
  t.points += a.points;
  t.maxPoints += a.maxPoints;
  t.total += 1;
  if (a.outcome === "correcta") t.correct += 1;
  else if (a.outcome === "parcial") t.partial += 1;
  else t.incorrect += 1;
}

export function summarize(answers: AnswerRecord[]) {
  const total = emptyTally();
  const byUnit: Partial<Record<UnitId, Tally>> = {};
  const byTopic = new Map<string, Tally & { unitId: UnitId }>();
  const byPlayer = new Map<number, Tally>();

  for (const a of answers) {
    add(total, a);
    add((byUnit[a.unitId] ??= emptyTally()), a);
    if (!byTopic.has(a.topic)) byTopic.set(a.topic, { ...emptyTally(), unitId: a.unitId });
    add(byTopic.get(a.topic)!, a);
    if (!byPlayer.has(a.player)) byPlayer.set(a.player, emptyTally());
    add(byPlayer.get(a.player)!, a);
  }

  /** Temas con al menos una respuesta no correcta, de peor a mejor. */
  const toReview = [...byTopic.entries()]
    .filter(([, t]) => t.correct < t.total)
    .sort((a, b) => a[1].points / a[1].maxPoints - b[1].points / b[1].maxPoints)
    .map(([topic, t]) => ({ topic, unitId: t.unitId, tally: t }));

  return { total, byUnit, byTopic, byPlayer, toReview };
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
