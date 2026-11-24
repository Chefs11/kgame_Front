"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { APPS, type ScreenInfo } from "@/content/apps";
import { useProgress } from "@/lib/progress";
import { updateSettings, useSettings } from "@/lib/settings";
import { playSound } from "@/lib/sound";
import { Clock } from "./Clock";
import { PixelIcon } from "./PixelIcon";
import { TaskbarButton, TaskbarLink, TaskbarTab } from "./TaskbarItem";

interface TaskbarProps {
  screen: ScreenInfo;
  isHome: boolean;
}

/**
 * Barra de tareas: accesos anclados (se reducen en pantallas angostas),
 * pestaña de la ventana activa, mensaje del sistema, sonido y reloj.
 * En teléfono aparece «Menú» con todas las secciones.
 */
export function Taskbar({ screen, isHome }: TaskbarProps) {
  const { sound, saveProgress, simple, motion } = useSettings();
  const { games } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  const toggleSound = () => {
    updateSettings({ sound: !sound });
    if (!sound) window.setTimeout(() => playSound("click"), 0);
  };

  const pinned = APPS.filter((a) => a.id !== "inicio").sort((a, b) => a.pinPriority - b.pinPriority);
  const ticker = isHome
    ? "Abre un icono o elige una acción para empezar."
    : saveProgress
    ? `Perfil local: invitado. ${games.length === 1 ? "1 partida guardada" : `${games.length} partidas guardadas`} en este navegador.`
    : "Perfil local: invitado. El guardado de resultados está desactivado.";

  return (
    <>
      {menuOpen && (
        <div className="start-menu" id={menuId} ref={menuRef} role="dialog" aria-label="Todas las secciones">
          <p className="start-menu__title">Secciones</p>
          <ul className="start-menu__list">
            {APPS.map((app) => (
              <li key={app.id}>
                <Link
                  href={app.href}
                  className="start-menu__link"
                  aria-current={screen.appId === app.id ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <PixelIcon name={app.icon} className="start-menu__icon" />
                  {app.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="start-menu__title start-menu__title--sub">Ajustes</p>
          <div className="start-menu__settings">
            <button
              type="button"
              className="start-menu__toggle"
              aria-pressed={simple}
              onClick={() => updateSettings({ simple: !simple })}
            >
              <PixelIcon name="presentation" className="start-menu__icon" />
              Modo simple (sin efectos CRT)
            </button>
            <button
              type="button"
              className="start-menu__toggle"
              aria-pressed={motion === "reduce"}
              onClick={() => updateSettings({ motion: motion === "reduce" ? "system" : "reduce" })}
            >
              <PixelIcon name="motion" className="start-menu__icon" />
              Reducir movimiento
            </button>
          </div>
        </div>
      )}

      <nav className="taskbar" aria-label="Barra de tareas">
        <TaskbarButton
          ref={buttonRef}
          className="task-key--menu"
          icon="menu"
          label="Menú"
          showLabel
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          aria-haspopup="dialog"
          onClick={() => setMenuOpen((v) => !v)}
        />

        <ul className="taskbar__pins" aria-label="Accesos anclados">
          <li data-priority={1}>
            <TaskbarLink href="/" icon="home" label="Escritorio" active={isHome} />
          </li>
          {pinned.map((app) => (
            <li key={app.id} data-priority={app.pinPriority}>
              <TaskbarLink href={app.href} icon={app.icon} label={app.label} active={screen.appId === app.id} />
            </li>
          ))}
        </ul>

        <span className="taskbar__sep" aria-hidden="true" />

        <div className="taskbar__tabs">
          {!isHome && <TaskbarTab label={screen.windowTitle} />}
          <p className="taskbar__ticker">{ticker}</p>
        </div>

        <div className="taskbar__tray">
          <TaskbarButton
            icon={sound ? "soundOn" : "soundOff"}
            label={sound ? "Silenciar sonido" : "Activar sonido"}
            aria-pressed={sound}
            onClick={toggleSound}
          />
          <Clock />
        </div>
      </nav>
    </>
  );
}
