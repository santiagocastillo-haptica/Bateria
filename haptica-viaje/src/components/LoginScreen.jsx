/**
 * LoginScreen.jsx — un solo botón de ingreso con Google (Sección G/H).
 * En MODO DEMO crea un colaborador local para poder recorrer la experiencia.
 * La restricción real @haptica.co la aplican las reglas de Firestore.
 */
import { useState } from "react";
import { ingresarGoogle } from "../state/authProvider.js";
import { MODO_DEMO } from "../firebaseConfig.js";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function login() {
    setError("");
    setCargando(true);
    try {
      await ingresarGoogle();
      // App detecta el cambio de sesión y continúa el flujo.
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError(e.message || "No fue posible iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🧳</div>
        <h1>Bienvenido a tu viaje</h1>
        <p className="sub">
          Una experiencia de Háptica. Ingresa con tu correo institucional para comenzar.
        </p>

        {MODO_DEMO && (
          <div className="aviso">
            🧪 <strong>Modo demo</strong>: Firebase aún no está configurado, así que la
            experiencia corre con datos locales de este navegador (ideal para probar y
            demostrar). Al configurar las variables de entorno, pasa a Firebase real.
          </div>
        )}

        <div className="btn-fila">
          <button className="btn btn-primario" onClick={login} disabled={cargando}>
            {cargando ? <span className="spinner" /> : "Ingresar con tu correo de Háptica"}
          </button>
        </div>

        {error && <p className="texto-error" style={{ marginTop: 14 }}>{error}</p>}
      </div>
    </div>
  );
}
