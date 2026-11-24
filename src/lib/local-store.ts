"use client";

import { useSyncExternalStore } from "react";

/**
 * Almacén pequeño sobre `localStorage` / `sessionStorage`, pensado para
 * `useSyncExternalStore`. En el servidor y en la primera hidratación devuelve
 * los valores por defecto, así que el HTML inicial siempre coincide.
 *
 * Si el navegador bloquea el almacenamiento (modo privado, permisos), el
 * juego sigue funcionando en memoria.
 */
export interface LocalStore<T> {
  get: () => T;
  getServer: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  reset: () => void;
  subscribe: (listener: () => void) => () => void;
}

export function createLocalStore<T>(options: {
  key: string;
  defaults: T;
  storage?: "local" | "session";
  /** Valida y completa datos guardados con una versión anterior. */
  parse?: (raw: unknown) => T;
}): LocalStore<T> {
  const { key, defaults, storage = "local" } = options;
  const parse = options.parse ?? ((raw: unknown) => ({ ...defaults, ...(raw as object) }) as T);
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  function area(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
      return storage === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  function read(): T {
    if (cache !== undefined) return cache;
    const s = area();
    if (!s) {
      cache = defaults;
      return cache;
    }
    try {
      const raw = s.getItem(key);
      cache = raw === null ? defaults : parse(JSON.parse(raw));
    } catch {
      cache = defaults;
    }
    return cache;
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function write(value: T | null) {
    const s = area();
    if (!s) return;
    try {
      if (value === null) s.removeItem(key);
      else s.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento lleno o bloqueado: se mantiene en memoria */
    }
  }

  return {
    get: read,
    getServer: () => defaults,
    set(next) {
      const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
      cache = value;
      write(value);
      emit();
    },
    reset() {
      cache = defaults;
      write(null);
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cache = undefined;
          listener();
        }
      };
      if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}
