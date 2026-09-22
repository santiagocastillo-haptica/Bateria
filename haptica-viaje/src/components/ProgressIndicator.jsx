/**
 * ProgressIndicator.jsx — barra de avance del recorrido.
 * No muestra puntuaciones ni niveles de riesgo, solo avance.
 */
export default function ProgressIndicator({ valor, max, texto }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="progreso-wrap">
      {texto && <div className="progreso-txt">{texto}</div>}
      <div
        className="progreso-barra"
        role="progressbar"
        aria-valuenow={valor}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className="progreso-relleno" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
