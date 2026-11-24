import type { Metadata } from "next";
import { GamePlay } from "@/components/game/GamePlay";

export const metadata: Metadata = { title: "Partida" };

export default function Partida() {
  return <GamePlay />;
}
