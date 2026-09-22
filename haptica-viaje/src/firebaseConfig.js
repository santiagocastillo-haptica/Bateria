/**
 * firebaseConfig.js — configuración leída de VARIABLES DE ENTORNO (Vite).
 * ---------------------------------------------------------------------------
 * NO se ponen secretos en el código. Los valores viven en un archivo .env.local
 * (que está en .gitignore) con el prefijo VITE_ para que Vite los exponga.
 *
 * Juliana crea `.env.local` (copiar de `.env.example`) con:
 *   VITE_FIREBASE_API_KEY=...
 *   VITE_FIREBASE_AUTH_DOMAIN=...
 *   VITE_FIREBASE_PROJECT_ID=...
 *   VITE_FIREBASE_STORAGE_BUCKET=...
 *   VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *   VITE_FIREBASE_APP_ID=...
 *
 * Estos valores del cliente NO son secretos reales; la seguridad vive en
 * firestore.rules. Mientras falten, la app corre en MODO DEMO (localStorage).
 * ---------------------------------------------------------------------------
 */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** true si faltan valores esenciales -> la app corre en MODO DEMO (sin Firebase). */
export const CONFIG_PENDIENTE = !(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

/** MODO DEMO: sin Firebase configurado, persistencia local para poder demostrar. */
export const MODO_DEMO = CONFIG_PENDIENTE;
