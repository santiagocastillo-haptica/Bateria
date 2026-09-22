/**
 * Album.jsx — ÁLBUM Haptiqueño (mecánica real). Vista por carpetas/recorridos
 * con conteo de recuerdos; al abrir una carpeta se ven las fotos capturadas y
 * al tocar una foto se amplía. Lee del gestor local (albumManager).
 * Mantiene la firma { onClose } para no romper las llamadas existentes.
 */
import { useMemo, useState } from "react";
import EscenaFoto from "./album/EscenaFoto.jsx";
import { getAlbum, FOLDERS } from "./album/albumManager.js";

export default function Album({ onClose }) {
  const album = useMemo(() => getAlbum(), []);
  const [folderId, setFolderId] = useState(null);
  const [fotoIndex, setFotoIndex] = useState(null);

  const folder = folderId ? FOLDERS.find((f) => f.id === folderId) : null;
  const fotos = folderId ? album[folderId] || [] : [];

  // ---- Foto ampliada ----
  if (folder && fotoIndex !== null && fotos[fotoIndex]) {
    const f = fotos[fotoIndex];
    return (
      <div className="modal-fondo" onClick={onClose}>
        <div className="modal album-modal" onClick={(e) => e.stopPropagation()}>
          <h2>📷 {folder.nombre}</h2>
          <div className="foto-ampliada">
            <EscenaFoto sceneKey={f.sceneKey} avatar="🍊" size={300} />
            <div className="foto-ampliada-caption">“{f.caption}”</div>
            <div className="foto-ampliada-sub">Momento capturado</div>
          </div>
          <div className="btn-fila">
            <button className="btn btn-secundario" disabled={fotoIndex === 0} onClick={() => setFotoIndex(fotoIndex - 1)}>◀ Anterior</button>
            <button className="btn btn-secundario" onClick={() => setFotoIndex(null)}>Volver</button>
            <button className="btn btn-secundario" disabled={fotoIndex >= fotos.length - 1} onClick={() => setFotoIndex(fotoIndex + 1)}>Siguiente ▶</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Dentro de una carpeta ----
  if (folder) {
    return (
      <div className="modal-fondo" onClick={onClose}>
        <div className="modal album-modal" onClick={(e) => e.stopPropagation()}>
          <h2>📁 {folder.nombre}</h2>
          {fotos.length === 0 ? (
            <p className="sub">Aún no hay recuerdos en esta carpeta.</p>
          ) : (
            <div className="album-fotos">
              {fotos.map((f, i) => (
                <button key={f.photoId} className="album-foto" onClick={() => setFotoIndex(i)}>
                  <EscenaFoto sceneKey={f.sceneKey} avatar="🍊" size={130} />
                  <span className="album-foto-pie">Momento capturado</span>
                </button>
              ))}
            </div>
          )}
          <div className="btn-fila">
            <button className="btn btn-secundario" onClick={() => setFolderId(null)}>◀ Volver al álbum</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Vista de carpetas ----
  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal album-modal" onClick={(e) => e.stopPropagation()}>
        <h2>📷 Álbum Haptiqueño</h2>
        <p className="sub">Estos son los recuerdos que recopilaste durante tu viaje.</p>
        <div className="album-carpetas">
          {FOLDERS.filter((f) => f.id !== "otros" || (album["otros"] || []).length > 0).map((f) => {
            const n = (album[f.id] || []).length;
            return (
              <button key={f.id} className={`carpeta ${n > 0 ? "tiene" : ""}`} onClick={() => setFolderId(f.id)}>
                <div className="carpeta-mini"><EscenaFoto sceneKey={f.sceneKey} avatar="🍊" size={90} /></div>
                <div className="carpeta-nombre">📁 {f.nombre}</div>
                <div className="carpeta-conteo">{n > 0 ? `${n} ${n === 1 ? "recuerdo" : "recuerdos"}` : "Aún no hay recuerdos"}</div>
              </button>
            );
          })}
        </div>
        <div className="btn-fila">
          <button className="btn btn-secundario" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
