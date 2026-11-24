import type { Metadata } from "next";
import { GameResults } from "@/components/game/GameResults";
import { Window } from "@/components/retro/Window";

export const metadata: Metadata = { title: "Resultados" };

export default function Resultados() {
  return (
    <Window status="Resultados de tu última partida" statusEnd="Sin clasificaciones en línea">
      <GameResults />
    </Window>
  );
}
