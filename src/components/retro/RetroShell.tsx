"use client";

import type { ReactNode } from "react";
import { GameProvider } from "@/lib/game-context";
import { Desktop } from "./Desktop";
import { MonitorFrame } from "./MonitorFrame";
import { ShellProvider } from "./ShellContext";

/** Composición completa: monitor → escritorio → ventana de la pantalla actual. */
export function RetroShell({ children, scenePhoto = false }: { children: ReactNode; scenePhoto?: boolean }) {
  return (
    <GameProvider>
      <ShellProvider>
        <MonitorFrame photo={scenePhoto}>
          <Desktop>{children}</Desktop>
        </MonitorFrame>
      </ShellProvider>
    </GameProvider>
  );
}
