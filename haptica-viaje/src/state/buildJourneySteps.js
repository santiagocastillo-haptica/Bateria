/**
 * buildJourneySteps.js
 * ---------------------------------------------------------------------------
 * Genera en tiempo de ejecución la lista completa de pasos del recorrido a
 * partir de `experiencia.json`. NADA está hardcodeado: la secuencia se deriva
 * del contenido congelado (Sección F de la especificación).
 *
 * Estructura esperada (Sección D):
 *   experiencia.bloques[]  -> { bloque, pais, escena, llave, puerta, preguntas[] }
 *   experiencia.preguntas[] -> ordenadas por orden_narrativo (1..204)
 *   experiencia.transiciones[] -> [{ transicion, momento }]
 *
 * Secuencia (Sección F):
 *   login, bienvenida, consentimiento,
 *   por cada bloque: intro_bloque + (una pregunta por id) + llave,
 *   tras Bloque 2  -> transicion "Colombia → México"
 *   tras Bloque 6  -> transicion "México → Chile"
 *   tras Bloque 10 -> transicion "Chile → Colombia (regreso)" + pausa_juli
 *   tras Bloque 15 -> cierre
 *
 * Total esperado: 3 + 15 intros + 204 preguntas + 15 llaves + 3 transiciones
 *                 + 1 pausa + 1 cierre = 242 pasos.
 * ---------------------------------------------------------------------------
 */

/** Extrae el número de bloque ("Bloque 7 - ...") de forma robusta. */
export function numeroDeBloque(nombreBloque) {
  const m = /Bloque\s+(\d+)/i.exec(nombreBloque || "");
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Busca en experiencia.transiciones la transición cuyo campo `transicion`
 * coincide con el nombre esperado. Devuelve el objeto completo (con `momento`)
 * o, si no lo encuentra, un objeto mínimo con solo el nombre (nunca rompe).
 */
function buscarTransicion(experiencia, nombre) {
  const lista = experiencia.transiciones || [];
  const encontrada = lista.find((t) => t.transicion === nombre);
  return encontrada || { transicion: nombre, momento: null };
}

/**
 * Construye la lista de pasos.
 * @param {object} experiencia - contenido de experiencia.json
 * @returns {Array<object>} pasos del recorrido, en orden
 */
export function buildJourneySteps(experiencia) {
  if (!experiencia || !Array.isArray(experiencia.bloques)) {
    throw new Error("buildJourneySteps: experiencia.json inválido o sin bloques.");
  }

  const pasos = [];

  // 1. Pasos de apertura (no dependen del contenido de las preguntas).
  pasos.push({ tipo: "login" });
  pasos.push({ tipo: "bienvenida" });
  pasos.push({ tipo: "consentimiento" });

  // 2. Recorrido bloque por bloque, en el orden EXACTO del JSON.
  experiencia.bloques.forEach((bloque, bloqueIndex) => {
    const numBloque = numeroDeBloque(bloque.bloque);

    // 2a. Intro del bloque.
    pasos.push({ tipo: "intro_bloque", bloque, bloqueIndex, numeroBloque: numBloque });

    // 2b. Una pregunta por cada id declarado en el bloque, en orden.
    bloque.preguntas.forEach((idPregunta) => {
      pasos.push({
        tipo: "pregunta",
        id: idPregunta,
        bloque: bloque.bloque,
        bloqueIndex,
        numeroBloque: numBloque,
        llaveAsociada: bloque.llave,
      });
    });

    // 2c. Llave del bloque (nunca depende de las respuestas dadas).
    pasos.push({ tipo: "llave", bloque, bloqueIndex, numeroBloque: numBloque });

    // 2d. Transiciones / pausa / cierre según el bloque final de cada país.
    if (numBloque === 2) {
      pasos.push({ tipo: "transicion", ...buscarTransicion(experiencia, "Colombia → México") });
    } else if (numBloque === 6) {
      pasos.push({ tipo: "transicion", ...buscarTransicion(experiencia, "México → Chile") });
    } else if (numBloque === 10) {
      pasos.push({
        tipo: "transicion",
        ...buscarTransicion(experiencia, "Chile → Colombia (regreso)"),
      });
      pasos.push({ tipo: "pausa_juli" });
    } else if (numBloque === 15) {
      pasos.push({ tipo: "cierre" });
    }
  });

  return pasos;
}

export default buildJourneySteps;
