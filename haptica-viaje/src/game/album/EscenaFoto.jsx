/**
 * EscenaFoto.jsx — "imagen" del recuerdo (captura estilizada del mundo del
 * videojuego). No usa la cámara física: representa la escena actual con el
 * color del país, los elementos del momento y el avatar del Haptiqueño.
 */
export const ESCENAS = {
  colombia_oficina: { bg: "#FA4616", emojis: ["🏠", "🧳"] },
  regreso_haptica: { bg: "#FA4616", emojis: ["🏠", "🎉"] },
  tejo: { bg: "#FA4616", emojis: ["🎯"] },
  carritos: { bg: "#FA4616", emojis: ["🚗", "🏁"] },
  bolorana: { bg: "#FA4616", emojis: ["🐸"] },
  cartas: { bg: "#FA4616", emojis: ["🃏"] },
  bolos: { bg: "#FA4616", emojis: ["🎳"] },
  verdadreto: { bg: "#FA4616", emojis: ["🎤"] },
  ultima_puerta: { bg: "#FA4616", emojis: ["🚪", "🔐"] },
  final: { bg: "#FA4616", emojis: ["🎉", "🍊"] },
  mexico: { bg: "#E5A000", emojis: ["🌮", "🎉"] },
  mariaca: { bg: "#E5A000", emojis: ["👩🏽"] },
  chile: { bg: "#00BCA0", emojis: ["⛰️"] },
  angelica: { bg: "#00BCA0", emojis: ["👩🏼"] },
  lorenzo: { bg: "#00BCA0", emojis: ["🐶"] },
  lila: { bg: "#00BCA0", emojis: ["🐕"] },
  botas: { bg: "#6E7677", emojis: ["🐾"] },
  generico: { bg: "#FA4616", emojis: ["🗺️"] },
};

export default function EscenaFoto({ sceneKey, avatar = "🍊", size = 220 }) {
  const esc = ESCENAS[sceneKey] || ESCENAS.generico;
  const grande = size >= 160;
  return (
    <div
      className="escena-foto"
      style={{ background: esc.bg, width: size, height: Math.round(size * 0.72) }}
    >
      <div className="escena-foto-elementos" style={{ fontSize: grande ? "3rem" : "1.5rem" }}>
        {esc.emojis.map((e, i) => (
          <span key={i}>{e}</span>
        ))}
        <span className="escena-foto-avatar">{avatar}</span>
      </div>
    </div>
  );
}
