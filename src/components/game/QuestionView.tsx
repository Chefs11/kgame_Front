"use client";

import type { ReactNode, Ref } from "react";
import { CONDUCT_LABEL } from "@/content/units";
import type { Question } from "@/content/types";
import type { AnswerRecord } from "@/lib/game-engine";
import type { PixelIconName } from "../retro/PixelIcon";
import { AnswerCard, type AnswerState } from "../ui/AnswerCard";
import { Button } from "../ui/Button";
import { FeedbackBlock, FeedbackMessage, type FeedbackVariant } from "../ui/FeedbackMessage";
import { SourceList } from "../ui/SourceList";

/**
 * Vista de un reto: enunciado, opciones, confirmación y retroalimentación con
 * fundamento. La comparten el Modo clásico (GamePlay) y el Modo aventura
 * (overlay sobre el juego). No guarda estado: lo recibe todo por props.
 */
export const LETTERS = ["A", "B", "C", "D", "E", "F"];
const NON_LEGAL_SOURCES = new Set(["temario", "gnuGpl"]);

export type QuestionPhase = "question" | "feedback";

function cardState(
  question: Question,
  optionId: string,
  phase: QuestionPhase,
  selected: string | null,
  answer?: AnswerRecord,
): AnswerState {
  if (phase === "question") return selected === optionId ? "selected" : "idle";
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

export function feedbackVariantOf(answer: AnswerRecord | undefined): FeedbackVariant | null {
  if (!answer) return null;
  if (answer.outcome === "correcta") return "correct";
  if (answer.outcome === "parcial") return "partial";
  if (answer.outcome === "sin-respuesta") return "timeout";
  return "incorrect";
}

export interface QuestionViewProps {
  question: Question;
  optionOrder: string[];
  phase: QuestionPhase;
  selected: string | null;
  answer?: AnswerRecord;
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
  /** Contenido previo al título (marcadores, progreso, temporizador). */
  header?: ReactNode;
  topRef?: Ref<HTMLDivElement>;
  feedbackRef?: Ref<HTMLDivElement>;
  /** Fila de acciones bajo la retroalimentación (p. ej. «Siguiente reto» o «Continuar»). */
  feedbackFooter?: ReactNode;
  /** Puntos a mostrar en la retroalimentación (por defecto, los de la respuesta). */
  pointsLabel?: string;
}

export function QuestionView({
  question,
  optionOrder,
  phase,
  selected,
  answer,
  onSelect,
  onConfirm,
  header,
  topRef,
  feedbackRef,
  feedbackFooter,
  pointsLabel,
}: QuestionViewProps) {
  const scenario = question.kind === "escenario";
  const isLegal = question.sources.some((s) => !NON_LEGAL_SOURCES.has(s.sourceId));
  const feedbackVariant = phase === "feedback" ? feedbackVariantOf(answer) : null;
  const feedbackTitle: Record<FeedbackVariant, string> = {
    correct: scenario ? "Decisión responsable" : "Correcto",
    partial: "Decisión a medias",
    incorrect: scenario ? "Decisión riesgosa" : "Incorrecto",
    timeout: "Se acabó el tiempo",
  };
  const chosenScenario =
    scenario && answer?.optionId ? question.options.find((o) => o.id === answer.optionId) : undefined;
  const correctMc = question.kind === "opcion-multiple" ? question.options.find((o) => o.correct) : undefined;
  const correctLetter = correctMc ? LETTERS[optionOrder.indexOf(correctMc.id)] : undefined;

  return (
    <>
      <div ref={topRef} tabIndex={-1} style={{ outline: "none", scrollMarginTop: 16 }}>
        {header}
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
        {optionOrder.map((optionId, i) => {
          const opt = question.options.find((o) => o.id === optionId);
          if (!opt) return null;
          const state = cardState(question, optionId, phase, selected, answer);
          return (
            <li key={optionId}>
              <AnswerCard
                letter={LETTERS[i]}
                text={opt.text}
                state={state}
                disabled={phase !== "question"}
                mark={scenarioMark(question, optionId, state)}
                onSelect={() => onSelect(optionId)}
              />
            </li>
          );
        })}
      </ul>

      {phase === "question" && (
        <div className="game-actions">
          <span className="game-actions__hint" role="status">
            {selected === null
              ? "Elige una opción con el mouse, el dedo o las teclas 1 a 4."
              : "Puedes cambiar de opción antes de confirmar."}
          </span>
          <Button size="lg" onClick={onConfirm} disabled={selected === null} shortcut="Enter">
            Confirmar respuesta
          </Button>
        </div>
      )}

      {phase === "feedback" && answer && feedbackVariant && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          style={{ outline: "none", marginTop: "var(--sp-6)", scrollMarginTop: 16 }}
          aria-label={`${feedbackTitle[feedbackVariant]}. Retroalimentación del reto`}
        >
          <FeedbackMessage
            variant={feedbackVariant}
            title={feedbackTitle[feedbackVariant]}
            points={pointsLabel ?? (answer.points === 1 ? "+1 punto" : `+${answer.points} puntos`)}
          >
            {feedbackVariant === "timeout" && (
              <FeedbackBlock title="Qué pasó">
                No elegiste ninguna opción a tiempo y no sumas puntos. Lee el fundamento: es lo que más te ayudará a
                recordarlo.
              </FeedbackBlock>
            )}

            {question.kind === "opcion-multiple" && feedbackVariant !== "correct" && correctMc && (
              <FeedbackBlock title="La respuesta correcta">{`${correctLetter}. ${correctMc.text}`}</FeedbackBlock>
            )}

            {chosenScenario && <FeedbackBlock title="Lo que pasaría">{chosenScenario.consequence}</FeedbackBlock>}

            <FeedbackBlock title="Por qué">{question.explanation}</FeedbackBlock>

            <FeedbackBlock title={isLegal ? "Fundamento legal" : "Fundamento ético"} variant="basis">
              {question.principle}
            </FeedbackBlock>

            {question.kind === "escenario" && (
              <FeedbackBlock title={feedbackVariant === "correct" ? "Por qué es la mejor decisión" : "Qué hacer en su lugar"}>
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
            </details>

            <p className="text-dim text-small" style={{ margin: 0 }}>
              Material educativo: no es asesoría jurídica.
            </p>
          </FeedbackMessage>

          {feedbackFooter}
        </div>
      )}
    </>
  );
}
