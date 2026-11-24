"use client";

import { updateSettings, useSettings } from "@/lib/settings";
import { Button } from "../ui/Button";

/** Ajustes de sonido, movimiento y pantalla. Cada botón muestra si está activo. */
export function SettingsPanel() {
  const s = useSettings();
  return (
    <div className="panel-grid">
      <div className="panel">
        <h3 className="panel__title">Sonido</h3>
        <p className="text-dim text-small">Empieza apagado. Son tonos generados en el navegador, sin archivos externos.</p>
        <Button
          variant="secondary"
          size="sm"
          aria-pressed={s.sound}
          icon={s.sound ? "soundOn" : "soundOff"}
          onClick={() => updateSettings({ sound: !s.sound })}
        >
          {s.sound ? "Sonido activado" : "Activar sonido"}
        </Button>
      </div>
      <div className="panel">
        <h3 className="panel__title">Movimiento</h3>
        <p className="text-dim text-small">
          Quita las animaciones. Si tu sistema ya pide menos movimiento, el juego lo respeta siempre.
        </p>
        <Button
          variant="secondary"
          size="sm"
          icon="motion"
          aria-pressed={s.motion === "reduce"}
          onClick={() => updateSettings({ motion: s.motion === "reduce" ? "system" : "reduce" })}
        >
          {s.motion === "reduce" ? "Movimiento reducido" : "Reducir movimiento"}
        </Button>
      </div>
      <div className="panel">
        <h3 className="panel__title">Pantalla</h3>
        <p className="text-dim text-small">
          El modo presentación oculta el cuarto y quita las líneas de barrido y el brillo. Útil para proyectar.
        </p>
        <div className="btn-row">
          <Button
            variant="secondary"
            size="sm"
            icon="presentation"
            aria-pressed={s.presentation}
            onClick={() => updateSettings({ presentation: !s.presentation })}
          >
            Modo presentación
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="zoomIn"
            aria-pressed={s.view === "near"}
            onClick={() => updateSettings({ view: s.view === "near" ? "desk" : "near" })}
          >
            Acercar pantalla
          </Button>
        </div>
      </div>
    </div>
  );
}
