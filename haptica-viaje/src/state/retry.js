/**
 * retry.js — reintento acotado para escrituras a Firestore (Sección J).
 * Cubre el caso "falla justo después del login con Google": el token de
 * autenticación puede tardar un instante en propagarse al canal de Firestore,
 * lo que produce errores TRANSITORIOS (unavailable, permission-denied,
 * deadline-exceeded, etc.) en la primera escritura real tras iniciar sesión.
 * Reintentar con una espera corta suele resolverlo sin que el colaborador
 * note nada.
 */

// Códigos de error de Firestore que vale la pena reintentar. Un error SIN
// código (ej. fallo de red genérico) también se trata como reintentable.
const CODIGOS_REINTENTABLES = new Set([
  "unavailable",
  "deadline-exceeded",
  "resource-exhausted",
  "aborted",
  "internal",
  "cancelled",
  "unknown",
  // "permission-denied" puede aparecer de forma transitoria justo después del
  // popup de Google si el token aún no se propagó al canal de Firestore.
  "permission-denied",
]);

/**
 * Ejecuta `fn` con reintentos acotados y backoff creciente.
 * @param {() => Promise<any>} fn función a ejecutar (debe ser idempotente).
 * @param {{backoffMs?: number[]}} opciones esperas entre reintentos (ms).
 */
export async function conReintento(fn, { backoffMs = [600, 1500] } = {}) {
  const intentosTotal = backoffMs.length + 1;
  let ultimoError;
  for (let intento = 0; intento < intentosTotal; intento++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error;
      const code = error?.code || "";
      const reintentable = !code || CODIGOS_REINTENTABLES.has(code);
      const esUltimoIntento = intento === intentosTotal - 1;
      if (!reintentable || esUltimoIntento) throw error;
      await new Promise((resolve) => setTimeout(resolve, backoffMs[intento]));
    }
  }
  // Inalcanzable, pero por si acaso.
  throw ultimoError;
}
