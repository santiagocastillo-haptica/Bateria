/**
 * FarewellScreen.jsx — pantalla de despedida (post-créditos), la ÚLTIMA
 * pantalla real de la experiencia (gran cierre → álbum → despedida).
 * Cálida y ligeramente misteriosa: deja intriga sin prometer nada concreto.
 * No muestra resultados, ni diagnósticos, ni clasificaciones.
 *
 * Sección 7: además del guardado automático en segundo plano (App.jsx marca
 * "cierre" al llegar al paso de cierre), aquí el colaborador registra el
 * cierre de forma EXPLÍCITA y deliberada con un botón.
 */
import { useState } from "react";
import { marcarCompletado } from "../state/firestore.js";
import { conReintento } from "../state/retry.js";

export default function FarewellScreen({ uid, haptiquenoLabel, avatarGlyph = "🍊" }) {
  const [estado, setEstado] = useState("inicial"); // inicial | guardando | listo | error

  async function finalizar() {
    if (!uid || estado === "guardando" || estado === "listo") return;
    setEstado("guardando");
    try {
      await conReintento(() => marcarCompletado(uid));
      setEstado("listo");
    } catch (error) {
      console.error("marcarCompletado failed:", error?.code, error?.message, error);
      setEstado("error");
    }
  }

  return (
    <div className="pantalla despedida">
      <div className="despedida-cielo">
        <span className="despedida-nube d1">☁️</span>
        <span className="despedida-nube d2">☁️</span>
        <span className="despedida-avion">✈️</span>
      </div>

      <div className="tarjeta despedida-tarjeta">
        <div style={{ fontSize: "2.4rem" }}>{avatarGlyph}</div>
        <h1>Hasta la próxima, {haptiquenoLabel}</h1>
        <p>Por ahora, la travesía termina aquí.</p>
        <p>Pero las historias de Háptica todavía tienen muchos caminos por recorrer.</p>
        <p className="despedida-intriga">Quizás algún día volvamos a preparar las maletas… 🧳</p>

        <div className="btn-fila" style={{ marginTop: 8 }}>
          <button
            className={`btn btn-primario btn-cta btn-finalizar ${estado === "listo" ? "btn-finalizar-listo" : ""}`}
            onClick={finalizar}
            disabled={estado === "guardando" || estado === "listo"}
          >
            {estado === "guardando" && <><span className="spinner" /> Registrando…</>}
            {estado === "listo" && "✓ Experiencia registrada"}
            {(estado === "inicial" || estado === "error") && "FINALIZAR EXPERIENCIA"}
          </button>
        </div>

        {estado === "error" && (
          <p className="texto-error" style={{ marginTop: 8 }}>
            No se pudo registrar el cierre. Tu avance ya está guardado; intenta de nuevo.
          </p>
        )}

        <div className="despedida-firma">✈️ Nos vemos en la próxima travesía.</div>
      </div>
    </div>
  );
}
