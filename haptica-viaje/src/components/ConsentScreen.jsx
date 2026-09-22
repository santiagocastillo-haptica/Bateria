/**
 * ConsentScreen.jsx — informa el siguiente paso del consentimiento informado.
 * El documento OFICIAL se envía y diligencia por Google, fuera de la
 * experiencia: aquí NO se reproduce ni se reemplaza su contenido.
 * No hay opción de rechazo en esta pantalla.
 */
import { useState } from "react";
import {
  CONSENTIMIENTO_TITULO,
  CONSENTIMIENTO_AVISO,
  CONSENTIMIENTO_DETALLE,
} from "../data/textos.js";

export default function ConsentScreen({ onAceptar }) {
  const [enviando, setEnviando] = useState(false);

  async function continuar() {
    setEnviando(true);
    try {
      await onAceptar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>📩</div>
        <h1>{CONSENTIMIENTO_TITULO}</h1>
        <p style={{ textAlign: "left" }}>{CONSENTIMIENTO_AVISO}</p>
        <p className="sub" style={{ textAlign: "left" }}>{CONSENTIMIENTO_DETALLE}</p>

        <div className="pasos-consentimiento">
          <span>📩 Recibes el documento</span>
          <span>📖 Lo lees</span>
          <span>✍️ Lo diligencias por Google</span>
        </div>

        <div className="btn-fila">
          <button className="btn btn-primario btn-cta" onClick={continuar} disabled={enviando}>
            {enviando ? <span className="spinner" /> : "✈️ Continuar la travesía"}
          </button>
        </div>
      </div>
    </div>
  );
}
