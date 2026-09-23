/**
 * useCamara.js — acceso a la cámara REAL del dispositivo (Sección 6).
 * Pide permiso (cámara frontal, estilo selfie), expone el <video> en vivo vía
 * `videoRef` y sabe capturar el cuadro actual a un data URL (JPEG). Si el
 * permiso se niega o el navegador no soporta getUserMedia, cae a
 * estado "no-disponible" y quien use el hook debe mostrar el fallback
 * simulado — nunca rompe la app.
 */
import { useEffect, useRef, useState } from "react";

export function useCamara() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [estado, setEstado] = useState("solicitando"); // solicitando | lista | no-disponible

  useEffect(() => {
    let cancelado = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setEstado("no-disponible");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setEstado("lista");
      })
      .catch((error) => {
        // Permiso denegado, sin cámara, contexto no seguro (http sin TLS), etc.
        console.error("getUserMedia failed:", error?.name, error?.message, error);
        setEstado("no-disponible");
      });

    return () => {
      cancelado = true;
      // Apaga la cámara SIEMPRE al salir del modo cámara / desmontar, para
      // no dejar la lucecita de la cámara encendida.
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  /** Dibuja el cuadro actual del video en un canvas y lo exporta a JPEG. */
  function capturarFrame() {
    const video = videoRef.current;
    if (!video || estado !== "lista" || !video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Espeja horizontalmente para que se vea como un selfie normal.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch (error) {
      console.error("toDataURL failed:", error);
      return null;
    }
  }

  return { videoRef, estado, capturarFrame };
}
