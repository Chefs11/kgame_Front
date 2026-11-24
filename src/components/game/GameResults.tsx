"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { QUESTION_BY_ID } from "@/content/questions";
import { UNIT_BY_ID, UNITS } from "@/content/units";
import { percent, summarize } from "@/lib/game-engine";
import { useGame } from "@/lib/game-context";
import { useSettings } from "@/lib/settings";
import { Button, ButtonLink } from "../ui/Button";
import { LabelValue, Meter, UnitTag } from "../ui/Data";
import { SectionHeader } from "../ui/Headers";
import { Podium } from "../ui/Podium";
import { EmptyState, Notice } from "../ui/States";
import { ClearProgressButton } from "./ClearProgressButton";

const OUTCOME_LABEL = {
  correcta: "correcta",
  parcial: "a medias",
  incorrecta: "incorrecta",
  "sin-respuesta": "sin respuesta",
} as const;

/** Resultados de la última partida: puntaje, desglose, podio local y temas para repasar. */
export function GameResults() {
  const router = useRouter();
  const game = useGame();
  const settings = useSettings();
  const result = game.lastResult;

  if (!result) {
    return (
      <EmptyState
        title="Todavía no hay resultados"
        icon="trophy"
        action={
          <>
            <ButtonLink href="/jugar" icon="play">
              Jugar una partida
            </ButtonLink>
            <ButtonLink href="/progreso" variant="secondary" icon="floppy">
              Ver mi progreso
            </ButtonLink>
          </>
        }
      >
        Aquí verás tu puntaje y los temas para repasar cuando termines una partida.
      </EmptyState>
    );
  }

  const { total, byUnit, byPlayer, toReview } = summarize(result.answers);
  const pct = percent(total.points, total.maxPoints);
  const multi = result.config.players > 1;

  const playAgain = () => {
    game.start(result.config);
    router.push("/jugar/partida");
  };

  const message =
    pct >= 80
      ? "Dominas estos temas. Repasa los fundamentos para no olvidarlos."
      : pct >= 50
        ? "Vas bien. Repasa los temas de abajo para subir tu puntaje."
        : "Equivocarse también enseña: revisa los fundamentos y vuelve a intentarlo.";

  return (
    <>
      <div className="result-hero">
        <div>
          <div className="screen-header__eyebrow">
            <UnitTag unitId={result.config.unit} long />
          </div>
          <h1 className="result-hero__score">
            {total.points} <span className="result-hero__max">de {total.maxPoints} puntos</span>
          </h1>
          <p className="screen-header__subtitle">{message}</p>
        </div>
      </div>

      <dl className="stat-grid">
        <LabelValue label="Aprovechamiento" value={`${pct}%`} />
        <LabelValue label="Correctas" value={total.correct} />
        <LabelValue label="A medias" value={total.partial} />
        <LabelValue label="Incorrectas o sin responder" value={total.incorrect} />
      </dl>

      {multi && (
        <>
          <SectionHeader title="Podio de esta partida" aside="Solo en este dispositivo" />
          <Podium
            entries={[...byPlayer.entries()].map(([player, t]) => ({
              name: `Jugador ${player}`,
              points: t.points,
              correct: t.correct,
              total: t.total,
            }))}
          />
        </>
      )}

      <SectionHeader title="Por unidad" />
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla (desplázala si no cabe)">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Unidad</th>
              <th scope="col" className="num">
                Correctas
              </th>
              <th scope="col" className="num">
                Puntos
              </th>
              <th scope="col" style={{ minWidth: 140 }}>
                Avance
              </th>
            </tr>
          </thead>
          <tbody>
            {UNITS.filter((u) => byUnit[u.id]).map((u) => {
              const t = byUnit[u.id]!;
              return (
                <tr key={u.id}>
                  <td>
                    Unidad {u.numeral}: {u.shortTitle}
                  </td>
                  <td className="num">
                    {t.correct} de {t.total}
                  </td>
                  <td className="num">
                    {t.points} de {t.maxPoints}
                  </td>
                  <td>
                    <Meter value={percent(t.points, t.maxPoints)} label={`Unidad ${u.numeral}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SectionHeader title="Temas para repasar" />
      {toReview.length === 0 ? (
        <p>No tienes temas pendientes en esta partida. Prueba otra unidad o una dificultad mayor.</p>
      ) : (
        <ul className="prose">
          {toReview.map(({ topic, unitId, tally }) => (
            <li key={topic}>
              <strong>{topic}</strong>{" "}
              <span className="text-dim">
                (Unidad {UNIT_BY_ID[unitId].numeral}, {tally.points} de {tally.maxPoints} puntos).
              </span>{" "}
              <Link className="text-link" href={`/jugar?unidad=${unitId}`}>
                Practicar la Unidad {UNIT_BY_ID[unitId].numeral}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SectionHeader title="Tus respuestas" />
      <ol className="prose text-small">
        {result.answers.map((a, i) => {
          const q = QUESTION_BY_ID[a.questionId];
          const chosen = q?.options.find((o) => o.id === a.optionId);
          return (
            <li key={`${a.questionId}-${i}`}>
              <strong>{q?.title ?? a.questionId}</strong>: {OUTCOME_LABEL[a.outcome]}, {a.points} de {a.maxPoints}{" "}
              puntos{multi ? ` (Jugador ${a.player})` : ""}.
              <br />
              <span className="text-dim">Elegiste: {chosen ? chosen.text : "ninguna opción"}</span>
            </li>
          );
        })}
      </ol>

      <div className="btn-row" style={{ marginTop: "var(--sp-6)" }}>
        <Button size="lg" icon="play" onClick={playAgain}>
          Jugar otra vez
        </Button>
        <ButtonLink href="/unidades" size="lg" variant="secondary" icon="folder">
          Elegir otra unidad
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="ghost" icon="home">
          Volver al escritorio
        </ButtonLink>
      </div>

      <SectionHeader title="Tu progreso guardado" />
      <Notice icon="lock">
        <p>
          {settings.saveProgress
            ? "Guardamos este resultado solo en este navegador, sin datos personales. Puedes consultarlo en Progreso o borrarlo aquí."
            : "El guardado está desactivado, así que este resultado no se guardó."}
        </p>
      </Notice>
      <div style={{ marginTop: "var(--sp-4)" }}>
        <ClearProgressButton />
      </div>
    </>
  );
}
