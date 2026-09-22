/**
 * placeholders.js — PUNTO ÚNICO DE EDICIÓN VISUAL (Fase 1 → Fase 2)
 * ---------------------------------------------------------------------------
 * Mapa bloque → { color, iconKey, label, companeros, memoriaBotas, imagen }.
 * En Fase 2, reemplazar un placeholder por arte final = cambiar `imagen` a la
 * ruta del asset (ej. "/assets/scenes/bloque1.png"). NO se toca lógica,
 * NO se toca experiencia.json, NO se tocan preguntas.
 * ---------------------------------------------------------------------------
 * Paleta por país (Sección N):
 *   Colombia -> amarillo cálido   Bloques 1, 2, 11, 12, 13, 14, 15
 *   México   -> rosa/terracota    Bloques 3, 4, 5, 6
 *   Chile    -> azul andino       Bloques 7, 8, 9, 10
 *   Avatar   -> naranja ("Naranja") — llaves, pasaporte, botones principales
 */

export const AVATAR_COLOR = "#FA4616"; // naranja Háptica (Pantone 172 C)

/** Distintivo por país (círculo de color — renderiza en Windows/Android/iOS). */
export const PAIS_FLAG = {
  Colombia: "🟡",
  "México": "🔴",
  Mexico: "🔴",
  Chile: "🔵",
};

/** Paleta por país, tomada ÚNICAMENTE de los tokens de marca Háptica. */
export const PAIS_COLOR = {
  Colombia: "#FA4616", // naranja Háptica
  "México": "#E5A000", // ámbar
  Mexico: "#E5A000", // tolerancia por si el JSON viniera sin acento
  Chile: "#00BCA0", // menta
};

/** Color de texto legible sobre cada fondo de país. */
export const PAIS_TEXTO = {
  Colombia: "#FFFFFF",
  "México": "#0D1B1D",
  Mexico: "#0D1B1D",
  Chile: "#0D1B1D",
};

/**
 * Datos de placeholder por número de bloque (1..15).
 * iconKey lo resuelve <SceneVisual> como forma simple; imagen=null en Fase 1.
 */
export const BLOQUE_PLACEHOLDER = {
  1: { iconKey: "maleta", label: "Maleta de viaje", imagen: null },
  2: { iconKey: "boleto", label: "Boleto de embarque", imagen: null },
  3: { iconKey: "canasta", label: "Mercado", imagen: null },
  4: { iconKey: "banca", label: "Plaza", imagen: null },
  5: { iconKey: "noria", label: "Parque de diversiones", imagen: null },
  6: { iconKey: "taza", label: "Café", imagen: null },
  7: { iconKey: "mapa", label: "Camino a casa de Angélica", imagen: null },
  8: { iconKey: "puerta_casa", label: "Casa de Angélica", imagen: null },
  9: { iconKey: "huella", label: "Paseo por el barrio", imagen: null },
  10: { iconKey: "mesa", label: "Sobremesa", imagen: null },
  11: { iconKey: "escritorio", label: "El escritorio", imagen: null },
  12: { iconKey: "junta", label: "Sala de juntas", imagen: null },
  13: { iconKey: "pasillo", label: "El pasillo", imagen: null },
  14: { iconKey: "equipo", label: "Sala del equipo", imagen: null },
  15: { iconKey: "puerta_grande", label: "La última puerta", imagen: null },
};

/**
 * Acompañantes de Chile (Sección N):
 *  - Lorenzo y Lila: dos huellas en los Bloques 8, 9 y 10.
 *  - Memoria de Botas: SOLO en el Bloque 10, discreta, tono apagado, sin
 *    protagonismo ni interacción (representación respetuosa).
 */
export const COMPANEROS_CHILE = {
  8: { huellas: 2, label: "Lorenzo y Lila te acompañan", memoriaBotas: false },
  9: { huellas: 2, label: "Lorenzo y Lila te acompañan", memoriaBotas: false },
  10: { huellas: 2, label: "Lorenzo y Lila te acompañan", memoriaBotas: true },
};

/** Tono apagado para la memoria de Botas (nunca el color vivo del país). */
export const BOTAS_COLOR = "#6E7677"; // gris-600

/**
 * Personajes narrativos por bloque (capa de experiencia, NO afecta preguntas).
 *  - México (3–6): Mariaca (María Camila Venegas) recibe al viajero.
 *  - Chile (7–10): Angélica María Flechas.
 *  - Regreso a Colombia (11–15): Juli acompaña el cierre.
 * Colombia inicio (1–2): solo el avatar naranja del viajero.
 */
export const PERSONAJE_POR_BLOQUE = {
  3: { nombre: "Mariaca", rol: "Te recibe en México" },
  4: { nombre: "Mariaca", rol: "Te recibe en México" },
  5: { nombre: "Mariaca", rol: "Te recibe en México" },
  6: { nombre: "Mariaca", rol: "Te recibe en México" },
  7: { nombre: "Angélica", rol: "Te acompaña en Chile" },
  8: { nombre: "Angélica", rol: "Te acompaña en Chile" },
  9: { nombre: "Angélica", rol: "Te acompaña en Chile" },
  10: { nombre: "Angélica", rol: "Te acompaña en Chile" },
  11: { nombre: "Juli", rol: "Te acompaña de regreso" },
  12: { nombre: "Juli", rol: "Te acompaña de regreso" },
  13: { nombre: "Juli", rol: "Te acompaña de regreso" },
  14: { nombre: "Juli", rol: "Te acompaña de regreso" },
  15: { nombre: "Juli", rol: "Te acompaña de regreso" },
};

/**
 * Devuelve el placeholder completo para un bloque, resolviendo color por país.
 * @param {number} numeroBloque 1..15
 * @param {string} pais  valor de bloque.pais en experiencia.json
 */
export function getPlaceholder(numeroBloque, pais) {
  const base = BLOQUE_PLACEHOLDER[numeroBloque] || {
    iconKey: "generico",
    label: "Escena",
    imagen: null,
  };
  const companeros = COMPANEROS_CHILE[numeroBloque] || null;
  const personaje = PERSONAJE_POR_BLOQUE[numeroBloque] || null;
  return {
    ...base,
    color: PAIS_COLOR[pais] || AVATAR_COLOR,
    textoColor: PAIS_TEXTO[pais] || "#FFFFFF",
    pais,
    companeros,
    personaje,
  };
}
