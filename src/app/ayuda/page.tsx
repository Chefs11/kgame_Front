import type { Metadata } from "next";
import { SettingsPanel } from "@/components/game/SettingsPanel";
import { Window } from "@/components/retro/Window";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { BackLink } from "@/components/ui/States";

export const metadata: Metadata = { title: "Ayuda" };

const SHORTCUTS: Array<[keys: string[], action: string]> = [
  [["1", "2", "3", "4"], "Elegir una opción (también funcionan A, B, C y D)"],
  [["Enter"], "Confirmar la respuesta o pasar al siguiente reto"],
  [["Esc"], "Abrir el cuadro para salir de la partida"],
  [["Tab"], "Moverte entre controles; el control activo siempre se marca"],
  [["Enter", "Espacio"], "Activar el botón o icono marcado"],
];

export default function Ayuda() {
  return (
    <Window status="Ayuda" statusEnd="El sonido empieza apagado">
      <BackLink href="/reglas">Ver cómo se juega</BackLink>
      <ScreenHeader title="Ayuda" subtitle="Controles, ajustes y cómo se guarda tu progreso." />

      <SectionHeader title="Teclado" />
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla (desplázala si no cabe)">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Tecla</th>
              <th scope="col">Qué hace</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map(([keys, action]) => (
              <tr key={action}>
                <td style={{ whiteSpace: "nowrap" }}>
                  {keys.map((k, i) => (
                    <span key={k}>
                      {i > 0 && " "}
                      <kbd>{k}</kbd>
                    </span>
                  ))}
                </td>
                <td>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-dim text-small">
        Los iconos del escritorio se abren con un clic o un toque. En el celular, el botón de menú de la barra de tareas
        muestra todas las secciones.
      </p>

      <SectionHeader title="Sonido, movimiento y pantalla" />
      <p className="text-dim text-small">
        También tienes estos ajustes a la mano: el sonido en la barra de tareas; la vista, el modo simple y el
        movimiento en el panel junto al monitor; y, en el celular, en el botón de menú. El juego funciona completo sin
        sonido.
      </p>
      <SettingsPanel />

      <SectionHeader title="Tu progreso" />
      <div className="prose text-small">
        <ul>
          <li>Al terminar una partida, el resultado se guarda en el almacenamiento local de este navegador.</li>
          <li>Se guarda la fecha, la configuración, los retos respondidos y los puntos. Nunca nombres ni datos personales.</li>
          <li>Nada se envía a un servidor: no hay cuentas ni sincronización entre dispositivos.</li>
          <li>
            Para borrarlo, abre <strong>Progreso</strong> y pulsa «Borrar progreso», o borra los datos del sitio en tu
            navegador. También puedes desactivar el guardado.
          </li>
        </ul>
      </div>

      <SectionHeader title="Si algo no funciona" />
      <div className="prose text-small">
        <ul>
          <li>
            <strong>La pantalla está negra.</strong> El monitor está apagado: pulsa el botón de encendido, abajo a la
            derecha del monitor.
          </li>
          <li>
            <strong>Cuesta leer.</strong> Activa el modo simple para quitar las líneas de barrido, el brillo y el
            parpadeo, o usa la lupa para acercarte a la pantalla.
          </li>
          <li>
            <strong>La ventana tapa los iconos.</strong> Pulsa el botón de restaurar en la barra de título o vuelve al
            escritorio con el botón de cerrar.
          </li>
        </ul>
      </div>
    </Window>
  );
}
