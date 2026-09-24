/**
 * JuliApp.jsx — contenedor de la ruta /juli.
 * Verifica sesión + rol "juli" y muestra Login o Dashboard.
 */
import { useEffect, useState } from "react";
import { observarAuth, cerrarSesion, obtenerRol, esDominioValido } from "../state/authProvider.js";
import { colaboradorPorCorreo } from "../data/colaboradores.js";
import JuliLogin from "./JuliLogin.jsx";
import JuliDashboard from "./JuliDashboard.jsx";

// Mientras el custom claim 'role: juli' no se haya asignado (requiere el
// script one-time con service account), estos correos también abren el
// panel — misma lista que esAdminHaptica() en firestore.rules, derivada de
// TABLA_DATOS_BATERIA.xlsx (columna rol = "Administrador"). Esto es solo la
// puerta de la UI: la seguridad real vive en las Security Rules.
function esAdminPorCorreo(correo) {
  const c = colaboradorPorCorreo(correo);
  return c?.rol === "Administrador";
}

export default function JuliApp() {
  const [user, setUser] = useState(null);
  const [esJuli, setEsJuli] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    return observarAuth(async (u) => {
      if (!u) {
        setUser(null);
        setEsJuli(false);
        setListo(true);
        return;
      }
      if (!esDominioValido(u.email)) {
        await cerrarSesion();
        setUser(null);
        setEsJuli(false);
        setListo(true);
        return;
      }
      const rol = await obtenerRol(u);
      setUser(u);
      setEsJuli(rol === "juli" || esAdminPorCorreo(u.email));
      setListo(true);
    });
  }, []);

  if (!listo) {
    return (
      <div className="pantalla">
        <div className="tarjeta"><span className="spinner" /> Cargando panel…</div>
      </div>
    );
  }

  if (!user) return <JuliLogin />;

  if (!esJuli) {
    return (
      <div className="pantalla">
        <div className="tarjeta">
          <h1>Acceso restringido</h1>
          <p className="sub">
            Esta cuenta no tiene permisos de administración del panel. Si eres Juliana y
            acabas de recibir el rol, cierra sesión y vuelve a ingresar.
          </p>
          <div className="btn-fila">
            <button className="btn btn-secundario" onClick={() => cerrarSesion()}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <JuliDashboard user={user} />;
}
