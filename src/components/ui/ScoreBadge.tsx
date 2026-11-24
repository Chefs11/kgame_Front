/** Marcador compacto: etiqueta + número grande en tipografía pixel. */
export function ScoreBadge({
  label,
  value,
  quiet = false,
}: {
  label: string;
  value: number | string;
  /** Variante sin sombra para marcadores secundarios. */
  quiet?: boolean;
}) {
  return (
    <div className={`score-badge${quiet ? " score-badge--quiet" : ""}`}>
      <span className="score-badge__label">{label}</span>
      <span className="score-badge__value">{value}</span>
    </div>
  );
}
