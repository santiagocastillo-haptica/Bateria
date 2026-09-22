/**
 * asignar_rol_juli.js — EJECUTAR UNA SOLA VEZ, manualmente (Admin SDK Node.js).
 * Asigna el custom claim { role: "juli" } a la cuenta administradora.
 *
 * Requisitos:
 *   1. npm install firebase-admin   (o: npm i -D firebase-admin)
 *   2. Descargar la clave de servicio del proyecto:
 *      Firebase Console → Configuración del proyecto → Cuentas de servicio →
 *      "Generar nueva clave privada" → guardar como serviceAccountKey.json
 *      (este archivo está en .gitignore; NUNCA subirlo al repo).
 *   3. node scripts/asignar_rol_juli.js
 *
 * Después de correrlo, Juliana debe CERRAR SESIÓN y volver a entrar para que el
 * nuevo claim se refleje en su token.
 */
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const CORREO_JULI = "juliana.lopez@haptica.co";

async function asignarRolJuli() {
  const user = await admin.auth().getUserByEmail(CORREO_JULI);
  await admin.auth().setCustomUserClaims(user.uid, { role: "juli" });
  console.log(`Rol 'juli' asignado a ${CORREO_JULI}.`);
  console.log("Juliana debe cerrar sesión y volver a iniciar sesión.");
  process.exit(0);
}

asignarRolJuli().catch((e) => {
  console.error("Error asignando el rol:", e.message);
  process.exit(1);
});
