"use client";

import { useSyncExternalStore } from "react";

/** Reloj de la barra de tareas. Se calcula solo en el navegador. */
function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}

function now(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function Clock() {
  const time = useSyncExternalStore(subscribe, now, () => "--:--");
  return (
    <span className="taskbar__clock">
      <span className="visually-hidden">Hora: </span>
      {time}
    </span>
  );
}
