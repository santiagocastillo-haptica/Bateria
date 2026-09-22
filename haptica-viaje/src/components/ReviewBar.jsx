/**
 * ReviewBar.jsx — barra de MODO REVISIÓN (solo para el equipo de Háptica).
 * Permite navegar libremente entre etapas para preparar y probar el juego.
 * NUNCA se muestra en modo producción: allí el recorrido es obligatorio y no
 * se puede adelantar ni omitir ninguna pregunta.
 */
import { useState } from "react";
import { ES_REVIEW } from "../config/appMode.js";

const ZONAS = [
  { id: "colombia", label: "🇨🇴 Colombia" },
  { id: "mexico", label: "🌮 México" },
  { id: "chile", label: "⛰️ Chile" },
  { id: "regreso", label: "🏠 Regreso" },
];

export default function ReviewBar({ zona, setZona, onReset }) {
  const [abierta, setAbierta] = useState(false);
  if (!ES_REVIEW) return null;

  return (
    <div className="review-bar">
      <button className="review-badge" onClick={() => setAbierta(!abierta)}>
        🔍 MODO REVISIÓN {abierta ? "▾" : "▸"}
      </button>
      {abierta && (
        <div className="review-controles">
          <span className="review-hint">Saltar a:</span>
          {ZONAS.map((z) => (
            <button
              key={z.id}
              className={`review-chip ${zona === z.id ? "activo" : ""}`}
              onClick={() => setZona(z.id)}
            >
              {z.label}
            </button>
          ))}
          <button className="review-chip peligro" onClick={onReset}>
            ♻️ Reiniciar demo
          </button>
        </div>
      )}
    </div>
  );
}
