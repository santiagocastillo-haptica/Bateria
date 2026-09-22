/**
 * CameraButton.jsx — botón flotante para sacar la cámara (📷) en cualquier
 * momento del juego. Abre el Modo Cámara con el contexto actual. Opcional:
 * no bloquea el avance.
 */
import { useEffect, useState } from "react";
import CameraMode from "./CameraMode.jsx";

export default function CameraButton() {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key.toLowerCase() === "c" && !abierta) {
        // no interferir si se escribe en un campo de texto
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        setAbierta(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierta]);

  return (
    <>
      {!abierta && (
        <button className="camara-fab" onClick={() => setAbierta(true)} title="Tomar foto (C)">
          📷
        </button>
      )}
      {abierta && <CameraMode onClose={() => setAbierta(false)} />}
    </>
  );
}
