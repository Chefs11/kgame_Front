import type { ReactNode } from "react";

/** Encabezado de pantalla: título pixelado, etiquetas y subtítulo. */
export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  size = "lg",
  as: Tag = "h1",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  size?: "lg" | "xl";
  as?: "h1" | "h2";
}) {
  return (
    <header className="screen-header">
      {eyebrow && <div className="screen-header__eyebrow">{eyebrow}</div>}
      <Tag className={`screen-header__title${size === "xl" ? " screen-header__title--xl" : ""}`}>{title}</Tag>
      {subtitle && <p className="screen-header__subtitle">{subtitle}</p>}
    </header>
  );
}

/** Encabezado de sección con línea punteada. */
export function SectionHeader({
  title,
  aside,
  id,
  as: Tag = "h2",
}: {
  title: ReactNode;
  aside?: ReactNode;
  id?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className="section-header">
      <Tag className="section-header__title" id={id}>
        {title}
      </Tag>
      <span className="section-header__rule" aria-hidden="true" />
      {aside && <span className="section-header__aside">{aside}</span>}
    </div>
  );
}

/** Separador horizontal punteado. */
export function Divider() {
  return <hr className="divider" />;
}
