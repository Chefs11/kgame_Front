import { Window } from "@/components/retro/Window";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <Window title="Error 404" icon="error" closeHref="/" status="Error 404" statusEnd="Esta ruta no existe">
      <h1 className="visually-hidden">Página no encontrada</h1>
      <ErrorState
        title="No encontramos esta pantalla"
        code="404"
        action={
          <>
            <ButtonLink href="/" icon="home">
              Volver al escritorio
            </ButtonLink>
            <ButtonLink href="/jugar" variant="secondary" icon="play">
              Jugar una partida
            </ButtonLink>
          </>
        }
      >
        La dirección no corresponde a ninguna sección del juego. Puede que el enlace esté incompleto o mal escrito.
        Vuelve al escritorio y abre la sección desde su icono.
      </ErrorState>
    </Window>
  );
}
