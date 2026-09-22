/**
 * ErrorScreen.jsx — bloqueo técnico persistente (Sección M).
 * "Hubo un problema técnico. Juli ya fue notificada."
 * Enlaza directamente a HelpReportModal (no a un flujo de salida).
 */
export default function ErrorScreen({ onPedirAyuda, onReintentar }) {
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>🛠️</div>
        <h1>Hubo un problema técnico</h1>
        <p className="sub">
          Juli ya fue notificada. No has perdido ninguna respuesta: cuando el problema
          se resuelva, continuarás exactamente donde ibas.
        </p>
        <div className="btn-fila">
          {onReintentar && (
            <button className="btn btn-primario" onClick={onReintentar}>Reintentar</button>
          )}
          <button className="btn btn-secundario" onClick={onPedirAyuda}>Necesito ayuda</button>
        </div>
      </div>
    </div>
  );
}
