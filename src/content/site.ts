/**
 * Datos generales del proyecto. Edita aquí el nombre del juego y los
 * marcadores pendientes. Los textos entre corchetes son marcadores que el
 * equipo debe reemplazar.
 */
import { GAME_NAME } from "@/lib/brand";

export const SITE = {
  /** Nombre del juego: se define en src/lib/brand.ts (GAME_NAME). */
  gameName: GAME_NAME,
  /** Nombre corto para la barra de título del sistema y el fondo de pantalla. */
  systemName: "ETICA-OS",
  monitorBrand: "KG-90",
  course: "Ética y Legislación en Tecnologías de la Información",
  tagline: "Resuelve casos de ética y legislación en las TIC y aprende qué dice la ley mexicana.",
  /** Fecha en que se cotejaron las fuentes jurídicas incluidas. */
  sourcesConsulted: "2026-11-23",
  version: "0.1 (prototipo de demostración)",
} as const;

/** Marcadores editables de la pantalla de créditos. No inventar datos. */
export const CREDITS = {
  team: ["[Integrante 1]", "[Integrante 2]", "[Integrante 3]"],
  teacher: "[Docente de la asignatura]",
  institution: "[Institución / grupo]",
  academicSources: [
    "[Bibliografía del temario: agregar referencias consultadas por el equipo]",
  ],
  license:
    "[Licencia del código y del contenido: pendiente de definir por el equipo]",
  privacyContact: "[Responsable y medio de contacto, si en el futuro se recopilan datos]",
} as const;
