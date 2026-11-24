"use client";

import { UNIT_BY_ID, UNITS } from "@/content/units";
import { percent, summarize } from "@/lib/game-engine";
import { useProgress } from "@/lib/progress";
import { updateSettings, useSettings } from "@/lib/settings";
import { ButtonLink } from "../ui/Button";
import { LabelValue, Meter } from "../ui/Data";
import { SectionHeader } from "../ui/Headers";
import { EmptyState, Notice } from "../ui/States";
import { ClearProgressButton } from "./ClearProgressButton";

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

/** Progreso guardado en este navegador. */
export function ProgressView() {
  const progress = useProgress();
  const settings = useSettings();
  const games = progress.games;
  const all = games.flatMap((g) => g.answers);
  const { total, byUnit, toReview } = summarize(all);

  return (
    <>
      <Notice icon="lock">
        <p>
          Tu progreso se guarda <strong>solo en este navegador</strong>. No hay cuentas ni servidor: si cambias de
          dispositivo o borras los datos del navegador, no lo verás.
        </p>
        <label className="checkbox" style={{ marginTop: "var(--sp-2)" }}>
          <input
            type="checkbox"
            checked={settings.saveProgress}
            onChange={(e) => updateSettings({ saveProgress: e.target.checked })}
          />
          <span>Guardar los resultados de mis próximas partidas</span>
        </label>
      </Notice>

      {games.length === 0 ? (
        <div style={{ marginTop: "var(--sp-5)" }}>
          <EmptyState
            title="Aún no hay partidas guardadas"
            icon="floppy"
            action={
              <ButtonLink href="/jugar" icon="play">
                Jugar una partida
              </ButtonLink>
            }
          >
            Termina una partida y aquí verás tu avance por unidad y los temas que te conviene repasar.
          </EmptyState>
        </div>
      ) : (
        <>
          <SectionHeader title="Resumen" />
          <dl className="stat-grid">
            <LabelValue label="Partidas" value={games.length} />
            <LabelValue label="Retos respondidos" value={total.total} />
            <LabelValue label="Aprovechamiento" value={`${percent(total.points, total.maxPoints)}%`} />
          </dl>

          <SectionHeader title="Avance por unidad" />
          <div className="stack" style={{ gap: "var(--sp-3)" }}>
            {UNITS.map((u) => {
              const t = byUnit[u.id];
              return (
                <div key={u.id}>
                  <div className="text-small" style={{ marginBottom: 4 }}>
                    Unidad {u.numeral} · {u.shortTitle}{" "}
                    <span className="text-dim">{t ? `(${t.total} retos respondidos)` : "(aún sin jugar)"}</span>
                  </div>
                  <Meter value={t ? percent(t.points, t.maxPoints) : 0} label={`Unidad ${u.numeral}`} />
                </div>
              );
            })}
          </div>

          <SectionHeader title="Temas para repasar" />
          {toReview.length === 0 ? (
            <p>No tienes temas pendientes. Prueba una dificultad mayor.</p>
          ) : (
            <ul className="prose text-small">
              {toReview.slice(0, 6).map(({ topic, unitId, tally }) => (
                <li key={topic}>
                  {topic}{" "}
                  <span className="text-dim">
                    (Unidad {UNIT_BY_ID[unitId].numeral}, {percent(tally.points, tally.maxPoints)}% de aprovechamiento)
                  </span>
                </li>
              ))}
            </ul>
          )}

          <SectionHeader title="Últimas partidas" />
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla (desplázala si no cabe)">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Unidad</th>
                  <th scope="col">Modalidad</th>
                  <th scope="col" className="num">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody>
                {games.slice(0, 10).map((g) => {
                  const s = summarize(g.answers).total;
                  return (
                    <tr key={g.id}>
                      <td>{dateFormat.format(new Date(g.finishedAt))}</td>
                      <td>{g.config.unit === "mixta" ? "Mixta" : `Unidad ${UNIT_BY_ID[g.config.unit].numeral}`}</td>
                      <td>{g.config.players > 1 ? `Pasa el dispositivo, ${g.config.players} jugadores` : "Individual"}</td>
                      <td className="num">
                        {s.points} de {s.maxPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <SectionHeader title="Borrar tu progreso" />
      <p className="text-dim text-small">
        También puedes borrarlo desde la configuración de tu navegador, en los datos del sitio.
      </p>
      <ClearProgressButton />
    </>
  );
}
