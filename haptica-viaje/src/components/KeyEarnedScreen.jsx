/**
 * KeyEarnedScreen.jsx — llave obtenida al completar un bloque (Sección G/K).
 * La llave NUNCA depende de qué opción se eligió, solo de haber respondido.
 */
export default function KeyEarnedScreen({ bloque, onContinuar }) {
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "3rem" }}>🔑</div>
        <h1>¡Conseguiste una llave!</h1>
        <p className="sub">
          Completaste <strong>{bloque.bloque}</strong> y ganaste{" "}
          <strong style={{ color: "var(--naranja-haptica)" }}>{bloque.llave}</strong>.
        </p>
        {bloque.puerta && (
          <p className="sub">Con ella se abre: <strong>{bloque.puerta}</strong>.</p>
        )}
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={onContinuar}>
            Cruzar la puerta
          </button>
        </div>
      </div>
    </div>
  );
}
