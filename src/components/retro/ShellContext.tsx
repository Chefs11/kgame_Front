"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Estado del "sistema operativo": si la ventana activa está maximizada
 * (ocupa todo el escritorio y oculta los iconos).
 */
interface ShellValue {
  maximized: boolean;
  toggleMaximized: () => void;
}

const ShellContext = createContext<ShellValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [maximized, setMaximized] = useState(false);
  const toggleMaximized = useCallback(() => setMaximized((m) => !m), []);
  const value = useMemo(() => ({ maximized, toggleMaximized }), [maximized, toggleMaximized]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell debe usarse dentro de <ShellProvider>");
  return ctx;
}
