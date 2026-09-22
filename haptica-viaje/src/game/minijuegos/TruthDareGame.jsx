/**
 * TruthDareGame.jsx — "Verdad o Te atreves" recreativo y ligero.
 * NO pide datos privados ni presiona. Es una pausa divertida del videojuego y
 * NO reemplaza ninguna pregunta oficial.
 */
import { useState } from "react";
import { VERDAD, RETO } from "../regresoData.js";

export default function TruthDareGame({ onGanar }) {
  const [modo, setModo] = useState(null); // "verdad" | "reto"
  const [texto, setTexto] = useState("");

  function elegir(m) {
    const lista = m === "verdad" ? VERDAD : RETO;
    setTexto(lista[Math.floor(Math.random() * lista.length)]);
    setModo(m);
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>🎤</div>
        <h1>Verdad o Te atreves</h1>
        {!modo ? (
          <>
            <p className="sub">Una pausa divertida antes de seguir. Elige:</p>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={() => elegir("verdad")}>Verdad</button>
              <button className="btn btn-primario" onClick={() => elegir("reto")}>Te atreves</button>
            </div>
          </>
        ) : (
          <>
            <div className="dialogo-caja" style={{ marginTop: 8 }}>
              <div className="dialogo-nombre">{modo === "verdad" ? "💬 Verdad" : "🎲 Te atreves"}</div>
              <div className="dialogo-texto">{texto}</div>
            </div>
            <div className="btn-fila">
              <button className="btn btn-secundario" onClick={() => setModo(null)}>Otra</button>
              <button className="btn btn-primario" onClick={onGanar}>Listo, continuar 🪙</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
