/**
 * verify_steps.mjs
 * Verificación aislada (sin UI) de buildJourneySteps.js contra experiencia.json.
 * Confirma los 3 números clave de la spec: 242 pasos / 204 preguntas / 15 bloques.
 * Uso:  node scripts/verify_steps.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildJourneySteps } from "../src/state/buildJourneySteps.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const experiencia = JSON.parse(
  readFileSync(join(__dirname, "../src/data/experiencia.json"), "utf8")
);

const pasos = buildJourneySteps(experiencia);

// --- Conteos por tipo de paso ---
const conteo = {};
for (const p of pasos) conteo[p.tipo] = (conteo[p.tipo] || 0) + 1;

const pasosPregunta = pasos.filter((p) => p.tipo === "pregunta");
const idsEnPasos = pasosPregunta.map((p) => p.id);
const idsEnJson = experiencia.preguntas.map((q) => q.id);

// --- Invariantes de contenido (NO se modifica nada, solo se valida) ---
const ordenContinuo = experiencia.preguntas.every(
  (q, i) => q.orden_narrativo === i + 1
);
const sumaItems = experiencia.bloques.reduce((a, b) => a + b.preguntas.length, 0);
const idsUnicos = new Set(idsEnJson).size === idsEnJson.length;
const mismoOrden = idsEnPasos.join(",") === idsEnJson.join(",");

// --- Resultados ---
console.log("========================================");
console.log(" VERIFICACIÓN buildJourneySteps.js");
console.log("========================================");
console.log("Pasos por tipo:");
for (const [tipo, n] of Object.entries(conteo)) {
  console.log(`   ${tipo.padEnd(14)} : ${n}`);
}
console.log("----------------------------------------");

const checks = [
  ["Total de pasos = 242", pasos.length === 242, pasos.length],
  ["Total de preguntas = 204", pasosPregunta.length === 204, pasosPregunta.length],
  ["Total de bloques = 15", experiencia.bloques.length === 15, experiencia.bloques.length],
  ["Suma de ítems por bloque = 204", sumaItems === 204, sumaItems],
  ["204 IDs únicos", idsUnicos, new Set(idsEnJson).size],
  ["orden_narrativo continuo 1..204", ordenContinuo, ordenContinuo],
  ["IDs de pasos == IDs del JSON (mismo orden)", mismoOrden, mismoOrden],
  ["intro_bloque = 15", conteo.intro_bloque === 15, conteo.intro_bloque],
  ["llave = 15", conteo.llave === 15, conteo.llave],
  ["transicion = 3", conteo.transicion === 3, conteo.transicion],
  ["pausa_juli = 1", conteo.pausa_juli === 1, conteo.pausa_juli],
  ["cierre = 1", conteo.cierre === 1, conteo.cierre],
];

let ok = true;
for (const [label, pass, val] of checks) {
  console.log(`${pass ? "✓" : "✗"} ${label}  (obtenido: ${val})`);
  if (!pass) ok = false;
}
console.log("========================================");
console.log(ok ? "RESULTADO: TODO OK ✓" : "RESULTADO: HAY FALLOS ✗");
console.log("========================================");
process.exit(ok ? 0 : 1);
