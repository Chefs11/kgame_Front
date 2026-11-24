"use client";

import { useSyncExternalStore } from "react";
import { useSettings } from "./settings";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;
}

/** `true` si el sistema o el ajuste del juego piden reducir el movimiento. */
export function useReducedMotion(): boolean {
  const system = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const { motion } = useSettings();
  return system || motion === "reduce";
}
