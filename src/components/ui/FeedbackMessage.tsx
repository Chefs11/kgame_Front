import type { ReactNode } from "react";
import { PixelIcon } from "../retro/PixelIcon";

export type FeedbackVariant = "correct" | "partial" | "incorrect" | "timeout";

const ICON = { correct: "check", partial: "half", incorrect: "close", timeout: "clock" } as const;

/** Mensaje de retroalimentación con encabezado y bloques explicativos. */
export function FeedbackMessage({
  variant,
  title,
  points,
  children,
}: {
  variant: FeedbackVariant;
  title: string;
  points?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="feedback" data-variant={variant}>
      <header className="feedback__head">
        <PixelIcon name={ICON[variant]} className="feedback__icon" />
        <h2 className="feedback__title">{title}</h2>
        {points !== undefined && <span className="feedback__points">{points}</span>}
      </header>
      <div className="feedback__body">{children}</div>
    </section>
  );
}

/** Bloque con título pequeño dentro de la retroalimentación. */
export function FeedbackBlock({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  /** `basis` resalta el fundamento ético o legal. */
  variant?: "default" | "basis";
}) {
  return (
    <div className={`feedback-block${variant === "basis" ? " feedback-block--basis" : ""}`}>
      <h3 className="feedback-block__title">{title}</h3>
      {typeof children === "string" ? <p>{children}</p> : children}
    </div>
  );
}
