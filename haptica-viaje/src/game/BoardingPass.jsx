/**
 * BoardingPass.jsx — PASSPORT. Pasaporte virtual "Háptica AIRLINES".
 * Objeto del inventario con espacio para sellos. Cae un sello animado.
 * SIN fecha (decisión de negocio). El sello y el texto del botón son
 * parametrizables por país para reutilizarlo en cada llegada.
 */
import { useEffect, useState } from "react";
import { VUELO } from "./officeData.js";

export default function BoardingPass({
  haptiquenoLabel,
  avatarGlyph = "🍊",
  onContinuar,
  sellos = [],
  selloTitulo = "BIENVENIDO A ESTA GRAN TRAVESÍA",
  botonTexto = "Iniciar la travesía",
}) {
  const [sellado, setSellado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSellado(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pantalla">
      <div className="pasaporte">
        <div className="pasaporte-header">
          <span>✈️ {VUELO.aerolinea}</span>
          <span className="pasaporte-vuelo">Vuelo {VUELO.numero}</span>
        </div>

        <div className="pasaporte-cuerpo">
          <div className="pasaporte-foto">{avatarGlyph}</div>
          <div className="pasaporte-datos">
            <div className="pasaporte-nombre">{haptiquenoLabel}</div>
            <div className="pasaporte-linea">Pasaporte de la travesía Háptica</div>
            <div className="pasaporte-linea">Pasajero Haptiqueño</div>
          </div>

          {sellado && (
            <div className="sello-viaje">
              <div className="sello-inner">
                <div className="sello-txt">{selloTitulo}</div>
                <div className="sello-sub">Háptica</div>
              </div>
            </div>
          )}
        </div>

        <div className="pasaporte-ruta">
          {VUELO.ruta.map((c, i) => (
            <span key={i} className="ruta-item">
              <span className={`ruta-cod ${sellos.includes(i) ? "activo" : ""}`}>{c}</span>
              {i < VUELO.ruta.length - 1 && <span className="ruta-flecha">✈</span>}
            </span>
          ))}
        </div>

        <div className="pasaporte-sellos">
          {["🟡", "🔴", "🔵", "🟡"].map((f, i) => (
            <div key={i} className={`casilla-sello ${sellos.includes(i) ? "puesto" : ""}`}>
              {sellos.includes(i) ? f : "○"}
            </div>
          ))}
        </div>

        <div className="btn-fila">
          <button className="btn btn-primario" onClick={onContinuar} disabled={!sellado}>
            {botonTexto}
          </button>
        </div>
      </div>
    </div>
  );
}
