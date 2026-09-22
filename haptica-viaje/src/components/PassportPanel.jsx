/**
 * PassportPanel.jsx — pasaporte virtual Háptica AIRLINES (modal).
 * Muestra la identidad del Haptiqueño, el vuelo, la ruta y las casillas de
 * sello por país. Se abre desde el botón "Pasaporte" de la barra superior.
 */
import { VUELO } from "../game/officeData.js";

const PAISES = [
  { cod: "CO", dot: "🟡", nombre: "Colombia" },
  { cod: "MX", dot: "🔴", nombre: "México" },
  { cod: "CL", dot: "🔵", nombre: "Chile" },
  { cod: "CO", dot: "🟡", nombre: "Regreso" },
];

export default function PassportPanel({ haptiquenoLabel = "Haptiqueño", idHaptiqueno, avatarGlyph = "🍊", sellos = [], onClose }) {
  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" style={{ background: "transparent", boxShadow: "none", padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="pasaporte">
          <div className="pasaporte-header">
            <span>✈️ {VUELO.aerolinea}</span>
            <span className="pasaporte-vuelo">Vuelo {VUELO.numero}</span>
          </div>

          <div className="pasaporte-cuerpo">
            <div className="pasaporte-foto">{avatarGlyph}</div>
            <div className="pasaporte-datos">
              <div className="pasaporte-nombre">{haptiquenoLabel}</div>
              {idHaptiqueno && <div className="pasaporte-linea">🍊 {idHaptiqueno}</div>}
              <div className="pasaporte-linea">Pasaporte de la travesía Háptica</div>
            </div>
          </div>

          <div className="pasaporte-ruta">
            {VUELO.ruta.map((c, i) => (
              <span key={i} className="ruta-item">
                <span className={`ruta-cod ${sellos.includes(i) ? "activo" : ""}`}>{c}</span>
                {i < VUELO.ruta.length - 1 && <span className="ruta-flecha">✈</span>}
              </span>
            ))}
          </div>

          <div className="pasaporte-paginas">
            {PAISES.map((p, i) => (
              <div key={i} className={`pagina-sello ${sellos.includes(i) ? "puesto" : ""}`}>
                <span className="pagina-dot">{sellos.includes(i) ? p.dot : "○"}</span>
                <span className="pagina-nombre">{p.nombre}</span>
                <span className="pagina-estado">{sellos.includes(i) ? "Sellado" : "Pendiente"}</span>
              </div>
            ))}
          </div>

          <div className="btn-fila">
            <button className="btn btn-primario" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
