/**
 * demoStore.js — persistencia LOCAL para MODO DEMO (sin Firebase).
 * Reproduce la misma forma de datos que Firestore (Sección C) usando
 * localStorage, para poder recorrer y demostrar la experiencia hoy.
 * La privacidad real (entre usuarios) la garantizan las reglas de Firestore
 * en producción; en demo todo es local a este navegador.
 */
const CLAVE_DB = "haptica_demo_db";
const CLAVE_AUTH = "haptica_demo_auth";

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_DB)) || { usuarios: {} };
  } catch {
    return { usuarios: {} };
  }
}
function guardar(db) {
  try {
    localStorage.setItem(CLAVE_DB, JSON.stringify(db));
  } catch (_) {
    // Safari privado / algunos WebViews embebidos pueden lanzar al escribir
    // en localStorage. El modo demo es solo para pruebas locales, así que
    // degradamos con silencio en vez de romper la app.
  }
}
function ahora() {
  return new Date().toISOString();
}

/* -------------------------------------------------------------- auth demo */

export function getDemoUser() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_AUTH)) || null;
  } catch {
    return null;
  }
}
export function setDemoUser(user) {
  try {
    if (user) localStorage.setItem(CLAVE_AUTH, JSON.stringify(user));
    else localStorage.removeItem(CLAVE_AUTH);
  } catch (_) {
    // ver nota en guardar(): degradar con silencio, no romper la app.
  }
}

/* ------------------------------------------------------------- usuario */

export function ensureUsuario(user) {
  const db = cargar();
  if (!db.usuarios[user.uid]) {
    const siguiente = Object.keys(db.usuarios).length + 1;
    db.usuarios[user.uid] = {
      correo: user.email || "",
      haptiqueno: siguiente, // identidad narrativa (Haptiqueño NN)
      tipo_vinculacion: null, // clasificación administrativa (solo Juli)
      fecha_creacion: ahora(),
      consentimiento: { estado: "no_iniciado", fecha: null },
      progreso: {
        paso_actual: 1,
        bloque_actual: null,
        llaves_obtenidas: [],
        estado: "activo",
        bloqueado_tecnico: false,
        fecha_fin: null,
      },
      respuestas: {},
      pausa_juli: [],
      soporte: [],
    };
    guardar(db);
  }
  return publico(db.usuarios[user.uid]);
}

function publico(u) {
  // Devuelve el documento sin las subcolecciones internas (como Firestore).
  const { respuestas, pausa_juli, soporte, ...doc } = u;
  return doc;
}

export function getUsuario(uid) {
  const db = cargar();
  return db.usuarios[uid] ? publico(db.usuarios[uid]) : null;
}

function mut(uid, fn) {
  const db = cargar();
  if (!db.usuarios[uid]) return;
  fn(db.usuarios[uid]);
  guardar(db);
}

export function setTipoVinculacion(uid, tipo) {
  mut(uid, (u) => (u.tipo_vinculacion = tipo));
}
export function setConsentimiento(uid, estado) {
  mut(uid, (u) => (u.consentimiento = { estado, fecha: ahora() }));
}
export function setJuegoColombia(uid, patch) {
  mut(uid, (u) => (u.juego_colombia = { ...(u.juego_colombia || {}), ...patch }));
}
export function setJuegoMexico(uid, patch) {
  mut(uid, (u) => (u.juego_mexico = { ...(u.juego_mexico || {}), ...patch }));
}
export function setJuegoChile(uid, patch) {
  mut(uid, (u) => (u.juego_chile = { ...(u.juego_chile || {}), ...patch }));
}
export function setJuegoRegreso(uid, patch) {
  mut(uid, (u) => (u.juego_regreso = { ...(u.juego_regreso || {}), ...patch }));
}
export function setPaso(uid, paso, bloque) {
  mut(uid, (u) => {
    u.progreso.paso_actual = paso;
    if (bloque !== undefined) u.progreso.bloque_actual = bloque;
  });
}
export function setBloqueadoTecnico(uid, valor) {
  mut(uid, (u) => (u.progreso.bloqueado_tecnico = valor));
}
export function marcarCompletado(uid) {
  mut(uid, (u) => {
    u.progreso.estado = "completado";
    u.progreso.fecha_fin = ahora();
  });
}

/* ---------------------------------------------------------- respuestas */

export function guardarRespuesta(uid, pregunta, opcionSeleccionada, meta = {}) {
  mut(uid, (u) => {
    u.respuestas[pregunta.id] = {
      numero_oficial: pregunta.numero_oficial,
      instrumento: pregunta.instrumento,
      opcion_seleccionada: opcionSeleccionada,
      fecha_hora: ahora(),
      ...(meta.actividad ? { actividad_narrativa: meta.actividad } : {}),
      ...(meta.etapa ? { etapa: meta.etapa } : {}),
    };
  });
}
export function getRespuestasIds(uid) {
  const db = cargar();
  return new Set(Object.keys(db.usuarios[uid]?.respuestas || {}));
}
export function otorgarLlaveSiBloqueCompleto(uid, idsBloque, llave) {
  const db = cargar();
  const u = db.usuarios[uid];
  if (!u) return false;
  const completo = idsBloque.every((id) => u.respuestas[id]);
  if (!completo) return false;
  if (!u.progreso.llaves_obtenidas.includes(llave)) {
    u.progreso.llaves_obtenidas.push(llave);
    guardar(db);
  }
  return true;
}

/* ------------------------------------------------------- pausa / soporte */

export function guardarPausaJuli(uid, comentario) {
  mut(uid, (u) =>
    u.pausa_juli.push({
      comentario: comentario && comentario.trim() ? comentario.trim() : null,
      fecha: ahora(),
    })
  );
}
export function crearSoporte(uid, mensaje, pasoActual) {
  mut(uid, (u) =>
    u.soporte.push({
      id: `s_${Date.now()}`,
      mensaje: mensaje && mensaje.trim() ? mensaje.trim() : null,
      paso_actual: pasoActual,
      fecha: ahora(),
      estado: "abierto",
    })
  );
}

/* -------------------------------------------------------------- Juli */

export function listarUsuarios() {
  const db = cargar();
  return Object.entries(db.usuarios).map(([uid, u]) => ({ uid, ...publico(u) }));
}
export function listarSoporte(uid) {
  const db = cargar();
  return (db.usuarios[uid]?.soporte || []).slice();
}
export function resolverBloqueoTecnico(uid) {
  mut(uid, (u) => {
    u.progreso.bloqueado_tecnico = false;
    u.soporte.forEach((t) => {
      if (t.estado === "abierto") t.estado = "resuelto";
    });
  });
}
export function getRespuestasUsuario(uid) {
  const db = cargar();
  const r = db.usuarios[uid]?.respuestas || {};
  return Object.entries(r).map(([id, v]) => ({ id, ...v }));
}
