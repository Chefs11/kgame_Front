import type { Metadata } from "next";
import { Window } from "@/components/retro/Window";
import { Tag } from "@/components/ui/Data";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { Notice } from "@/components/ui/States";
import { QUESTIONS } from "@/content/questions";
import { CREDITS, SITE } from "@/content/site";
import { GAME_NAME } from "@/lib/brand";
import { SOURCES } from "@/content/sources";
import { UNIT_BY_ID } from "@/content/units";

export const metadata: Metadata = { title: "Créditos" };

export default function Creditos() {
  const toReview = QUESTIONS.filter((q) => q.review.status === "requiere-revision");
  return (
    <Window status="Los textos entre [corchetes] los completa el equipo" statusEnd={`Fuentes cotejadas el ${SITE.sourcesConsulted}`}>
      <ScreenHeader
        title="Créditos"
        subtitle={`${GAME_NAME}: proyecto escolar de ${SITE.course}.`}
      />

      <Notice>
        <p>
          Edita estos datos en <code>src/content/site.ts</code>. No se incluyen nombres, licencias ni autorizaciones que
          el equipo no haya confirmado.
        </p>
      </Notice>

      <SectionHeader title="Equipo" />
      <ul className="prose">
        {CREDITS.team.map((m) => (
          <li key={m}>
            <span className="editable">{m}</span>
          </li>
        ))}
        <li>
          Docente: <span className="editable">{CREDITS.teacher}</span>
        </li>
        <li>
          Institución / grupo: <span className="editable">{CREDITS.institution}</span>
        </li>
      </ul>

      <SectionHeader title="Fuentes académicas" />
      <ul className="prose text-small">
        {CREDITS.academicSources.map((s) => (
          <li key={s}>
            <span className="editable">{s}</span>
          </li>
        ))}
      </ul>

      <SectionHeader title="Fuentes jurídicas" aside={`Consultadas el ${SITE.sourcesConsulted}`} />
      <ul className="prose text-small">
        {Object.values(SOURCES)
          .filter((s) => s.id !== "temario")
          .map((s) => (
            <li key={s.id}>
              {s.url ? (
                <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ) : (
                s.name
              )}
              <span className="text-dim">
                {" "}
                — {s.issuer}. {s.version}.{s.note ? ` ${s.note}` : ""}
              </span>{" "}
              {!s.verified && <Tag variant="alert">Pendiente de verificar</Tag>}
            </li>
          ))}
      </ul>

      <SectionHeader title="Recursos de terceros" />
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla (desplázala si no cabe)">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Recurso</th>
              <th scope="col">Autoría / origen</th>
              <th scope="col">Licencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tipografía Jersey 10</td>
              <td>Sarah Cadigan-Fried (Google Fonts), autoalojada con next/font</td>
              <td>SIL Open Font License 1.1</td>
            </tr>
            <tr>
              <td>Tipografía Chivo Mono</td>
              <td>Omnibus-Type (Google Fonts), autoalojada con next/font</td>
              <td>SIL Open Font License 1.1</td>
            </tr>
            <tr>
              <td>Iconos pixelados</td>
              <td>Creados para este proyecto (SVG en código)</td>
              <td>
                <span className="editable">Misma licencia que el proyecto (pendiente)</span>
              </td>
            </tr>
            <tr>
              <td>Sonidos</td>
              <td>Tonos generados en el navegador con Web Audio</td>
              <td>No usa archivos de audio de terceros</td>
            </tr>
            <tr>
              <td>Imágenes y fotografías</td>
              <td>No se usan; el cuarto y el monitor se dibujan con CSS (sin fotografías de terceros)</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Next.js, React, Tailwind CSS</td>
              <td>Dependencias de código</td>
              <td>MIT (ver ATTRIBUTIONS.md)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-dim text-small">
        La dirección visual se inspira en el portafolio de Milo Varga hecho en Framer, usado como referencia con
        permiso de su autor. No se usan su fotografía, su nombre ni sus textos.
      </p>

      <SectionHeader title="Licencia" />
      <p>
        <span className="editable">{CREDITS.license}</span>
      </p>
      <p className="text-dim text-small">
        Nota: el repositorio contiene un archivo <code>LICENSE</code> (MIT). El equipo debe confirmar si esa es la
        licencia definitiva del código y decidir la del contenido académico.
      </p>

      <SectionHeader title="Pendiente de revisión docente" aside={`${toReview.length} retos`} />
      <p className="text-dim text-small">
        Estos retos tienen contenido conceptual o interpretativo que el equipo docente debe validar o vincular con la
        bibliografía del curso.
      </p>
      <ul className="prose text-small">
        {toReview.map((q) => (
          <li key={q.id}>
            <strong>
              Unidad {UNIT_BY_ID[q.unitId].numeral}: {q.title}
            </strong>{" "}
            <span className="text-dim">{q.review.note}</span>
          </li>
        ))}
      </ul>
    </Window>
  );
}
