/**
 * fotoContexto.js — contexto actual para la cámara (qué momento se fotografía).
 * Cada zona/actividad actualiza este contexto; la cámara lo lee al capturar.
 * Singleton simple (no necesita reactividad: se lee al abrir la cámara).
 */
let ctx = {
  folderId: "oficina",
  country: "Colombia",
  activity: null,
  sceneKey: "colombia_oficina",
  avatar: "🍊",
};

export function setContextoFoto(parcial) {
  ctx = { ...ctx, ...parcial };
}

export function getContextoFoto() {
  return ctx;
}
