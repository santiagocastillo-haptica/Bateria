/**
 * firestore.js — acceso a datos (Sección C, J, K).
 * En MODO DEMO delega en demoStore (localStorage); en producción usa Firestore.
 * Reglas clave:
 *  - Cada respuesta se escribe con ID = id_interno oficial (P001..P204):
 *    reintentar SOBRESCRIBE, nunca duplica.
 *  - La llave se otorga por EXISTENCIA de documentos de respuesta del bloque,
 *    nunca por su contenido.
 *  - pausa_juli y soporte viven en subcolecciones aparte de /respuestas.
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  arrayUnion,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { MODO_DEMO } from "../firebaseConfig.js";
import * as demo from "./demoStore.js";

/** Asigna el siguiente número Haptiqueño con una transacción sobre un contador. */
async function siguienteHaptiqueno() {
  const ref = doc(db, "contadores", "haptiquenos");
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const actual = snap.exists() ? snap.data().ultimo || 0 : 0;
    const nuevo = actual + 1;
    tx.set(ref, { ultimo: nuevo }, { merge: true });
    return nuevo;
  });
}

/* ------------------------------------------------------------------ usuario */

export async function ensureUsuario(user) {
  if (MODO_DEMO) return demo.ensureUsuario(user);
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    let haptiqueno = null;
    try {
      haptiqueno = await siguienteHaptiqueno();
    } catch (_) {
      // Si el contador falla, el usuario se crea igual; Juli puede asignarlo luego.
    }
    const nuevo = {
      correo: user.email || "",
      haptiqueno,
      tipo_vinculacion: null,
      fecha_creacion: serverTimestamp(),
      consentimiento: { estado: "no_iniciado", fecha: null },
      progreso: {
        paso_actual: 1,
        bloque_actual: null,
        llaves_obtenidas: [],
        estado: "activo",
        bloqueado_tecnico: false,
        fecha_fin: null,
      },
    };
    await setDoc(ref, nuevo);
    return nuevo;
  }
  return snap.data();
}

export async function getUsuario(uid) {
  if (MODO_DEMO) return demo.getUsuario(uid);
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? snap.data() : null;
}

export async function setTipoVinculacion(uid, tipo) {
  if (MODO_DEMO) return demo.setTipoVinculacion(uid, tipo);
  await updateDoc(doc(db, "usuarios", uid), { tipo_vinculacion: tipo });
}

export async function setConsentimiento(uid, estado) {
  if (MODO_DEMO) return demo.setConsentimiento(uid, estado);
  await updateDoc(doc(db, "usuarios", uid), {
    consentimiento: { estado, fecha: serverTimestamp() },
  });
}

/** Guarda (merge) el estado del mini-mundo de Colombia dentro del doc de usuario. */
export async function setJuegoColombia(uid, patch) {
  if (MODO_DEMO) return demo.setJuegoColombia(uid, patch);
  const plano = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`juego_colombia.${k}`, v])
  );
  await updateDoc(doc(db, "usuarios", uid), plano);
}

/** Guarda (merge) el estado del mini-mundo de México dentro del doc de usuario. */
export async function setJuegoMexico(uid, patch) {
  if (MODO_DEMO) return demo.setJuegoMexico(uid, patch);
  const plano = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`juego_mexico.${k}`, v])
  );
  await updateDoc(doc(db, "usuarios", uid), plano);
}

/** Guarda (merge) el estado del mini-mundo de Chile dentro del doc de usuario. */
export async function setJuegoChile(uid, patch) {
  if (MODO_DEMO) return demo.setJuegoChile(uid, patch);
  const plano = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`juego_chile.${k}`, v])
  );
  await updateDoc(doc(db, "usuarios", uid), plano);
}

/** Guarda (merge) el estado del Regreso a Colombia (circuito final). */
export async function setJuegoRegreso(uid, patch) {
  if (MODO_DEMO) return demo.setJuegoRegreso(uid, patch);
  const plano = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`juego_regreso.${k}`, v])
  );
  await updateDoc(doc(db, "usuarios", uid), plano);
}

/* ----------------------------------------------------------------- progreso */

export async function setPaso(uid, pasoActual, bloqueActual) {
  if (MODO_DEMO) return demo.setPaso(uid, pasoActual, bloqueActual);
  const patch = { "progreso.paso_actual": pasoActual };
  if (bloqueActual !== undefined) patch["progreso.bloque_actual"] = bloqueActual;
  await updateDoc(doc(db, "usuarios", uid), patch);
}

export async function setBloqueadoTecnico(uid, valor) {
  if (MODO_DEMO) return demo.setBloqueadoTecnico(uid, valor);
  await updateDoc(doc(db, "usuarios", uid), { "progreso.bloqueado_tecnico": valor });
}

export async function marcarCompletado(uid) {
  if (MODO_DEMO) return demo.marcarCompletado(uid);
  await updateDoc(doc(db, "usuarios", uid), {
    "progreso.estado": "completado",
    "progreso.fecha_fin": serverTimestamp(),
  });
}

/* --------------------------------------------------------------- respuestas */

/** Prefija cada clave de `patch` con `${prefijo}.` (mismo formato que setJuego*). */
function planoConPrefijo(prefijo, patch) {
  return Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`${prefijo}.${k}`, v])
  );
}

// Setter demo por zona, usado únicamente por el fallback de MODO_DEMO (ver abajo).
const SETTER_DEMO_POR_ZONA = {
  juego_colombia: demo.setJuegoColombia,
  juego_mexico: demo.setJuegoMexico,
  juego_chile: demo.setJuegoChile,
  juego_regreso: demo.setJuegoRegreso,
};

/**
 * Guarda UNA respuesta individual Y el avance de bloque correspondiente
 * (ej. dgIndex/qGlobal) como UNA SOLA operación atómica de Firestore
 * (writeBatch): o se confirman las dos escrituras, o no se confirma
 * ninguna. Esto es la fuente de verdad de la contestación — el progreso
 * (dgIndex/qGlobal/fase/etc.) es solo un puntero de navegación derivado,
 * NUNCA se avanza si la respuesta no quedó realmente guardada.
 *
 * @param {string} uid
 * @param {object} pregunta objeto oficial de experiencia.json (P001..P204)
 * @param {*} opcionSeleccionada
 * @param {string} zonaPrefijo "juego_colombia" | "juego_mexico" | "juego_chile" | "juego_regreso"
 * @param {object} avancePatch ej. { dgIndex: 4 } — SIN el prefijo de zona
 * @param {{actividad?:string, etapa?:string}} meta metadatos narrativos opcionales
 */
export async function guardarRespuestaConProgreso(
  uid,
  pregunta,
  opcionSeleccionada,
  zonaPrefijo,
  avancePatch,
  meta = {}
) {
  if (MODO_DEMO) {
    // El modo demo (localStorage, un solo hilo, sin red) no tiene el riesgo
    // de escritura parcial que resuelve el batch en Firestore real; basta
    // con encadenar las dos escrituras en orden.
    await demo.guardarRespuesta(uid, pregunta, opcionSeleccionada, meta);
    const setter = SETTER_DEMO_POR_ZONA[zonaPrefijo];
    if (setter) await setter(uid, avancePatch);
    return;
  }
  const batch = writeBatch(db);
  const refRespuesta = doc(db, "usuarios", uid, "respuestas", pregunta.id);
  batch.set(refRespuesta, {
    numero_oficial: pregunta.numero_oficial,
    instrumento: pregunta.instrumento,
    opcion_seleccionada: opcionSeleccionada,
    fecha_hora: serverTimestamp(),
    ...(meta.actividad ? { actividad_narrativa: meta.actividad } : {}),
    ...(meta.etapa ? { etapa: meta.etapa } : {}),
  });
  const refUsuario = doc(db, "usuarios", uid);
  batch.update(refUsuario, planoConPrefijo(zonaPrefijo, avancePatch));
  await batch.commit();
}

/**
 * Existencia de un conjunto CONOCIDO de preguntas (las de un bloque).
 * IMPORTANTE: se hace con getDoc() individuales, NUNCA con una consulta de
 * lista sobre toda la subcolección `respuestas`. Firestore rechaza una
 * consulta de lista completa si sus reglas de seguridad no pueden garantizar
 * que TODOS los documentos que existan en la colección serían legibles (nue-
 * stras reglas exigen la llave previa por documento vía `puertaAbierta`, así
 * que preguntas de bloques posteriores harían fallar la consulta entera con
 * permission-denied). Un getDoc() por ID sí se evalúa documento a documento,
 * sin ese problema.
 */
async function idsRespondidos(uid, ids) {
  const snaps = await Promise.all(
    ids.map((id) => getDoc(doc(db, "usuarios", uid, "respuestas", id)))
  );
  return snaps.every((s) => s.exists());
}

export async function otorgarLlaveSiBloqueCompleto(uid, idsBloque, llave) {
  if (MODO_DEMO) return demo.otorgarLlaveSiBloqueCompleto(uid, idsBloque, llave);
  const completo = await idsRespondidos(uid, idsBloque);
  if (!completo) return false;
  await updateDoc(doc(db, "usuarios", uid), {
    "progreso.llaves_obtenidas": arrayUnion(llave),
  });
  return true;
}

/**
 * Reparación: otorga cualquier llave de bloque que ya deba existir (todas
 * sus preguntas ya están respondidas) pero que quedó sin otorgar por el bug
 * histórico de "llave otorgada solo al final de la etapa". Idempotente y
 * segura de llamar siempre al entrar a una zona: no repite llaves ya
 * otorgadas ni toca bloques incompletos.
 */
export async function repararLlaves(uid, bloques) {
  if (MODO_DEMO) return; // el modo demo no tuvo este bug (sin reglas de puerta)
  for (const b of bloques) {
    try {
      const completo = await idsRespondidos(uid, b.preguntas);
      if (completo) {
        await updateDoc(doc(db, "usuarios", uid), {
          "progreso.llaves_obtenidas": arrayUnion(b.llave),
        });
      }
    } catch (_) {
      // Si esta llave en particular falla (ej. bloque aún bloqueado para
      // leer), seguimos con las demás.
    }
  }
}

/* ------------------------------------------------------------- pausa / soporte */

export async function guardarPausaJuli(uid, comentario) {
  if (MODO_DEMO) return demo.guardarPausaJuli(uid, comentario);
  await addDoc(collection(db, "usuarios", uid, "pausa_juli"), {
    comentario: comentario && comentario.trim() ? comentario.trim() : null,
    fecha: serverTimestamp(),
  });
}

export async function crearSoporte(uid, mensaje, pasoActual) {
  if (MODO_DEMO) return demo.crearSoporte(uid, mensaje, pasoActual);
  await addDoc(collection(db, "usuarios", uid, "soporte"), {
    mensaje: mensaje && mensaje.trim() ? mensaje.trim() : null,
    paso_actual: pasoActual,
    fecha: serverTimestamp(),
    estado: "abierto",
  });
}

/* -------------------------------------------------------------------- Juli */

export async function listarUsuarios() {
  if (MODO_DEMO) return demo.listarUsuarios();
  const snap = await getDocs(collection(db, "usuarios"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function listarSoporte(uid) {
  if (MODO_DEMO) return demo.listarSoporte(uid);
  const snap = await getDocs(collection(db, "usuarios", uid, "soporte"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function resolverBloqueoTecnico(uid) {
  if (MODO_DEMO) return demo.resolverBloqueoTecnico(uid);
  await updateDoc(doc(db, "usuarios", uid), { "progreso.bloqueado_tecnico": false });
  const tickets = await getDocs(collection(db, "usuarios", uid, "soporte"));
  await Promise.all(
    tickets.docs
      .filter((d) => d.data().estado === "abierto")
      .map((d) =>
        updateDoc(doc(db, "usuarios", uid, "soporte", d.id), { estado: "resuelto" })
      )
  );
}

export async function getRespuestasUsuario(uid) {
  if (MODO_DEMO) return demo.getRespuestasUsuario(uid);
  const snap = await getDocs(collection(db, "usuarios", uid, "respuestas"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
