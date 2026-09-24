/**
 * DatosGeneralesMission.jsx — MISIÓN que invoca el MOTOR DE PREGUNTAS.
 * Presenta las 19 preguntas oficiales de "Ficha de Datos Generales" como UN
 * SOLO bloque (petición de Juli): una pregunta por pantalla, texto y opciones
 * EXACTOS del motor. No modifica ninguna pregunta.
 */
import { useState } from "react";
import QuestionScreen from "../components/QuestionScreen.jsx";

export default function DatosGeneralesMission({ preguntas, startIndex = 0, onAnswer, onComplete }) {
  const [fase, setFase] = useState(startIndex > 0 ? "preguntas" : "intro");
  const [idx, setIdx] = useState(startIndex);
  const total = preguntas.length;

  if (fase === "intro") {
    return (
      <div className="pantalla">
        <div className="tarjeta mision-intro">
          <div style={{ fontSize: "2.6rem" }}>📋</div>
          <h1>Misión: Datos Generales</h1>
          <p className="sub">Completa este documento para continuar tu viaje.</p>
          <div className="mision-meta">
            <span>📝 {total} preguntas</span>
            <span>🎯 Completar bloque</span>
          </div>
          <p style={{ textAlign: "left" }}>
            Detrás de la puerta hay un documento oficial de Háptica. Respóndelo con calma:
            tus respuestas se guardan solas y son privadas.
          </p>
          <div className="btn-fila">
            <button className="btn btn-primario" onClick={() => setFase("preguntas")}>
              Abrir el documento
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[idx];

  async function submit(valor) {
    const siguiente = idx + 1;
    await onAnswer(pregunta, valor, siguiente);
    if (siguiente >= total) {
      await onComplete();
    } else {
      setIdx(siguiente);
    }
  }

  return (
    <QuestionScreen
      key={pregunta.id}
      pregunta={pregunta}
      numeroBloque={1}
      pais="Colombia"
      escenaLabel="Datos Generales"
      posEnBloque={idx + 1}
      totalBloque={total}
      onSubmit={submit}
      onAtras={idx > 0 ? () => setIdx(idx - 1) : undefined}
    />
  );
}
