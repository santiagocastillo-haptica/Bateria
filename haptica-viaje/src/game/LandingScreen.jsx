/**
 * LandingScreen.jsx — "ATERRIZANDO EN MÉXICO" (transición oficial CO → MX).
 * Animación breve avión → nubes → destino, y luego continúa al mundo.
 */
import { useEffect, useState } from "react";

export default function LandingScreen({
  titulo = "ATERRIZANDO EN MÉXICO",
  destino = "🌵",
  iconoTitulo,
  onContinuar,
  boton = "Bajar del avión",
}) {
  const icono = iconoTitulo || destino;
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setListo(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pantalla landing">
      <div className="landing-cielo">
        <span className="landing-nube n1">☁️</span>
        <span className="landing-nube n2">☁️</span>
        <span className="landing-nube n3">☁️</span>
        <span className="landing-avion">✈️</span>
        <span className="landing-destino">{destino}</span>
      </div>
      <h1 className="landing-titulo">{icono} {titulo}</h1>
      <div className="btn-fila">
        <button className="btn btn-primario" onClick={onContinuar} disabled={!listo}>
          {listo ? boton : "Descendiendo…"}
        </button>
      </div>
    </div>
  );
}
