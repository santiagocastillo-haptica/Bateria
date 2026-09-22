/**
 * JuliPauseScreen.jsx — Pausa Humana de Juli (Sección G/O).
 * Aparece tras la transición Chile → Colombia, antes del Bloque 11.
 * Comentario OPCIONAL, guardado en pausa_juli, NUNCA junto a respuestas.
 */
import { useState } from "react";

export default function JuliPauseScreen({ onContinuar }) {
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function continuar() {
    setEnviando(true);
    try {
      await onContinuar(comentario); // App guarda en pausa_juli y avanza
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.4rem" }}>☕</div>
        <h1>Una pausa contigo</h1>
        <p style={{ textAlign: "left" }}>
          Has recorrido un largo camino. Antes de volver a casa, tómate un momento.
          Si quieres, puedes dejar un comentario sobre cómo te has sentido en el viaje.
          Es completamente opcional y se guarda por separado de tus respuestas.
        </p>
        <textarea
          className="campo"
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe aquí si lo deseas — opcional"
        />
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={continuar} disabled={enviando}>
            {enviando ? <span className="spinner" /> : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
