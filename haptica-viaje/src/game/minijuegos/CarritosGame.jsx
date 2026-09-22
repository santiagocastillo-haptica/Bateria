/**
 * CarritosGame.jsx — minijuego de carritos. Avanza por la ruta y, en la mitad,
 * elige un desvío (cualquiera sirve). Sin física compleja; siempre se completa.
 */
import { useState } from "react";

export default function CarritosGame({ onGanar }) {
  const [avance, setAvance] = useState(0);
  const [enDesvio, setEnDesvio] = useState(false);
  const [desvioHecho, setDesvioHecho] = useState(false);
  const completado = avance >= 100;

  function acelerar() {
    setAvance((a) => {
      const n = Math.min(100, a + 16);
      if (n >= 52 && !desvioHecho && !enDesvio) setEnDesvio(true);
      return enDesvio ? a : n;
    });
  }
  function desvio() {
    setEnDesvio(false);
    setDesvioHecho(true);
    setAvance((a) => Math.min(100, a + 16));
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>🚗</div>
        <h1>Carritos</h1>
        <p className="sub">Acelera para completar la ruta. En el camino aparece un desvío.</p>

        <div className="ruta-carritos">
          <div className="ruta-progreso" style={{ width: `${avance}%` }} />
          <span className="ruta-carro" style={{ left: `calc(${avance}% - 14px)` }}>🚗</span>
          <span className="ruta-meta">🏁</span>
        </div>

        {completado ? (
          <>
            <div className="puerta-abierta">¡Ruta completada! Encontraste una pista en el camino.</div>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={onGanar}>Reclamar recompensa 🪙</button>
            </div>
          </>
        ) : enDesvio ? (
          <>
            <p className="sub">¡Un desvío! ¿Por dónde seguimos?</p>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={desvio}>⬅️ Izquierda</button>
              <button className="btn btn-primario" onClick={desvio}>Derecha ➡️</button>
            </div>
          </>
        ) : (
          <div className="btn-fila">
            <button className="btn btn-primario" onClick={acelerar}>Acelerar 🚗💨</button>
          </div>
        )}
      </div>
    </div>
  );
}
