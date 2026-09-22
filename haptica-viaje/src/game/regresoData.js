/**
 * regresoData.js — configuración del REGRESO A COLOMBIA (Circuito Final).
 * Anfitriones Santi y Cami. 8 actividades (misterio + 6 minijuegos + misterio
 * final), cada una seguida de un pequeño bloque del Cuestionario Intralaboral
 * (123 preguntas, P082–P204), repartido conservando el ORDEN oficial.
 * La creatividad está en los juegos; las preguntas NO se tocan.
 */

export const SANTI = { nombre: "Santi", emoji: "🧑🏻" };
export const CAMI = { nombre: "Cami", emoji: "🧑🏽" };

/** Encuentro inicial (Santi y Cami alternan). */
export const SANTI_CAMI_BIENVENIDA = [
  { nombre: "Santi", emoji: "🧑🏻", texto: "¡Haptiqueño, regresaste!" },
  { nombre: "Cami", emoji: "🧑🏽", texto: "Pero no creas que el viaje terminó." },
  { nombre: "Santi", emoji: "🧑🏻", texto: "Nos queda una última parte del recorrido." },
  { nombre: "Cami", emoji: "🧑🏽", texto: "Vamos a recorrer algunos lugares, jugar, descubrir cosas y completar lo que falta." },
  { nombre: "Santi", emoji: "🧑🏻", texto: "Bienvenido al Circuito Final." },
];

/**
 * Código del gran misterio final: el SEGUNDO dígito del indicativo telefónico
 * de cada país recorrido, en orden — Colombia (+57) · México (+52) · Chile (+56).
 */
export const CODIGO_FINAL = "726";
export const PREGUNTA_FINAL =
  "¿Cuál es el segundo dígito del indicativo de cada país? Úsalos en orden: Colombia, México y Chile.";
export const PISTA_EXTRA_FINAL =
  "Fíjate en el segundo número de cada indicativo: +5_7_, +5_2_, +5_6_.";

/**
 * 8 actividades del circuito, en orden. Cada una:
 *  - tipo: nota | precision | carritos | cartas | verdadreto | mystery-final
 *  - host: quién la presenta (santi/cami)
 *  - npc: línea narrativa (sin sugerir respuestas)
 *  - pieza: fragmento del misterio final (solo algunas dan dígito)
 *  - foto: momento para el álbum
 */
export const ACTIVIDADES = [
  {
    id: "misterio_inicial", tipo: "nota", emoji: "🧩", titulo: "El misterio del regreso", host: "santi",
    intro: "Has recorrido Colombia, México y Chile… pero todavía falta una parte del viaje. Hay algo que debemos descubrir antes de terminar.",
    npc: "Reunamos las pistas del viaje. En el camino, cuéntanos cómo has vivido tu día a día.",
    foto: "Regreso a Colombia",
  },
  {
    id: "tejo", tipo: "precision", emoji: "🎯", titulo: "Tejo", host: "cami",
    tema: { objeto: "tejo", lanzar: "¡Lanzar el tejo!", exito: "¡Mecha! Diste en el centro." },
    npc: "Mientras jugamos tejo, cuéntanos cómo te has sentido últimamente.",
    pieza: { pos: 0, texto: "Ficha de tejo con una anotación al reverso: «Colombia — indicativo +57»" },
    foto: "Jugando tejo",
  },
  {
    id: "carritos", tipo: "carritos", emoji: "🚗", titulo: "Carritos", host: "santi",
    npc: "Buen pulso al volante. Sigamos el recorrido y sigue contándonos.",
    foto: "Pista de carritos",
  },
  {
    id: "bolorana", tipo: "precision", emoji: "🐸", titulo: "Rana", host: "cami",
    tema: { objeto: "moneda", lanzar: "¡Lanzar a la rana!", exito: "¡En la boca de la rana!" },
    npc: "¡Buen tino! Continuemos el circuito.",
    foto: "Bolo rana",
  },
  {
    id: "cartas", tipo: "cartas", emoji: "🃏", titulo: "Cartas", host: "cami",
    npc: "Encontraste las parejas. Sigamos descubriendo el misterio.",
    pieza: { pos: 1, texto: "Una carta con un sello estampado: «México — indicativo +52»" },
    foto: "Juego de cartas",
  },
  {
    id: "bolos", tipo: "precision", emoji: "🎳", titulo: "Bolos", host: "santi",
    tema: { objeto: "bola", lanzar: "¡Lanzar la bola!", exito: "¡Chuza! Tumbaste todos." },
    npc: "¡Chuza! Vamos por la siguiente parte.",
    pieza: { pos: 2, texto: "Un pin marcado con tinta: «Chile — indicativo +56»" },
    foto: "Bolos",
  },
  {
    id: "verdadreto", tipo: "verdadreto", emoji: "🎤", titulo: "Verdad o Te atreves", host: "cami",
    npc: "Buen momento. Sigamos avanzando en el circuito.",
    foto: "Verdad o te atreves",
  },
  {
    id: "final", tipo: "mystery-final", emoji: "🔐", titulo: "El gran misterio final", host: "santi",
    intro: "Todas las pistas del viaje estaban conectadas. Une los fragmentos de Bogotá, México y Chile para abrir la última puerta.",
    npc: "Última parte del recorrido. Gracias por compartir cómo estás viviendo tu experiencia.",
    foto: "La última puerta",
  },
];

/** Frases ligeras para Verdad / Te atreves (recreativo, no invasivo). */
export const VERDAD = [
  "¿Cuál fue tu momento favorito del viaje?",
  "¿Qué país te sorprendió más?",
  "¿Qué te llevas de esta travesía?",
];
export const RETO = [
  "Busca el objeto naranja 🍊 más cercano a ti.",
  "Estírate y respira profundo 3 veces.",
  "Sonríe: acabas de recorrer tres países. 😄",
];
