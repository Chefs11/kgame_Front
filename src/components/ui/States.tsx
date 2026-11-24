import Link from "next/link";
import type { ReactNode } from "react";
import { PixelIcon, type PixelIconName } from "../retro/PixelIcon";

/** Estado vacío: explica qué falta y ofrece una acción. */
export function EmptyState({
  title,
  children,
  action,
  icon = "folder",
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: PixelIconName;
}) {
  return (
    <div className="state-box">
      <PixelIcon name={icon} className="state-box__icon" />
      <h2 className="state-box__title">{title}</h2>
      {children && <div className="state-box__text">{children}</div>}
      {action && <div className="btn-row">{action}</div>}
    </div>
  );
}

/** Estado de error con mensaje amigable. */
export function ErrorState({
  title,
  children,
  action,
  code,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  code?: string;
}) {
  return (
    <div className="state-box state-box--error" role="alert">
      <PixelIcon name="error" className="state-box__icon" />
      <h2 className="state-box__title">{title}</h2>
      {code && <p className="state-box__text">Código: {code}</p>}
      {children && <div className="state-box__text">{children}</div>}
      {action && <div className="btn-row">{action}</div>}
    </div>
  );
}

/** Aviso informativo (p. ej. qué se guarda en el dispositivo). */
export function Notice({
  children,
  icon = "info",
  variant = "info",
}: {
  children: ReactNode;
  icon?: PixelIconName;
  variant?: "info" | "review";
}) {
  return (
    <div className={`notice${variant === "review" ? " notice--review" : ""}`}>
      <PixelIcon name={icon} className="notice__icon" />
      <div>{children}</div>
    </div>
  );
}

/** Enlace de regreso. */
export function BackLink({ href, children = "Regresar" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="back-link">
      <PixelIcon name="arrowLeft" />
      {children}
    </Link>
  );
}
