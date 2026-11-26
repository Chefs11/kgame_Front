/**
 * Datos generales del proyecto y de la pantalla de créditos.
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
  version: "1.0",
} as const;

export const CREDITS = {
  team: ["Alan Salgado Arias", "Ernesto Figueroa Domínguez", "Bigvai Villanueva", "José Manuel Sánchez"],
  teacher: "Mtra. Iris Nayeli Corona",
  institution: "Universidad Tecnológica Emiliano Zapata",
  group: "7E",
  license: {
    code: "Licencia MIT",
    content: "Creative Commons Atribución 4.0 Internacional (CC BY 4.0)",
    contentUrl: "https://creativecommons.org/licenses/by/4.0/deed.es",
  },
} as const;
