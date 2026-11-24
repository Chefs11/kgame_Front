"use client";

import type { ReactNode } from "react";
import { GameProvider } from "@/lib/game-context";
import { Desktop } from "./Desktop";
import { MonitorFrame } from "./MonitorFrame";
import { ShellProvider } from "./ShellContext";

/** Composición completa: monitor → escritorio → ventana de la pantalla actual. */
export function RetroShell({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <ShellProvider>
        <MonitorFrame>
          <Desktop>{children}</Desktop>
        </MonitorFrame>
      </ShellProvider>
    </GameProvider>
  );
}
