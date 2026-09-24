/**
 * generate_firestore_rules.mjs
 * Genera firestore.rules a partir de experiencia.json (Sección I/K).
 * El mapa de "puertas" (pregunta -> llave del bloque ANTERIOR) se deriva del
 * contenido, NUNCA se escribe a mano. Correr:  node scripts/generate_firestore_rules.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");
const experiencia = JSON.parse(
  readFileSync(join(raiz, "src/data/experiencia.json"), "utf8")
);

// mapa idInterno -> llave del bloque anterior (bloques 2..15; el bloque 1 no tiene puerta previa)
const mapa = {};
experiencia.bloques.forEach((bloque, i) => {
  if (i === 0) return; // Bloque 1: sin llave previa requerida
  const llavePrevia = experiencia.bloques[i - 1].llave;
  bloque.preguntas.forEach((id) => {
    mapa[id] = llavePrevia;
  });
});

const entradas = Object.entries(mapa)
  .map(([id, llave]) => `        '${id}': '${llave.replace(/'/g, "\\'")}'`)
  .join(",\n");

const rules = `rules_version = '2';
// ARCHIVO GENERADO por scripts/generate_firestore_rules.mjs — NO editar a mano.
// El mapa de puertas se deriva de experiencia.json (${Object.keys(mapa).length} preguntas con puerta previa).
service cloud.firestore {
  match /databases/{database}/documents {

    function esDeHaptica() {
      // .lower() evita falsos negativos si el correo de Google llega con
      // mayúsculas (ej. Nombre@Haptica.co): el token no siempre viene en
      // minúsculas garantizado, y una comparación case-sensitive bloquearía
      // a un colaborador real por escritura del correo, no por dominio.
      return request.auth != null
        && request.auth.token.email.lower().matches('.*@haptica[.]co$');
    }

    function esElMismoUsuario(uid) {
      return request.auth.uid == uid;
    }

    function esJuli() {
      return request.auth != null && request.auth.token.role == 'juli';
    }

    // Administradores autorizados para el panel /juli mientras el custom
    // claim 'role: juli' no se haya asignado (requiere el script one-time
    // con service account). Lista cerrada, tomada de TABLA_DATOS_BATERIA.xlsx
    // (columna rol = "Administrador"). Solo lectura/actualización de estado,
    // igual que esJuli(): nunca abre escritura de respuestas ajenas.
    function esAdminHaptica() {
      return request.auth != null && (
        request.auth.token.email.lower() == 'juliana.lopez@haptica.co' ||
        request.auth.token.email.lower() == 'maria.marta@haptica.co' ||
        request.auth.token.email.lower() == 'santiago.castillo@haptica.co'
      );
    }

    // Llave del bloque ANTERIOR requerida para escribir una respuesta.
    // Devuelve null cuando la pregunta pertenece al primer bloque (sin puerta).
    function llavePreviaDe(idInterno) {
      return ({
${entradas}
      }).get(idInterno, null);
    }

    // Puerta: la respuesta solo se acepta si la llave previa ya fue obtenida.
    function puertaAbierta(uid, idInterno) {
      return llavePreviaDe(idInterno) == null
        || get(/databases/$(database)/documents/usuarios/$(uid))
             .data.progreso.llaves_obtenidas.hasAny([llavePreviaDe(idInterno)]);
    }

    // Contador para asignar el número de HAPTIQUEÑO (identidad narrativa).
    match /contadores/{doc} {
      allow read, write: if esDeHaptica();
    }

    match /usuarios/{uid} {
      allow read, write: if esDeHaptica() && esElMismoUsuario(uid);
      allow read: if esJuli() || esAdminHaptica();     // Juli/Admin leen (no escriben) el documento de cualquier usuario
      allow update: if esJuli() || esAdminHaptica();   // Juli/Admin actualizan (ej. bloqueado_tecnico)

      match /respuestas/{idInterno} {
        allow read, write: if esDeHaptica() && esElMismoUsuario(uid)
          && puertaAbierta(uid, idInterno);
        allow read: if esJuli() || esAdminHaptica();
      }

      match /pausa_juli/{docId} {
        allow read, write: if esDeHaptica() && esElMismoUsuario(uid);
        allow read: if esJuli() || esAdminHaptica();
      }

      match /soporte/{docId} {
        allow create: if esDeHaptica() && esElMismoUsuario(uid);
        allow read: if esDeHaptica() && esElMismoUsuario(uid);
        allow read, update: if esJuli() || esAdminHaptica();
      }
    }
  }
}
`;

writeFileSync(join(raiz, "firestore.rules"), rules, "utf8");
console.log(
  `firestore.rules generado ✓ — ${Object.keys(mapa).length} preguntas con puerta previa (esperado 194).`
);
