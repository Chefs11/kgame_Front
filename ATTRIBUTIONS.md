# Atribuciones y licencias de terceros

**ÉticaTIC Arcade**, proyecto escolar de *Ética y Legislación en TI*. Este archivo declara los recursos de terceros
utilizados.

## Dependencias principales
| Recurso | Licencia |
|---|---|
| Next.js / React | MIT |
| Tailwind CSS | MIT |
| socket.io-client (instalado; sin uso en el prototipo) | MIT |

## Tipografías
Autoalojadas con `next/font/google` (los archivos se descargan al compilar; el navegador no hace
peticiones a Google). Autoría y licencia verificadas en el repositorio oficial de Google Fonts
(`ofl/<fuente>/METADATA.pb`) el 2026-11-23.

| Fuente | Uso | Autor | Fuente / repositorio | Licencia |
|---|---|---|---|---|
| Jersey 10 | Títulos y nombre del juego (pixel) | Sarah Cadigan-Fried (The Soft Type Project Authors) | https://github.com/scfried/soft-type-jersey · https://fonts.google.com/specimen/Jersey+10 | SIL Open Font License 1.1 |
| Chivo Mono | Texto, botones y controles | Omnibus-Type (The Chivo Project Authors) | https://github.com/Omnibus-Type/Chivo · https://fonts.google.com/specimen/Chivo+Mono | SIL Open Font License 1.1 |

Alternativas locales si no cargan: `Courier New` / `monospace` y `ui-monospace`, `Menlo`, `Consolas`.

## Iconos, imágenes y sonidos
- **Iconos pixelados:** diseño propio del equipo, dibujados como rejillas de 16×16 en
  `src/components/retro/PixelIcon.tsx` (no se basan en paquetes de iconos de terceros). Licencia: la
  del proyecto (pendiente de definir por el equipo).
- **Monitor y efectos CRT:** dibujados con CSS y SVG en línea (`monitor.css`, `crt.css`); el grano es
  ruido SVG generado (`feTurbulence`).
- **Fondo del cuarto:** `public/scene/bg.jpg` (archivo original `fondo_desk.jpeg`, 1427×736 px).
  - Autoría: imagen **generada con inteligencia artificial (Google Gemini)** a petición del equipo.
  - Licencia: no proviene de un banco de imágenes ni de otra persona; su uso se rige por los términos
    de servicio de Google Gemini vigentes al generarla, que el equipo debe conservar y revisar.
  - Nota: el art. 12 de la Ley Federal del Derecho de Autor define al autor como «la persona física
    que ha creado una obra»; si una imagen generada por IA tiene o no protección por derecho de autor
    es una cuestión que el equipo docente debe revisar. Se declara aquí por transparencia.
  - Si se elimina, se usa la escena alternativa hecha solo con CSS (`src/styles/scene.css`).
- **Sonidos:** tonos generados en el navegador con Web Audio; no hay archivos de audio.

## Diseño de referencia
- La dirección visual (monitor CRT beige en un cuarto con luz cálida, escritorio ámbar con iconos
  pixel, barra de tareas, título pixel grande) se inspira en el **portafolio de Milo Varga, hecho en
  Framer** (retro-pc.framer.website), **usado como referencia con permiso de su autor**. No se usan
  su fotografía, su nombre, sus textos ni otros recursos de ese sitio.

## Textos legales citados
Las leyes mexicanas citadas son textos oficiales publicados por la Cámara de Diputados
(Leyes Federales Vigentes). El Reglamento (UE) 2024/1689 se consultó en EUR-Lex. Ver
`src/content/sources.ts`.

Agregar aquí cualquier imagen, sonido, icono o texto de terceros que se incorpore, con su autor,
fuente y licencia.
