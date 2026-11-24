"use client";

import type { GameResult } from "./game-engine";
import { createLocalStore, useLocalStore } from "./local-store";

/**
 * Progreso local: solo se guardan resultados de partidas en este navegador
 * (`localStorage`). No se guardan nombres ni datos personales, y nada se
 * envía a un servidor.
 */
export interface ProgressData {
  version: 1;
  games: GameResult[];
}

const MAX_GAMES = 30;

export const PROGRESS_STORAGE_KEY = "kgame.progress.v1";

export const progressStore = createLocalStore<ProgressData>({
  key: PROGRESS_STORAGE_KEY,
  defaults: { version: 1, games: [] },
  parse(raw) {
    const r = raw as Partial<ProgressData> | null;
    if (!r || r.version !== 1 || !Array.isArray(r.games)) return { version: 1, games: [] };
    return { version: 1, games: r.games.filter((g) => g && Array.isArray(g.answers)) };
  },
});

export function useProgress(): ProgressData {
  return useLocalStore(progressStore);
}

export function saveGameResult(result: GameResult) {
  progressStore.set((prev) => ({
    version: 1,
    games: [result, ...prev.games.filter((g) => g.id !== result.id)].slice(0, MAX_GAMES),
  }));
}

export function clearProgress() {
  progressStore.reset();
}
