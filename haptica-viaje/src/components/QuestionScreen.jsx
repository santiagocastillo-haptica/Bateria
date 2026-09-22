/**
 * QuestionScreen.jsx — una sola pregunta por pantalla (Sección G/J).
 * - Texto y opciones EXACTOS desde experiencia.json (nunca reescritos).
 * - Tipo de input según tipo_de_respuesta.
 * - Sin botón "Atrás" en el MVP.
 * - "Continuar" no avanza hasta confirmar el guardado (onSubmit async).
 */
import { useMemo, useState } from "react";
import { getPlaceholder, PAIS_FLAG } from "../data/placeholders.js";
import { ES_REVIEW } from "../config/appMode.js";

function modoDePregunta(pregunta) {
  if (!pregunta) return "texto";
  if (Array.isArray(pregunta.opciones_exactas)) return "radio";
  const t = pregunta.tipo_de_respuesta || "";
  if (/2 subcampos/i.test(t)) return "dos";
  if (/numérico condicional/i.test(t)) return "condicional";
  if (/Numérico/i.test(t)) return "numero";
  return "texto";
}

export default function QuestionScreen({
  pregunta,
  numeroBloque,
  pais,
  escenaLabel,
  posEnBloque,
  totalBloque,
  onSubmit,
  onAtras,
  onSaltar,
}) {
  const modo = useMemo(() => modoDePregunta(pregunta), [pregunta]);
  const ph = getPlaceholder(numeroBloque, pais);
  const color = ph.color;
  const flag = PAIS_FLAG[pais] || "🧭";
  const pctBloque = totalBloque ? Math.round((posEnBloque / totalBloque) * 100) : 0;

  const [sel, setSel] = useState(null); // radio
  const [dos, setDos] = useState({ a: "", b: "" }); // 2 subcampos
  const [cond, setCond] = useState({ opcion: null, anios: "" }); // selección + numérico
  const [txt, setTxt] = useState(""); // texto / numero
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  // Frases oficiales del caso condicional (verbatim desde el raw).
  const condPartes = useMemo(() => {
    const raw = pregunta?.opciones_exactas_raw || "";
    const partes = raw.split(" / ");
    return { a: partes[0] || "Menos de un año", b: partes[1] || "Más de un año" };
  }, [pregunta]);

  function valido() {
    if (modo === "radio") return sel !== null;
    if (modo === "dos") return dos.a.trim() !== "" && dos.b.trim() !== "";
    if (modo === "condicional")
      return cond.opcion === "A" || (cond.opcion === "B" && cond.anios.trim() !== "" && !isNaN(Number(cond.anios)));
    if (modo === "numero") return txt.trim() !== "" && !isNaN(Number(txt));
    return txt.trim() !== "";
  }

  function valor() {
    if (modo === "radio") return sel;
    if (modo === "dos") return `${dos.a.trim()} / ${dos.b.trim()}`;
    if (modo === "condicional") return cond.opcion === "A" ? condPartes.a : String(Number(cond.anios));
    return txt.trim();
  }

  async function continuar() {
    if (!valido() || guardando) return;
    setGuardando(true);
    setErrorGuardado(false);
    try {
      await onSubmit(valor()); // App guarda en Firestore y avanza al confirmar
    } catch (_) {
      setErrorGuardado(true);
      setGuardando(false); // permite reintentar; la respuesta ya quedó en buffer local
    }
  }

  if (!pregunta) return null;

  return (
    <div className="pantalla">
      <div className="tarjeta" style={{ borderTop: `6px solid ${color}` }}>
        <div className="escena-banner" style={{ background: color, color: ph.textoColor }}>
          <div>
            <div className="lugar">{flag} {escenaLabel || pais}</div>
            {totalBloque > 0 && (
              <div className="escena-banner-barra">
                <div className="escena-banner-relleno" style={{ width: `${pctBloque}%` }} />
              </div>
            )}
          </div>
          {totalBloque > 0 && (
            <span className="avance">{posEnBloque} / {totalBloque}</span>
          )}
        </div>
        <div className="pregunta-texto">{pregunta.texto_exacto}</div>

        {/* --- Selección única (radios con opciones EXACTAS) --- */}
        {modo === "radio" && (
          <div className="opciones">
            {pregunta.opciones_exactas.map((op) => (
              <label key={op} className={`opcion ${sel === op ? "sel" : ""}`}>
                <input
                  type="radio"
                  name={pregunta.id}
                  value={op}
                  checked={sel === op}
                  onChange={() => setSel(op)}
                />
                <span>{op}</span>
              </label>
            ))}
          </div>
        )}

        {/* --- Texto / Numérico abierto --- */}
        {(modo === "texto" || modo === "numero") && (
          <input
            className="campo"
            type={modo === "numero" ? "number" : "text"}
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder="Escribe tu respuesta"
            aria-label={pregunta.texto_exacto}
          />
        )}

        {/* --- Texto abierto (2 subcampos) — guía oficial verbatim --- */}
        {modo === "dos" && (
          <div className="campo-fila">
            <div className="raw-hint">{pregunta.opciones_exactas_raw}</div>
            <input
              className="campo"
              value={dos.a}
              onChange={(e) => setDos({ ...dos, a: e.target.value })}
              aria-label="Primer campo"
            />
            <input
              className="campo"
              value={dos.b}
              onChange={(e) => setDos({ ...dos, b: e.target.value })}
              aria-label="Segundo campo"
            />
          </div>
        )}

        {/* --- Selección + numérico condicional — frases oficiales verbatim --- */}
        {modo === "condicional" && (
          <div className="opciones">
            <label className={`opcion ${cond.opcion === "A" ? "sel" : ""}`}>
              <input
                type="radio"
                name={pregunta.id}
                checked={cond.opcion === "A"}
                onChange={() => setCond({ opcion: "A", anios: "" })}
              />
              <span>{condPartes.a}</span>
            </label>
            <label className={`opcion ${cond.opcion === "B" ? "sel" : ""}`}>
              <input
                type="radio"
                name={pregunta.id}
                checked={cond.opcion === "B"}
                onChange={() => setCond({ opcion: "B", anios: cond.anios })}
              />
              <span>{condPartes.b}</span>
            </label>
            {cond.opcion === "B" && (
              <input
                className="campo"
                type="number"
                min="0"
                value={cond.anios}
                onChange={(e) => setCond({ opcion: "B", anios: e.target.value })}
                placeholder="Número de años"
                aria-label="Número de años"
              />
            )}
          </div>
        )}

        {errorGuardado && (
          <p className="texto-error" style={{ marginTop: 12 }}>
            No se pudo confirmar el guardado. Tu respuesta quedó guardada localmente; intenta de nuevo.
          </p>
        )}

        <div className="btn-fila">
          <button className="btn btn-primario" onClick={continuar} disabled={!valido() || guardando}>
            {guardando ? <span className="spinner" /> : "Continuar"}
          </button>
        </div>

        <div className="instrumento-pie">{pregunta.instrumento}</div>

        {/* Navegación libre SOLO en modo revisión. En producción no existe:
            el participante no puede retroceder ni saltar preguntas. */}
        {ES_REVIEW && (onAtras || onSaltar) && (
          <div className="review-nav">
            {onAtras && <button className="review-chip" onClick={onAtras}>← Anterior</button>}
            {onSaltar && <button className="review-chip" onClick={onSaltar}>Saltar →</button>}
          </div>
        )}
      </div>
    </div>
  );
}
