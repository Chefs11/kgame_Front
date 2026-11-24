import type { PixelIconName } from "@/components/retro/PixelIcon";

/**
 * Registro de "aplicaciones" del escritorio: iconos, accesos de la barra de
 * tareas, títulos de ventana y ruta. Cambia aquí etiquetas, iconos o destinos.
 */
export interface AppEntry {
  id: string;
  /** Etiqueta del icono y del acceso anclado. */
  label: string;
  href: string;
  icon: PixelIconName;
  /** Título de la ventana y de la pestaña activa. */
  windowTitle: string;
  /** 1 = siempre visible en la barra; números mayores se ocultan en pantallas angostas. */
  pinPriority: number;
}

export const APPS: AppEntry[] = [
  { id: "inicio", label: "Inicio", href: "/", icon: "home", windowTitle: "Escritorio", pinPriority: 1 },
  { id: "jugar", label: "Jugar", href: "/jugar", icon: "play", windowTitle: "Nueva partida", pinPriority: 2 },
  { id: "unidades", label: "Unidades", href: "/unidades", icon: "folder", windowTitle: "Unidades", pinPriority: 4 },
  { id: "reglas", label: "Reglas", href: "/reglas", icon: "rules", windowTitle: "Reglas", pinPriority: 5 },
  { id: "progreso", label: "Progreso", href: "/progreso", icon: "floppy", windowTitle: "Progreso", pinPriority: 3 },
  { id: "creditos", label: "Créditos", href: "/creditos", icon: "people", windowTitle: "Créditos", pinPriority: 7 },
  { id: "privacidad", label: "Privacidad", href: "/privacidad", icon: "lock", windowTitle: "Privacidad", pinPriority: 8 },
  { id: "ayuda", label: "Ayuda", href: "/ayuda", icon: "help", windowTitle: "Ayuda", pinPriority: 6 },
];

export interface Crumb {
  label: string;
  href?: string;
}

export interface ScreenInfo {
  id: string;
  href: string;
  icon: PixelIconName;
  windowTitle: string;
  /** Ruta mostrada en la ventana; los elementos con href son enlaces. */
  crumbs: Crumb[];
  /** A dónde lleva el botón de cerrar. */
  parentHref: string;
  /** Id del icono de escritorio relacionado (para marcarlo como activo). */
  appId: string;
}

const DESKTOP: Crumb = { label: "Escritorio", href: "/" };

const EXTRA_SCREENS: ScreenInfo[] = [
  {
    id: "partida",
    href: "/jugar/partida",
    icon: "play",
    windowTitle: "Partida",
    crumbs: [DESKTOP, { label: "Jugar", href: "/jugar" }, { label: "Partida" }],
    parentHref: "/jugar",
    appId: "jugar",
  },
  {
    id: "resultados",
    href: "/jugar/resultados",
    icon: "trophy",
    windowTitle: "Resultados",
    crumbs: [DESKTOP, { label: "Jugar", href: "/jugar" }, { label: "Resultados" }],
    parentHref: "/jugar",
    appId: "jugar",
  },
];

export const NOT_FOUND_SCREEN: ScreenInfo = {
  id: "error",
  href: "",
  icon: "error",
  windowTitle: "Error",
  crumbs: [DESKTOP, { label: "Ruta desconocida" }],
  parentHref: "/",
  appId: "",
};

export function getScreen(pathname: string): ScreenInfo {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const app = APPS.find((a) => a.href === clean);
  if (app) {
    return {
      id: app.id,
      href: app.href,
      icon: app.icon,
      windowTitle: app.windowTitle,
      crumbs: app.id === "inicio" ? [DESKTOP] : [DESKTOP, { label: app.label }],
      parentHref: "/",
      appId: app.id,
    };
  }
  return EXTRA_SCREENS.find((s) => s.href === clean) ?? NOT_FOUND_SCREEN;
}
