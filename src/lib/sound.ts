"use client";

import { useCallback } from "react";
import { settingsStore, useSettings } from "./settings";

/**
 * Sonidos generados con Web Audio (sin archivos de terceros).
 * Solo suenan si el jugador activa el sonido; por defecto está apagado.
 */
export type SoundName = "click" | "select" | "correct" | "partial" | "incorrect" | "power";

const PATTERNS: Record<SoundName, Array<[freq: number, ms: number]>> = {
  click: [[880, 30]],
  select: [[660, 40]],
  correct: [
    [660, 80],
    [990, 120],
  ],
  partial: [
    [660, 80],
    [740, 120],
  ],
  incorrect: [
    [330, 120],
    [220, 160],
  ],
  power: [
    [220, 60],
    [440, 60],
    [880, 80],
  ],
};

let ctx: AudioContext | null = null;

export function playSound(name: SoundName) {
  if (!settingsStore.get().sound || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, ms] of PATTERNS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + ms / 1000);
      t += ms / 1000;
    }
  } catch {
    /* audio no disponible: el juego funciona igual sin sonido */
  }
}

export function useSound() {
  const { sound } = useSettings();
  const play = useCallback((name: SoundName) => playSound(name), []);
  return { enabled: sound, play };
}
