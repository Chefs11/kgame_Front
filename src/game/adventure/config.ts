/**
 * Configuración del Modo aventura. Todos los valores para afinar la física,
 * la cámara, el render y el audio viven aquí.
 */

export const RENDER = {
  /** Resolución interna fija (10:7, la proporción del vidrio del monitor). */
  width: 320,
  height: 224,
  tile: 16,
  /** Usar escala entera solo si cubre al menos esta fracción del contenedor. */
  integerScaleMinFill: 0.88,
} as const;

export const PHYSICS = {
  /** px/s² */
  gravity: 1000,
  /** Velocidad inicial de salto (px/s). Altura máxima ≈ v² / 2g ≈ 54 px ≈ 3.4 tiles. */
  jumpSpeed: 330,
  /** Al soltar el salto mientras sube, la velocidad vertical se multiplica por este factor. */
  jumpCutFactor: 0.5,
  maxRunSpeed: 95,
  acceleration: 600,
  friction: 700,
  /** En el aire se controla un poco menos. */
  airControl: 0.85,
  maxFallSpeed: 380,
  /** s */
  coyoteTime: 0.1,
  jumpBuffer: 0.1,
  /** Hitbox del personaje (más chica que el sprite). */
  hitbox: { w: 11, h: 21 },
} as const;

export const CAMERA = {
  /** Zona muerta horizontal centrada (px). */
  deadZone: 40,
  /** Suavizado (fracción de la distancia recorrida por segundo, 0–1 por frame a 60 Hz). */
  smoothing: 0.14,
  /** Adelanto en la dirección de la mirada (px). */
  lookAhead: 24,
  /** Parallax del fondo lejano. */
  parallax: 0.2,
} as const;

export const GAMEPLAY = {
  /** Fundido al caer en un foso (s): 0.2 de salida + 0.2 de entrada. */
  respawnFade: 0.4,
  /** Rebote del bloque "?" al tocarlo (s). */
  blockBounce: 0.12,
  /** Bloqueo de movimiento tras cerrar una pregunta (ms). */
  inputLockAfterQuestionMs: 400,
  /** Duración del gesto "ups" tras responder mal (s). */
  oopsTime: 0.7,
  /** Cada cuánto parpadea en reposo (s, aleatorio entre los dos valores). */
  blinkEvery: [2.4, 4.2] as const,
  blinkDuration: 0.14,
  /** El bloque azul (bonus) multiplica los puntos de su reto. */
  bonusMultiplier: 2,
  /** Banner de inicio del nivel (ms). */
  bannerMs: 1200,
  /** Aviso "Faltan N…" en la salida (s). */
  exitHintCooldown: 1.6,
} as const;

export const AUDIO = {
  bpm: 112,
  /** Volumen por defecto (0–1) si el usuario no lo ha cambiado. */
  defaultVolume: 0.7,
  musicGain: 0.32,
  sfxGain: 0.55,
  /** Atenuación de la música mientras hay una pregunta abierta. */
  duckDb: -8,
  duckLowpassHz: 900,
  /** Planificador con anticipación (sin deriva de tiempo). */
  lookaheadMs: 25,
  scheduleAheadS: 0.12,
} as const;

/**
 * Punto de extensión: para sustituir la música sintetizada por un archivo,
 * cambia a { kind: "file", url: "/audio/bosque.ogg" } (colócalo en public/audio).
 */
export type MusicSource = { kind: "synth" } | { kind: "file"; url: string };
export const MUSIC_SOURCE: MusicSource = { kind: "synth" };
