"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_BY_ID } from "@/content/questions";
import type { UnitId } from "@/content/types";
import { UNIT_BY_ID, UNITS } from "@/content/units";
import { getAdventureAudio, type Sfx } from "@/game/adventure/audio";
import { loadArt } from "@/game/adventure/assets/manifest";
import { GAMEPLAY } from "@/game/adventure/config";
import { AdventureEngine } from "@/game/adventure/engine";
import type { VirtualKey } from "@/game/adventure/input";
import type { Level } from "@/game/adventure/level";
import { levelFor, LEVEL_SOURCES } from "@/game/adventure/levels";
import { readAdventure, resetUnit, updateUnit, type UnitAdventure } from "@/game/adventure/progress";
import { newUnitState, questionForBlock, scoreAdventureAnswer } from "@/game/adventure/session";
import type { WorldEventType } from "@/game/adventure/world";
import { percent, sessionLength, summarize, type AnswerRecord } from "@/lib/game-engine";
import { useGame } from "@/lib/game-context";
import { settingsStore, updateSettings, useSettings } from "@/lib/settings";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { QuestionView, LETTERS } from "../game/QuestionView";
import { PixelIcon } from "../retro/PixelIcon";
import { Button, ButtonLink } from "../ui/Button";

type Status = "loading" | "banner" | "playing" | "question" | "paused" | "summary" | "error";

interface OpenQuestion {
  blockIndex: number;
  blockId: string;
  questionId: string;
  bonus: boolean;
  optionOrder: string[];
  phase: "question" | "feedback";
  selected: string | null;
  answer?: AnswerRecord;
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Primera unidad con nivel cuyo Modo aventura no está completo. */
export function firstIncompleteUnit(): UnitId {
  const data = readAdventure();
  const withLevel = UNITS.filter((u) => LEVEL_SOURCES[u.id]);
  return (withLevel.find((u) => !data.units[u.id]?.completed) ?? withLevel[0] ?? UNITS[0]).id;
}

function nextUnit(unit: UnitId): UnitId | null {
  const withLevel = UNITS.filter((u) => LEVEL_SOURCES[u.id]).map((u) => u.id);
  const i = withLevel.indexOf(unit);
  return i >= 0 && i < withLevel.length - 1 ? withLevel[i + 1] : null;
}

function isTouchCapable(): boolean {
  return typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
}

export function AdventureGame({ unitId }: { unitId: UnitId }) {
  const router = useRouter();
  const game = useGame();
  const settings = useSettings();
  const reducedMotion = useReducedMotion();
  const unit = UNIT_BY_ID[unitId];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AdventureEngine | null>(null);
  const stateRef = useRef<UnitAdventure | null>(null);
  const levelRef = useRef<Level | null>(null);
  const statusRef = useRef<Status>("loading");
  const overlayRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [status, setStatusState] = useState<Status>("loading");
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(sessionLength(unitId));
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenQuestion | null>(null);
  const [touch] = useState(isTouchCapable);
  const [summary, setSummary] = useState<AnswerRecord[] | null>(null);
  const [hint, setHint] = useState("");

  const setStatus = useCallback((s: Status) => {
    statusRef.current = s;
    setStatusState(s);
  }, []);

  const audio = getAdventureAudio();
  const sfx = useCallback((s: Sfx) => audio.play(s), [audio]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  }, []);

  /* ---------- estado de silencio compartido con la barra de tareas ---------- */
  useEffect(() => {
    audio.setMuted(!settings.sound);
    audio.setVolume(settings.volume);
  }, [audio, settings.sound, settings.volume]);

  const toggleMute = useCallback(() => {
    const next = !settingsStore.get().sound;
    updateSettings({ sound: next });
    void audio.unlock().then(() => {
      if (next && (statusRef.current === "playing" || statusRef.current === "question")) audio.startMusic();
    });
  }, [audio]);

  /* ---------- pausa ---------- */
  const pause = useCallback(() => {
    if (statusRef.current !== "playing") return;
    engineRef.current?.hold("pause");
    audio.stopMusic();
    setStatus("paused");
  }, [audio, setStatus]);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    setStatus("playing");
    engineRef.current?.release("pause", 150);
    audio.startMusic();
    canvasRef.current?.focus({ preventScroll: true });
  }, [audio, setStatus]);

  /* ---------- eventos del motor ---------- */
  const onEvent = useCallback(
    (type: WorldEventType, value: number) => {
      const engine = engineRef.current;
      const level = levelRef.current;
      const st = stateRef.current;
      switch (type) {
        case "jump":
        case "land":
        case "step":
          sfx(type);
          return;
        case "exitBlocked":
          showToast(value === 1 ? "Falta 1 signo de interrogación" : `Faltan ${value} signos de interrogación`);
          return;
        case "exitOpened":
          sfx("exitOpen");
          showToast("¡El tronco se abrió! Ve a la salida →");
          return;
        case "question": {
          if (!engine || !level || !st) return;
          const block = level.blocks[value];
          const qid = questionForBlock(st, block.id);
          if (!qid) {
            engine.world.markAnswered(value, true);
            return;
          }
          stateRef.current = updateUnit(unitId, (prev) => {
            const base = prev ?? st;
            return { ...base, assigned: { ...base.assigned, [block.id]: qid } };
          });
          sfx("question");
          engine.hold("question");
          audio.duck(true);
          const q = QUESTION_BY_ID[qid];
          setOpen({
            blockIndex: value,
            blockId: block.id,
            questionId: qid,
            bonus: block.bonus,
            optionOrder: shuffle(q.options.map((o) => o.id)),
            phase: "question",
            selected: null,
          });
          setStatus("question");
          return;
        }
        case "complete": {
          if (!engine || !st) return;
          engine.hold("summary");
          audio.stopMusic();
          sfx("complete");
          const finished = updateUnit(unitId, (prev) => ({ ...(prev ?? st), completed: true }));
          stateRef.current = finished;
          game.recordResult({
            id: `aventura-${unitId}-${Date.now().toString(36)}`,
            finishedAt: new Date().toISOString(),
            config: {
              unit: unitId,
              length: finished.order.length,
              difficulty: "todas",
              mode: "individual",
              players: 1,
              timerSeconds: 0,
            },
            answers: finished.answers,
            variant: "aventura",
          });
          setSummary(finished.answers);
          setStatus("summary");
          return;
        }
        default:
          return;
      }
    },
    [audio, game, sfx, setStatus, showToast, unitId],
  );

  // Referencias estables para que el motor llame siempre a la versión actual
  const onEventRef = useRef(onEvent);
  const pauseRef = useRef(pause);
  const toggleMuteRef = useRef(toggleMute);
  useEffect(() => {
    onEventRef.current = onEvent;
    pauseRef.current = pause;
    toggleMuteRef.current = toggleMute;
  });

  /* ---------- carga, banner y arranque ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const level = levelFor(unitId);
    if (!canvas || !level) {
      setStatus("error");
      return;
    }
    levelRef.current = level;
    setHint(level.hint);
    let st = readAdventure().units[unitId];
    if (!st || st.completed) {
      st = newUnitState(unitId);
      updateUnit(unitId, () => st as UnitAdventure);
    }
    stateRef.current = st;
    setTotal(level.blocks.length);
    setAnswered(st.used.length);
    setScore(st.answers.reduce((n, a) => n + a.points, 0));

    let cancelled = false;
    let bannerTimer = 0;
    void audio.unlock().catch(() => {});
    loadArt()
      .then((art) => {
        if (cancelled) return;
        const engine = new AdventureEngine({
          canvas,
          level,
          art,
          usedBlocks: st.used,
          reducedMotion,
          onEvent: (t, v) => onEventRef.current(t, v),
          onPause: () => pauseRef.current(),
          onMute: () => toggleMuteRef.current(),
        });
        engineRef.current = engine;
        engine.hold("banner");
        engine.start();
        setStatus("banner");
        bannerTimer = window.setTimeout(() => {
          if (cancelled) return;
          setStatus("playing");
          engine.release("banner");
          audio.startMusic();
          canvas.focus({ preventScroll: true });
        }, reducedMotion ? 600 : GAMEPLAY.bannerMs);
        if (process.env.NODE_ENV !== "production") {
          // Ganchos de depuración SOLO en desarrollo (pruebas e2e)
          (window as unknown as { __ADVENTURE__?: unknown }).__ADVENTURE__ = {
            engine,
            world: engine.world,
            level,
            teleportToBlock: (i: number) => {
              const b = level.blocks[i];
              // Justo debajo del bloque, subiendo: el siguiente paso lo golpea con la cabeza
              engine.world.x = b.tx * 16 + 2;
              engine.world.y = (b.ty + 1) * 16 + 2;
              engine.world.prevX = engine.world.x;
              engine.world.prevY = engine.world.y;
              engine.world.vy = -250;
            },
            teleportToExit: () => {
              engine.world.x = (level.exit.tx + 1) * 16;
              engine.world.y = (level.exit.ty + level.exit.h) * 16 - 21;
            },
          };
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(bannerTimer);
      engineRef.current?.destroy();
      engineRef.current = null;
      audio.stopMusic();
    };
    // El motor se crea una vez por unidad
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  // Música en pausa cuando la pestaña se oculta
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) audio.stopMusic();
      else if (statusRef.current === "playing" || statusRef.current === "question") audio.startMusic();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [audio]);

  /* ---------- pregunta ---------- */
  const confirm = useCallback(() => {
    setOpen((o) => {
      if (!o || o.phase !== "question" || o.selected === null) return o;
      const rec = scoreAdventureAnswer(o.questionId, o.selected, o.bonus);
      sfx(rec.outcome === "correcta" ? "correct" : "wrong");
      return { ...o, phase: "feedback", answer: rec };
    });
  }, [sfx]);

  const closeQuestion = useCallback(() => {
    const o = open;
    const engine = engineRef.current;
    if (!o || !o.answer || !engine) return;
    const rec = o.answer;
    const st = updateUnit(unitId, (prev) => {
      const base = prev ?? (stateRef.current as UnitAdventure);
      return {
        ...base,
        used: base.used.includes(o.blockId) ? base.used : [...base.used, o.blockId],
        answers: [...base.answers, rec],
      };
    });
    stateRef.current = st;
    engine.world.markAnswered(o.blockIndex, rec.outcome === "correcta");
    setAnswered(st.used.length);
    setScore(st.answers.reduce((n, a) => n + a.points, 0));
    setOpen(null);
    setStatus("playing");
    audio.duck(false);
    engine.release("question", GAMEPLAY.inputLockAfterQuestionMs);
    canvasRef.current?.focus({ preventScroll: true });
  }, [audio, open, setStatus, unitId]);

  // Foco y atajos dentro de la pregunta (1–4 / A–D / Enter) y foco atrapado
  useEffect(() => {
    if (!open) return;
    const root = overlayRef.current;
    if (open.phase === "feedback") feedbackRef.current?.focus({ preventScroll: true });
    else topRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (!root) return;
      if (e.key === "Tab") {
        const items = Array.from(root.querySelectorAll<HTMLElement>("button:not([disabled]), summary, a[href]"));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (!root.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if ((e.target as HTMLElement | null)?.tagName === "SUMMARY") return;
      if (open.phase === "question") {
        const n = Number.parseInt(e.key, 10);
        const idx = !Number.isNaN(n) ? n - 1 : LETTERS.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < open.optionOrder.length) {
          e.preventDefault();
          setOpen((o) => (o && o.phase === "question" ? { ...o, selected: o.optionOrder[idx] } : o));
        } else if (e.key === "Enter" && open.selected !== null) {
          e.preventDefault();
          confirm();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closeQuestion();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirm, closeQuestion]);

  /* ---------- acciones de menú ---------- */
  const exitToDesktop = () => router.push("/");
  const classicMode = () => router.push(`/jugar?unidad=${unitId}`);
  const replay = () => {
    resetUnit(unitId);
    router.replace(`/aventura?unidad=${unitId}&r=${Date.now().toString(36)}`);
  };
  const next = nextUnit(unitId);

  const onVirtual = useCallback(
    (key: VirtualKey, down: boolean) => {
      if (down) void audio.unlock();
      engineRef.current?.setVirtual(key, down);
    },
    [audio],
  );

  const question = open ? QUESTION_BY_ID[open.questionId] : null;
  const sum = summary ? summarize(summary).total : null;

  return (
    <div className="adventure" data-status={status} data-reduced={reducedMotion}>
      <div className="adventure__stage" inert={status === "question" || status === "paused" || status === "summary"}>
        <canvas
          ref={canvasRef}
          className="adventure__canvas"
          tabIndex={0}
          role="img"
          aria-label={`Modo aventura, ${unit.title}. Sprout recorre el bosque y responde un reto al tocar cada signo de interrogación. Usa las flechas para moverte y Espacio para saltar. El Modo clásico es la alternativa sin plataformas.`}
        />

        <div className="adventure__hud">
          <span className="adventure__counter" aria-live="polite">
            <span aria-hidden="true">?</span> {answered}/{total}
            <span className="visually-hidden"> retos respondidos</span>
          </span>
          <span className="adventure__hud-right">
            <span className="adventure__score">{score} pts</span>
            <button type="button" className="adventure__hud-btn" aria-label="Pausa" onClick={pause}>
              <PixelIcon name="menu" />
            </button>
            <button
              type="button"
              className="adventure__hud-btn"
              aria-pressed={settings.sound}
              aria-label={settings.sound ? "Silenciar sonido" : "Activar sonido"}
              onClick={toggleMute}
            >
              <PixelIcon name={settings.sound ? "soundOn" : "soundOff"} />
            </button>
          </span>
        </div>

        {toast && (
          <p className="adventure__toast" role="status">
            {toast}
          </p>
        )}

        {status === "banner" && (
          <div className="adventure__banner" role="status">
            <p className="adventure__banner-title">
              Unidad {unit.numeral} · {unit.shortTitle}
            </p>
            <p className="adventure__banner-hint">{hint}</p>
            {!settings.sound && <p className="adventure__banner-sound">Sonido apagado: pulsa M o la bocina para oír la música.</p>}
          </div>
        )}

        {touch && (status === "playing" || status === "banner") && (
          <TouchControls onVirtual={onVirtual} />
        )}
      </div>

      {status === "loading" && (
        <div className="adventure__loading" role="status">
          Cargando el bosque…
        </div>
      )}

      {status === "error" && (
        <div className="adventure__overlay" role="alert">
          <div className="adventure__panel">
            <h1 className="adventure__title">No se pudo cargar el modo aventura</h1>
            <p>Puedes jugar la misma unidad en el Modo clásico.</p>
            <div className="btn-row">
              <ButtonLink href={`/jugar?unidad=${unitId}`} icon="play">
                Modo clásico
              </ButtonLink>
              <ButtonLink href="/" variant="secondary" icon="home">
                Escritorio
              </ButtonLink>
            </div>
          </div>
        </div>
      )}

      {open && question && (
        <div className="adventure__overlay adventure__overlay--question" role="dialog" aria-modal="true" aria-label="Reto">
          <div className="adventure__panel adventure__panel--question" ref={overlayRef}>
            {open.bonus && <p className="adventure__bonus">Bloque azul: este reto vale el doble</p>}
            <QuestionView
              question={question}
              optionOrder={open.optionOrder}
              phase={open.phase}
              selected={open.selected}
              answer={open.answer}
              topRef={topRef}
              feedbackRef={feedbackRef}
              onSelect={(optionId) => setOpen((o) => (o && o.phase === "question" ? { ...o, selected: optionId } : o))}
              onConfirm={confirm}
              feedbackFooter={
                <div className="game-actions">
                  <span className="game-actions__hint">Vuelve al bosque y busca más signos de interrogación.</span>
                  <Button size="lg" onClick={closeQuestion} shortcut="Enter" icon="play">
                    Continuar
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      )}

      {status === "paused" && (
        <div className="adventure__overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className="adventure__panel adventure__panel--menu">
            <h1 className="adventure__title" id="pause-title">
              Pausa
            </h1>
            <div className="adventure__menu">
              <Button size="lg" icon="play" onClick={resume} autoFocus>
                Continuar
              </Button>
              <Button variant="secondary" icon="home" onClick={exitToDesktop}>
                Salir al escritorio
              </Button>
              <Button variant="secondary" icon="rules" onClick={classicMode}>
                Modo clásico (sin plataformas)
              </Button>
              <Button
                variant="secondary"
                icon={settings.sound ? "soundOn" : "soundOff"}
                aria-pressed={settings.sound}
                onClick={toggleMute}
              >
                {settings.sound ? "Sonido activado" : "Activar sonido"}
              </Button>
            </div>
            <p className="adventure__menu-hint">Esc o P también continúan. Tu avance en esta unidad se guarda en el navegador.</p>
          </div>
        </div>
      )}

      {status === "summary" && sum && (
        <div className="adventure__overlay" role="dialog" aria-modal="true" aria-labelledby="summary-title">
          <div className="adventure__panel adventure__panel--menu">
            <h1 className="adventure__title" id="summary-title">
              ¡Unidad {unit.numeral} completada!
            </h1>
            <p className="adventure__summary-score">
              {sum.points} <span>de {sum.maxPoints} puntos</span>
            </p>
            <p>
              {sum.correct} de {sum.total} respuestas correctas ({percent(sum.points, sum.maxPoints)} % de aprovechamiento).
            </p>
            <div className="adventure__menu">
              {next ? (
                <ButtonLink href={`/aventura?unidad=${next}`} size="lg" icon="play" autoFocus>
                  Siguiente unidad
                </ButtonLink>
              ) : (
                <ButtonLink href="/jugar/resultados" size="lg" icon="trophy" autoFocus>
                  Ver resultados
                </ButtonLink>
              )}
              <Button variant="secondary" icon="play" onClick={replay}>
                Repetir unidad
              </Button>
              <ButtonLink href="/" variant="secondary" icon="home">
                Escritorio
              </ButtonLink>
            </div>
            <p className="adventure__menu-hint">
              <Link className="text-link" href="/jugar/resultados">
                Ver el detalle de tus respuestas
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** D-pad y botón de salto grandes y semitransparentes dentro del cristal (solo con pantalla táctil). */
function TouchControls({ onVirtual }: { onVirtual: (key: VirtualKey, down: boolean) => void }) {
  const props = (key: VirtualKey) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      onVirtual(key, true);
    },
    onPointerUp: () => onVirtual(key, false),
    onPointerCancel: () => onVirtual(key, false),
    onLostPointerCapture: () => onVirtual(key, false),
  });
  return (
    <div className="adventure__touch" aria-hidden="true">
      <div className="adventure__dpad">
        <button type="button" tabIndex={-1} className="adventure__pad" {...props("left")}>
          ◀
        </button>
        <button type="button" tabIndex={-1} className="adventure__pad" {...props("down")}>
          ▼
        </button>
        <button type="button" tabIndex={-1} className="adventure__pad" {...props("right")}>
          ▶
        </button>
      </div>
      <button type="button" tabIndex={-1} className="adventure__pad adventure__pad--jump" {...props("jump")}>
        Saltar
      </button>
    </div>
  );
}
