/**
 * albumManager.js — ÁLBUM Haptiqueño como mecánica real (localStorage).
 * Estructura: album[folderId] = [ {photoId, participantId, email, folderId,
 * country, activity, sceneKey, caption, ts, origen?} ].
 *
 * - Reutiliza las carpetas/recorridos existentes (no crea estructura paralela).
 * - Migra los momentos ya recolectados en juego_*.fotos hacia sus carpetas.
 * - No usa Firebase (solo local, como pidió el diseño de esta iteración).
 */
import { getDemoUser } from "../../state/demoStore.js";

/** Carpetas canónicas del recorrido (id, nombre visible, país, escena, caption). */
export const FOLDERS = [
  { id: "oficina", nombre: "Oficina Háptica", country: "Colombia", sceneKey: "colombia_oficina", caption: "Un recuerdo que nos acompaña desde el inicio." },
  { id: "llegada_mx", nombre: "Llegada a México", country: "México", sceneKey: "mexico", caption: "¡Llegamos a México!" },
  { id: "recorrido_mx", nombre: "Recorrido en México", country: "México", sceneKey: "mexico", caption: "Una excursión por México." },
  { id: "llegada_cl", nombre: "Llegada a Chile", country: "Chile", sceneKey: "chile", caption: "¡Llegamos a Chile!" },
  { id: "angelica", nombre: "Con Angélica", country: "Chile", sceneKey: "angelica", caption: "Una tarde con Angélica." },
  { id: "regreso", nombre: "Regreso a Háptica", country: "Colombia", sceneKey: "regreso_haptica", caption: "Nuestro regreso a Háptica." },
  { id: "tejo", nombre: "Jugando tejo", country: "Colombia", sceneKey: "tejo", caption: "Una partida de tejo." },
  { id: "carritos", nombre: "Pista de carritos", country: "Colombia", sceneKey: "carritos", caption: "Una vuelta en los carritos." },
  { id: "bolorana", nombre: "Bolo rana", country: "Colombia", sceneKey: "bolorana", caption: "Buen tino en la rana." },
  { id: "cartas", nombre: "Juego de cartas", country: "Colombia", sceneKey: "cartas", caption: "Una partida de cartas." },
  { id: "bolos", nombre: "Bolos", country: "Colombia", sceneKey: "bolos", caption: "¡Chuza en los bolos!" },
  { id: "verdadreto", nombre: "Verdad o te atreves", country: "Colombia", sceneKey: "verdadreto", caption: "Un momento divertido." },
  { id: "ultima_puerta", nombre: "La última puerta", country: "Colombia", sceneKey: "ultima_puerta", caption: "La última puerta." },
  { id: "final", nombre: "Momento final", country: "Colombia", sceneKey: "final", caption: "El final de la travesía." },
  { id: "otros", nombre: "Otros recuerdos", country: "Colombia", sceneKey: "generico", caption: "Un recuerdo del viaje." },
];

export const FOLDER_BY_ID = Object.fromEntries(FOLDERS.map((f) => [f.id, f]));

/** Mapea los nombres de momentos ya existentes (juego_*.fotos) a su carpeta. */
const CAPTION_MAP = {
  "Oficina Háptica — Bogotá": "oficina",
  "Mapa de rutas — Bogotá": "oficina",
  "Regreso a Colombia": "regreso",
  "Regreso a Háptica": "regreso",
  "Llegada a México": "llegada_mx",
  "Momento en México": "recorrido_mx",
  "Feria en México": "recorrido_mx",
  "Centro histórico — México": "recorrido_mx",
  "Llegada a Chile": "llegada_cl",
  "Un recuerdo de Chile": "llegada_cl",
  "Paseo con Angélica — Chile": "angelica",
  "Mirador de Chile": "llegada_cl",
  "Atardecer en Chile": "angelica",
  "Con Angélica": "angelica",
  "Jugando tejo": "tejo",
  "Pista de carritos": "carritos",
  "Bolo rana": "bolorana",
  "Juego de cartas": "cartas",
  "Bolos": "bolos",
  "Verdad o te atreves": "verdadreto",
  "La última puerta": "ultima_puerta",
  "Momento final": "final",
};

function idUsuario() {
  const u = getDemoUser();
  return u?.uid || "anon";
}
function emailUsuario() {
  const u = getDemoUser();
  return u?.email || "";
}
function clave() {
  return `haptica_album_${idUsuario()}`;
}
function cargar() {
  try {
    return JSON.parse(localStorage.getItem(clave())) || {};
  } catch {
    return {};
  }
}
function guardar(album) {
  localStorage.setItem(clave(), JSON.stringify(album));
}

/** Trae los momentos ya recolectados en juego_*.fotos hacia el álbum (idempotente). */
function migrar(album) {
  let db;
  try {
    db = JSON.parse(localStorage.getItem("haptica_demo_db"));
  } catch {
    db = null;
  }
  const u = db?.usuarios?.[idUsuario()];
  if (!u) return album;
  const fuentes = [
    ...(u.juego_colombia?.fotos || []),
    ...(u.juego_mexico?.fotos || []),
    ...(u.juego_chile?.fotos || []),
    ...(u.juego_regreso?.fotos || []),
  ];
  fuentes.forEach((nombre) => {
    const folderId = CAPTION_MAP[nombre] || "otros";
    const folder = FOLDER_BY_ID[folderId];
    album[folderId] = album[folderId] || [];
    const yaEsta = album[folderId].some((p) => p.origen === nombre);
    if (!yaEsta) {
      album[folderId].push({
        photoId: `mig_${folderId}_${album[folderId].length}`,
        participantId: idUsuario(),
        email: emailUsuario(),
        folderId,
        country: folder.country,
        activity: folderId,
        sceneKey: folder.sceneKey,
        caption: folder.caption,
        origen: nombre,
        ts: Date.now(),
      });
    }
  });
  return album;
}

/** Devuelve el álbum completo (tras migrar los momentos ya recolectados). */
export function getAlbum() {
  const album = migrar(cargar());
  guardar(album);
  return album;
}

/**
 * Captura manual desde la cámara. Guarda en la carpeta del contexto actual.
 * `dataUrl` es opcional: cuando la cámara real del dispositivo pudo tomar la
 * foto, aquí viaja la imagen real (canvas.toDataURL). Si no hay cámara
 * disponible (permiso denegado, navegador sin soporte), se omite y el
 * momento se guarda igual con la "escena" estilizada de siempre — no rompe
 * la compatibilidad con lo ya guardado.
 */
export function capturar({ folderId, caption, sceneKey, country, activity, dataUrl }) {
  const album = cargar();
  const folder = FOLDER_BY_ID[folderId] || FOLDER_BY_ID.otros;
  album[folder.id] = album[folder.id] || [];
  const foto = {
    photoId: `cap_${folder.id}_${Date.now()}`,
    participantId: idUsuario(),
    email: emailUsuario(),
    folderId: folder.id,
    country: country || folder.country,
    activity: activity || folder.id,
    sceneKey: sceneKey || folder.sceneKey,
    caption: caption || folder.caption,
    ts: Date.now(),
    ...(dataUrl ? { dataUrl } : {}),
  };
  album[folder.id].push(foto);
  guardar(album);
  return foto;
}

/** Total de fotos en el álbum. */
export function totalFotos() {
  const album = getAlbum();
  return Object.values(album).reduce((n, arr) => n + arr.length, 0);
}
