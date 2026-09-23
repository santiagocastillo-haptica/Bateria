/**
 * mexicoData.js — configuración de la ZONA México (reutiliza el motor de mundo).
 * Datos, NO lógica. Paleta cálida mexicana, decorado, objetos del hub y las
 * 3 excursiones que reparten (narrativamente) el Cuestionario de Estrés.
 */

export const MUNDO_MX = {
  ancho: 720,
  alto: 480,
  piso: "#FBE3B0", // arena
  pared: "#E5A000", // ámbar
  borde: "#FA4616", // naranja Háptica
};

/** Decorado sólido (colisión). */
export const MUEBLES_MX = [
  { x: 70, y: 66, w: 150, h: 55, color: "#E5A000", label: "Puesto" }, // ámbar
  { x: 545, y: 350, w: 130, h: 60, color: "#006663", label: "Fuente" }, // verde petróleo
  { x: 300, y: 205, w: 130, h: 72, color: "#B7BCBC", label: "Kiosko" }, // gris-400
];

/**
 * Objetos del HUB de México.
 *  - mariaca : NPC (volver a hablar)
 *  - carrito : inicia la siguiente excursión pendiente
 *  - foto    : registrar momento (álbum)
 *  - salida  : rumbo a Chile (se abre al completar México)
 */
export const OBJETOS_MX = [
  { id: "mariaca", tipo: "npc", emoji: "👩🏻", nombre: "Mariaca", x: 180, y: 150 },
  { id: "carrito", tipo: "carrito", emoji: "🛺", nombre: "Carrito de excursión", x: 520, y: 150 },
  { id: "fotoMX", tipo: "photo", emoji: "🎉", nombre: "Plaza de México", foto: "Momento en México", x: 360, y: 96 },
  { id: "salidaMX", tipo: "salida", emoji: "🚪", nombre: "Salida hacia Chile", x: 360, y: 30 },
];

/** Reparto del Cuestionario de Estrés (31) en 3 excursiones, en orden oficial. */
export const LIMITES_EXCURSION = [0, 11, 21, 31]; // 11 + 10 + 10 = 31

export const EXCURSIONES = [
  {
    id: 0,
    emoji: "🌮",
    titulo: "Mercado y sabores",
    parada: "Primera parada",
    color: "#E5A000", // ámbar
    npc: "¡Haptiqueño! Empezamos por el mercado. Antes de probar los tacos, acompáñame a registrar algo.",
    foto: "Mercado con Mariaca — México",
  },
  {
    id: 1,
    emoji: "🎡",
    titulo: "Feria y diversión",
    parada: "Siguiente parada 🎡",
    color: "#FA4616", // naranja Háptica
    npc: "¡A la feria! Antes de subir a la rueda de la fortuna, sigamos con lo nuestro.",
    foto: "Feria en México",
  },
  {
    id: 2,
    emoji: "🏛️",
    titulo: "Centro histórico",
    parada: "Última parada 🏛️",
    color: "#006663", // verde petróleo
    npc: "El centro histórico nos espera. Terminemos juntos este recorrido por México.",
    foto: "Centro histórico — México",
  },
];

/** Bienvenida de Mariaca (encuentro inicial). */
export const MARIACA_BIENVENIDA = [
  "¡Haptiqueño! ¡Por fin llegaste a México!",
  "Soy María Camila Venegas… pero todos me dicen Mariaca.",
  "Tenemos mucho por recorrer: mercado, feria y el centro histórico.",
  "Pero antes… necesito mostrarte algo. Súbete al carrito cuando estés listo. 🛺",
];
