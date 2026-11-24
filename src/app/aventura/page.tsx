import type { Metadata } from "next";
import { Suspense } from "react";
import { AdventureFromParams } from "@/components/adventure/AdventureFromParams";

export const metadata: Metadata = { title: "Modo aventura" };

export default function Aventura() {
  return (
    <Suspense fallback={<div className="adventure__loading">Cargando el bosque…</div>}>
      <AdventureFromParams />
    </Suspense>
  );
}
