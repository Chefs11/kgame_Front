"use client";

import { createLocalStore, useLocalStore } from "./local-store";

export type MonitorView = "desk" | "near";
export type MotionPreference = "system" | "reduce";

export interface Settings {
  /** Sonido apagado por defecto. */
  sound: boolean;
  view: MonitorView;
  /** Modo simple: apaga los efectos CRT (scanlines, halo, reflejos, parpadeo). */
  simple: boolean;
  motion: MotionPreference;
  /** Guardar resultados de partidas en este dispositivo. */
  saveProgress: boolean;
  /** Volumen general del audio (0–1). */
  volume: number;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: false,
  view: "near",
  simple: false,
  motion: "system",
  saveProgress: true,
  volume: 0.7,
};

export const settingsStore = createLocalStore<Settings>({
  key: "kgame.settings.v1",
  defaults: DEFAULT_SETTINGS,
  parse(raw) {
    const r = (raw ?? {}) as Partial<Settings>;
    return {
      sound: typeof r.sound === "boolean" ? r.sound : DEFAULT_SETTINGS.sound,
      view: r.view === "desk" ? "desk" : "near",
      // `presentation` es el nombre anterior del ajuste (v0.1); se migra a `simple`.
      simple: r.simple === true || (r as { presentation?: boolean }).presentation === true,
      motion: r.motion === "reduce" ? "reduce" : "system",
      saveProgress: r.saveProgress !== false,
      volume: typeof r.volume === "number" && r.volume >= 0 && r.volume <= 1 ? r.volume : DEFAULT_SETTINGS.volume,
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
