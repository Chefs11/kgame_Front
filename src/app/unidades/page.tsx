import type { Metadata } from "next";
import { Window } from "@/components/retro/Window";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Data";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { questionsForUnit, QUESTIONS } from "@/content/questions";
import { UNITS } from "@/content/units";

export const metadata: Metadata = { title: "Unidades" };

export default function Unidades() {
  return (
    <Window status={`${UNITS.length} unidades`} statusEnd={`${QUESTIONS.length} retos de demostración`}>
      <ScreenHeader
        title="Unidades"
        subtitle="Practica los temas de una unidad o juega una partida mixta con retos de las cuatro."
      />

      <div className="panel-grid">
        {UNITS.map((u) => {
          const qs = questionsForUnit(u.id);
          const scenarios = qs.filter((q) => q.kind === "escenario").length;
          return (
            <article key={u.id} className="panel unit-card">
              <div className="unit-card__head">
                <Tag variant="solid">Unidad {u.numeral}</Tag>
                <span className="text-dim text-small">Vale {u.rubricPoints} puntos en la rúbrica</span>
              </div>
              <h2 className="panel__title">{u.title}</h2>
              <p className="text-dim text-small" style={{ margin: 0 }}>
                {qs.length} retos: {scenarios} escenarios de decisión y {qs.length - scenarios} de opción múltiple
              </p>
              <ul className="unit-card__topics">
                {u.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <div className="unit-card__footer">
                <ButtonLink href={`/jugar?unidad=${u.id}`} size="sm" icon="play">
                  Jugar Unidad {u.numeral}
                </ButtonLink>
              </div>
            </article>
          );
        })}
        <article className="panel panel--strong unit-card">
          <div className="unit-card__head">
            <Tag variant="solid">Repaso general</Tag>
          </div>
          <h2 className="panel__title">Partida mixta</h2>
          <p className="text-dim text-small" style={{ margin: 0 }}>
            Alterna retos de las cuatro unidades. Ideal para repasar antes del examen.
          </p>
          <div className="unit-card__footer">
            <ButtonLink href="/jugar?unidad=mixta" size="sm" icon="play">
              Jugar mixta
            </ButtonLink>
          </div>
        </article>
      </div>

      <SectionHeader title="Retos por unidad" />
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla (desplázala si no cabe)">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Unidad</th>
              <th scope="col" className="num">Retos</th>
              <th scope="col" className="num">Escenarios</th>
              <th scope="col" className="num">Básico, intermedio, avanzado</th>
              <th scope="col" className="num">Rúbrica</th>
            </tr>
          </thead>
          <tbody>
            {UNITS.map((u) => {
              const qs = questionsForUnit(u.id);
              const by = (d: string) => qs.filter((q) => q.difficulty === d).length;
              return (
                <tr key={u.id}>
                  <td>Unidad {u.numeral}</td>
                  <td className="num">{qs.length}</td>
                  <td className="num">{qs.filter((q) => q.kind === "escenario").length}</td>
                  <td className="num">
                    {by("basico")}, {by("intermedio")}, {by("avanzado")}
                  </td>
                  <td className="num">{u.rubricPoints} puntos</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Window>
  );
}
