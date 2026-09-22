/**
 * userProfile.js — perfil del participante y selección de avatar (CAMBIO 2).
 * El avatar se deriva de la información del login (@haptica.co). NO se pregunta
 * el género ni se muestra como categoría; si no se puede determinar de forma
 * confiable, se usa un avatar neutral (el Haptiqueño 🍊 clásico).
 *
 * Extensible: agrega correos a CORRESPONDENCIAS para asignar su avatar.
 */

import { nombreDesdeCorreo } from "./identidad.js";

/** Glifos de avatar por tipo (conservan la identidad cálida del Haptiqueño). */
export const AVATAR_GLYPH = {
  neutral: "🍊",
  femenino: "👩🏻",
  masculino: "👨🏻",
};

/**
 * Tabla de correspondencias correo → tipo de avatar (MVP).
 * Ampliable con el resto de HaptiqueñoS cuando se confirmen.
 */
export const CORRESPONDENCIAS = {
  "maria@haptica.co": "femenino",
  "maria.camila@haptica.co": "femenino",
  "mariaca@haptica.co": "femenino",
  "angelica@haptica.co": "femenino",
  "juliana.lopez@haptica.co": "femenino",
  // Ejemplos masculinos (ajustar con datos reales):
  // "juan@haptica.co": "masculino",
};

/**
 * Resuelve el perfil a partir del usuario autenticado.
 * @param {{email?:string, displayName?:string}} user
 * @returns {{email:string, displayName:string, avatarType:string, avatarId:string, avatarGlyph:string}}
 */
export function resolverPerfil(user) {
  const email = (user?.email || "").toLowerCase();
  // El nombre visible sale del perfil de Google o del correo corporativo.
  const displayName = (user?.displayName || "").trim() || nombreDesdeCorreo(email);
  const avatarType = CORRESPONDENCIAS[email] || "neutral";
  return {
    email,
    displayName,
    avatarType,
    avatarId: `${avatarType}-01`,
    avatarGlyph: AVATAR_GLYPH[avatarType] || AVATAR_GLYPH.neutral,
  };
}
