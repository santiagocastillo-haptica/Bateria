/**
 * HelpReportModal.jsx — "Necesito ayuda / Reportar problema técnico" (Sección G/M).
 * ⚠️ El texto es OFICIAL y NO debe alterarse ni parafrasearse (ver textos.js).
 * Escribe en usuarios/{uid}/soporte. NO cierra sesión ni interrumpe el progreso.
 * NO es un mecanismo para abandonar la experiencia.
 */
import { useState } from "react";
import { AYUDA_TITULO, AYUDA_CUERPO, AYUDA_PLACEHOLDER } from "../data/textos.js";

export default function HelpReportModal({ onEnviar, onClose }) {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      await onEnviar(mensaje); // App crea el ticket en soporte
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{AYUDA_TITULO}</h2>
        <p style={{ textAlign: "left" }}>{AYUDA_CUERPO}</p>

        {enviado ? (
          <>
            <div className="aviso">
              Tu reporte fue enviado a Juli. Puedes seguir intentando continuar mientras tanto;
              no perderás las respuestas que ya registraste.
            </div>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={onClose}>Volver a la experiencia</button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className="campo"
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={AYUDA_PLACEHOLDER}
            />
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={enviar} disabled={enviando}>
                {enviando ? <span className="spinner" /> : "Enviar reporte"}
              </button>
              <button className="btn btn-secundario" onClick={onClose} disabled={enviando}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
