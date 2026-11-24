import type { Unit, UnitId } from "./types";

/** Unidades del temario y su ponderación en la rúbrica. */
export const UNITS: Unit[] = [
  {
    id: "u1",
    numeral: "I",
    title: "Fundamentos de la ética en las TIC",
    shortTitle: "Fundamentos de la ética",
    rubricPoints: 15,
    topics: [
      "Moral, valores, principios, ética y dilemas éticos",
      "Ética en el uso de las TIC y en el desarrollo de software",
      "Ética de empleados y usuarios de tecnologías",
      "Privacidad, seguridad, responsabilidad, propiedad intelectual y acceso equitativo",
      "Ciberacoso, plagio, discriminación y desinformación",
      "Toma de decisiones éticas",
      "Políticas, procedimientos y cumplimiento normativo",
    ],
  },
  {
    id: "u2",
    numeral: "II",
    title: "Datos personales y derecho de la propiedad",
    shortTitle: "Datos personales y propiedad",
    rubricPoints: 20,
    topics: [
      "Derecho a la información y régimen jurídico de la información en México",
      "Marco constitucional y libertad de expresión",
      "Derecho de petición",
      "Privacidad y protección de datos personales",
      "Propiedad intelectual y derechos de autor en el ámbito digital",
      "Revisión y auditoría de código",
    ],
  },
  {
    id: "u3",
    numeral: "III",
    title: "Delitos informáticos",
    shortTitle: "Delitos informáticos",
    rubricPoints: 20,
    topics: [
      "Responsabilidad social y ambiental en las TIC",
      "Definición y clasificación de delitos informáticos",
      "Penas y medidas de prevención",
      "Normatividad nacional e internacional",
      "Delitos contra el patrimonio",
      "Delitos contra la propiedad intelectual",
      "Uso de las TIC como medio para cometer delitos",
      "Normas relativas a inteligencia artificial",
      "Cumplimiento normativo",
    ],
  },
  {
    id: "u4",
    numeral: "IV",
    title: "Aplicaciones de la ética y la legislación en las TIC",
    shortTitle: "Aplicaciones de la ética y la ley",
    rubricPoints: 15,
    topics: [
      "Ética y responsabilidad en la investigación en línea",
      "Ética en el uso de redes sociales",
      "Propiedad industrial, licenciamiento y derechos de autor",
      "Copyright, Copyleft y licencias de software",
      "Comercio electrónico y protección al consumidor",
      "Inteligencia artificial, sesgos algorítmicos, discriminación y privacidad",
    ],
  },
];

export const UNIT_BY_ID: Record<UnitId, Unit> = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
) as Record<UnitId, Unit>;

export const DIFFICULTY_LABEL = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
} as const;

export const KIND_LABEL = {
  "opcion-multiple": "Opción múltiple",
  escenario: "Escenario de decisión",
} as const;

export const CONDUCT_LABEL = {
  "falta-etica": "Falta ética",
  "infraccion-administrativa": "Infracción administrativa",
  delito: "Delito",
} as const;
