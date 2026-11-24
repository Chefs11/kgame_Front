"use client";

import { clearProgress } from "@/lib/progress";
import { SubmitButton } from "../ui/SubmitButton";

/** Borra el progreso guardado en este navegador, con confirmación. */
export function ClearProgressButton() {
  return (
    <SubmitButton
      variant="danger"
      confirmMessage="¿Borrar todos los resultados guardados en este navegador? No se puede deshacer."
      confirmLabel="Borrar progreso"
      action={() => clearProgress()}
      labels={{
        idle: "Borrar progreso",
        processing: "Borrando…",
        success: "Progreso borrado. Empiezas desde cero.",
        error: "No se pudo borrar. Revisa que tu navegador permita guardar datos del sitio e inténtalo de nuevo.",
      }}
    />
  );
}
