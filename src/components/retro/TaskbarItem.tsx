"use client";

import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { useShell } from "./ShellContext";

interface CommonProps {
  icon?: PixelIconName;
  /** Nombre del acceso. Si no se muestra, se usa como nombre accesible y tooltip. */
  label: string;
  showLabel?: boolean;
  active?: boolean;
  className?: string;
}

/** Acceso anclado (tecla cuadrada): navega a una pantalla. */
export function TaskbarLink({ href, icon, label, showLabel, active, className }: CommonProps & { href: string }) {
  const { rememberOpener } = useShell();
  return (
    <Link
      href={href}
      onClick={() => rememberOpener(href)}
      className={`task-key ${className ?? ""}`}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      {icon && <PixelIcon name={icon} className="task-key__icon" />}
      {showLabel ? <span className="task-key__label">{label}</span> : <span className="visually-hidden">{label}</span>}
    </Link>
  );
}

/** Botón de la barra (menú, sonido): ejecuta una acción. */
export function TaskbarButton({
  icon,
  label,
  showLabel,
  active,
  className,
  ...rest
}: CommonProps & Omit<ComponentPropsWithRef<"button">, "children">) {
  return (
    <button
      type="button"
      className={`task-key ${className ?? ""}`}
      data-active={active || undefined}
      title={label}
      {...rest}
    >
      {icon && <PixelIcon name={icon} className="task-key__icon" />}
      {showLabel ? <span className="task-key__label">{label}</span> : <span className="visually-hidden">{label}</span>}
    </button>
  );
}

/** Pestaña de la ventana activa: bloque de fósforo con el título. */
export function TaskbarTab({ label }: { label: string }) {
  return (
    <span className="task-tab">
      <span className="visually-hidden">Ventana abierta: </span>
      {label}
    </span>
  );
}
