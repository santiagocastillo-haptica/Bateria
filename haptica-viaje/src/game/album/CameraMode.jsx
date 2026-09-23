/**
 * CameraMode.jsx — MODO CÁMARA. Visor del mundo del videojuego + captura.
 * Usa la cámara REAL del dispositivo cuando hay permiso (Sección 6); si no
 * hay cámara disponible (permiso denegado, navegador sin soporte), cae al
 * visor simulado de siempre, con un aviso. La foto se guarda automáticamente
 * en la carpeta del contexto actual (no la elige el jugador). Es opcional.
 */
import { useEffect, useState } from "react";
import EscenaFoto from "./EscenaFoto.jsx";
import { getContextoFoto } from "./fotoContexto.js";
import { capturar, FOLDER_BY_ID } from "./albumManager.js";
import { useCamara } from "./useCamara.js";

export default function CameraMode({ onClose }) {
  const ctx = getContextoFoto();
  const folder = FOLDER_BY_ID[ctx.folderId] || FOLDER_BY_ID.otros;
  const [fase, setFase] = useState("visor"); // visor | flash | capturada
  const [foto, setFoto] = useState(null);
  const { videoRef, estado: camaraEstado, capturarFrame } = useCamara();
  const camaraLista = camaraEstado === "lista";

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function tomar() {
    setFase("flash");
    // Captura el cuadro real ANTES de que termine el flash (mientras el
    // video sigue corriendo), para que la foto no incluya el destello blanco.
    const dataUrl = camaraLista ? capturarFrame() : null;
    setTimeout(() => {
      const guardada = capturar({
        folderId: folder.id,
        caption: folder.caption,
        sceneKey: ctx.sceneKey,
        country: ctx.country,
        activity: ctx.activity,
        dataUrl: dataUrl || undefined,
      });
      setFoto(guardada);
      setFase("capturada");
    }, 220);
  }

  return (
    <div className="camara-modo">
      <div className="camara-top">
        <span>📷 CÁMARA</span>
        <button className="chip-btn" onClick={onClose}>ESC ✕</button>
      </div>

      <div className="camara-visor">
        {fase === "flash" && <div className="camara-flash" />}

        {camaraLista && fase !== "capturada" ? (
          <video ref={videoRef} className="camara-video" autoPlay playsInline muted />
        ) : (
          <EscenaFoto
            sceneKey={ctx.sceneKey}
            avatar={ctx.avatar}
            size={280}
            dataUrl={fase === "capturada" ? foto?.dataUrl : undefined}
          />
        )}

        <div className="camara-esquinas">
          <span className="esq e1" /><span className="esq e2" />
          <span className="esq e3" /><span className="esq e4" />
        </div>
        {fase === "capturada" && <div className="camara-capturado">📸 ¡Momento capturado!</div>}
      </div>

      {camaraEstado === "no-disponible" && fase !== "capturada" && (
        <p className="aviso">
          📵 No se pudo acceder a la cámara del dispositivo (permiso denegado o no disponible).
          Igual puedes registrar el momento — se guardará con la escena del recorrido.
        </p>
      )}

      {fase !== "capturada" ? (
        <>
          <p className="camara-hint">📷 Este parece un buen momento para una foto.</p>
          <div className="btn-fila">
            <button className="btn btn-primario" onClick={tomar}>📸 Tomar foto</button>
            <button className="btn btn-secundario" onClick={onClose}>Salir</button>
          </div>
        </>
      ) : (
        <>
          <div className="camara-recuerdo">
            <div className="camara-recuerdo-folder">📁 {folder.nombre}</div>
            <div className="camara-recuerdo-caption">"{foto?.caption}"</div>
          </div>
          <div className="btn-fila">
            <button className="btn btn-secundario" onClick={() => setFase("visor")}>Tomar otra</button>
            <button className="btn btn-primario" onClick={onClose}>Guardar y salir</button>
          </div>
        </>
      )}
    </div>
  );
}
