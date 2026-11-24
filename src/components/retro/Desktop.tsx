"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { APPS, getScreen } from "@/content/apps";
import { DesktopIcon } from "./DesktopIcon";
import { useShell } from "./ShellContext";
import { Taskbar } from "./Taskbar";

/**
 * Escritorio del sistema: fondo, rejilla de iconos, área de ventanas y barra
 * de tareas. En "/" no hay ventana: el escritorio es la portada del juego.
 * Se adapta con container queries al ancho real de la pantalla del monitor.
 */
export function Desktop({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const screen = getScreen(pathname);
  const { maximized, takeFocusReturn } = useShell();

  // Al cerrar una ventana, el foco regresa al icono o acceso que la abrió.
  useEffect(() => {
    const href = takeFocusReturn();
    if (!href) return;
    const target = document.querySelector<HTMLElement>(
      `.desk-icon[href="${href}"], .task-key[href="${href}"]`,
    );
    target?.focus({ preventScroll: true });
  }, [pathname, takeFocusReturn]);
  const isHome = screen.id === "inicio";
  // La partida siempre usa todo el escritorio (modo enfoque).
  const focusMode = screen.id === "partida";
  const fill = !isHome && (maximized || focusMode);
  const showBackground = !isHome && !fill;

  return (
    <div className="desktop" data-mode={isHome ? "home" : "window"} data-maximized={fill}>
      <div className="desktop__main">
        <nav aria-label="Iconos del escritorio" className="desktop__nav">
          <ul className="desktop__icons">
            {APPS.map((app) => (
              <li key={app.id}>
                <DesktopIcon label={app.label} icon={app.icon} href={app.href} active={screen.appId === app.id} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="desktop__windows" data-with-background={showBackground}>
          {showBackground && (
            <aside className="window window--background" aria-label="Nota del sistema">
              <div className="window__titlebar">
                <p className="window__title">Nota.txt</p>
              </div>
              <div className="window__body">
                <p>Lee el fundamento aunque aciertes: es lo que más te servirá en el examen.</p>
              </div>
            </aside>
          )}
          {children}
        </div>
      </div>

      <Taskbar screen={screen} isHome={isHome} />
    </div>
  );
}
