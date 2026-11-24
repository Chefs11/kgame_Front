"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Temporizador por reto. Se monta de nuevo en cada reto (prop `key`) y se
 * pausa con `running=false`. Al llegar a cero llama a `onExpire` una vez.
 * Es opcional: el jugador decide antes de empezar si lo usa (WCAG 2.2.1).
 */
export function Timer({
  seconds,
  running,
  onExpire,
}: {
  seconds: number;
  running: boolean;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const expire = useRef(onExpire);
  useEffect(() => {
    expire.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && left === 0) expire.current();
  }, [left, running]);

  const warning = left <= 10;
  const announce = left === 10 || left === 5;
  return (
    <div className="timer" data-warning={warning} data-paused={!running && left > 0}>
      <div className="timer__row">
        <span className="timer__label">Tiempo</span>
        <span className="timer__value">{left}s</span>
      </div>
      <div className="timer__track" aria-hidden="true">
        <div className="timer__fill" style={{ width: `${(left / seconds) * 100}%` }} />
      </div>
      <span className="visually-hidden" aria-live="polite">
        {announce ? `Quedan ${left} segundos` : ""}
      </span>
    </div>
  );
}
