import type { Metadata } from "next";
import { ClearProgressButton } from "@/components/game/ClearProgressButton";
import { Window } from "@/components/retro/Window";
import { ScreenHeader, SectionHeader } from "@/components/ui/Headers";
import { Notice } from "@/components/ui/States";
import { CREDITS } from "@/content/site";

export const metadata: Metadata = { title: "Privacidad" };

export default function Privacidad() {
  return (
    <Window status="Este prototipo no recopila datos personales" statusEnd="Todo se queda en tu navegador">
      <ScreenHeader
        title="Privacidad"
        subtitle="Qué guarda el juego, dónde lo guarda y cómo borrarlo."
      />

      <div className="prose">
        <SectionHeader title="Qué datos usamos" />
        <p>
          Esta versión es un prototipo que funciona sin servidor. <strong>No pide ni recopila datos personales</strong>:
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

      <SectionHeader title="Si en el futuro se recopilan datos" />
      <Notice variant="review">
        <p>
          Si se conecta un backend que recopile datos personales (por ejemplo, apodos o cuentas), el equipo deberá
          redactar un aviso de privacidad conforme a la Ley Federal de Protección de Datos Personales en Posesión de
          los Particulares (en particular, los elementos del aviso que exige su art. 15) y ponerlo a disposición antes
          de recabar datos. Responsable y contacto: <span className="editable">{CREDITS.privacyContact}</span>.
        </p>
      </Notice>
    </Window>
  );
}
