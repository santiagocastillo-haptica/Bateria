/**
 * authProvider.js — autenticación unificada (Firebase real o MODO DEMO).
 * Los componentes NO importan firebase/auth directamente; usan esta fachada.
 */
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider, DOMINIO_PERMITIDO, MODO_DEMO } from "../firebase.js";
import { getDemoUser, setDemoUser } from "./demoStore.js";

export { DOMINIO_PERMITIDO, MODO_DEMO };

// --- listeners para el modo demo ---
const listeners = new Set();
function notificarDemo() {
  const u = getDemoUser();
  listeners.forEach((cb) => cb(u));
}

/** Observa el estado de sesión. Devuelve función para desuscribir. */
export function observarAuth(cb) {
  if (MODO_DEMO) {
    listeners.add(cb);
    // Notifica el estado actual de inmediato.
    Promise.resolve().then(() => cb(getDemoUser()));
    return () => listeners.delete(cb);
  }
  return onAuthStateChanged(auth, cb);
}

/** Inicia sesión con Google (o crea usuario demo). Lanza Error si el dominio no es válido. */
export async function ingresarGoogle() {
  if (MODO_DEMO) {
    setDemoUser({ uid: "demo-uid", email: "demo@haptica.co", displayName: "Colaborador Demo" });
    notificarDemo();
    return;
  }
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email || "";
  if (!email.endsWith(DOMINIO_PERMITIDO)) {
    await signOut(auth);
    throw new Error("Solo se permiten cuentas @haptica.co");
  }
}

export async function cerrarSesion() {
  if (MODO_DEMO) {
    setDemoUser(null);
    notificarDemo();
    return;
  }
  await signOut(auth);
}

/** Rol del usuario a partir del custom claim (o 'juli' en demo para poder mostrar el panel). */
export async function obtenerRol(user) {
  if (MODO_DEMO) return "juli";
  if (!user) return null;
  const token = await user.getIdTokenResult(true);
  return token.claims.role || null;
}

export function esDominioValido(email) {
  return (email || "").endsWith(DOMINIO_PERMITIDO);
}
