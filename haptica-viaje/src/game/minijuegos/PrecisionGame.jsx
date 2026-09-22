/**
 * PrecisionGame.jsx — minijuego de puntería reutilizable (Tejo, Rana, Bolos).
 * Un marcador se mueve; el jugador lanza intentando caer en la zona objetivo.
 * Fácil y con reintentos ilimitados (nunca bloquea). El resultado NO afecta a
 * las preguntas; es solo diversión y una recompensa narrativa.
 */
import { useEffect, useRef, useState } from "react";

const OBJETIVO = [34, 66]; // banda central (ancha = fácil)

export default function PrecisionGame({ tema, emoji = "🎯", onGanar }) {
  const [pos, setPos] = useState(10);
  const [corriendo, setCorriendo] = useState(true);
  const [resultado, setResultado] = useState(null); // "exito" | "casi"
  const dir = useRef(1);
  const intervalRef = useRef();

  useEffect(() => {
    if (!corriendo) return;
    intervalRef.current = setInterval(() => {
      setPos((p) => {
        let n = p + dir.current * 2.2;
        if (n >= 100) { n = 100; dir.current = -1; }
        if (n <= 0) { n = 0; dir.current = 1; }
        return n;
      });
    }, 24);
    return () => clearInterval(intervalRef.current);
  }, [corriendo]);

  function lanzar() {
    setCorriendo(false);
    const exito = pos >= OBJETIVO[0] && pos <= OBJETIVO[1];
    setResultado(exito ? "exito" : "casi");
  }
  function reintentar() {
    setResultado(null);
    setPos(10);
    dir.current = 1;
    setCorriendo(true);
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>{emoji}</div>
        <h1>{tema.objeto === "tejo" ? "Tejo" : tema.objeto === "moneda" ? "Rana" : "Bolos"}</h1>
        <p className="sub">Lanza cuando el marcador esté en la zona verde. ¡Puedes intentarlo las veces que quieras!</p>

        <div className="precision-barra">
          <div className="precision-objetivo" style={{ left: `${OBJETIVO[0]}%`, width: `${OBJETIVO[1] - OBJETIVO[0]}%` }} />
          <div className="precision-marcador" style={{ left: `${pos}%` }}>{emoji}</div>
        </div>

        {resultado === null ? (
          <div className="btn-fila">
            <button className="btn btn-primario" onClick={lanzar}>{tema.lanzar}</button>
          </div>
        ) : resultado === "exito" ? (
          <>
            <div className="puerta-abierta">{tema.exito}</div>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={onGanar}>Reclamar recompensa 🪙</button>
            </div>
          </>
        ) : (
          <>
            <p className="sub">¡Casi! Por poco. Inténtalo de nuevo.</p>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={reintentar}>Reintentar</button>
              <button className="btn btn-secundario" onClick={onGanar}>Continuar de todos modos</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
