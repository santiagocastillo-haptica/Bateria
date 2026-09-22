/**
 * appMode.js — MODO DE LA APLICACIÓN.
 *
 *   review     → para el equipo de Háptica: navegación libre, saltar bloques,
 *                volver atrás, jugar cualquier etapa. SOLO para preparar/probar.
 *   production → para participantes reales: recorrido obligatorio, sin saltar
 *                ni omitir ninguna pregunta, sin botón "Anterior".
 *
 * REGLA DE ORO: los colaboradores NO pueden adelantar ni omitir preguntas.
 * Antes del lanzamiento real hay que dejar VITE_APP_MODE=production.
 *
 * Se puede fijar con la variable de entorno VITE_APP_MODE en .env.local.
 */
const MODO = (import.meta.env.VITE_APP_MODE || "review").toLowerCase();

export const APP_MODE = MODO === "production" ? "production" : "review";
export const ES_REVIEW = APP_MODE === "review";
export const ES_PRODUCCION = APP_MODE === "production";
