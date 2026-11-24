"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QUESTION_BY_ID } from "@/content/questions";
import { DIFFICULTY_LABEL, KIND_LABEL, UNIT_BY_ID } from "@/content/units";
import { scoreAnswer } from "@/lib/game-engine";
import { useGame } from "@/lib/game-context";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Window } from "../retro/Window";
import { LETTERS, QuestionView } from "./QuestionView";
import { Button, ButtonLink } from "../ui/Button";
import { ProgressIndicator, Tag, UnitTag } from "../ui/Data";
import { ScoreBadge } from "../ui/ScoreBadge";
import { EmptyState } from "../ui/States";
import { Timer } from "../ui/Timer";


function scrollWithinWindow(el: HTMLElement, behavior: ScrollBehavior) {
  const body = el.closest<HTMLElement>(".window__body");
  if (!body) return;
  const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12;
  body.scrollTo({ top: Math.max(0, top), behavior });
}

/** Pantalla de juego: reto, opciones, temporizador, puntaje y retroalimentación. */
export function GamePlay() {
  const router = useRouter();
  const game = useGame();
  const reduceMotion = useReducedMotion();
  const { session } = game;
  const [exitOpen, setExitOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLButtonElement>(null);

  const item = session?.items[session.index];
  const question = item ? QUESTION_BY_ID[item.questionId] : undefined;
  const answer = session?.phase === "feedback" ? session.answers[session.answers.length - 1] : undefined;
  const isLast = !!session && session.index === session.items.length - 1;
  const phase = session?.phase;
  const index = session?.index;

  // Foco y desplazamiento al cambiar de fase (solo dentro de la ventana).
  useEffect(() => {
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    if (phase === "feedback" && feedbackRef.current) {
      scrollWithinWindow(feedbackRef.current, behavior);
      feedbackRef.current.focus({ preventScroll: true });
    } else if (phase === "question" && topRef.current) {
      scrollWithinWindow(topRef.current, "auto");
      topRef.current.focus({ preventScroll: true });
    } else if (phase === "handoff") {
      handoffRef.current?.focus({ preventScroll: true });
    }
  }, [phase, index, reduceMotion]);

  function next() {
    if (!session) return;
    if (isLast) {
      const result = game.finish();
      router.push(result ? "/jugar/resultados" : "/jugar");
    } else {
      game.dispatch({ type: "next" });
    }
  }

  function confirm() {
    if (!session || !question || session.selected === null) return;
    const { outcome } = scoreAnswer(question, session.selected);
    playSound(outcome === "correcta" ? "correct" : outcome === "parcial" ? "partial" : "incorrect");
    game.dispatch({ type: "confirm" });
  }

  // Atajos de teclado: 1–4 o A–D eligen, Enter confirma o continúa, Esc abre «Salir».
  useEffect(() => {
    if (!session || !item || exitOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "SUMMARY"].includes(target.tagName)) return;
      if (e.key === "Escape") {
        setExitOpen(true);
        return;
      }
      if (session.phase === "question") {
        const n = Number.parseInt(e.key, 10);
        const idx = !Number.isNaN(n) ? n - 1 : LETTERS.indexOf(e.key.toUpperCase());
        if (idx >= 0 && idx < item.optionOrder.length) {
          e.preventDefault();
          playSound("select");
          game.dispatch({ type: "select", optionId: item.optionOrder[idx] });
        } else if (e.key === "Enter" && session.selected !== null) {
          e.preventDefault();
          confirm();
        }
      } else if (session.phase === "feedback" && e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!session || !item || !question) {
    return (
      <Window closeHref="/jugar" status="Sin partida en curso">
        <EmptyState
          title="No hay una partida en curso"
          icon="play"
          action={
            <>
              <ButtonLink href="/jugar" icon="play">
                Configurar partida
              </ButtonLink>
              {game.lastResult && (
                <ButtonLink href="/jugar/resultados" variant="secondary" icon="trophy">
                  Ver últimos resultados
                </ButtonLink>
              )}
            </>
          }
        >
          Para jugar, elige una unidad, la duración y la modalidad.
        </EmptyState>
      </Window>
    );
  }

  const unit = UNIT_BY_ID[question.unitId];
  const multi = session.config.players > 1;
  const totalPoints = session.answers.reduce((s, a) => s + a.points, 0);
  const playerPoints = session.answers.filter((a) => a.player === item.player).reduce((s, a) => s + a.points, 0);
  const total = session.items.length;

  const exitDialog = exitOpen ? (
    <ExitDialog
      answered={session.answers.length}
      onStay={() => setExitOpen(false)}
      onResults={() => {
        setExitOpen(false);
        const result = game.finish();
        router.push(result ? "/jugar/resultados" : "/jugar");
      }}
      onAbandon={() => {
        setExitOpen(false);
        game.abandon();
        router.push("/jugar");
      }}
    />
  ) : null;

  return (
    <Window
      onClose={() => setExitOpen(true)}
      closeLabel="Salir de la partida"
      maximizable={false}
      crumbs={[
        { label: "Escritorio", href: "/" },
        { label: "Jugar", href: "/jugar" },
        { label: `Unidad ${unit.numeral}` },
        { label: `Reto ${session.index + 1}` },
      ]}
      status={multi ? `Turno de Jugador ${item.player}` : "Partida individual"}
      statusEnd="1–4 elige · Enter confirma · Esc sale"
      inertBody={exitOpen}
      overlay={exitDialog}
    >
      {session.phase === "handoff" ? (
        <div className="handoff">
          <p className="text-dim" style={{ margin: 0 }}>
            Pasa el dispositivo a
          </p>
          <h1 className="handoff__player">Jugador {item.player}</h1>
          <div style={{ width: "min(100%, 420px)" }}>
            <ProgressIndicator current={session.index + 1} total={total} label="Reto" />
          </div>
          <p style={{ margin: 0, maxWidth: "46ch" }}>
            Cuando tengas el dispositivo, muestra tu reto. El resto del grupo puede comentar la respuesta después
            de leer el fundamento.
          </p>
          <Button ref={handoffRef} size="lg" icon="play" onClick={() => game.dispatch({ type: "ready" })}>
            Mostrar mi reto
          </Button>
        </div>
      ) : (
        <>
          <QuestionView
            question={question}
            optionOrder={item.optionOrder}
            phase={session.phase === "feedback" ? "feedback" : "question"}
            selected={session.selected}
            answer={answer}
            topRef={topRef}
            feedbackRef={feedbackRef}
            onSelect={(optionId) => {
              playSound("select");
              game.dispatch({ type: "select", optionId });
            }}
            onConfirm={confirm}
            header={
              <div className="game-hud">
                <div className="game-hud__meta">
                  <UnitTag unitId={question.unitId} />
                  <Tag>{KIND_LABEL[question.kind]}</Tag>
                  <Tag variant="dim">{DIFFICULTY_LABEL[question.difficulty]}</Tag>
                  {multi && <Tag variant="dim">Jugador {item.player}</Tag>}
                </div>
                <ProgressIndicator
                  current={session.index + 1}
                  total={total}
                  label="Reto"
                  done={session.phase === "feedback" ? session.index + 1 : session.index}
                />
                <div className="game-hud__stats">
                  <ScoreBadge label={multi ? `Puntos J${item.player}` : "Puntos"} value={multi ? playerPoints : totalPoints} />
                  {session.config.timerSeconds > 0 && (
                    <Timer
                      key={`${session.id}-${session.index}`}
                      seconds={session.config.timerSeconds}
                      running={session.phase === "question" && !exitOpen}
                      onExpire={() => {
                        playSound("incorrect");
                        game.dispatch({ type: "timeout" });
                      }}
                    />
                  )}
                </div>
              </div>
            }
            feedbackFooter={
              <div className="game-actions">
                <span className="game-actions__hint">
                  {multi && !isLast ? `Sigue el turno de Jugador ${session.items[session.index + 1].player}.` : ""}
                </span>
                <Button size="lg" onClick={next} shortcut="Enter" icon={isLast ? "trophy" : "play"}>
                  {isLast ? "Ver resultados" : "Siguiente reto"}
                </Button>
              </div>
            }
          />
        </>
      )}
    </Window>
  );
}

function ExitDialog({
  answered,
  onStay,
  onResults,
  onAbandon,
}: {
  answered: number;
  onStay: () => void;
  onResults: () => void;
  onAbandon: () => void;
}) {
  const stayRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    stayRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <>
      <div className="dialog-backdrop" onClick={onStay} aria-hidden="true" />
      <Window variant="dialog" title="¿Salir de la partida?" icon="error" onClose={onStay} closeLabel="Seguir jugando">
        <p style={{ marginTop: 0 }}>
          {answered > 0
            ? `Llevas ${answered} ${answered === 1 ? "reto respondido" : "retos respondidos"}. Puedes ver tus resultados hasta aquí o salir sin guardar.`
            : "Todavía no respondes ningún reto. Si sales, la partida no se guarda."}
        </p>
        <div className="btn-row">
          <Button ref={stayRef} onClick={onStay}>
            Seguir jugando
          </Button>
          {answered > 0 && (
            <Button variant="secondary" onClick={onResults}>
              Ver resultados hasta aquí
            </Button>
          )}
          <Button variant="danger" onClick={onAbandon}>
            Salir sin guardar
          </Button>
        </div>
      </Window>
    </>
  );
}
