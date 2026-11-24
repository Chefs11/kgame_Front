import type { ReactNode } from "react";
import { UNIT_BY_ID } from "@/content/units";
import type { UnitId } from "@/content/types";

/** Etiqueta y valor. `inline` = fila; por defecto, bloque con valor grande. */
export function LabelValue({
  label,
  value,
  inline = false,
}: {
  label: ReactNode;
  value: ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={`label-value${inline ? " label-value--inline" : ""}`}>
      <dt className="label-value__label">{label}</dt>
      <dd className="label-value__value" style={{ margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}

/** Etiqueta de categoría genérica. */
export function Tag({
  children,
  variant = "outline",
}: {
  children: ReactNode;
  variant?: "outline" | "solid" | "dim" | "alert";
}) {
  return <span className={`tag${variant === "outline" ? "" : ` tag--${variant}`}`}>{children}</span>;
}

/** Etiqueta de unidad o de partida mixta. */
export function UnitTag({ unitId, long = false }: { unitId: UnitId | "mixta"; long?: boolean }) {
  if (unitId === "mixta") return <Tag variant="solid">Mixta (unidades I a IV)</Tag>;
  const unit = UNIT_BY_ID[unitId];
  return <Tag variant="solid">{long ? `Unidad ${unit.numeral}: ${unit.shortTitle}` : `Unidad ${unit.numeral}`}</Tag>;
}

/** Indicador de progreso por celdas, p. ej. "Pregunta 3 de 10". */
export function ProgressIndicator({
  current,
  total,
  label = "Pregunta",
  done,
}: {
  /** Número (1-based) del elemento actual. */
  current: number;
  total: number;
  label?: string;
  /** Cuántos están completos (por defecto, current - 1). */
  done?: number;
}) {
  const completed = done ?? current - 1;
  const text = `${label} ${current} de ${total}`;
  return (
    <div className="progress">
      <div className="progress__label">
        <span>
          {label} <strong>{current}</strong> de {total}
        </span>
        <span>{completed === 1 ? "1 resuelto" : `${completed} resueltos`}</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={text}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        {total <= 24 ? (
          Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className="progress__cell"
              data-state={i < completed ? "done" : i === current - 1 ? "current" : "todo"}
            />
          ))
        ) : (
          <span className="progress__bar" style={{ width: `${(completed / total) * 100}%` }} />
        )}
      </div>
    </div>
  );
}

/** Barra simple de porcentaje. */
export function Meter({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="meter">
      <div className="meter__track" role="img" aria-label={`${label}: ${v}%`}>
        <div className="meter__fill" style={{ width: `${v}%` }} />
      </div>
      <span className="meter__value">{v}%</span>
    </div>
  );
}
