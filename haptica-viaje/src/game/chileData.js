/**
 * chileData.js — configuración de la ZONA Chile (reutiliza el motor de mundo).
 * Visita a Angélica ("Boss"), con Lorenzo, Lila y la memoria de Botas.
 * Las 31 preguntas de "Cuestionario de Factores Psicosociales Extralaborales"
 * (P051–P081) se reparten narrativamente en 3 excursiones, en su ORDEN oficial.
 */

export const MUNDO_CL = {
  ancho: 720,
  alto: 480,
  piso: "#F4F4F2", // gris-100
  pared: "#00BCA0", // menta
  borde: "#006663", // verde petróleo
};

export const MUEBLES_CL = [
  { x: 70, y: 66, w: 165, h: 58, color: "#006663", label: "Casa de Angélica" }, // verde petróleo
  { x: 545, y: 350, w: 135, h: 60, color: "#00BCA0", label: "Jardín" }, // menta
  { x: 300, y: 205, w: 130, h: 72, color: "#B7BCBC", label: "Terraza" }, // gris-400
];

/**
 * Objetos del HUB de Chile.
 *  - angelica : NPC (hilo conductor)
 *  - lorenzo/lila : mascotas interactivas (se mueven un poco: wander)
 *  - botas : memoria coleccionable (cariño, no tristeza)
 *  - foto  : registrar momento (álbum)
 *  - carrito : inicia la siguiente excursión
 *  - salida  : rumbo al regreso a Colombia (al completar Chile)
 */
export const OBJETOS_CL = [
  { id: "angelica", tipo: "npc", emoji: "👩🏼", nombre: "Angélica", x: 180, y: 150 },
  { id: "lorenzo", tipo: "pet", emoji: "🐶", nombre: "Lorenzo", x: 130, y: 330, wander: true },
  { id: "lila", tipo: "pet", emoji: "🐕", nombre: "Lila", x: 255, y: 330, wander: true },
  { id: "botas", tipo: "memoria", emoji: "🐾", nombre: "Memoria de Botas", x: 610, y: 320 },
  { id: "fotoCL", tipo: "photo", emoji: "⛰️", nombre: "Mirador de Chile", foto: "Un recuerdo de Chile", x: 360, y: 96 },
  { id: "carrito", tipo: "carrito", emoji: "🚐", nombre: "Van para el recorrido", x: 520, y: 150 },
  { id: "salidaCL", tipo: "salida", emoji: "🚪", nombre: "Rumbo a Colombia", x: 360, y: 30 },
];

export const LIMITES_EXCURSION_CL = [0, 11, 21, 31]; // 11 + 10 + 10 = 31

export const EXCURSIONES_CL = [
  {
    id: 0,
    emoji: "🏞️",
    titulo: "Un paseo para conversar",
    parada: "Primera parada",
    color: "#00BCA0", // menta
    npc: "Me alegra que podamos hacer este recorrido. Cuéntame, ¿cómo has estado?",
    foto: "Paseo con Angélica — Chile",
  },
  {
    id: 1,
    emoji: "🌄",
    titulo: "Seguimos recorriendo",
    parada: "Siguiente parada",
    color: "#006663", // verde petróleo
    npc: "Hay cosas que desde lejos no siempre podemos ver. Sigamos un poco más.",
    foto: "Mirador de Chile",
  },
  {
    id: 2,
    emoji: "🏡",
    titulo: "Antes de regresar",
    parada: "Última parada",
    color: "#6E7677", // gris-600
    npc: "Gracias por ayudarme a conocer mejor cómo está el equipo.",
    foto: "Atardecer en Chile",
  },
];

/** Bienvenida de Angélica (encuentro inicial). Narrativa, sin sugerir respuestas. */
export const ANGELICA_BIENVENIDA = [
  { nombre: "Angélica", emoji: "👩🏼", texto: "¡Haptiqueño! Qué alegría verte por acá." },
  { nombre: "Angélica", emoji: "👩🏼", texto: "Hola, soy Angélica Flechas. Quería recibirte personalmente." },
  { nombre: "Angélica", emoji: "👩🏼", texto: "Para mí es importante conocer cómo están viviendo esta etapa los Haptiqueños." },
  { nombre: "Angélica", emoji: "👩🏼", texto: "Quiero saber cómo está el equipo y por eso los voy a acompañar durante este recorrido." },
];

/** Texto de la memoria de Botas (cariño + historia, nunca tristeza). */
export const BOTAS_MEMORIA = {
  titulo: "Recuerdo encontrado",
  lineas: [
    "Botas fue parte de los primeros momentos de Háptica.",
    "Algunas historias permanecen con nosotros y siguen viajando.",
  ],
  foto: "Memoria de Botas",
};
