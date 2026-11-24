"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState, type MouseEvent, type ReactNode } from "react";
import { getScreen, type Crumb } from "@/content/apps";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { useShell } from "./ShellContext";

export interface WindowProps {
  /** Título editable. Por defecto se toma del registro de pantallas. */
  title?: string;
  icon?: PixelIconName;
  /** Ruta de la ventana. Por defecto, la del registro (Escritorio / …). */
  crumbs?: Crumb[];
  /** Barra de estado: texto a la izquierda y, opcionalmente, a la derecha. */
  status?: ReactNode;
  statusEnd?: ReactNode;
  /** Cierre: `onClose` ejecuta una acción; `closeHref` navega (por defecto, a la pantalla padre). */
  onClose?: () => void;
  closeHref?: string;
  closeLabel?: string;
  /** `main` = ventana principal; `background` = inactiva; `dialog` = cuadro de diálogo. */
  variant?: "main" | "background" | "dialog";
  /** Muestra el botón funcional de maximizar (solo en ventanas principales). */
  maximizable?: boolean;
  /** Bloquea la interacción con el contenido (p. ej. mientras hay un diálogo abierto). */
  inertBody?: boolean;
  children: ReactNode;
  /** Contenido que se dibuja encima del cuerpo (diálogos). */
  overlay?: ReactNode;
}

/**
 * Ventana reutilizable. La barra de título, la ruta y la barra de estado
 * quedan fijas; solo el contenido se desplaza. Solo hay controles que
 * funcionan: maximizar/restaurar y cerrar.
 */
export function Window({
  title,
  icon,
  crumbs,
  status,
  statusEnd,
  onClose,
  closeHref,
  closeLabel,
  variant = "main",
  maximizable = variant === "main",
  inertBody = false,
  children,
  overlay,
}: WindowProps) {
  const pathname = usePathname();
  const screen = getScreen(pathname);
  const { maximized, toggleMaximized, requestFocusReturn } = useShell();
  const router = useRouter();
  const titleId = useId();
  const [closing, setClosing] = useState(false);

  // Cerrar: estado presionado inmediato, fundido corto y luego se navega.
  const closeWithFade = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (closing) return;
    setClosing(true);
    requestFocusReturn();
    window.setTimeout(() => {
      router.push(href);
      setClosing(false);
    }, 120);
  };

  const resolvedTitle = title ?? screen.windowTitle;
  const resolvedIcon = icon ?? screen.icon;
  const resolvedCrumbs = crumbs ?? (variant === "main" ? screen.crumbs : undefined);
  const closeText = closeLabel ?? `Cerrar ${resolvedTitle}`;
  const href = closeHref ?? screen.parentHref;

  const Tag = variant === "background" ? "aside" : "section";

  return (
    <Tag
      className={`window window--${variant}`}
      data-active={variant !== "background"}
      data-maximized={variant === "main" && (maximized || !maximizable) ? true : undefined}
      data-closing={closing || undefined}
      aria-labelledby={titleId}
      role={variant === "dialog" ? "dialog" : undefined}
      aria-modal={variant === "dialog" ? true : undefined}
    >
      <header className="window__titlebar">
        <PixelIcon name={resolvedIcon} className="window__icon" />
        <p className="window__title" id={titleId}>
          {resolvedTitle}
        </p>
        {variant !== "background" && (
          <div className="window__controls">
            {maximizable && (
              <button
                type="button"
                className="window__btn window__btn--max"
                aria-pressed={maximized}
                aria-label={maximized ? "Restaurar tamaño de la ventana" : "Maximizar ventana"}
                title={maximized ? "Restaurar tamaño" : "Maximizar"}
                onClick={toggleMaximized}
              >
                <PixelIcon name={maximized ? "restore" : "maximize"} />
              </button>
            )}
            {onClose ? (
              <button type="button" className="window__btn" aria-label={closeText} title={closeText} onClick={onClose}>
                <PixelIcon name="close" />
              </button>
            ) : (
              <Link href={href} className="window__btn" aria-label={closeText} title={closeText} onClick={closeWithFade}>
                <PixelIcon name="close" />
              </Link>
            )}
          </div>
        )}
      </header>

      {resolvedCrumbs && resolvedCrumbs.length > 0 && (
        <nav className="window__path" aria-label="Ubicación">
          <ol>
            {resolvedCrumbs.map((c, i) => {
              const last = i === resolvedCrumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`}>
                  {c.href && !last ? (
                    <Link href={c.href} className="window__crumb">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="window__crumb" aria-current={last ? "page" : undefined}>
                      {c.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div
        className="window__body"
        tabIndex={variant === "main" ? 0 : undefined}
        role={variant === "main" ? "region" : undefined}
        aria-label={variant === "main" ? resolvedTitle : undefined}
        inert={inertBody}
      >
        {children}
      </div>

      {(status || statusEnd) && (
        <footer className="statusbar" inert={inertBody}>
          <span className="statusbar__item">{status}</span>
          {statusEnd && <span className="statusbar__item statusbar__item--end">{statusEnd}</span>}
        </footer>
      )}

      {overlay}
    </Tag>
  );
}
