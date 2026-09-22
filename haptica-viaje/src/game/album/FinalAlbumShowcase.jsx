/**
 * FinalAlbumShowcase.jsx — el Álbum Haptiqueño como pieza central del cierre.
 * Muestra las carpetas del recorrido con sus miniaturas. Las carpetas sin
 * fotos aparecen como recuerdo pendiente, sin bloquear el cierre.
 */
import { useMemo } from "react";
import EscenaFoto from "./EscenaFoto.jsx";
import { getAlbum, FOLDERS } from "./albumManager.js";

export default function FinalAlbumShowcase({ onContinuar }) {
  const album = useMemo(() => getAlbum(), []);
  const total = Object.values(album).reduce((n, arr) => n + arr.length, 0);
  const carpetas = FOLDERS.filter((f) => f.id !== "otros" || (album["otros"] || []).length > 0);

  return (
    <div className="pantalla">
      <div className="tarjeta cierre-album">
        <div style={{ fontSize: "2.6rem" }}>📷</div>
        <h1>Álbum Haptiqueño</h1>
        <p className="sub">Estos son los recuerdos que te llevas de la travesía.</p>
        <div className="cierre-album-total">🖼️ {total} {total === 1 ? "recuerdo" : "recuerdos"}</div>

        <div className="album-carpetas">
          {carpetas.map((f) => {
            const fotos = album[f.id] || [];
            return (
              <div key={f.id} className={`carpeta ${fotos.length > 0 ? "tiene" : ""}`}>
                <div className="carpeta-mini">
                  <EscenaFoto sceneKey={f.sceneKey} avatar="🍊" size={90} />
                </div>
                <div className="carpeta-nombre">📁 {f.nombre}</div>
                <div className="carpeta-conteo">
                  {fotos.length > 0
                    ? `${fotos.length} ${fotos.length === 1 ? "recuerdo" : "recuerdos"}`
                    : "Recuerdo pendiente"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="btn-fila">
          <button className="btn btn-primario btn-cta" onClick={onContinuar}>
            ✈️ Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
