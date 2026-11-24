import { PixelIcon, type PixelIconName } from "../retro/PixelIcon";

export type AnswerState = "idle" | "selected" | "correct" | "partial" | "incorrect" | "dimmed";

const DEFAULT_MARK: Partial<Record<AnswerState, { text: string; icon: PixelIconName }>> = {
  selected: { text: "Tu elección", icon: "check" },
  correct: { text: "Correcta", icon: "check" },
  partial: { text: "A medias", icon: "half" },
  incorrect: { text: "Tu respuesta", icon: "close" },
};

/**
 * Tarjeta de respuesta: tecla grande con letra de atajo. El estado se
 * comunica con texto, icono y forma del borde, no solo con color.
 */
export function AnswerCard({
  letter,
  text,
  state = "idle",
  disabled = false,
  onSelect,
  mark,
}: {
  letter: string;
  text: string;
  state?: AnswerState;
  disabled?: boolean;
  onSelect?: () => void;
  /** Marca personalizada (p. ej. «Decisión responsable»). */
  mark?: { text: string; icon: PixelIconName };
}) {
  const m = mark ?? DEFAULT_MARK[state];
  return (
    <button
      type="button"
      className="answer"
      data-state={state}
      aria-pressed={state === "selected"}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="answer__key" aria-hidden="true">
        {letter}
      </span>
      <span className="answer__text">
        <span className="visually-hidden">Opción {letter}: </span>
        {text}
      </span>
      {m && (
        <span className="answer__mark">
          <PixelIcon name={m.icon} />
          {m.text}
        </span>
      )}
    </button>
  );
}
