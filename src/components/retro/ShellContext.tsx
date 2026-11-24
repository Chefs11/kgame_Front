"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Estado del "sistema operativo": ventana maximizada y qué icono abrió la
 * ventana actual (para devolverle el foco al cerrarla).
 */
interface ShellValue {
  maximized: boolean;
  toggleMaximized: () => void;
  /** Guarda el destino del icono o acceso que abrió una ventana. */
  rememberOpener: (href: string) => void;
  /** Pide devolver el foco al icono que abrió la ventana que se está cerrando. */
  requestFocusReturn: () => void;
  /** Devuelve (y consume) el destino al que hay que regresar el foco, si hay uno pendiente. */
  takeFocusReturn: () => string | null;
}

const ShellContext = createContext<ShellValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [maximized, setMaximized] = useState(false);
  const opener = useRef<string | null>(null);
  const pending = useRef(false);
  const toggleMaximized = useCallback(() => setMaximized((m) => !m), []);
  const rememberOpener = useCallback((href: string) => {
    opener.current = href;
  }, []);
  const requestFocusReturn = useCallback(() => {
    pending.current = true;
  }, []);
  const takeFocusReturn = useCallback(() => {
    if (!pending.current) return null;
    pending.current = false;
    return opener.current;
  }, []);
  const value = useMemo(
    () => ({ maximized, toggleMaximized, rememberOpener, requestFocusReturn, takeFocusReturn }),
    [maximized, toggleMaximized, rememberOpener, requestFocusReturn, takeFocusReturn],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell debe usarse dentro de <ShellProvider>");
  return ctx;
}
