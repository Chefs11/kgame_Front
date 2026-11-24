import type { Metadata } from "next";
import { ProgressView } from "@/components/game/ProgressView";
import { Window } from "@/components/retro/Window";
import { ScreenHeader } from "@/components/ui/Headers";

export const metadata: Metadata = { title: "Progreso" };

export default function Progreso() {
  return (
    <Window status="Guardado en este navegador" statusEnd="Sin cuentas ni servidor">
      <ScreenHeader title="Tu progreso" subtitle="Cómo vas en cada unidad y qué temas te conviene repasar." />
      <ProgressView />
    </Window>
  );
}
