"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SITE } from "@/content/site";
import { MONITOR } from "@/lib/monitor-config";
import { bootServerSnapshot, bootStore, updateSettings, useSettings } from "@/lib/settings";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { PixelIcon, type PixelIconName } from "./PixelIcon";

/**
 * Escenario fotográfico: una foto real de un monitor CRT en un cuarto, con el
 * juego recortado exactamente sobre el vidrio (ver src/lib/monitor-config.ts).
 * Todo (foto, pantalla y capas de vidrio) vive en un mismo "stage" que se
 * escala junto; la cámara solo usa transform. El juego permanece montado
 * siempre (también apagado), así no se pierde el progreso.
 */

type Phase = "pending" | "intro" | "on" | "powering-off" | "off" | "powering-on";

/** Duraciones (ms). La secuencia completa de arranque dura menos de 1.5 s. */
const T = {
  introTotal: 1300,
  introReduced: 260,
  cameraDelay: 200,
  powerOff: 380,
  powerOn: 650,
  powerReduced: 160,
};

const MOBILE_MAX = 767;

/* ---------- Tamaño del viewport como store externo (sin setState en efectos) ---------- */
function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  window.visualViewport?.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.visualViewport?.removeEventListener("resize", cb);
  };
}
const viewportSnapshot = () => `${window.innerWidth}x${window.innerHeight}`;
const viewportServer = () => "0x0";

/* ---------- Pestaña oculta: pausar animaciones ---------- */
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

/** Calcula el encuadre de la cámara a partir de la configuración del monitor. */
function computeCamera(vw: number, vh: number) {
  const A = MONITOR.image.aspect;
  const nf = MONITOR.nearFrame;
  const rf = MONITOR.roomFrame;
  // Vista cercana: vidrio + mentón ocupan casi todo el viewport (estado sin escalar, texto nítido).
  const near = Math.min((vw * 0.98) / ((nf.right - nf.left) / 100), (vh * 0.98 * A) / ((nf.bottom - nf.top) / 100));
  // Vista de sala: la foto cubre el viewport, pero el monitor completo siempre cabe.
  const cover = Math.max(vw, vh * A);
  const room = Math.min(cover, (vw * 0.97) / ((rf.right - rf.left) / 100), (vh * 0.97 * A) / ((rf.bottom - rf.top) / 100));
  return {
    width: near,
    height: near / A,
    left: (vw - near) / 2,
    top: (vh - near / A) / 2,
    roomScale: room / near,
  };
}

function DockButton({
  icon,
  label,
  pressed,
  onClick,
}: {
  icon: PixelIconName;
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="dock__btn" aria-pressed={pressed} aria-label={label} onClick={onClick}>
      <PixelIcon name={icon} />
      <span className="dock__tip" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}

export function MonitorFrame({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const reduceMotion = useReducedMotion();
  const boot = useSyncExternalStore(bootStore.subscribe, bootStore.get, () => bootServerSnapshot);
  const viewport = useSyncExternalStore(subscribeViewport, viewportSnapshot, viewportServer);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  /** Fase de energía controlada por el usuario (null = derivada del arranque). */
  const [powerPhase, setPowerPhase] = useState<Phase | null>(null);
  /** Durante el arranque la cámara empieza en la sala y luego se acerca. */
  const [introCamera, setIntroCamera] = useState<"room" | null>("room");

  const phase: Phase =
    powerPhase ?? (boot.booted === null ? "pending" : boot.booted === false ? "intro" : "on");

  const [vw, vh] = viewport.split("x").map(Number);
  const mobile = vw > 0 && vw <= MOBILE_MAX;
  const cam = vw > 0 ? computeCamera(vw, vh) : null;

  // Las transiciones de cámara se activan un par de cuadros después de medir el viewport,
  // para que la primera pintura no anime desde un encuadre equivocado.
  const measured = cam !== null;
  const [animReady, setAnimReady] = useState(false);
  useEffect(() => {
    if (!measured) return;
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setAnimReady(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [measured]);

  const finishIntro = useCallback(() => {
    bootStore.set({ booted: true });
    setIntroCamera(null);
  }, []);

  // Secuencia de arranque (una vez por sesión del navegador).
  useEffect(() => {
    if (phase !== "intro") return;
    const camTimer = window.setTimeout(() => setIntroCamera(null), reduceMotion ? 0 : T.cameraDelay);
    const done = window.setTimeout(finishIntro, reduceMotion ? T.introReduced : T.introTotal);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finishIntro();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(camTimer);
      window.clearTimeout(done);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reduceMotion, finishIntro]);

  // Transiciones de apagado y encendido.
  useEffect(() => {
    if (phase !== "powering-off" && phase !== "powering-on") return;
    const ms = reduceMotion ? T.powerReduced : phase === "powering-off" ? T.powerOff : T.powerOn;
    const t = window.setTimeout(() => setPowerPhase(phase === "powering-off" ? "off" : "on"), ms);
    return () => window.clearTimeout(t);
  }, [phase, reduceMotion]);

  const togglePower = () => {
    if (phase === "on" || phase === "intro" || phase === "powering-on") {
      if (phase === "intro") finishIntro();
      setPowerPhase("powering-off");
    } else if (phase === "off" || phase === "powering-off") {
      setPowerPhase("powering-on");
      playSound("power");
    }
  };

  const ledOn = phase !== "off" && phase !== "powering-off" && phase !== "pending";
  const contentVisible = phase === "on" || phase === "intro" || phase === "powering-on" || phase === "powering-off";
  const view = mobile ? "near" : introCamera === "room" && phase === "intro" && !reduceMotion ? "desk" : settings.view;

  const g = MONITOR.glass;
  const stageStyle = cam
    ? ({
        width: `${cam.width}px`,
        height: `${cam.height}px`,
        left: `${cam.left}px`,
        top: `${cam.top}px`,
        "--room-scale": cam.roomScale.toFixed(4),
      } as CSSProperties)
    : undefined;
  const glassStyle = {
    left: `${g.left}%`,
    top: `${g.top}%`,
    width: `${g.right - g.left}%`,
    height: `${g.bottom - g.top}%`,
    "--glass-clip": MONITOR.glassClip,
  } as CSSProperties;
  const stageClip = { "--stage-clip": MONITOR.stageClip } as CSSProperties;
  const at = (p: { x: number; y: number }, w: number, h: number): CSSProperties => ({
    left: `${p.x - w / 2}%`,
    top: `${p.y - h / 2}%`,
    width: `${w}%`,
    height: `${h}%`,
  });

  return (
    <div
      className="room"
      data-view={view}
      data-simple={settings.simple}
      data-motion={settings.motion}
      data-phase={phase}
      data-power={ledOn ? "on" : "off"}
      data-reduced={reduceMotion}
      data-hidden={hidden}
      data-ready={measured}
      data-anim={animReady}
    >
      <div className="stage" style={stageStyle}>
        {/* Foto real del cuarto y el monitor (decorativa) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- WebP 1x/2x generados a mano con srcset; next/image reescalaría la calibración */}
        <img
          className="stage__photo"
          src={MONITOR.image.src1x}
          srcSet={`${MONITOR.image.src1x} 1920w, ${MONITOR.image.src2x} 3840w`}
          sizes="(max-width: 767px) 1px, 230vw"
          width={MONITOR.image.width}
          height={MONITOR.image.height}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />

        {/* Derrame de luz ámbar sobre el bisel, el mentón y el escritorio */}
        <div className="stage__spill" style={glassStyle} aria-hidden="true" />
        <div className="stage__desk-glow" aria-hidden="true" />

        {/* Pantalla: el juego recortado con el contorno exacto del vidrio */}
        <div className="screen" style={glassStyle}>
          <div className="screen__content" inert={phase !== "on"} data-visible={contentVisible}>
            {children}
          </div>

          <div className="screen__fx screen__edge" aria-hidden="true" />
          <div className="screen__fx screen__scanlines" aria-hidden="true" />

          {(phase === "pending" || phase === "intro" || phase === "powering-on" || phase === "powering-off") && (
            <div className="screen__boot" data-kind={phase} aria-hidden="true">
              <div className="screen__boot-glow" />
              <div className="screen__boot-band" />
              <div className="screen__boot-flash" />
            </div>
          )}
          <span className="visually-hidden" role="status">
            {phase === "intro" || phase === "powering-on"
              ? `Encendiendo ${SITE.monitorBrand}…`
              : phase === "off"
                ? "Monitor apagado. Usa el botón de encendido del monitor para volver a jugar."
                : ""}
          </span>
        </div>

        {/* Vidrio: reflejos reales de la foto encima del juego, y sombra del labio del bisel */}
        <div className="stage__glass stage__glass--reflect" style={stageClip} aria-hidden="true" />
        <div className="stage__glass stage__glass--shade" style={stageClip} aria-hidden="true" />

        {/* Controles físicos sobre la foto */}
        <span className="stage__led" style={at(MONITOR.led, MONITOR.led.size, MONITOR.led.size * MONITOR.image.aspect)} aria-hidden="true" />
        <button
          type="button"
          className="stage__power"
          style={at(MONITOR.power, MONITOR.power.w, MONITOR.power.h)}
          aria-pressed={ledOn}
          aria-label={ledOn ? "Apagar monitor" : "Encender monitor"}
          title={ledOn ? "Apagar monitor" : "Encender monitor"}
          onClick={togglePower}
        />
      </div>

      {phase === "intro" && !reduceMotion && (
        <button type="button" className="intro-skip" onClick={finishIntro}>
          Omitir
        </button>
      )}

      <div className="dock" role="toolbar" aria-label="Vista y efectos">
        <DockButton
          icon="zoomIn"
          label="Acercar a la pantalla"
          pressed={settings.view === "near"}
          onClick={() => updateSettings({ view: "near" })}
        />
        <DockButton
          icon="zoomOut"
          label="Ver el escritorio completo"
          pressed={settings.view === "desk"}
          onClick={() => updateSettings({ view: "desk" })}
        />
        <span className="dock__sep" aria-hidden="true" />
        <DockButton
          icon="presentation"
          label={settings.simple ? "Modo simple activado: volver a los efectos de vidrio" : "Modo simple: quitar efectos de vidrio"}
          pressed={settings.simple}
          onClick={() => updateSettings({ simple: !settings.simple })}
        />
        <DockButton
          icon="motion"
          label={settings.motion === "reduce" ? "Efectos reducidos (activado)" : "Efectos reducidos: sin zoom ni animaciones"}
          pressed={settings.motion === "reduce"}
          onClick={() => updateSettings({ motion: settings.motion === "reduce" ? "system" : "reduce" })}
        />
      </div>
    </div>
  );
}
