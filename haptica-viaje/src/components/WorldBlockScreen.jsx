/**
 * WorldBlockScreen.jsx — CAPA DE EXPERIENCIA (no es una encuesta).
 * Cada bloque se entra como un "mundo": país + casa/escena + Haptiqueño +
 * puerta cerrada. El participante INVESTIGA, resuelve un misterio breve, la
 * puerta se abre y entra al bloque de preguntas oficiales (motor existente).
 *
 * El misterio representa PROGRESO, nunca respuestas correctas ni evaluación.
 */
import { useState } from "react";
import SceneVisual from "./SceneVisual.jsx";
import { PAIS_FLAG } from "../data/placeholders.js";

/** Objetos de la maleta (Bloque 1). Empacar los esenciales abre la puerta. */
const ITEMS_MALETA = [
  { emoji: "🛂", nombre: "Pasaporte", esencial: true },
  { emoji: "🧳", nombre: "Ropa", esencial: true },
  { emoji: "🔌", nombre: "Cargador", esencial: true },
  { emoji: "📷", nombre: "Cámara", esencial: false },
  { emoji: "🏖️", nombre: "Sombrilla", esencial: false },
];

function MaletaMystery({ onResuelto }) {
  const [empacados, setEmpacados] = useState([]);
  const [nota, setNota] = useState("");
  const esenciales = ITEMS_MALETA.filter((i) => i.esencial).map((i) => i.nombre);
  const listo = esenciales.every((n) => empacados.includes(n));

  function empacar(item) {
    if (empacados.includes(item.nombre)) return;
    if (item.esencial) {
      const nuevos = [...empacados, item.nombre];
      setEmpacados(nuevos);
      setNota(`Empacaste: ${item.nombre}`);
      if (esenciales.every((n) => nuevos.includes(n))) {
        setNota("¡Maleta lista para el viaje!");
        onResuelto();
      }
    } else {
      setNota(`${item.nombre}: eso puedes dejarlo en casa 😊`);
    }
  }

  return (
    <div>
      <p className="sub" style={{ textAlign: "left" }}>
        Toca los objetos que sí necesitas para el viaje y empácalos en la maleta.
      </p>
      <div className="maleta-items">
        {ITEMS_MALETA.map((item) => {
          const dentro = empacados.includes(item.nombre);
          return (
            <button
              key={item.nombre}
              className={`item-maleta ${dentro ? "dentro" : ""}`}
              onClick={() => empacar(item)}
              disabled={dentro}
            >
              <span style={{ fontSize: "1.6rem" }}>{item.emoji}</span>
              <span>{item.nombre}</span>
              {dentro && <span className="check">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="maleta-estado">
        🧳 {empacados.length ? empacados.join(" · ") : "Maleta vacía"}
      </div>
      {nota && <p className="raw-hint" style={{ marginTop: 8 }}>{nota}</p>}
    </div>
  );
}

function InvestigarGenerico({ onResuelto }) {
  const [buscando, setBuscando] = useState(false);
  return (
    <div>
      <p className="sub" style={{ textAlign: "left" }}>
        Observa el lugar con atención. Cuando estés listo, investiga para hallar la pista
        que abre la puerta.
      </p>
      {!buscando ? (
        <div className="btn-fila">
          <button
            className="btn btn-secundario"
            onClick={() => {
              setBuscando(true);
              onResuelto();
            }}
          >
            🔎 Buscar la pista
          </button>
        </div>
      ) : (
        <p className="raw-hint">Encontraste la pista. La puerta cede.</p>
      )}
    </div>
  );
}

export default function WorldBlockScreen({
  bloque,
  numeroBloque,
  haptiquenoLabel,
  llavesCount,
  esMaleta,
  onContinuar,
}) {
  const [fase, setFase] = useState("mundo"); // mundo | misterio
  const [resuelto, setResuelto] = useState(false);
  const flag = PAIS_FLAG[bloque.pais] || "🧭";
  const casa = bloque.pais === "Colombia" ? "Casa Háptica" : `${bloque.pais}`;

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div className="mundo-cabecera">
          <span className="mundo-pais">{flag} {bloque.pais.toUpperCase()}</span>
          <span className="mundo-llaves">🔑 {llavesCount} {llavesCount === 1 ? "llave" : "llaves"}</span>
        </div>

        <SceneVisual numeroBloque={numeroBloque} pais={bloque.pais} escenaNombre={bloque.escena} />

        <div className="mundo-haptiqueno">🍊 {haptiquenoLabel}</div>

        {fase === "mundo" && (
          <>
            <div className="puerta-cerrada">🔐 Puerta cerrada</div>
            <p style={{ textAlign: "left" }}>
              Estás en <strong>{casa}</strong>. {bloque.misterio}
            </p>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={() => setFase("misterio")}>
                🔎 Investigar
              </button>
            </div>
          </>
        )}

        {fase === "misterio" && (
          <>
            <h2 style={{ marginTop: 8 }}>El misterio</h2>
            {esMaleta ? (
              <MaletaMystery onResuelto={() => setResuelto(true)} />
            ) : (
              <InvestigarGenerico onResuelto={() => setResuelto(true)} />
            )}
            {resuelto && (
              <>
                <div className="puerta-abierta">🔓 ¡La puerta se abre!</div>
                <div className="btn-fila">
                  <button className="btn btn-primario" onClick={onContinuar}>
                    Entrar
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
