/**
 * CarritoTransition.jsx — desplazamiento en el carrito turístico 🛺 entre paradas.
 * Animación sencilla (el carrito cruza la pantalla) + texto de la parada.
 */
import { useEffect, useState } from "react";

export default function CarritoTransition({ titulo = "¡Vámonos!", parada, onContinuar }) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setListo(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <h1>🛺 {titulo}</h1>
        {parada && <p className="sub">{parada}</p>}
        <div className="carril">
          <div className="carrito-anim">🛺</div>
          <div className="carril-linea" />
          <span className="carril-destino">🌵</span>
        </div>
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={onContinuar} disabled={!listo}>
            {listo ? "Llegar" : "En camino…"}
          </button>
        </div>
      </div>
    </div>
  );
}
