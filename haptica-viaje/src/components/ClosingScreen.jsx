/**
 * ClosingScreen.jsx — cierre (Sección G/O).
 * NO muestra puntuaciones, niveles de riesgo, ni comparaciones.
 */
import { CIERRE_TITULO, CIERRE_CUERPO } from "../data/textos.js";

export default function ClosingScreen({ llavesObtenidas = [] }) {
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "3rem" }}>🏁</div>
        <h1>{CIERRE_TITULO}</h1>
        <p style={{ textAlign: "left" }}>{CIERRE_CUERPO}</p>
        <p className="sub">
          Reuniste {llavesObtenidas.length} {llavesObtenidas.length === 1 ? "llave" : "llaves"} en el camino.
        </p>
      </div>
    </div>
  );
}
