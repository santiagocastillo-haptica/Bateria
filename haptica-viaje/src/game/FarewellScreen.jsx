/**
 * FarewellScreen.jsx — pantalla de despedida (post-créditos).
 * Cálida y ligeramente misteriosa: deja intriga sin prometer nada concreto.
 * No muestra resultados, ni diagnósticos, ni clasificaciones.
 */
export default function FarewellScreen({ haptiquenoLabel, avatarGlyph = "🍊" }) {
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
        <div className="despedida-firma">✈️ Nos vemos en la próxima travesía.</div>
      </div>
    </div>
  );
}
