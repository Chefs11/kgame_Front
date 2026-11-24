"use client";

import { createLocalStore, useLocalStore } from "./local-store";

export type MonitorView = "desk" | "near";
export type MotionPreference = "system" | "reduce";

export interface Settings {
  /** Sonido apagado por defecto. */
  sound: boolean;
  view: MonitorView;
  /** Oculta el cuarto y reduce efectos (scanlines, brillo, curvatura). */
  presentation: boolean;
  motion: MotionPreference;
  /** Guardar resultados de partidas en este dispositivo. */
  saveProgress: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  view: "desk",
  presentation: false,
  motion: "system",
  saveProgress: true,
};

export const settingsStore = createLocalStore<Settings>({
  key: "kgame.settings.v1",
  defaults: DEFAULT_SETTINGS,
  parse(raw) {
    const r = (raw ?? {}) as Partial<Settings>;
    return {
      sound: typeof r.sound === "boolean" ? r.sound : DEFAULT_SETTINGS.sound,
      view: r.view === "near" ? "near" : "desk",
      presentation: r.presentation === true,
      motion: r.motion === "reduce" ? "reduce" : "system",
      saveProgress: r.saveProgress !== false,
    };
  },
});

export function useSettings(): Settings {
  return useLocalStore(settingsStore);
}

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((prev) => ({ ...prev, ...patch }));
}

/** Indica si ya se mostró la animación de encendido en esta sesión del navegador. */
export const bootStore = createLocalStore<{ booted: boolean | null }>({
  key: "kgame.booted.v1",
  storage: "session",
  defaults: { booted: false },
  parse: (raw) => ({ booted: (raw as { booted?: boolean })?.booted === true }),
});

/** Versión de servidor "desconocida" para no mostrar el escritorio antes del encendido. */
export const bootServerSnapshot = { booted: null };
