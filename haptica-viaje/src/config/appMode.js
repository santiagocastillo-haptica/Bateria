/**
 * appMode.js — MODO DE LA APLICACIÓN.
 *
 *   review     → para el equipo de Háptica: navegación libre, saltar bloques,
 *                volver atrás, jugar cualquier etapa. SOLO para un periodo de
 *                pruebas puntual, activándolo a propósito.
 *   production → para participantes reales: recorrido obligatorio, sin saltar
 *                ni omitir ninguna pregunta, sin botón "Anterior", sin barra
 *                de modo revisión. ESTE ES EL DEFAULT DEL LANZAMIENTO.
 *
 * REGLA DE ORO: los colaboradores NO pueden adelantar ni omitir preguntas.
 * El default es "production" para que el modo revisión NUNCA aparezca por
 * accidente (ej. si se olvida configurar la variable de entorno en el
 * hosting). Para un periodo de pruebas puntual, fijar explícitamente
 * VITE_APP_MODE=review en ese despliegue (nunca en el de producción real).
 */
const MODO = (import.meta.env.VITE_APP_MODE || "production").toLowerCase();

export const APP_MODE = MODO === "production" ? "production" : "review";
export const ES_REVIEW = APP_MODE === "review";
export const ES_PRODUCCION = APP_MODE === "production";
