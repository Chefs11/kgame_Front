import type { Metadata } from "next";
import { ClearProgressButton } from "@/components/game/ClearProgressButton";
import { Window } from "@/components/retro/Window";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";

export const metadata: Metadata = { title: "Privacidad" };

export default function Privacidad() {
  return (
    <Window status="El juego no recopila datos personales" statusEnd="Todo se queda en tu navegador">
      <ScreenHeader
        title="Privacidad"
        subtitle="Qué guarda el juego, dónde lo guarda y cómo borrarlo."
      />

      <div className="prose">
        <SectionHeader title="Qué datos usamos" />
        <p>
          El juego funciona sin servidor. <strong>No pide ni recopila datos personales</strong>:
          no hay registro, nombre, correo ni analítica. En el modo «pasa el dispositivo» los jugadores se identifican
          como «Jugador 1», «Jugador 2», etc.
        </p>

        <SectionHeader title="Qué se guarda en tu dispositivo" />
        <ul>
          <li>
            <code>kgame.progress.v1</code> (almacenamiento local): resultados de partidas — fecha, configuración, retos
            respondidos y puntos.
          </li>
          <li>
            <code>kgame.settings.v1</code> (almacenamiento local): ajustes de sonido, vista, movimiento y guardado.
          </li>
          <li>
            <code>kgame.booted.v1</code> (almacenamiento de sesión): indica que ya viste la animación de encendido.
          </li>
        </ul>
        <p>Esta información no sale de tu navegador y nadie más puede verla desde otro equipo.</p>

        <SectionHeader title="Cómo borrarlo" />
        <p>
          Usa el botón de abajo, la opción de la pantalla <em>Progreso</em>, o borra los datos del sitio desde la
          configuración del navegador.
        </p>
      </div>
      <ClearProgressButton />

    </Window>
  );
}
