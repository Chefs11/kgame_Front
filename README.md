# kgame_Front — [Nombre del juego]

Frontend de un juego educativo para repasar **Ética y Legislación en Tecnologías de la Información**.
La interfaz simula una computadora CRT de los años 90: un monitor sobre un escritorio, con un sistema
operativo retro (iconos, ventanas, barra de tareas) en paleta ámbar.

> Prototipo **sin backend**: no hay cuentas, partidas en línea, clasificaciones compartidas ni
> sincronización. Las partidas son individuales o en modo local «pasa el dispositivo», y el progreso
> se guarda solo en el navegador (`localStorage`).

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4
(tokens en `@theme`) y hojas de estilo por área en `src/styles/`.

## Instalar y ejecutar

```bash
npm install
npm run dev        # http://localhost:3001
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3001) |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación (puerto 3001) |
| `npm run lint` | ESLint |

No necesita variables de entorno. `.env.example` y `src/lib/socket.ts` son del arranque original del
proyecto y **no se usan** en esta versión.

## Organización

```
src/
  app/                    Rutas (cada una es una ventana del escritorio)
    page.tsx              Inicio
    jugar/                Selección de partida
    jugar/partida/        Juego
    jugar/resultados/     Resultados
    unidades/ reglas/ ayuda/ progreso/ creditos/ privacidad/
    not-found.tsx         Ventana de error 404
  components/
    retro/                Sistema: MonitorFrame, Desktop, DesktopHero, DesktopIcon,
                          TaskbarItem, Taskbar, Window, PixelIcon, Clock
    ui/                   Button/ButtonLink, AnswerCard, Timer, ScoreBadge, Podium,
                          SubmitButton, ScreenHeader, SectionHeader, Divider, LabelValue,
                          Tag/UnitTag, ProgressIndicator, Meter, FeedbackMessage,
                          EmptyState, ErrorState, Notice, BackLink, SourceList
    game/                 GameSetup, GamePlay, GameResults, ProgressView, SettingsPanel
  content/                DATOS EDITABLES (sin interfaz)
    site.ts               Nombre del juego y marcadores de créditos
    units.ts              Unidades, temas y ponderación de la rúbrica
    sources.ts            Fuentes jurídicas consultadas (con fecha y versión)
    questions/unidad-N.ts Retos de cada unidad
    apps.ts               Iconos, accesos y títulos de ventana
  lib/
    game-engine.ts        Lógica pura: armado de partidas, puntaje, resúmenes
    game-context.tsx      Estado de la partida en curso
    progress.ts           Progreso local (localStorage)
    settings.ts           Ajustes (sonido, vista, presentación, movimiento)
    sound.ts              Tonos generados con Web Audio (apagado por defecto)
  styles/                 Estilos por área (monitor, escritorio, ventanas, ui, juego) y
                          tokens.css (alias semánticos de los tokens de Tailwind)
```

## Sistema de diseño

Dirección visual: computadora CRT beige de los 90 en un cuarto con luz cálida; dentro, un
escritorio de fósforo ámbar (`#FFB648`) sobre azul noche (`#020B14`). La pieza memorable es el
nombre del juego en pixel gigante sobre el escritorio; todo lo demás es sobrio: filetes delgados,
teclas con sombra dura y texto monoespaciado.

**Tokens** (una sola fuente de verdad en `src/app/globals.css`, bloque `@theme` de Tailwind v4;
generan utilidades como `bg-screen`, `text-phosphor`, `font-display` y variables CSS):

| Grupo | Tokens |
|---|---|
| Pantalla | `screen`, `screen-raised`, `phosphor`, `phosphor-bright`, `phosphor-dim` (texto secundario), `phosphor-line` (bordes de controles), `phosphor-deep` (sombra de teclas), `alert` |
| Monitor y cuarto | `case`, `case-light`, `case-shade`, `case-deep`, `case-ink`, `bezel`, `wall`, `wall-lit`, `wood`, `led` |
| Tipografía | `font-display` (Jersey 10), `font-mono` (Chivo Mono); tamaños `meta`, `ui`, `body`, `lead`, `display-sm/md/lg` |
| Sombras | `shadow-key`, `shadow-key-sm`, `shadow-window` (siempre duras, sin difuminado) |

Contraste comprobado sobre `screen`: `phosphor` 11.3:1, `phosphor-dim` 6.7:1, `alert` 7.7:1,
`phosphor-line` 3.8:1 (bordes de controles, WCAG 1.4.11).

**Componentes de juego extraídos**

| Componente | Uso | Estados |
|---|---|---|
| `Button` / `ButtonLink` | Acciones; variantes `primary`, `secondary`, `ghost`, `danger`; tamaños `sm`, `md`, `lg` | reposo, hover, presionado (se hunde), foco, deshabilitado |
| `AnswerCard` | Opción de respuesta con letra de atajo | `idle`, `selected`, `correct`, `partial`, `incorrect`, `dimmed` (con texto e icono, no solo color) |
| `Timer` | Cuenta regresiva opcional por reto | normal, advertencia (≤10 s, se anuncia a lectores de pantalla), en pausa |
| `ScoreBadge` | Marcador de puntos | normal, `quiet` |
| `Podium` | Podio local en «pasa el dispositivo» (empates comparten lugar) | 1.º–4.º lugar |

### Editar contenido

- **Nombre del juego, equipo, licencia:** `src/content/site.ts`.
- **Agregar un reto:** añade un objeto al archivo `src/content/questions/unidad-N.ts`. El tipo
  `Question` (`src/content/types.ts`) admite `opcion-multiple` (una opción con `correct: true`) o
  `escenario` (cada opción con `quality` y `consequence`, más `responsibleAlternative`). Incluye
  siempre `sources` y `review`.
- **Fuentes:** `src/content/sources.ts`. Cada pregunta jurídica apunta a una fuente y artículo.

### Qué es de demostración

- Los **31 retos** (7 de la Unidad I y 8 de cada una de las Unidades II, III y IV), incluidos 9
  escenarios de decisión.
- Los textos de créditos entre `[corchetes]`.
- El «perfil local» (Invitado) y el progreso: solo existen en el navegador.

## Mecánica y puntaje

- Básico = 100, intermedio = 150, avanzado = 200 puntos.
- Escenarios: decisión responsable = 100 %, parcial = 50 %, riesgosa = 0.
- La velocidad no da puntos; el temporizador (45 s / 90 s) es opcional.
- La partida mixta alterna unidades para una cobertura equilibrada.
- Atajos: `1–4` o `A–D` elegir, `Enter` confirmar/continuar, `Esc` salir.

## Accesibilidad y diseño adaptable

- Probado en 1200 px, 810 px y 390 px de ancho, y auditado con axe-core (reglas WCAG 2.0/2.1 A y AA)
  en todas las pantallas, la partida, la retroalimentación y los resultados: sin violaciones. El escritorio se adapta con *container queries*
  al ancho real de la pantalla del monitor; en teléfono se ve una sola ventana y la barra limita los
  accesos anclados (el resto está en «Menú»).
- Foco de teclado visible en todos los controles; estados de respuesta con texto, icono y forma.
- Áreas táctiles de al menos 40–44 px (los botones de la barra de título amplían su área a 44 px).
- El diálogo de salida bloquea el contenido de fondo (`inert`) y devuelve el foco con `Esc`.
- El temporizador es opcional y se elige antes de empezar (WCAG 2.2.1).
- Respeta `prefers-reduced-motion` y además tiene un ajuste «Movimiento reducido».
- «Modo presentación» oculta el cuarto y quita scanlines, brillo y curvatura.
- La retroalimentación separa «Por qué» del **Fundamento legal o ético**, que cita la ley mexicana y el
  artículo cuando aplica (LFPDPPP, LFDA, LFPPI, CPF, LFPC, Constitución).

## Contenido que requiere revisión del equipo

- Las leyes mexicanas se cotejaron el **2026-11-23** con los textos vigentes de la Cámara de
  Diputados (ver `src/content/sources.ts`). Revisa la vigencia antes de entregar.
- El **Código Penal Federal** aparecía «en actualización» (reforma DOF 13-11-2026); el texto
  consultado era el de la reforma del 13-03-2026. Confirmar que los arts. 199 Septies, 199 Octies,
  211 bis 1, 211 bis 2, 386 y 424 bis no cambiaron.
- Los retos marcados con `review.status: "requiere-revision"` (se listan en la pantalla
  **Créditos**) tienen contenido conceptual o interpretativo que debe vincularse con la bibliografía
  del curso.
- No se pudo verificar: la adhesión de México al Convenio de Budapest (no se incluye en el juego), el
  artículo 113 del Reglamento (UE) 2024/1689 (se citan fechas de su considerando 179) y el texto de la
  GNU GPL.
- La rúbrica y el temario no se recibieron como archivos; las unidades y temas se tomaron de la
  descripción del proyecto.
- El contenido es educativo y no constituye asesoría jurídica.

## Pendientes para el backend (no implementado)

- Banco de preguntas servido por API con el mismo formato de `src/content/types.ts`.
- Partidas multijugador en tiempo real (por ejemplo con Socket.IO, como prevé `src/lib/socket.ts`):
  salas, códigos de acceso, sincronización de turnos y temporizador del lado del servidor.
- Cuentas o apodos, si se deciden; en ese caso, aviso de privacidad conforme a la LFPDPPP
  (art. 15) **antes** de recabar datos, y mecanismo para derechos ARCO.
- Persistencia y sincronización del progreso entre dispositivos.
- Panel docente para editar retos y marcar revisiones.
- Validación de respuestas en servidor (hoy la correcta viaja en el cliente).

## Licencia y atribuciones

Licencia del proyecto: **pendiente de definir por el equipo** (el repositorio incluye un `LICENSE`
MIT que el equipo debe confirmar). Recursos de terceros en `ATTRIBUTIONS.md`.
