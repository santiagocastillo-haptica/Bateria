/**
 * ColombiaGame.jsx — ORQUESTADOR de la aventura de Colombia (MVP).
 * Conecta: WORLD/PLAYER (OfficeWorld) · INVENTORY · CAMERA/ALBUM ·
 * MYSTERY (El mensaje perdido) · QUESTION ENGINE (Datos Generales, 19 oficiales)
 * · PROGRESS/STATE (persistido) · PASSPORT · TRAVEL TRANSITION (reutilizada).
 *
 * Flujo: explorar → recoger 4 objetos → cámara → pistas → código → llave →
 * puerta de acceso → Datos Generales (19) → pase → puerta de salida →
 * transición de viaje → pasaporte + sello → llegada a México (próximamente).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import experiencia from "../data/experiencia.json";
import OfficeWorld from "./OfficeWorld.jsx";
import Inventory from "./Inventory.jsx";
import Album from "./Album.jsx";
import CodePuzzle from "./CodePuzzle.jsx";
import BoardingPass from "./BoardingPass.jsx";
import DatosGeneralesMission from "./DatosGeneralesMission.jsx";
import TransitionScreen from "../components/TransitionScreen.jsx";
import { OBJETOS_DIBUJO, ITEMS_REQUERIDOS, CODIGO_MISTERIO, PREGUNTA_MISTERIO, PISTA_EXTRA_MISTERIO } from "./officeData.js";
import { setContextoFoto } from "./album/fotoContexto.js";
import { INSTRUCCION_JUEGO_TITULO, INSTRUCCION_JUEGO } from "../data/textos.js";
import { guardarRespuesta, otorgarLlaveSiBloqueCompleto, setJuegoColombia } from "../state/firestore.js";
import { conReintento } from "../state/retry.js";

const DG_PREGUNTAS = experiencia.preguntas
  .filter((q) => q.instrumento === "Ficha de Datos Generales")
  .sort((a, b) => a.orden_narrativo - b.orden_narrativo);

const TRANSICION_MX = experiencia.transiciones?.find((t) => /México/.test(t.transicion)) || {
  transicion: "Colombia → México",
  momento: null,
};

export default function ColombiaGame({ uid, usuario, haptiquenoLabel, avatarGlyph = "🍊", onFin }) {
  const init = usuario?.juego_colombia || {};
  const [juego, setJuego] = useState(() => ({
    recogidos: init.recogidos || [],
    pistas: init.pistas || [],
    fotos: init.fotos || [],
    llave: !!init.llave,
    pase: !!init.pase,
    datosDone: !!init.datosDone,
    dgIndex: init.dgIndex || 0,
    fase: init.fase || "mundo",
    tipVisto: !!init.tipVisto,
  }));
  const [overlay, setOverlay] = useState(null); // inventario | album | misterio
  const [mensaje, setMensaje] = useState("");
  const toastRef = useRef();

  function toast(m) {
    setMensaje(m);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setMensaje(""), 2800);
  }

  function actualizar(patch) {
    setJuego((prev) => {
      const next = { ...prev, ...patch };
      setJuegoColombia(uid, next).catch(() => {});
      return next;
    });
  }

  // --- Objetos que dibuja el mundo (visibilidad/bloqueo según estado) ---
  const objetos = useMemo(() => {
    return OBJETOS_DIBUJO.map((o) => {
      let visible = true;
      let locked = false;
      if (o.tipo === "item") visible = !juego.recogidos.includes(o.id);
      if (o.tipo === "safe") locked = !juego.llave;
      if (o.id === "puertaAcceso") locked = !juego.llave;
      if (o.id === "puertaSalida") locked = !juego.pase;
      return { id: o.id, x: o.x, y: o.y, emoji: o.emoji, nombre: o.nombre, tipo: o.tipo, visible, locked };
    });
  }, [juego.recogidos, juego.llave, juego.pase]);

  const faltanPistas = 3 - juego.pistas.length;

  const misionTexto = (() => {
    if (juego.recogidos.length < ITEMS_REQUERIDOS.length)
      return `Misión: Prepara tu viaje — objetos ${juego.recogidos.length}/4`;
    if (!juego.llave) return "Misión: El mensaje perdido — halla las pistas y abre la caja";
    if (!juego.datosDone) return "Misión: cruza la Puerta de acceso (Datos Generales)";
    return "Ve a la Puerta de salida para iniciar el viaje";
  })();

  // --- Interacciones ---
  function onInteract(id) {
    const o = OBJETOS_DIBUJO.find((x) => x.id === id);
    if (!o) return;
    if (o.tipo === "item") return recoger(o);
    if (o.tipo === "clue") return pista(o);
    if (o.tipo === "photo") return foto(o);
    if (o.tipo === "safe") return setOverlay("misterio");
    if (o.tipo === "door") return puerta(o);
  }

  function recoger(o) {
    if (juego.recogidos.includes(o.id)) return;
    actualizar({ recogidos: [...juego.recogidos, o.id] });
    toast(`Recogiste: ${o.emoji} ${o.nombre}`);
  }

  function pista(o) {
    if (juego.pistas.some((p) => p.pos === o.pos)) {
      toast("Ya registraste esta pista.");
      return;
    }
    if (o.requiereCamara && !juego.recogidos.includes("camara")) {
      toast("📷 Necesitas la cámara para registrar el mapa.");
      return;
    }
    const patch = { pistas: [...juego.pistas, { pos: o.pos, texto: o.texto }] };
    if (o.requiereCamara && !juego.fotos.includes("Mapa de rutas — Bogotá")) {
      patch.fotos = [...juego.fotos, "Mapa de rutas — Bogotá"];
    }
    actualizar(patch);
    toast(`🔎 Pista encontrada (${o.pos + 1}/3)`);
  }

  function foto(o) {
    if (!juego.recogidos.includes("camara")) {
      toast("📷 Primero recoge la cámara.");
      return;
    }
    if (juego.fotos.includes(o.foto)) {
      toast("Ya tienes esa foto en tu álbum.");
      return;
    }
    actualizar({ fotos: [...juego.fotos, o.foto] });
    toast(`📷 Momento registrado: ${o.foto}`);
  }

  function puerta(o) {
    if (o.id === "puertaAcceso") {
      if (juego.datosDone) return toast("✅ Ya completaste Datos Generales. Dirígete a la Puerta de salida 🚪.");
      if (!juego.llave) return toast("🔒 Puerta bloqueada: necesitas la llave 🗝️.");
      actualizar({ fase: "datos" });
    } else if (o.id === "puertaSalida") {
      if (!juego.pase) return toast("Necesitas el pase de viaje 🎫. Completa Datos Generales.");
      actualizar({ fase: "transicion" });
    }
  }

  function probarCodigo(code) {
    if (code === CODIGO_MISTERIO) {
      actualizar({ llave: true });
      setOverlay(null);
      toast("🗝️ ¡Abriste la caja y conseguiste la llave!");
      return true;
    }
    return false;
  }

  // --- Datos Generales (motor de preguntas) ---
  async function onAnswerDG(pregunta, valor, nuevoIndex) {
    try {
      await conReintento(() => guardarRespuesta(uid, pregunta, valor));
    } catch (error) {
      console.error("guardarRespuesta failed:", error?.code, error?.message, error);
      throw error;
    }
    // Otorga la llave del bloque de ESTA pregunta apenas se completa, no solo
    // al final de todo el instrumento: las reglas de Firestore exigen la
    // llave del bloque anterior para aceptar la siguiente pregunta (puerta),
    // y los bloques oficiales no coinciden con los cortes de la narrativa.
    const bloque = experiencia.bloques.find((b) => b.preguntas.includes(pregunta.id));
    if (bloque) {
      try {
        await otorgarLlaveSiBloqueCompleto(uid, bloque.preguntas, bloque.llave);
      } catch (_) {}
    }
    actualizar({ dgIndex: nuevoIndex });
  }
  async function onCompleteDG() {
    const b1 = experiencia.bloques[0];
    const b2 = experiencia.bloques[1];
    try {
      await otorgarLlaveSiBloqueCompleto(uid, b1.preguntas, b1.llave);
      await otorgarLlaveSiBloqueCompleto(uid, b2.preguntas, b2.llave);
    } catch (_) {}
    actualizar({ datosDone: true, pase: true, fase: "mundo" });
    toast("✅ Datos Generales completados — ¡conseguiste el pase 🎫!");
  }

  // Recuperación: si quedó en "datos" pero ya respondió todo (índice fuera de
  // rango), corrige el estado y vuelve al mundo — evita render en blanco.
  useEffect(() => {
    if (juego.fase === "datos" && juego.dgIndex >= DG_PREGUNTAS.length) {
      actualizar({ datosDone: true, pase: true, fase: "mundo" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [juego.fase, juego.dgIndex]);

  // Contexto para la cámara (carpeta del álbum según el momento).
  useEffect(() => {
    setContextoFoto({ folderId: "oficina", country: "Colombia", sceneKey: "colombia_oficina", avatar: avatarGlyph });
  }, [avatarGlyph]);

  // ===================== RENDER POR FASE =====================
  if (juego.fase === "datos" && juego.dgIndex < DG_PREGUNTAS.length) {
    return (
      <DatosGeneralesMission
        preguntas={DG_PREGUNTAS}
        startIndex={juego.dgIndex}
        onAnswer={onAnswerDG}
        onComplete={onCompleteDG}
      />
    );
  }

  if (juego.fase === "transicion") {
    return (
      <TransitionScreen
        nombre={TRANSICION_MX.transicion}
        momento={TRANSICION_MX.momento}
        onContinuar={() => actualizar({ fase: "pasaporte" })}
      />
    );
  }

  if (juego.fase === "pasaporte") {
    return (
      <BoardingPass
        haptiquenoLabel={haptiquenoLabel}
        avatarGlyph={avatarGlyph}
        sellos={[0]}
        onContinuar={() => {
          actualizar({ fase: "fin", completado: true });
          onFin?.();
        }}
      />
    );
  }

  if (juego.fase === "fin") {
    return (
      <div className="pantalla">
        <div className="tarjeta">
          <div style={{ fontSize: "3rem" }}>🛬</div>
          <h1>¡Aterrizaste en México!</h1>
          <p className="sub">
            Completaste la aventura de Colombia: preparaste tu maleta, resolviste el misterio,
            registraste el documento de Datos Generales y despegaste. Tu álbum guarda{" "}
            {juego.fotos.length} {juego.fotos.length === 1 ? "momento" : "momentos"}.
          </p>
          {onFin && (
            <div className="btn-fila">
              <button className="btn btn-primario btn-cta" onClick={onFin}>
                ✈️ Continuar la travesía
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- fase "mundo": exploración ----
  return (
    <div className="juego">
      {!juego.tipVisto && (
        <div className="modal-fondo" onClick={() => actualizar({ tipVisto: true })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.4rem", textAlign: "center" }}>🎮</div>
            <h2 style={{ textAlign: "center" }}>{INSTRUCCION_JUEGO_TITULO}</h2>
            <p style={{ textAlign: "left" }}>{INSTRUCCION_JUEGO}</p>
            <div className="btn-fila">
              <button className="btn btn-primario btn-cta" onClick={() => actualizar({ tipVisto: true })}>
                ✈️ ¡Entendido, comenzar!
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="juego-hud">
        <div className="hud-mision">🗺️ Bogotá · {misionTexto}</div>
        <div className="hud-inv">
          {ITEMS_REQUERIDOS.map((id) => {
            const o = OBJETOS_DIBUJO.find((x) => x.id === id);
            const tiene = juego.recogidos.includes(id);
            return (
              <span key={id} className={`hud-item ${tiene ? "on" : ""}`} title={o.nombre}>
                {tiene ? o.emoji : "·"}
              </span>
            );
          })}
          {juego.llave && <span className="hud-item on" title="Llave">🗝️</span>}
          {juego.pase && <span className="hud-item on" title="Pase">🎫</span>}
          <button className="chip-btn" onClick={() => setOverlay("inventario")}>🎒</button>
          <button className="chip-btn" onClick={() => setOverlay("album")}>📷 {juego.fotos.length}</button>
        </div>
      </div>

      <OfficeWorld objetos={objetos} onInteract={onInteract} paused={overlay !== null || !juego.tipVisto} misionTexto={misionTexto} avatarGlyph={avatarGlyph} />

      {mensaje && <div className="juego-toast">{mensaje}</div>}

      {overlay === "inventario" && (
        <Inventory
          recogidos={juego.recogidos}
          llave={juego.llave}
          pase={juego.pase}
          fotos={juego.fotos}
          onAbrirAlbum={() => setOverlay("album")}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "album" && <Album fotos={juego.fotos} onClose={() => setOverlay(null)} />}
      {overlay === "misterio" && (
        <CodePuzzle
          titulo="El mensaje perdido"
          pregunta={PREGUNTA_MISTERIO}
          pistas={juego.pistas}
          faltan={faltanPistas}
          pistaExtra={PISTA_EXTRA_MISTERIO}
          onProbar={probarCodigo}
          onClose={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
