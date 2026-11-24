"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

export type SubmitState = "idle" | "processing" | "success" | "error";

/**
 * Botón de envío con estados de reposo, procesando, éxito y error.
 * La acción puede ser síncrona o asíncrona (p. ej. una futura llamada al backend).
 */
export function SubmitButton({
  action,
  labels,
  variant = "primary",
  confirmMessage,
  confirmLabel = "Continuar",
}: {
  action: () => void | Promise<void>;
  labels: { idle: string; processing: string; success: string; error: string };
  variant?: "primary" | "secondary" | "danger";
  /** Si se indica, pide confirmación antes de ejecutar. */
  confirmMessage?: string;
  /** Texto del botón que confirma (usa el verbo de la acción). */
  confirmLabel?: string;
}) {
  const [state, setState] = useState<SubmitState>("idle");
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function run() {
    setConfirming(false);
    setState("processing");
    try {
      await action();
      setState("success");
    } catch {
      setState("error");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2500);
  }

  if (confirming && confirmMessage) {
    return (
      <div className="stack" style={{ gap: "var(--sp-2)" }} role="group" aria-label="Confirmación">
        <p className="submit-status" style={{ margin: 0 }}>
          {confirmMessage}
        </p>
        <div className="btn-row">
          <Button variant={variant} size="sm" onClick={run}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
            Conservar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cluster">
      <Button
        variant={variant}
        data-state={state}
        aria-busy={state === "processing"}
        disabled={state === "processing"}
        onClick={() => (confirmMessage ? setConfirming(true) : run())}
      >
        {state === "success" || state === "error" ? labels.idle : labels[state]}
      </Button>
      <span className="submit-status" data-state={state} role="status">
        {state === "success" ? labels.success : state === "error" ? labels.error : ""}
      </span>
    </div>
  );
}
