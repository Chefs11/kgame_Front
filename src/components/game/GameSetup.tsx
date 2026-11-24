"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { UNITS } from "@/content/units";
import {
  availableQuestions,
  DEFAULT_SESSION_LENGTH,
  LENGTH_OPTIONS,
  TIMER_OPTIONS,
  type DifficultyChoice,
  type GameMode,
  type UnitChoice,
} from "@/lib/game-engine";
import { useGame } from "@/lib/game-context";
import { updateSettings, useSettings } from "@/lib/settings";
import { playSound } from "@/lib/sound";
import { Button, ButtonLink } from "../ui/Button";
import { SectionHeader } from "../ui/Headers";
import { Notice } from "../ui/States";

const UNIT_VALUES: UnitChoice[] = ["mixta", "u1", "u2", "u3", "u4"];

function parseUnit(value: string | null): UnitChoice {
  return UNIT_VALUES.includes(value as UnitChoice) ? (value as UnitChoice) : "mixta";
}

function Choice<T extends string | number>({
  name,
  value,
  current,
  onChange,
  title,
  desc,
  disabled,
}: {
  name: string;
  value: T;
  current: T;
  onChange: (v: T) => void;
  title: ReactNode;
  desc?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className="choice">
      <input
        className="choice__input"
        type="radio"
        name={name}
        value={String(value)}
        checked={current === value}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <span className="choice__box">
        <span className="choice__title">{title}</span>
        {desc && <span className="choice__desc">{desc}</span>}
      </span>
    </label>
  );
}

/** Lee `?unidad=` y reinicia el formulario cuando cambia. */
export function GameSetupFromParams() {
  const params = useSearchParams();
  const unit = parseUnit(params.get("unidad"));
  return <GameSetup key={unit} initialUnit={unit} />;
}

/** Selección de partida: unidad, duración, dificultad, modalidad y tiempo. */
export function GameSetup({ initialUnit = "mixta" }: { initialUnit?: UnitChoice }) {
  const router = useRouter();
  const game = useGame();
  const settings = useSettings();

  const [unit, setUnit] = useState<UnitChoice>(initialUnit);
  const [length, setLength] = useState<number>(DEFAULT_SESSION_LENGTH);
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("todas");
  const [mode, setMode] = useState<GameMode>("individual");
  const [players, setPlayers] = useState(2);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const available = availableQuestions(unit, difficulty).length;
  const effectiveLength = Math.min(length, available);

  const countFor = (d: DifficultyChoice) => availableQuestions(unit, d).length;

  function start() {
    if (effectiveLength === 0) return;
    playSound("power");
    game.start({
      unit,
      length: effectiveLength,
      difficulty,
      mode,
      players: mode === "pasa" ? players : 1,
      timerSeconds,
    });
    router.push("/jugar/partida");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
    >
      {game.session && (
        <div style={{ marginBottom: "var(--sp-5)" }}>
          <Notice icon="play">
            <p>
              Tienes una partida sin terminar: llevas {game.session.answers.length} de {game.session.items.length} retos.
            </p>
            <div className="btn-row" style={{ marginTop: "var(--sp-2)" }}>
              <ButtonLink href="/jugar/partida" size="sm">
                Continuar partida
              </ButtonLink>
              <Button size="sm" variant="secondary" onClick={game.abandon}>
                Descartar partida
              </Button>
            </div>
          </Notice>
        </div>
      )}

      <fieldset className="fieldset">
        <legend className="fieldset__legend">1. Unidad</legend>
        <p className="fieldset__hint">La partida mixta alterna retos de las cuatro unidades.</p>
        <div className="choice-grid">
          <Choice
            name="unidad"
            value="mixta"
            current={unit}
            onChange={setUnit}
            title="Mixta"
            desc={`${availableQuestions("mixta", "todas").length} retos de todo el temario`}
          />
          {UNITS.map((u) => (
            <Choice
              key={u.id}
              name="unidad"
              value={u.id}
              current={unit}
              onChange={setUnit}
              title={`Unidad ${u.numeral}`}
              desc={`${u.shortTitle}. ${availableQuestions(u.id, "todas").length} retos`}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">2. Duración</legend>
        <div className="choice-grid choice-grid--compact">
          {LENGTH_OPTIONS.map((o) => (
            <Choice
              key={o.value}
              name="duracion"
              value={o.value}
              current={length}
              onChange={setLength}
              title={o.label}
              desc={o.desc}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">3. Dificultad</legend>
        <p className="fieldset__hint">
          Básico vale 100 puntos, intermedio 150 y avanzado 200. Entre paréntesis, los retos disponibles.
        </p>
        <div className="choice-grid choice-grid--compact">
          {(
            [
              ["todas", "Todas"],
              ["basico", "Básico"],
              ["intermedio", "Intermedio"],
              ["avanzado", "Avanzado"],
            ] as const
          ).map(([value, label]) => (
            <Choice
              key={value}
              name="dificultad"
              value={value as DifficultyChoice}
              current={difficulty}
              onChange={setDifficulty}
              title={`${label} (${countFor(value)})`}
              disabled={countFor(value) === 0}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">4. Modalidad</legend>
        <div className="choice-grid">
          <Choice
            name="modalidad"
            value="individual"
            current={mode}
            onChange={setMode}
            title="Individual"
            desc="Una persona responde todos los retos"
          />
          <Choice
            name="modalidad"
            value="pasa"
            current={mode}
            onChange={setMode}
            title="Pasa el dispositivo"
            desc="Por turnos, en este mismo dispositivo"
          />
        </div>
        {mode === "pasa" && (
          <div style={{ marginTop: "var(--sp-3)" }}>
            <p className="fieldset__hint" style={{ margin: "0 0 var(--sp-2)" }}>
              ¿Cuántas personas juegan? Se identifican como «Jugador 1», «Jugador 2», etc. No pedimos nombres.
            </p>
            <div className="choice-grid choice-grid--compact">
              {[2, 3, 4].map((n) => (
                <Choice
                  key={n}
                  name="jugadores"
                  value={n}
                  current={players}
                  onChange={setPlayers}
                  title={`${n} jugadores`}
                />
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend">5. Temporizador</legend>
        <p className="fieldset__hint">Opcional. El tiempo no da puntos extra: solo limita cada reto.</p>
        <div className="choice-grid choice-grid--compact">
          {TIMER_OPTIONS.map((o) => (
            <Choice
              key={o.value}
              name="tiempo"
              value={o.value}
              current={timerSeconds}
              onChange={setTimerSeconds}
              title={o.label}
              desc={o.desc}
            />
          ))}
        </div>
      </fieldset>

      <SectionHeader title="Antes de empezar" />
      <div className="prose text-small">
        <ul>
          <li>Elige una opción y confírmala. En los escenarios, cada decisión tiene consecuencias.</li>
          <li>
            Una respuesta correcta o una decisión responsable vale todos los puntos; una decisión a medias, la mitad; una
            riesgosa o incorrecta, cero.
          </li>
          <li>Después de cada reto verás qué pasó, por qué y el fundamento ético o legal, con sus fuentes.</li>
        </ul>
      </div>

      <Notice icon="lock">
        <p>
          Al terminar, guardamos tu resultado (unidad, retos y puntos) solo en este navegador, sin nombres ni datos
          personales. Nada se envía a internet y puedes borrarlo cuando quieras desde <em>Progreso</em>.
        </p>
        <label className="checkbox" style={{ marginTop: "var(--sp-2)" }}>
          <input
            type="checkbox"
            checked={settings.saveProgress}
            onChange={(e) => updateSettings({ saveProgress: e.target.checked })}
          />
          <span>Guardar mis resultados en este navegador</span>
        </label>
      </Notice>

      <div className="game-actions">
        <span className="game-actions__hint" role="status">
          {effectiveLength === 0
            ? "No hay retos con esa combinación. Elige otra unidad u otra dificultad."
            : `Vas a jugar ${effectiveLength} ${effectiveLength === 1 ? "reto" : "retos"}${
                effectiveLength < length ? `: son todos los disponibles con esa combinación` : ""
              }.`}
        </span>
        <Button type="submit" size="lg" icon="play" disabled={effectiveLength === 0}>
          Empezar partida
        </Button>
      </div>
    </form>
  );
}
