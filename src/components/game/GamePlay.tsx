"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { QUESTION_BY_ID } from "@/content/questions";
import { CONDUCT_LABEL, DIFFICULTY_LABEL, KIND_LABEL, UNIT_BY_ID } from "@/content/units";
import type { Question } from "@/content/types";
import { scoreAnswer, type AnswerRecord, type GameSession } from "@/lib/game-engine";
import { useGame } from "@/lib/game-context";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { PixelIconName } from "../retro/PixelIcon";
import { Window } from "../retro/Window";
import { AnswerCard, type AnswerState } from "../ui/AnswerCard";
import { Button, ButtonLink } from "../ui/Button";
import { ProgressIndicator, Tag, UnitTag } from "../ui/Data";
import { FeedbackBlock, FeedbackMessage, type FeedbackVariant } from "../ui/FeedbackMessage";
import { ScoreBadge } from "../ui/ScoreBadge";
import { SourceList } from "../ui/SourceList";
import { EmptyState, Notice } from "../ui/States";
import { Timer } from "../ui/Timer";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const NON_LEGAL_SOURCES = new Set(["temario", "gnuGpl"]);

function scrollWithinWindow(el: HTMLElement, behavior: ScrollBehavior) {
  const body = el.closest<HTMLElement>(".window__body");
  if (!body) return;
  const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12;
  body.scrollTo({ top: Math.max(0, top), behavior });
}

function cardState(question: Question, optionId: string, session: GameSession, answer?: AnswerRecord): AnswerState {
  if (session.phase === "question") return session.selected === optionId ? "selected" : "idle";
  const chosen = answer?.optionId === optionId;
  if (question.kind === "opcion-multiple") {
    if (question.options.find((o) => o.id === optionId)?.correct) return "correct";
    return chosen ? "incorrect" : "dimmed";
  }
  const quality = question.options.find((o) => o.id === optionId)?.quality;
  if (quality === "responsable") return "correct";
  if (chosen) return quality === "parcial" ? "partial" : "incorrect";
  return "dimmed";
}

function scenarioMark(
  question: Question,
  optionId: string,
  state: AnswerState,
): { text: string; icon: PixelIconName } | undefined {
  if (question.kind !== "escenario" || state === "idle" || state === "selected") return undefined;
  const q = question.options.find((o) => o.id === optionId)?.quality;
  if (q === "responsable") return { text: "Responsable", icon: "check" };
  if (q === "parcial") return { text: state === "dimmed" ? "A medias" : "Tu decisión: a medias", icon: "half" };
  return { text: state === "dimmed" ? "Riesgosa" : "Tu decisión: riesgosa", icon: "close" };
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
  const isLegal = question.sources.some((s) => !NON_LEGAL_SOURCES.has(s.sourceId));

  const feedbackVariant: FeedbackVariant | null = answer
    ? answer.outcome === "correcta"
      ? "correct"
      : answer.outcome === "parcial"
        ? "partial"
        : answer.outcome === "sin-respuesta"
          ? "timeout"
          : "incorrect"
    : null;

  const scenario = question.kind === "escenario";
  const feedbackTitle: Record<FeedbackVariant, string> = {
    correct: scenario ? "Decisión responsable" : "Correcto",
    partial: "Decisión a medias",
    incorrect: scenario ? "Decisión riesgosa" : "Incorrecto",
    timeout: "Se acabó el tiempo",
  };

  const chosenScenario =
    scenario && answer?.optionId ? question.options.find((o) => o.id === answer.optionId) : undefined;
  const correctMc = question.kind === "opcion-multiple" ? question.options.find((o) => o.correct) : undefined;
  const correctLetter = correctMc ? LETTERS[item.optionOrder.indexOf(correctMc.id)] : undefined;

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
          <div ref={topRef} tabIndex={-1} style={{ outline: "none", scrollMarginTop: 16 }}>
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

            <h1 className="challenge-title">{question.title}</h1>
            <p className="challenge-topic">Tema: {question.topic}</p>
            {question.context && (
              <div className="challenge-context">
                <span className="challenge-context__label">La situación</span>
                {question.context}
              </div>
            )}
            <p className="challenge-prompt">{question.prompt}</p>
          </div>

          <ul className={`answers${scenario ? " answers--stack" : ""}`} aria-label="Opciones de respuesta">
            {item.optionOrder.map((optionId, i) => {
              const opt = question.options.find((o) => o.id === optionId)!;
              const state = cardState(question, optionId, session, answer);
              return (
                <li key={optionId}>
                  <AnswerCard
                    letter={LETTERS[i]}
                    text={opt.text}
                    state={state}
                    disabled={session.phase !== "question"}
                    mark={scenarioMark(question, optionId, state)}
                    onSelect={() => {
                      playSound("select");
                      game.dispatch({ type: "select", optionId });
                    }}
                  />
                </li>
              );
            })}
          </ul>

          {session.phase === "question" && (
            <div className="game-actions">
              <span className="game-actions__hint" role="status">
                {session.selected === null
                  ? "Elige una opción con el mouse, el dedo o las teclas 1 a 4."
                  : "Puedes cambiar de opción antes de confirmar."}
              </span>
              <Button size="lg" onClick={confirm} disabled={session.selected === null} shortcut="Enter">
                Confirmar respuesta
              </Button>
            </div>
          )}

          {session.phase === "feedback" && answer && feedbackVariant && (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              style={{ outline: "none", marginTop: "var(--sp-6)", scrollMarginTop: 16 }}
              aria-label={`${feedbackTitle[feedbackVariant]}. Retroalimentación del reto`}
            >
              <FeedbackMessage
                variant={feedbackVariant}
                title={feedbackTitle[feedbackVariant]}
                points={answer.points === 1 ? "+1 punto" : `+${answer.points} puntos`}
              >
                {feedbackVariant === "timeout" && (
                  <FeedbackBlock title="Qué pasó">
                    No elegiste ninguna opción a tiempo y no sumas puntos. Lee el fundamento: es lo que más te ayudará
                    a recordarlo.
                  </FeedbackBlock>
                )}

                {question.kind === "opcion-multiple" && feedbackVariant !== "correct" && correctMc && (
                  <FeedbackBlock title="La respuesta correcta">{`${correctLetter}. ${correctMc.text}`}</FeedbackBlock>
                )}

                {chosenScenario && (
                  <FeedbackBlock title="Lo que pasaría">{chosenScenario.consequence}</FeedbackBlock>
                )}

                <FeedbackBlock title="Por qué">{question.explanation}</FeedbackBlock>

                <FeedbackBlock title={isLegal ? "Fundamento legal" : "Fundamento ético"} variant="basis">
                  {question.principle}
                </FeedbackBlock>

                {question.kind === "escenario" && (
                  <FeedbackBlock
                    title={feedbackVariant === "correct" ? "Por qué es la mejor decisión" : "Qué hacer en su lugar"}
                  >
                    {question.responsibleAlternative}
                  </FeedbackBlock>
                )}

                {question.classification && question.classification.length > 0 && (
                  <FeedbackBlock title="¿Falta ética, infracción o delito?">
                    <ul className="source-list">
                      {question.classification.map((c, i) => (
                        <li key={i}>
                          <strong>{CONDUCT_LABEL[c.type]}.</strong> {c.text}
                        </li>
                      ))}
                    </ul>
                  </FeedbackBlock>
                )}

                <details className="disclosure">
                  <summary>Fuentes consultadas y vigencia</summary>
                  <SourceList sources={question.sources} />
                  {question.review.status === "requiere-revision" && (
                    <div style={{ marginTop: "var(--sp-3)" }}>
                      <Notice variant="review" icon="info">
                        <p>Contenido en revisión por el equipo docente. {question.review.note}</p>
                      </Notice>
                    </div>
                  )}
                </details>

                <p className="text-dim text-small" style={{ margin: 0 }}>
                  Material educativo: no es asesoría jurídica.
                </p>
              </FeedbackMessage>

              <div className="game-actions">
                <span className="game-actions__hint">
                  {multi && !isLast ? `Sigue el turno de Jugador ${session.items[session.index + 1].player}.` : ""}
                </span>
                <Button size="lg" onClick={next} shortcut="Enter" icon={isLast ? "trophy" : "play"}>
                  {isLast ? "Ver resultados" : "Siguiente reto"}
                </Button>
              </div>
            </div>
          )}
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
