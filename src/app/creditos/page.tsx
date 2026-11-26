import type { Metadata } from "next";
import { Window } from "@/components/retro/Window";
import { Tag } from "@/components/ui/Data";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { CREDITS, SITE } from "@/content/site";
import { GAME_NAME } from "@/lib/brand";
import { SOURCES } from "@/content/sources";

export const metadata: Metadata = { title: "Créditos" };

export default function Creditos() {
  return (
    <Window status={`Versión ${SITE.version}`} statusEnd={`Fuentes cotejadas el ${SITE.sourcesConsulted}`}>
      <ScreenHeader
        title="Créditos"
        subtitle={`${GAME_NAME}: proyecto escolar de ${SITE.course}.`}
      />

      <SectionHeader title="Equipo" />
      <ul className="prose">
        {CREDITS.team.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <ul className="prose">
        <li>Docente: {CREDITS.teacher}</li>
        <li>
          Institución: {CREDITS.institution}, grupo {CREDITS.group}
        </li>
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
              <td>{CREDITS.license.content}</td>
            </tr>
            <tr>
              <td>Sonidos</td>
              <td>Tonos generados en el navegador con Web Audio</td>
              <td>No usa archivos de audio de terceros</td>
            </tr>
            <tr>
              <td>Foto del monitor y del cuarto (public/scene/room-monitor*)</td>
              <td>Imagen generada con inteligencia artificial (Google Gemini) por el equipo</td>
              <td>Sujeta a los términos de servicio de Google Gemini (ver ATTRIBUTIONS.md)</td>
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
      <ul className="prose">
        <li>
          Código: {CREDITS.license.code} (archivo <code>LICENSE</code> del repositorio).
        </li>
        <li>
          Contenido (textos, retos e imágenes propias):{" "}
          <a className="text-link" href={CREDITS.license.contentUrl} target="_blank" rel="noopener noreferrer">
            {CREDITS.license.content}
          </a>
          .
        </li>
      </ul>

      <SectionHeader title="Validación del contenido" />
      <p>
        Los retos y sus explicaciones fueron revisados y validados por la {CREDITS.teacher}, docente de la asignatura.
      </p>
    </Window>
  );
}
