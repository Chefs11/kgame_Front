import type { Metadata } from "next";
import { Window } from "@/components/retro/Window";
import { ButtonLink } from "@/components/ui/Button";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { POINTS_BY_DIFFICULTY } from "@/lib/game-engine";

export const metadata: Metadata = { title: "Reglas" };

export default function Reglas() {
  return (
    <Window status="Lectura de 3 minutos" statusEnd="Controles y ajustes: Ayuda">
      <ScreenHeader title="Cómo se juega" subtitle="Todo lo que necesitas para jugar una partida completa." />

      <div className="prose">
        <SectionHeader title="Una partida, paso a paso" />
        <ol>
          <li>
            Abre <strong>Jugar</strong> y elige unidad (o partida mixta), duración, dificultad, modalidad y si quieres
            temporizador.
          </li>
          <li>Lee el reto. Arriba ves la unidad, el tema y en qué reto vas (por ejemplo, «Reto 3 de 8»).</li>
          <li>Elige una opción y pulsa «Confirmar respuesta». Puedes cambiar de opción antes de confirmar.</li>
          <li>Lee la retroalimentación: qué pasó, por qué y el fundamento ético o legal. Luego pulsa «Siguiente reto».</li>
          <li>Al final verás tus resultados por unidad y los temas que te conviene repasar.</li>
        </ol>
        <p>
          Para salir antes, usa el botón de cerrar de la ventana o la tecla <kbd>Esc</kbd>. Podrás ver tus resultados
          hasta ese momento o salir sin guardar.
        </p>

        <SectionHeader title="Dos tipos de reto" />
        <ul>
          <li>
            <strong>Opción múltiple.</strong> Solo una respuesta es correcta. Sirve para repasar conceptos y artículos
            clave.
          </li>
          <li>
            <strong>Escenario de decisión.</strong> Una situación realista con varias decisiones posibles: responsables,
            a medias o riesgosas. Verás qué pasaría con tu decisión y qué conviene hacer en su lugar.
          </li>
        </ul>

        <SectionHeader title="Puntos" />
        <ul>
          <li>
            Cada reto vale según su dificultad: básico {POINTS_BY_DIFFICULTY.basico}, intermedio{" "}
            {POINTS_BY_DIFFICULTY.intermedio} y avanzado {POINTS_BY_DIFFICULTY.avanzado} puntos.
          </li>
          <li>Respuesta correcta o decisión responsable: todos los puntos.</li>
          <li>Decisión a medias: la mitad de los puntos.</li>
          <li>Respuesta incorrecta, decisión riesgosa o tiempo agotado: 0 puntos.</li>
          <li>
            <strong>Responder rápido no da puntos extra.</strong> El temporizador es opcional y solo limita el tiempo
            para pensar.
          </li>
        </ul>

        <SectionHeader title="Pasa el dispositivo" />
        <p>
          De 2 a 4 personas juegan por turnos en el mismo equipo. Antes de cada reto aparece a quién le toca. Al final
          se muestra un podio solo de esa partida: no se piden nombres y no hay clasificaciones en línea.
        </p>

        <SectionHeader title="Falta ética, infracción o delito" />
        <p>
          Muchas respuestas distinguen tres niveles. Una <strong>falta ética</strong> rompe principios o reglas
          internas. Una <strong>infracción administrativa</strong> viola una ley y la sanciona una autoridad, por lo
          general con multa. Un <strong>delito</strong> está tipificado en la ley penal y puede castigarse con
          prisión. El juego es material educativo y no sustituye la asesoría jurídica.
        </p>
      </div>

      <div className="btn-row" style={{ marginTop: "var(--sp-6)" }}>
        <ButtonLink href="/jugar" icon="play">
          Jugar ahora
        </ButtonLink>
        <ButtonLink href="/ayuda" variant="secondary" icon="help">
          Ver controles y ajustes
        </ButtonLink>
      </div>
    </Window>
  );
}
