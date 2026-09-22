/**
 * AutoCamera.jsx — captura AUTOMÁTICA de ~3 segundos al comenzar un viaje,
 * una transición entre países o una excursión. Microanimación: 3·2·1 → 📸 →
 * "Momento registrado" y continúa. Guarda en la carpeta del contexto actual.
 * No reemplaza la cámara manual del jugador.
 */
import { useEffect, useState } from "react";
import EscenaFoto from "./EscenaFoto.jsx";
import { getContextoFoto } from "./fotoContexto.js";
import { capturar, FOLDER_BY_ID } from "./albumManager.js";

export default function AutoCamera({ onFin }) {
  const ctx = getContextoFoto();
  const folder = FOLDER_BY_ID[ctx.folderId] || FOLDER_BY_ID.otros;
  const [n, setN] = useState(3);
  const [fase, setFase] = useState("cuenta"); // cuenta | flash | listo

  // Cuenta regresiva 3 · 2 · 1
  useEffect(() => {
    if (fase !== "cuenta") return;
    const t = setTimeout(() => {
      if (n > 1) setN(n - 1);
      else setFase("flash");
    }, 650);
    return () => clearTimeout(t);
  }, [n, fase]);

  // Disparo + guardado automático
  useEffect(() => {
    if (fase !== "flash") return;
    capturar({
      folderId: folder.id,
      caption: folder.caption,
      sceneKey: ctx.sceneKey,
      country: ctx.country,
      activity: ctx.activity,
    });
    const t = setTimeout(() => setFase("listo"), 260);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // Cierre automático
  useEffect(() => {
    if (fase !== "listo") return;
    const t = setTimeout(() => onFin?.(), 900);
    return () => clearTimeout(t);
  }, [fase, onFin]);

  return (
    <div className="auto-camara">
      <div className="camara-visor">
        {fase === "flash" && <div className="camara-flash" />}
        <EscenaFoto sceneKey={ctx.sceneKey} avatar={ctx.avatar} size={240} />
        <div className="camara-esquinas">
          <span className="esq e1" /><span className="esq e2" />
          <span className="esq e3" /><span className="esq e4" />
        </div>
        {fase === "cuenta" && <div className="auto-cuenta">{n}</div>}
        {fase === "listo" && <div className="camara-capturado">📸 Momento registrado</div>}
      </div>
      <div className="auto-camara-pie">📷 {folder.nombre}</div>
    </div>
  );
}
