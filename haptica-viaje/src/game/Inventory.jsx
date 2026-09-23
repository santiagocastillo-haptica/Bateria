/**
 * Inventory.jsx — INVENTORY. HUD compacto + modal de mochila.
 * Muestra los objetos recogidos, la llave y el pase.
 */
import { ITEMS_REQUERIDOS, OBJETOS } from "./officeData.js";

const NOMBRE = Object.fromEntries(
  OBJETOS.filter((o) => o.tipo === "item").map((o) => [o.id, { emoji: o.emoji, nombre: o.nombre }])
);

export default function Inventory({ recogidos, llave, pase, onClose }) {
  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal inventario-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🎒 Inventario</h2>
        <div className="inv-grid">
          {ITEMS_REQUERIDOS.map((id) => {
            const it = NOMBRE[id];
            const tiene = recogidos.includes(id);
            return (
              <div key={id} className={`inv-celda ${tiene ? "tiene" : ""}`}>
                <span className="inv-emoji">{tiene ? it.emoji : "❔"}</span>
                <span className="inv-nombre">{tiene ? it.nombre : "¿?"}</span>
              </div>
            );
          })}
        </div>

        <div className="inv-especiales">
          <div className={`inv-chip ${llave ? "on" : ""}`}>🗝️ {llave ? "Llave" : "Sin llave"}</div>
          <div className={`inv-chip ${pase ? "on" : ""}`}>🎫 {pase ? "Pase de viaje" : "Sin pase"}</div>
        </div>

        <div className="btn-fila">
          <button className="btn btn-secundario" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
