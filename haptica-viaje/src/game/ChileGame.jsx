/**
 * ChileGame.jsx — ZONA 3: visita a Angélica ("Boss") en Chile.
 * Reutiliza todos los sistemas (mundo, player, inventario, cámara, álbum,
 * motor de preguntas, pasaporte, transiciones, NPC, vehículo). Integra las 31
 * preguntas de "Factores Psicosociales Extralaborales" (P051–P081, ORDEN oficial)
 * repartidas en 3 excursiones. Lorenzo, Lila y la memoria de Botas dan alma a Chile.
 *
 * Fases: aterrizaje → sello → angelica → mundo(hub) → carrito → excursion → completado.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import experiencia from "../data/experiencia.json";
import OfficeWorld from "./OfficeWorld.jsx";
import { setContextoFoto } from "./album/fotoContexto.js";
import Confetti from "../components/Confetti.jsx";
import Inventory from "./Inventory.jsx";
import Album from "./Album.jsx";
import BoardingPass from "./BoardingPass.jsx";
import MissionQuestions from "./MissionQuestions.jsx";
import NPCDialog from "./NPCDialog.jsx";
import CarritoTransition from "./CarritoTransition.jsx";
import LandingScreen from "./LandingScreen.jsx";
import {
  MUNDO_CL, MUEBLES_CL, OBJETOS_CL, EXCURSIONES_CL, LIMITES_EXCURSION_CL,
  ANGELICA_BIENVENIDA, BOTAS_MEMORIA,
} from "./chileData.js";
import { guardarRespuesta, otorgarLlaveSiBloqueCompleto, setJuegoChile } from "../state/firestore.js";

const EXTRALABORAL = experiencia.preguntas
  .filter((q) => /Extralaboral/i.test(q.instrumento))
  .sort((a, b) => a.orden_narrativo - b.orden_narrativo); // 31, P051–P081

function excIndexDe(qGlobal) {
  for (let i = 0; i < EXCURSIONES_CL.length; i++) {
    if (qGlobal < LIMITES_EXCURSION_CL[i + 1]) return i;
  }
  return EXCURSIONES_CL.length - 1;
}

export default function ChileGame({ uid, usuario, haptiquenoLabel, avatarGlyph = "🍊", onFin }) {
  const init = usuario?.juego_chile || {};
  const fotosPrevias = [
    ...(usuario?.juego_colombia?.fotos || []),
    ...(usuario?.juego_mexico?.fotos || []),
  ];
  const [juego, setJuego] = useState(() => ({
    fase: init.fase || "aterrizaje",
    qGlobal: init.qGlobal || 0,
    excursionesHechas: init.excursionesHechas || [],
    fotos: init.fotos || [],
    completado: !!init.completado,
  }));
  const [overlay, setOverlay] = useState(null); // inventario | album | botas
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
      setJuegoChile(uid, next).catch(() => {});
      return next;
    });
  }
  function agregarFoto(nombre) {
    setJuego((prev) => {
      if (prev.fotos.includes(nombre)) return prev;
      const next = { ...prev, fotos: [...prev.fotos, nombre] };
      setJuegoChile(uid, next).catch(() => {});
      return next;
    });
  }

  const excActual = excIndexDe(juego.qGlobal);
  const todasFotos = [...fotosPrevias, ...juego.fotos];

  // Contexto para la cámara (carpeta del álbum según el momento).
  useEffect(() => {
    const map = { aterrizaje: "llegada_cl", sello: "llegada_cl" };
    const folderId = map[juego.fase] || "angelica";
    const sceneKey = folderId === "angelica" ? "angelica" : "chile";
    setContextoFoto({ folderId, country: "Chile", sceneKey, avatar: avatarGlyph });
  }, [juego.fase, avatarGlyph]);

  const objetos = useMemo(() => {
    return OBJETOS_CL.map((o) => ({
      id: o.id, x: o.x, y: o.y, emoji: o.emoji, nombre: o.nombre, tipo: o.tipo,
      wander: !!o.wander,
      locked: o.id === "salidaCL" ? !juego.completado : false,
      visible: true,
    }));
  }, [juego.completado]);

  const misionTexto = juego.completado
    ? "Chile completado — ve a la Salida 🚪 (rumbo a Colombia)"
    : `¿Cómo está el equipo? — recorre con Angélica 🚐 (${juego.excursionesHechas.length}/3)`;

  function onInteract(id) {
    if (id === "angelica") return toast("👩🏼 Angélica: cuando quieras, subimos a la van 🚐 y recorremos.");
    if (id === "lorenzo") { agregarFoto("Con Lorenzo"); return toast("🐾 Lorenzo te ha encontrado."); }
    if (id === "lila") { agregarFoto("Con Lila"); return toast("🐾 Lila quiere acompañarte."); }
    if (id === "botas") return setOverlay("botas");
    if (id === "fotoCL") { agregarFoto("Un recuerdo de Chile"); return toast("📷 Momento registrado: Un recuerdo de Chile"); }
    if (id === "carrito") {
      if (juego.completado) return toast("Ya recorrimos Chile 💚. Ve a la Salida 🚪.");
      return actualizar({ fase: "carrito" });
    }
    if (id === "salidaCL") {
      if (!juego.completado) return toast("🔒 Aún falta recorrer con Angélica.");
      onFin?.();
    }
  }

  async function onAnswerExc(pregunta, valor, sliceIndex) {
    await guardarRespuesta(uid, pregunta, valor);
    actualizar({ qGlobal: LIMITES_EXCURSION_CL[excActual] + sliceIndex });
  }
  async function onCompleteExc() {
    const exc = EXCURSIONES_CL[excActual];
    agregarFoto(exc.foto);
    const hechas = juego.excursionesHechas.includes(excActual)
      ? juego.excursionesHechas
      : [...juego.excursionesHechas, excActual];
    const finChile = LIMITES_EXCURSION_CL[excActual + 1] >= EXTRALABORAL.length;
    if (finChile) {
      try {
        for (const b of experiencia.bloques.slice(6, 10)) {
          await otorgarLlaveSiBloqueCompleto(uid, b.preguntas, b.llave);
        }
      } catch (_) {}
      actualizar({ excursionesHechas: hechas, completado: true, fase: "completado" });
      toast("💚 ¡Recorrido completado!");
    } else {
      actualizar({ excursionesHechas: hechas, fase: "mundo" });
      toast(`✅ Experiencia completada — ${exc.titulo}`);
    }
  }

  // ===================== RENDER POR FASE =====================
  if (juego.fase === "aterrizaje") {
    return (
      <LandingScreen
        titulo="ATERRIZANDO EN CHILE"
        destino="⛰️"
        boton="Bajar del avión"
        onContinuar={() => actualizar({ fase: "sello" })}
      />
    );
  }

  if (juego.fase === "sello") {
    return (
      <BoardingPass
        haptiquenoLabel={haptiquenoLabel}
        avatarGlyph={avatarGlyph}
        sellos={[0, 1, 2]}
        selloTitulo="BIENVENIDO A CHILE"
        botonTexto="Bajar del avión"
        onContinuar={() => actualizar({ fase: "angelica" })}
      />
    );
  }

  if (juego.fase === "angelica") {
    return (
      <NPCDialog
        nombre="Angélica"
        emoji="👩🏼"
        avatarGlyph={avatarGlyph}
        color="#00BCA0"
        lineas={ANGELICA_BIENVENIDA}
        botonFinal="Explorar Chile ⛰️"
        onFin={() => {
          agregarFoto("Llegada a Chile");
          agregarFoto("Con Angélica");
          actualizar({ fase: "mundo" });
        }}
      />
    );
  }

  if (juego.fase === "carrito") {
    const exc = EXCURSIONES_CL[excActual];
    return (
      <CarritoTransition
        titulo={excActual === 0 ? "¡Vamos!" : "Siguiente parada"}
        parada={`${exc.emoji} ${exc.titulo}`}
        onContinuar={() => actualizar({ fase: "excursion" })}
      />
    );
  }

  if (juego.fase === "excursion") {
    const exc = EXCURSIONES_CL[excActual];
    const slice = EXTRALABORAL.slice(LIMITES_EXCURSION_CL[excActual], LIMITES_EXCURSION_CL[excActual + 1]);
    const startIndex = juego.qGlobal - LIMITES_EXCURSION_CL[excActual];
    return (
      <MissionQuestions
        preguntas={slice}
        startIndex={Math.max(0, Math.min(startIndex, slice.length - 1))}
        intro={{
          emoji: exc.emoji,
          titulo: exc.titulo,
          subtitulo: exc.parada,
          npc: exc.npc,
          npcNombre: "Angélica",
          npcEmoji: "👩🏼",
          color: exc.color,
          boton: "Seguir el recorrido",
        }}
        escenaLabel={`${exc.emoji} ${exc.titulo}`}
        pais="Chile"
        numeroBloque={7}
        onAnswer={onAnswerExc}
        onComplete={onCompleteExc}
      />
    );
  }

  if (juego.fase === "completado") {
    return (
      <div className="pantalla">
        <Confetti />
        <div className="tarjeta">
          <div style={{ fontSize: "3rem" }}>⛰️🎉</div>
          <h1>Chile completado</h1>
          <div className="dialogo-caja" style={{ marginTop: 8 }}>
            <div className="dialogo-nombre">👩🏼 Angélica</div>
            <div className="dialogo-texto">
              Gracias por hacer este recorrido conmigo y por compartir cómo estás viviendo tu
              experiencia. Ahora entiendo un poco mejor cómo está nuestro equipo.
            </div>
          </div>
          <p className="sub" style={{ marginTop: 12 }}>Es momento de continuar la travesía.</p>
          <div className="btn-fila">
            {onFin && (
              <button className="btn btn-primario btn-cta" onClick={onFin}>
                ✈️ El siguiente destino
              </button>
            )}
            <button className="btn btn-secundario" onClick={() => actualizar({ fase: "mundo" })}>
              Ver el mapa de Chile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- fase "mundo": hub explorable de Chile ----
  return (
    <div className="juego">
      <div className="juego-hud">
        <div className="hud-mision">⛰️ Chile · {misionTexto}</div>
        <div className="hud-inv">
          {EXCURSIONES_CL.map((e, i) => {
            const done = juego.excursionesHechas.includes(i);
            const actual = i === excActual && !juego.completado;
            return (
              <span key={e.id} className={`hud-item ${done ? "on" : ""}`} title={e.titulo}
                style={actual ? { boxShadow: "inset 0 0 0 2px #00BCA0" } : undefined}>
                {done ? "✓" : e.emoji}
              </span>
            );
          })}
          <button className="chip-btn" onClick={() => setOverlay("inventario")}>🎒</button>
          <button className="chip-btn" onClick={() => setOverlay("album")}>📷 {todasFotos.length}</button>
        </div>
      </div>

      <OfficeWorld
        objetos={objetos}
        onInteract={onInteract}
        paused={overlay !== null}
        misionTexto={misionTexto}
        mundo={MUNDO_CL}
        muebles={MUEBLES_CL}
        avatarGlyph={avatarGlyph}
        playerStart={{ x: 360, y: 400 }}
      />

      {mensaje && <div className="juego-toast">{mensaje}</div>}

      {overlay === "inventario" && (
        <Inventory
          recogidos={["ropa", "cargador", "pasaporte", "camara"]}
          llave={true}
          pase={true}
          fotos={todasFotos}
          onAbrirAlbum={() => setOverlay("album")}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "album" && <Album fotos={todasFotos} onClose={() => setOverlay(null)} />}
      {overlay === "botas" && (
        <BotasMemoria
          onRegistrar={() => {
            agregarFoto(BOTAS_MEMORIA.foto);
            toast("📷 Momento registrado: una historia que sigue viajando.");
            setOverlay(null);
          }}
          onClose={() => setOverlay(null)}
        />
      )}
    </div>
  );
}

function BotasMemoria({ onRegistrar, onClose }) {
  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "2.4rem", textAlign: "center" }}>🐾</div>
        <h2 style={{ textAlign: "center" }}>{BOTAS_MEMORIA.titulo}</h2>
        {BOTAS_MEMORIA.lineas.map((l, i) => (
          <p key={i} style={{ textAlign: "center" }}>{l}</p>
        ))}
        <div className="btn-fila">
          <button className="btn btn-primario" onClick={onRegistrar}>📷 Registrar este momento</button>
          <button className="btn btn-secundario" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
