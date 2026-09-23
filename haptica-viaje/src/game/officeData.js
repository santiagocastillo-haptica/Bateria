/**
 * officeData.js — configuración del mundo explorable (Oficina Háptica, Bogotá).
 * Coordenadas en un lienzo lógico de 720 x 480 (se escala responsivo).
 * Datos, NO lógica: la lógica vive en ColombiaGame/OfficeWorld.
 */

export const MUNDO = {
  ancho: 720,
  alto: 480,
  piso: "#FBE3B0", // arena
  pared: "#E6E6E3", // gris-200
  borde: "#FA4616", // naranja Háptica
};

/** Muebles sólidos (colisión). [x, y, w, h] esquina superior izquierda. */
export const MUEBLES = [
  { x: 60, y: 66, w: 170, h: 58, color: "#FA4616", label: "Escritorio" }, // naranja
  { x: 545, y: 58, w: 130, h: 46, color: "#006663", label: "Estante" }, // verde petróleo
  { x: 520, y: 372, w: 160, h: 58, color: "#E5A000", label: "Sofá" }, // ámbar
  { x: 300, y: 208, w: 130, h: 72, color: "#B7BCBC", label: "Mesa" }, // gris-400
];

/**
 * Objetos interactivos. tipo:
 *  - "item"  : coleccionable → inventario
 *  - "clue"  : revela un dígito del código
 *  - "safe"  : caja fuerte (código → llave)
 *  - "door"  : puerta (requiere item para abrir)
 */
export const OBJETOS = [
  // Coleccionables (Misión: preparar el viaje) — todos en piso alcanzable
  { id: "ropa", tipo: "item", emoji: "👕", nombre: "Ropa", x: 250, y: 320 },
  { id: "cargador", tipo: "item", emoji: "🔌", nombre: "Cargador", x: 600, y: 145 },
  { id: "pasaporte", tipo: "item", emoji: "🛂", nombre: "Pasaporte", x: 210, y: 160 },

  // Pistas del misterio "El mensaje perdido" (código de 3 dígitos)
  { id: "nota", tipo: "clue", emoji: "✉️", nombre: "Nota en el escritorio",
    pos: 0,
    texto: "Una nota a medio escribir: «Nuestra historia comenzó con la unión de dos pilares fundamentales: la innovación constante y el enfoque en las personas. Si sumas estas 2 grandes fuerzas, obtienes la primera cifra de nuestro año de nacimiento.»" },
  // el objeto físico de la nota está frente al escritorio (piso alcanzable)
  { id: "nota_pos", ref: "nota", x: 110, y: 150 },

  { id: "calendario", tipo: "clue", emoji: "📅", nombre: "Calendario de la pared",
    pos: 1,
    texto: "Una marca en el calendario: «Háptica abrió sus puertas un inolvidable año donde la creatividad cobró vida. Si a una década completa le sumas 4 años de pura evolución y crecimiento, obtendrás el número con el que se completa nuestro año de fundación.»",
    x: 410, y: 60 },

  { id: "mapa", tipo: "clue", emoji: "🗺️", nombre: "Mapa de rutas",
    pos: 2,
    texto: "Una anotación al margen del mapa: «Primero la cifra con la que empieza nuestra historia; después, las dos que la completan. Tres dígitos en total.»",
    x: 665, y: 225 },

  // Caja fuerte (código → llave)
  { id: "caja", tipo: "safe", emoji: "🧰", nombre: "Caja fuerte", x: 92, y: 300 },

  // Puertas
  { id: "puertaAcceso", tipo: "door", emoji: "🚪", nombre: "Puerta de acceso",
    requiere: "llave", x: 692, y: 320 },
  { id: "puertaSalida", tipo: "door", emoji: "🚪", nombre: "Puerta de salida",
    requiere: "pase", x: 300, y: 30 },
];

/** El objeto físico "nota" se dibuja en nota_pos; unificamos para dibujo/colisión. */
export const OBJETOS_DIBUJO = OBJETOS
  .filter((o) => o.tipo) // solo los que tienen tipo se dibujan por sí mismos
  .map((o) => {
    if (o.id === "nota") {
      const pos = OBJETOS.find((p) => p.id === "nota_pos");
      return { ...o, x: pos.x, y: pos.y };
    }
    return o;
  });

/**
 * Código del misterio de Colombia: el año de fundación de Háptica (2014)
 * condensado en 3 dígitos → 2 (con la que empieza) + 14 (las que completan).
 */
export const CODIGO_MISTERIO = "214";
export const PREGUNTA_MISTERIO = "¿Con qué número empieza nuestra historia?";
export const PISTA_EXTRA_MISTERIO =
  "Háptica nació en 2014. Toma la cifra con la que empieza el año y las dos que lo completan.";

/** Los 3 items que deben recogerse para "preparar el viaje". */
export const ITEMS_REQUERIDOS = ["ropa", "cargador", "pasaporte"];

/** Vuelo del pasaporte (ilustrativo, configurable). */
export const VUELO = {
  aerolinea: "Háptica AIRLINES",
  numero: "HPT-025",
  ruta: ["BOG", "MEX", "SCL", "BOG"],
};
