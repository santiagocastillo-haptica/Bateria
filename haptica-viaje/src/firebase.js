/**
 * firebase.js — inicialización del SDK (Auth + Firestore con caché offline).
 * En MODO DEMO (sin variables de entorno) NO se inicializa Firebase; la app
 * usa persistencia local. La caché offline (Sección J) encola escrituras y
 * sincroniza al reconectar cuando Firebase sí está configurado.
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { firebaseConfig, CONFIG_PENDIENTE, MODO_DEMO } from "./firebaseConfig.js";

export let app = null;
export let auth = null;
export let db = null;
export let googleProvider = null;

if (!MODO_DEMO) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
  // Proveedor Google restringido por sugerencia de dominio (Sección H).
  // La restricción REAL y obligatoria vive en firestore.rules.
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ hd: "haptica.co" });
}

export const DOMINIO_PERMITIDO = "@haptica.co";
export { CONFIG_PENDIENTE, MODO_DEMO };
