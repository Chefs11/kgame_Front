# Atribuciones y licencias de terceros

Proyecto escolar de *Ética y Legislación en TI*. Este archivo declara los recursos de terceros
utilizados.

## Dependencias principales
| Recurso | Licencia |
|---|---|
| Next.js / React | MIT |
| Tailwind CSS | MIT |
| socket.io-client (instalado; sin uso en el prototipo) | MIT |

## Tipografías
Autoalojadas con `next/font/google` (los archivos se descargan al compilar; el navegador no hace
peticiones a Google).

| Fuente | Uso | Licencia |
|---|---|---|
| Jersey 10 | Títulos y nombre del juego (pixel) | SIL Open Font License 1.1 |
| Chivo Mono | Texto, botones y controles | SIL Open Font License 1.1 |

Alternativas locales si no cargan: `Courier New` / `monospace` y `ui-monospace`, `Menlo`, `Consolas`.

Las tipografías coinciden con las del sitio de referencia visual (retro-pc.framer.website); solo se
reutiliza la elección de fuentes abiertas, no imágenes, textos ni recursos de ese sitio.

## Iconos, imágenes y sonidos
- **Iconos pixelados:** creados para este proyecto como rejillas SVG en
  `src/components/retro/PixelIcon.tsx`.
- **Cuarto y monitor:** dibujados con CSS; no se usan fotografías ni imágenes externas (la fotografía
  del sitio de referencia no se copió).
- **Sonidos:** tonos generados en el navegador con Web Audio; no hay archivos de audio.

## Textos legales citados
Las leyes mexicanas citadas son textos oficiales publicados por la Cámara de Diputados
(Leyes Federales Vigentes). El Reglamento (UE) 2024/1689 se consultó en EUR-Lex. Ver
`src/content/sources.ts`.

Agregar aquí cualquier imagen, sonido, icono o texto de terceros que se incorpore, con su autor,
fuente y licencia.
