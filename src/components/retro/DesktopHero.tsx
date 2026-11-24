"use client";

import { SITE } from "@/content/site";
import { useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { ButtonLink } from "../ui/Button";

/**
 * Portada del escritorio: frase con cursor parpadeante, nombre del juego en
 * tipografía pixel gigante y las tres acciones principales.
 */
export function DesktopHero() {
  const { games } = useProgress();
  const { saveProgress } = useSettings();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero__lead">
        {SITE.tagline}
        <span className="hero__cursor" aria-hidden="true" />
      </p>
      <h1 className="hero__name" id="hero-title">
        {SITE.gameName}
      </h1>
      <div className="hero__actions">
        <ButtonLink href="/jugar" icon="play">
          Jugar
        </ButtonLink>
        <ButtonLink href="/unidades" variant="secondary" icon="folder">
          Elegir unidad
        </ButtonLink>
        <ButtonLink href="/reglas" variant="secondary" icon="rules">
          Ver reglas
        </ButtonLink>
      </div>
      <p className="hero__profile">
        Juegas como invitado, sin cuenta ni datos personales.{" "}
        {saveProgress
          ? games.length === 0
            ? "Aún no hay partidas guardadas en este navegador."
            : `${games.length === 1 ? "1 partida guardada" : `${games.length} partidas guardadas`} en este navegador.`
          : "El guardado de resultados está desactivado."}
      </p>
    </section>
  );
}
