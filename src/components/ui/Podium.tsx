/**
 * Podio local de una partida en «pasa el dispositivo». Solo muestra a los
 * jugadores de esta partida en este equipo; no es una clasificación en línea.
 * Los empates comparten lugar.
 */
export interface PodiumEntry {
  name: string;
  points: number;
  correct: number;
  total: number;
}

export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.points - a.points || b.correct - a.correct);
  // Lugar = 1 + cuántos jugadores tienen estrictamente más puntos (los empates comparten lugar).
  const ranked = sorted.map((e) => ({ ...e, rank: 1 + sorted.filter((o) => o.points > e.points).length }));

  return (
    <ol className="podium" aria-label="Podio de esta partida">
      {ranked.map((e) => (
        <li key={e.name} className="podium__place" data-rank={Math.min(e.rank, 4)}>
          <span className="podium__who">{e.name}</span>
          <span className="podium__pts">
            {e.points} puntos, {e.correct} de {e.total} correctas
          </span>
          <span className="podium__block" aria-label={`Lugar ${e.rank}`}>
            {e.rank}
          </span>
        </li>
      ))}
    </ol>
  );
}
