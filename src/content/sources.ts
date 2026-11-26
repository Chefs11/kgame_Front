import type { Source, SourceId } from "./types";

/**
 * Fuentes consultadas. Las leyes mexicanas se cotejaron el 2026-11-23 con los
 * textos vigentes publicados por la Cámara de Diputados (Leyes Federales
 * Vigentes). Antes de entregar, el equipo debe volver a revisar la vigencia:
 * las leyes se reforman con frecuencia.
 */
export const SOURCES: Record<SourceId, Source> = {
  indiceLeyes: {
    id: "indiceLeyes",
    name: "Leyes Federales Vigentes",
    shortName: "Índice de leyes",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/index.htm",
    version: "Índice con última reforma publicada en el DOF el 19-11-2026",
    consulted: "2026-11-23",
    verified: true,
  },
  cpeum: {
    id: "cpeum",
    name: "Constitución Política de los Estados Unidos Mexicanos",
    shortName: "CPEUM",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf",
    version: "Texto vigente, última reforma DOF 07-10-2026",
    consulted: "2026-11-23",
    verified: true,
  },
  lfpdppp: {
    id: "lfpdppp",
    name: "Ley Federal de Protección de Datos Personales en Posesión de los Particulares",
    shortName: "LFPDPPP",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf",
    version:
      "Nueva ley publicada en el DOF el 20-03-2025 (abrogó la de 2010); última reforma DOF 14-11-2025",
    consulted: "2026-11-23",
    verified: true,
    note: "La autoridad que aplica esta ley es la Secretaría Anticorrupción y Buen Gobierno (art. 2, fr. XV).",
  },
  lgpdppso: {
    id: "lgpdppso",
    name: "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados",
    shortName: "LGPDPPSO",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/index.htm",
    version: "DOF 20-03-2025; última reforma DOF 14-11-2025 (según el índice)",
    consulted: "2026-11-23",
    verified: true,
    note: "Solo se verificó su nombre y fecha en el índice; no se citan artículos.",
  },
  lgtaip: {
    id: "lgtaip",
    name: "Ley General de Transparencia y Acceso a la Información Pública",
    shortName: "LGTAIP",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGTAIP.pdf",
    version: "Nueva ley publicada en el DOF el 20-03-2025, sin reforma",
    consulted: "2026-11-23",
    verified: true,
  },
  lfda: {
    id: "lfda",
    name: "Ley Federal del Derecho de Autor",
    shortName: "LFDA",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf",
    version: "DOF 24-12-1996; última reforma DOF 14-05-2026",
    consulted: "2026-11-23",
    verified: true,
  },
  lfppi: {
    id: "lfppi",
    name: "Ley Federal de Protección a la Propiedad Industrial",
    shortName: "LFPPI",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPPI.pdf",
    version: "DOF 01-07-2020; última reforma DOF 13-11-2026",
    consulted: "2026-11-23",
    verified: true,
  },
  cpf: {
    id: "cpf",
    name: "Código Penal Federal",
    shortName: "CPF",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/CPF.pdf",
    version:
      "Texto consultado con última reforma DOF 13-03-2026; el índice marcaba una reforma del DOF 13-11-2026 «en actualización»",
    consulted: "2026-11-23",
    verified: true,
    note: "Revisar si la reforma del 13-11-2026 modificó los artículos citados.",
  },
  lfpc: {
    id: "lfpc",
    name: "Ley Federal de Protección al Consumidor",
    shortName: "LFPC",
    issuer: "Cámara de Diputados del H. Congreso de la Unión",
    url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf",
    version: "DOF 24-12-1992; última reforma DOF 12-12-2025",
    consulted: "2026-11-23",
    verified: true,
  },
  reglamentoIaUe: {
    id: "reglamentoIaUe",
    name: "Reglamento (UE) 2024/1689 del Parlamento Europeo y del Consejo, de 13 de junio de 2024, por el que se establecen normas armonizadas en materia de inteligencia artificial",
    shortName: "Reglamento de IA (UE)",
    issuer: "EUR-Lex, Diario Oficial de la Unión Europea",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    version: "DO L, 2024/1689, 12-07-2024",
    consulted: "2026-11-23",
    verified: true,
    note: "Considerando 179: aplicación general desde el 2-08-2026; prohibiciones desde el 2-02-2025.",
  },
  gnuGpl: {
    id: "gnuGpl",
    name: "GNU General Public License, versión 3",
    shortName: "GNU GPL v3",
    issuer: "Free Software Foundation",
    url: "https://www.gnu.org/licenses/gpl-3.0.html",
    version: "Versión 3, 29 de junio de 2007",
    consulted: "2026-11-25",
    verified: true,
  },
  temario: {
    id: "temario",
    name: "Temario de la asignatura Ética y Legislación en Tecnologías de la Información",
    shortName: "Temario",
    issuer: "Universidad Tecnológica Emiliano Zapata",
    version: "Contenido validado por la Mtra. Iris Nayeli Corona",
    verified: true,
  },
};

export function getSource(id: SourceId): Source {
  return SOURCES[id];
}
