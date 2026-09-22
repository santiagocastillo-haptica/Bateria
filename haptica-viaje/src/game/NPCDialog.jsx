/**
 * NPCDialog.jsx — diálogo estilo videojuego con uno o varios personajes (NPC).
 * `lineas` acepta strings (un solo NPC) u objetos {nombre, emoji, texto}
 * para alternar hablantes (p. ej. Santi y Cami).
 */
import { useState } from "react";

export default function NPCDialog({
  nombre = "Mariaca",
  emoji = "👩🏽",
  avatarGlyph = "🍊",
  escenaEmojis,
  color = "#FA4616",
  lineas = [],
  botonFinal = "Continuar",
  onFin,
}) {
  const [i, setI] = useState(0);
  const ultima = i >= lineas.length - 1;
  const linea = lineas[i];
  const esObj = linea && typeof linea === "object";
  const nombreLinea = esObj ? linea.nombre : nombre;
  const emojiLinea = esObj ? linea.emoji : emoji;
  const textoLinea = esObj ? linea.texto : linea;
  const emojisEscena = escenaEmojis || [emoji];

  return (
    <div className="pantalla">
      <div className="tarjeta dialogo" style={{ borderTop: `6px solid ${color}` }}>
        <div className="dialogo-escena" style={{ background: color }}>
          {emojisEscena.map((e, k) => (
            <span key={k} className="dialogo-npc-emoji">{e}</span>
          ))}
          <span className="dialogo-vs">↔</span>
          <span className="dialogo-npc-emoji">{avatarGlyph}</span>
        </div>
        <div className="dialogo-caja">
          <div className="dialogo-nombre">{emojiLinea} {nombreLinea}</div>
          <div className="dialogo-texto">{textoLinea}</div>
        </div>
        <div className="dialogo-progreso">
          {lineas.map((_, k) => (
            <span key={k} className={`dialogo-punto ${k === i ? "activo" : ""}`} />
          ))}
        </div>
        <div className="btn-fila">
          {!ultima ? (
            <button className="btn btn-primario" onClick={() => setI(i + 1)}>Siguiente ▶</button>
          ) : (
            <button className="btn btn-primario" onClick={onFin}>{botonFinal}</button>
          )}
        </div>
      </div>
    </div>
  );
}
