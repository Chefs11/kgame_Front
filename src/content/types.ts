/**
 * Tipos del contenido académico. Todo el contenido vive en `src/content/`
 * y no depende de componentes de interfaz, para que más adelante pueda
 * venir de un backend con la misma forma.
 */

export type UnitId = "u1" | "u2" | "u3" | "u4";

export type Difficulty = "basico" | "intermedio" | "avanzado";

export type QuestionKind = "opcion-multiple" | "escenario";

/** Calidad de una decisión en un escenario. */
export type OptionQuality = "responsable" | "parcial" | "riesgosa";

/** Tipo de consecuencia que puede tener una conducta. */
export type ConductType = "falta-etica" | "infraccion-administrativa" | "delito";

/**
 * Estado de revisión:
 * - `texto-verificado`: los artículos citados se cotejaron con el texto oficial
 *   en la fecha de consulta de la fuente. La interpretación pedagógica también
 *   debe validarla el equipo docente.
 * - `requiere-revision`: contenido conceptual o interpretativo que el equipo
 *   debe vincular con la bibliografía del curso antes de darlo por definitivo.
 */
export type ReviewStatus = "texto-verificado" | "requiere-revision";

export type SourceId =
  | "cpeum"
  | "lfpdppp"
  | "lgpdppso"
  | "lgtaip"
  | "lfda"
  | "lfppi"
  | "cpf"
  | "lfpc"
  | "indiceLeyes"
  | "reglamentoIaUe"
  | "gnuGpl"
  | "temario";

export interface Source {
  id: SourceId;
  /** Nombre oficial completo. */
  name: string;
  shortName: string;
  issuer: string;
  url?: string;
  /** Versión o fecha de última reforma que se consultó. */
  version: string;
  /** Fecha de consulta en formato AAAA-MM-DD. */
  consulted?: string;
  /** `false` si la fuente no se pudo consultar y debe verificarse. */
  verified: boolean;
  note?: string;
}

export interface SourceRef {
  sourceId: SourceId;
  /** Ubicación exacta, por ejemplo "art. 2, fr. VI". */
  pinpoint?: string;
}

export interface Classification {
  type: ConductType;
  text: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface ScenarioOption {
  id: string;
  text: string;
  quality: OptionQuality;
  /** Qué ocurre si se elige esta decisión. */
  consequence: string;
}

interface QuestionBase {
  id: string;
  unitId: UnitId;
  /** Tema del temario al que pertenece (se usa para recomendar repaso). */
  topic: string;
  difficulty: Difficulty;
  /** Nombre corto del reto. */
  title: string;
  /** Situación previa (opcional en opción múltiple, típica en escenarios). */
  context?: string;
  prompt: string;
  /** Por qué la respuesta es correcta o incorrecta. */
  explanation: string;
  /**
   * Fundamento: el principio ético o la disposición legal que respalda la
   * respuesta. Si aplica, cita la ley mexicana y el artículo.
   */
  principle: string;
  /** Distinción entre falta ética, infracción y delito, cuando aplica. */
  classification?: Classification[];
  sources: SourceRef[];
  review: {
    status: ReviewStatus;
    note?: string;
  };
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: "opcion-multiple";
  options: MultipleChoiceOption[];
}

export interface ScenarioQuestion extends QuestionBase {
  kind: "escenario";
  options: ScenarioOption[];
  /** Alternativa responsable explicada con detalle. */
  responsibleAlternative: string;
}

export type Question = MultipleChoiceQuestion | ScenarioQuestion;

export interface Unit {
  id: UnitId;
  numeral: "I" | "II" | "III" | "IV";
  title: string;
  shortTitle: string;
  /** Ponderación en la rúbrica. */
  rubricPoints: number;
  topics: string[];
}
