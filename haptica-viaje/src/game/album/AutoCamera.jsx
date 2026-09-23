/**
 * AutoCamera.jsx — captura AUTOMÁTICA de ~3 segundos al comenzar un viaje,
 * una transición entre países o una excursión. Usa la cámara REAL del
 * dispositivo cuando hay permiso (Sección 6); si no la hay, cae a la
 * microanimación simulada de siempre (3·2·1 → 📸 → "Momento registrado").
 * Muestra una frase de pose que rota durante la cuenta regresiva.
 * Guarda en la carpeta del contexto actual. No reemplaza la cámara manual.
 */
import { useEffect, useState } from "react";
import EscenaFoto from "./EscenaFoto.jsx";
import { getContextoFoto, FRASES_POSE } from "./fotoContexto.js";
import { capturar, FOLDER_BY_ID } from "./albumManager.js";
import { useCamara } from "./useCamara.js";

export default function AutoCamera({ onFin }) {
  const ctx = getContextoFoto();
  const folder = FOLDER_BY_ID[ctx.folderId] || FOLDER_BY_ID.otros;
  const [n, setN] = useState(3);
  const [fase, setFase] = useState("cuenta"); // cuenta | flash | listo
  const { videoRef, estado: camaraEstado, capturarFrame } = useCamara();
  const camaraLista = camaraEstado === "lista";
  const frasePose = FRASES_POSE[Math.min(3 - n, FRASES_POSE.length - 1)];

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
    const dataUrl = camaraLista ? capturarFrame() : null;
    capturar({
      folderId: folder.id,
      caption: folder.caption,
      sceneKey: ctx.sceneKey,
      country: ctx.country,
      activity: ctx.activity,
      dataUrl: dataUrl || undefined,
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

        {camaraLista && fase !== "listo" ? (
          <video ref={videoRef} className="camara-video" autoPlay playsInline muted />
        ) : (
          <EscenaFoto sceneKey={ctx.sceneKey} avatar={ctx.avatar} size={240} />
        )}

        <div className="camara-esquinas">
          <span className="esq e1" /><span className="esq e2" />
          <span className="esq e3" /><span className="esq e4" />
        </div>
        {fase === "cuenta" && <div className="auto-cuenta">{n}</div>}
        {fase === "listo" && <div className="camara-capturado">📸 Momento registrado</div>}
      </div>
      {fase === "cuenta" && <div className="auto-camara-pose">{frasePose}</div>}
      <div className="auto-camara-pie">📷 {folder.nombre}</div>
      {camaraEstado === "no-disponible" && fase === "cuenta" && (
        <div className="auto-camara-aviso">📵 Cámara no disponible — se registra con la escena del recorrido.</div>
      )}
    </div>
  );
}
