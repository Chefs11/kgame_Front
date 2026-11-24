import type { Metadata } from "next";
import { Suspense } from "react";
import { GameSetup, GameSetupFromParams } from "@/components/game/GameSetup";
import { Window } from "@/components/retro/Window";
import { ScreenHeader } from "@/components/ui/Headers";

export const metadata: Metadata = { title: "Nueva partida" };

export default function Jugar() {
  return (
    <Window status="Configura tu partida" statusEnd="Nada se envía a internet">
      <ScreenHeader
        title="Nueva partida"
        subtitle="Elige qué quieres repasar y cómo quieres jugar. Puedes cambiarlo en cada partida."
      />
      <Suspense fallback={<GameSetup />}>
        <GameSetupFromParams />
      </Suspense>
    </Window>
  );
}
