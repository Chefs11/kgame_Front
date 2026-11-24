import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { PixelIcon, type PixelIconName } from "../retro/PixelIcon";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface BaseProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  icon?: PixelIconName;
  /** Atajo de teclado mostrado dentro del botón, p. ej. "Enter". */
  shortcut?: string;
  block?: boolean;
  children: ReactNode;
}

function classes({ variant = "primary", size = "md", block }: BaseProps, extra?: string) {
  return ["btn", `btn--${variant}`, size === "sm" && "btn--sm",
    size === "lg" && "btn--lg", block && "btn--block", extra]
    .filter(Boolean)
    .join(" ");
}

function Inner({ icon, shortcut, children }: BaseProps) {
  return (
    <>
      {icon && <PixelIcon name={icon} className="btn__icon" />}
      <span>{children}</span>
      {shortcut && (
        <kbd className="btn__shortcut" aria-label={`atajo: ${shortcut}`}>
          {shortcut}
        </kbd>
      )}
    </>
  );
}

/** Botón principal o secundario con apariencia de tecla física. */
export function Button({
  variant,
  size,
  icon,
  shortcut,
  block,
  children,
  className,
  type = "button",
  ...rest
}: BaseProps & Omit<ComponentPropsWithRef<"button">, "children">) {
  const base = { variant, size, icon, shortcut, block, children };
  return (
    <button type={type} className={classes(base, className)} {...rest}>
      <Inner {...base} />
    </button>
  );
}

/** El mismo botón, pero como enlace de navegación. */
export function ButtonLink({
  href,
  variant,
  size,
  icon,
  shortcut,
  block,
  children,
  className,
  ...rest
}: BaseProps & { href: string } & Omit<ComponentPropsWithRef<typeof Link>, "children" | "href">) {
  const base = { variant, size, icon, shortcut, block, children };
  return (
    <Link href={href} className={classes(base, className)} {...rest}>
      <Inner {...base} />
    </Link>
  );
}
