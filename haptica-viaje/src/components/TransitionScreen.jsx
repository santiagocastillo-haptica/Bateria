/**
 * TransitionScreen.jsx — transición entre países como secuencia de viaje.
 * OFICINA → VAN → AEROPUERTO → AVIÓN → destino. Usa el objeto de transición de
 * experiencia.json (nombre + momento). Al iniciar el viaje se dispara la
 * cámara automática (recuerdo del trayecto).
 */
import { useEffect, useState } from "react";
import AutoCamera from "../game/album/AutoCamera.jsx";

const PASOS = [
  { ico: "🏢", label: "Oficina" },
  { ico: "🚐", label: "Van" },
  { ico: "🛫", label: "Aeropuerto" },
  { ico: "✈️", label: "Avión" },
];

/** Emoji de destino: elemento de viaje, nunca una alerta. */
const DESTINO_EMOJI = { "México": "🌮", Mexico: "🌮", Chile: "⛰️", Colombia: "🏠" };

function destinoDe(nombre) {
  const partes = (nombre || "").split("→");
  const destino = (partes[1] || "").trim().replace(/\s*\(.*\)/, "");
  return { destino, emoji: DESTINO_EMOJI[destino] || "🌎" };
}

export default function TransitionScreen({ nombre, momento, onContinuar }) {
  const { destino, emoji } = destinoDe(nombre);
  const total = PASOS.length + 1; // + destino
  const [activo, setActivo] = useState(0);
  const [foto, setFoto] = useState(true); // cámara automática al iniciar el viaje

  useEffect(() => {
    if (foto) return;
    setActivo(0);
    const t = setInterval(() => {
      setActivo((a) => (a < total - 1 ? a + 1 : a));
    }, 650);
    return () => clearInterval(t);
  }, [nombre, foto, total]);

  if (foto) return <AutoCamera onFin={() => setFoto(false)} />;

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <h1>{nombre}</h1>

        <div className="viaje-secuencia">
          {PASOS.map((p, i) => (
            <span key={p.label} style={{ display: "contents" }}>
              <span className={`viaje-paso ${i <= activo ? "activo" : ""}`}>
                <span className="ico">{p.ico}</span>
                <span>{p.label}</span>
              </span>
              <span className="viaje-flecha">→</span>
            </span>
          ))}
          <span className={`viaje-paso ${activo >= total - 1 ? "activo" : ""}`}>
            <span className="ico">{emoji}</span>
            <span>{destino}</span>
          </span>
        </div>

        {momento && <p style={{ textAlign: "left" }}>{momento}</p>}

        <div className="btn-fila">
          <button className="btn btn-primario btn-cta" onClick={onContinuar}>
            ✈️ Continuar la travesía
          </button>
        </div>
      </div>
    </div>
  );
}
