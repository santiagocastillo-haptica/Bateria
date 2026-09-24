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

/**
 * Traduce un error real de signInWithPopup a un mensaje que el participante
 * pueda entender y sobre el que pueda actuar (reintentar, cambiar de
 * navegador, permitir ventanas emergentes) — nunca un código críptico.
 */
function mensajeAmigablePopup(error) {
  if (error?.code === "auth/popup-blocked") {
    return "Tu navegador bloqueó la ventana de inicio de sesión. Permite ventanas emergentes para este sitio e intenta de nuevo.";
  }
  if (error?.code === "auth/operation-not-supported-in-this-environment") {
    return "Este navegador no admite el inicio de sesión aquí. Abre el enlace en Chrome o Safari e inténtalo de nuevo.";
  }
  return "No fue posible iniciar sesión. Revisa tu conexión e inténtalo de nuevo.";
}

/** Inicia sesión con Google (o crea usuario demo). Lanza Error si el dominio no es válido. */
export async function ingresarGoogle() {
  if (MODO_DEMO) {
    setDemoUser({ uid: "demo-uid", email: "demo@haptica.co", displayName: "Colaborador Demo" });
    notificarDemo();
    return;
  }
  // SOLO ventana emergente, en todos los navegadores (desktop y móvil). Se
  // probó signInWithRedirect como respaldo para móvil, pero Firebase mismo
  // reportó el error "missing initial state ... storage-partitioned browser
  // environment" en un Android real: el viaje de ida y vuelta a
  // accounts.google.com depende de que el navegador conserve un estado
  // temporal (IndexedDB/sessionStorage), y con el dominio de autenticación
  // de Firebase (*.firebaseapp.com) siendo distinto al dominio real de la
  // app (Vercel), Chrome Android lo pierde por su particionamiento de
  // almacenamiento — el participante acepta el login en Google y lo
  // devuelve SIN sesión. El popup no depende de ese viaje entre dominios en
  // absoluto, así que es la única vía confiable aquí; si de verdad no puede
  // abrirse, se lanza un error claro y reintentable en vez de caer a un
  // mecanismo que ya demostró romperse.
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email || "";
    if (!email.endsWith(DOMINIO_PERMITIDO)) {
      await signOut(auth);
      throw new Error("Solo se permiten cuentas @haptica.co");
    }
  } catch (error) {
    if (error?.code === "auth/popup-closed-by-user") throw error; // el llamador ya ignora este caso
    console.error("signInWithPopup failed:", error?.code, error?.message, error);
    throw new Error(mensajeAmigablePopup(error));
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
