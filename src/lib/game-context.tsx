"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  createSession,
  isFinished,
  reduceSession,
  type GameAction,
  type GameConfig,
  type GameResult,
  type GameSession,
} from "./game-engine";
import { saveGameResult } from "./progress";
import { settingsStore } from "./settings";

/**
 * Estado de la partida en curso (en memoria). El resultado final se guarda
 * en el dispositivo solo si el ajuste "Guardar progreso" está activo.
 */
interface GameContextValue {
  session: GameSession | null;
  lastResult: GameResult | null;
  /** Última configuración usada, para "Volver a jugar". */
  lastConfig: GameConfig | null;
  start: (config: GameConfig) => GameSession;
  dispatch: (action: GameAction) => void;
  /** Cierra la partida y devuelve el resultado (o null si no hubo respuestas). */
  finish: () => GameResult | null;
  abandon: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [lastConfig, setLastConfig] = useState<GameConfig | null>(null);

  const start = useCallback((config: GameConfig) => {
    const s = createSession(config);
    setSession(s);
    setLastConfig(config);
    return s;
  }, []);

  const dispatch = useCallback((action: GameAction) => {
    setSession((s) => (s ? reduceSession(s, action) : s));
  }, []);

  const finish = useCallback(() => {
    if (!session || session.answers.length === 0) {
      setSession(null);
      return null;
    }
    const result: GameResult = {
      id: session.id,
      finishedAt: new Date().toISOString(),
      config: session.config,
      answers: session.answers,
    };
    setLastResult(result);
    setSession(null);
    if (settingsStore.get().saveProgress) saveGameResult(result);
    return result;
  }, [session]);

  const abandon = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({ session, lastResult, lastConfig, start, dispatch, finish, abandon }),
    [session, lastResult, lastConfig, start, dispatch, finish, abandon],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return ctx;
}

export { isFinished };
