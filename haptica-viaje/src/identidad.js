/**
 * identidad.js — identidad NARRATIVA del participante.
 * Todos son Haptiqueños. La identidad visible es el NOMBRE de la persona,
 * tomado de su correo corporativo @haptica.co. El número (Haptiqueño NN) se
 * conserva como ID interno/administrativo y como respaldo si no hay nombre.
 * La clasificación administrativa (directa/contratista) NO vive aquí.
 */

/** ID de respaldo/administrativo: "Haptiqueño 01". */
export function haptiquenoLabel(n) {
  if (!n && n !== 0) return "Haptiqueño";
  return `Haptiqueño ${String(n).padStart(2, "0")}`;
}

/** Convierte "maria.camila@haptica.co" → "Maria Camila". */
export function nombreDesdeCorreo(email) {
  const base = (email || "").split("@")[0];
  return base
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Etiqueta visible del participante: su nombre real; si no se puede
 * determinar, el ID Haptiqueño NN.
 */
export function etiquetaParticipante(perfil, n) {
  const nombre = (perfil?.displayName || "").trim();
  return nombre || haptiquenoLabel(n);
}

export const NARANJA_EMOJI = "🍊";
