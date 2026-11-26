import { getSource } from "@/content/sources";
import type { SourceRef } from "@/content/types";

/** Lista de fuentes de una pregunta, con su ubicación y estado de verificación. */
export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="source-list">
      {sources.map((ref, i) => {
        const s = getSource(ref.sourceId);
        return (
          <li key={`${ref.sourceId}-${i}`}>
            {s.url ? (
              <a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.shortName}
              </a>
            ) : (
              <span>{s.shortName}</span>
            )}
            {ref.pinpoint && <>, {ref.pinpoint}</>}
            <span className="text-dim">
              {" "}
              — {s.version}
              {s.consulted ? `. Consultada: ${s.consulted}` : ""}
              {!s.verified ? ". Pendiente de verificar." : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
