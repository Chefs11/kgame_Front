"use client";

import Link from "next/link";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { useShell } from "./ShellContext";

interface DesktopIconProps {
  /** Etiqueta editable bajo el icono. */
  label: string;
  icon: PixelIconName;
  /** Destino de navegación. */
  href: string;
  active?: boolean;
}

/**
 * Icono de escritorio. Toda el área (icono + etiqueta) es clicable y se abre
 * con un solo clic, toque o Enter.
 */
export function DesktopIcon({ label, icon, href, active = false }: DesktopIconProps) {
  const { rememberOpener } = useShell();
  return (
    <Link
      href={href}
      className="desk-icon"
      aria-current={active ? "page" : undefined}
      onClick={() => rememberOpener(href)}
    >
      <PixelIcon name={icon} className="desk-icon__glyph" />
      <span className="desk-icon__label">{label}</span>
    </Link>
  );
}
