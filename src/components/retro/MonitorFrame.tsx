"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { SITE } from "@/content/site";
import { bootServerSnapshot, bootStore, updateSettings, useSettings } from "@/lib/settings";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PixelIcon, type PixelIconName } from "./PixelIcon";
import { RoomScene } from "./RoomScene";

type Phase = "pending" | "booting" | "booting-short" | "on" | "off";

const BOOT_MS = 2000;
const SHORT_BOOT_MS = 650;

function DockButton({
  icon,
  label,
  pressed,
  onClick,
  disabled,
}: {
  icon: PixelIconName;
  label: string;
  pressed: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="dock__btn"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      <PixelIcon name={icon} />
      <span className="dock__tip" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}

/**
 * Marco reutilizable: cuarto con luz cálida, monitor CRT beige, pantalla con
 * efectos sutiles, botón de encendido con LED y panel de vista.
 */
export function MonitorFrame({ children, photo = false }: { children: ReactNode; photo?: boolean }) {
  const settings = useSettings();
  const reduceMotion = useReducedMotion();
  const boot = useSyncExternalStore(bootStore.subscribe, bootStore.get, () => bootServerSnapshot);
  const [power, setPower] = useState(true);
  const [shortBoot, setShortBoot] = useState(false);

  let phase: Phase;
  if (!power) phase = "off";
  else if (shortBoot) phase = "booting-short";
  else if (boot.booted === null) phase = "pending";
  else if (boot.booted === false) phase = "booting";
  else phase = "on";

  const finishBoot = useCallback(() => {
    bootStore.set({ booted: true });
    setShortBoot(false);
  }, []);

  useEffect(() => {
    if (phase !== "booting" && phase !== "booting-short") return;
    const ms = reduceMotion ? 0 : phase === "booting" ? BOOT_MS : SHORT_BOOT_MS;
    const t = window.setTimeout(finishBoot, ms);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finishBoot();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reduceMotion, finishBoot]);

  const togglePower = () => {
    if (power) {
      setPower(false);
    } else {
      setPower(true);
      setShortBoot(true);
      playSound("power");
    }
  };

  const isOn = phase === "on";
  const booting = phase === "booting" || phase === "booting-short";

  return (
    <div
      className="room"
      data-view={settings.view}
      data-presentation={settings.presentation}
      data-motion={settings.motion}
      data-power={power ? "on" : "off"}
    >
      <RoomScene photo={photo} />

      <div className="monitor">
        <div className="monitor__side" aria-hidden="true" />
        <div className="monitor__case">
          <div className="monitor__bezel">
            <div className="screen">
              <div className="screen__content" inert={!isOn}>
                {children}
              </div>

              <div className="screen__fx screen__scanlines" aria-hidden="true" />
              <div className="screen__fx screen__vignette" aria-hidden="true" />
              <div className="screen__fx screen__glare" aria-hidden="true" />

              {phase === "off" && (
                <div className="screen__off">
                  <p className="screen__off-hint">
                    Monitor apagado. Pulsa el botón de encendido para volver a jugar.
                  </p>
                </div>
              )}

              {(booting || phase === "pending") && (
                <div className="screen__boot" data-short={phase === "booting-short"} role="status">
                  {booting && !reduceMotion && <div className="screen__boot-beam" aria-hidden="true" />}
                  {phase === "booting" && (
                    <>
                      <div className="screen__boot-log">
                        <p>{SITE.monitorBrand} BIOS 1.0 — memoria correcta</p>
                        <p>Iniciando {SITE.systemName}…</p>
                        <p>Cargando unidades I, II, III y IV</p>
                        <p>Sonido apagado. Progreso solo en este navegador.</p>
                        <p>
                          Listo<span className="blink">_</span>
                        </p>
                      </div>
                      <button type="button" className="btn btn--ghost btn--sm screen__boot-skip" onClick={finishBoot}>
                        Saltar inicio
                      </button>
                    </>
                  )}
                  {phase === "booting-short" && <span className="visually-hidden">Encendiendo el monitor…</span>}
                </div>
              )}
            </div>
          </div>

          <div className="monitor__chin">
            <span className="monitor__brand" aria-hidden="true">
              {SITE.monitorBrand}
            </span>
            <div className="dock" role="toolbar" aria-label="Vista y accesibilidad">
              <DockButton
                icon="zoomIn"
                label="Acercar a la pantalla"
                pressed={settings.view === "near"}
                disabled={settings.presentation}
                onClick={() => updateSettings({ view: "near" })}
              />
              <DockButton
                icon="zoomOut"
                label="Ver el escritorio completo"
                pressed={settings.view === "desk"}
                disabled={settings.presentation}
                onClick={() => updateSettings({ view: "desk" })}
              />
              <span className="dock__sep" aria-hidden="true" />
              <DockButton
                icon="presentation"
                label={settings.presentation ? "Salir del modo presentación" : "Modo presentación: sin cuarto ni efectos"}
                pressed={settings.presentation}
                onClick={() => updateSettings({ presentation: !settings.presentation })}
              />
              <DockButton
                icon="motion"
                label={settings.motion === "reduce" ? "Movimiento reducido (activado)" : "Reducir movimiento"}
                pressed={settings.motion === "reduce"}
                onClick={() => updateSettings({ motion: settings.motion === "reduce" ? "system" : "reduce" })}
              />
            </div>
            <span className="monitor__slot" aria-hidden="true" />
            <button
              type="button"
              className="monitor__power"
              aria-pressed={power}
              aria-label={power ? "Apagar monitor" : "Encender monitor"}
              title={power ? "Apagar monitor" : "Encender monitor"}
              onClick={togglePower}
            >
              <PixelIcon name="power" />
            </button>
            <span className="monitor__led" data-on={power} aria-hidden="true" />
          </div>
        </div>
        <div className="monitor__neck" aria-hidden="true" />
        <div className="monitor__base" aria-hidden="true" />
        <div className="monitor__shadow" aria-hidden="true" />
      </div>

    </div>
  );
}
