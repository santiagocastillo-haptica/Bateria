/**
 * MissionQuestions.jsx — runner genérico de un SUBBLOQUE de preguntas oficiales.
 * Muestra una intro temática (personaje/lugar) y luego una pregunta por pantalla
 * con el MOTOR OFICIAL (QuestionScreen). No modifica ninguna pregunta.
 */
import { useState } from "react";
import QuestionScreen from "../components/QuestionScreen.jsx";

export default function MissionQuestions({
  preguntas,
  startIndex = 0,
  intro,
  escenaLabel,
  pais = "México",
  numeroBloque = 3,
  onAnswer,
  onComplete,
}) {
  const [fase, setFase] = useState(startIndex > 0 || !intro ? "preguntas" : "intro");
  const [idx, setIdx] = useState(startIndex);
  const total = preguntas.length;

  if (fase === "intro" && intro) {
    return (
      <div className="pantalla">
        <div className="tarjeta" style={{ borderTop: `6px solid ${intro.color || "#FA4616"}` }}>
          <div style={{ fontSize: "2.8rem" }}>{intro.emoji}</div>
          <h1>{intro.titulo}</h1>
          {intro.subtitulo && <p className="sub">{intro.subtitulo}</p>}
          {intro.npc && (
            <div className="dialogo-caja" style={{ marginTop: 12 }}>
              <div className="dialogo-nombre">{intro.npcEmoji || "👩🏽"} {intro.npcNombre || "Mariaca"}</div>
              <div className="dialogo-texto">{intro.npc}</div>
            </div>
          )}
          <div className="btn-fila">
            <button className="btn btn-primario" onClick={() => setFase("preguntas")}>
              {intro.boton || "Comenzar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[idx];
  if (!pregunta) return null;

  async function submit(valor) {
    const sig = idx + 1;
    await onAnswer(pregunta, valor, sig);
    if (sig >= total) await onComplete();
    else setIdx(sig);
  }

  return (
    <QuestionScreen
      key={pregunta.id}
      pregunta={pregunta}
      numeroBloque={numeroBloque}
      pais={pais}
      escenaLabel={escenaLabel}
      posEnBloque={idx + 1}
      totalBloque={total}
      onSubmit={submit}
      onAtras={idx > 0 ? () => setIdx(idx - 1) : undefined}
      onSaltar={() => {
        const sig = idx + 1;
        if (sig >= total) onComplete();
        else setIdx(sig);
      }}
    />
  );
}
