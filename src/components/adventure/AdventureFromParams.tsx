"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { UnitId } from "@/content/types";
import { AdventureGame, firstIncompleteUnit } from "./AdventureGame";

const UNIT_IDS: UnitId[] = ["u1", "u2", "u3", "u4"];
const noop = () => () => {};

/**
 * Lee `?unidad=` o, si no viene, elige la primera unidad incompleta (dato del
 * navegador, por eso se resuelve solo en el cliente). La clave incluye `r` para
 * que «Repetir unidad» reinicie el motor.
 */
export function AdventureFromParams() {
  const params = useSearchParams();
  const requested = params.get("unidad");
  const stored = useSyncExternalStore<UnitId | null>(noop, firstIncompleteUnit, () => null);
  const unit = UNIT_IDS.includes(requested as UnitId) ? (requested as UnitId) : stored;
  if (!unit) return <div className="adventure__loading">Cargando el bosque…</div>;
  return <AdventureGame key={`${unit}-${params.get("r") ?? ""}`} unitId={unit} />;
}
