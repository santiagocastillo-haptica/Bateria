/**
 * JuliLogin.jsx — ingreso al panel de administración (/juli).
 * Mismo Google Sign-In restringido a @haptica.co; el acceso real al panel lo
 * decide el custom claim role:"juli" (verificado en JuliApp).
 */
import { useState } from "react";
import { ingresarGoogle } from "../state/authProvider.js";
import { MODO_DEMO } from "../firebaseConfig.js";

export default function JuliLogin() {
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function login() {
    setError("");
    setCargando(true);
    try {
      await ingresarGoogle();
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError(e.message || "No fue posible iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.2rem" }}>🛂</div>
        <h1>Panel de Juli</h1>
        <p className="sub">Acceso exclusivo de administración.</p>
        {MODO_DEMO && (
          <div className="aviso">🧪 Modo demo: acceso de panel habilitado con datos locales.</div>
        )}
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={login} disabled={cargando}>
            {cargando ? <span className="spinner" /> : "Ingresar"}
          </button>
        </div>
        {error && <p className="texto-error" style={{ marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
