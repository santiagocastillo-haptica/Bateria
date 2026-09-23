/**
 * MexicoGame.jsx — ZONA 2: aventura de México con Mariaca.
 * Reutiliza los sistemas de Colombia: OfficeWorld (mundo/player), Inventory,
 * Album, BoardingPass (pasaporte), MissionQuestions (motor oficial) y la
 * persistencia. Integra las 31 preguntas del Cuestionario de Estrés (P020–P050,
 * en su ORDEN oficial) repartidas narrativamente en 3 excursiones.
 *
 * Fases: aterrizaje → sello → mariaca → mundo(hub) → carrito → excursion → completado.
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
  MUNDO_MX, MUEBLES_MX, OBJETOS_MX, EXCURSIONES, LIMITES_EXCURSION, MARIACA_BIENVENIDA,
} from "./mexicoData.js";
import { guardarRespuesta, otorgarLlaveSiBloqueCompleto, setJuegoMexico } from "../state/firestore.js";
import { conReintento } from "../state/retry.js";

const ESTRES = experiencia.preguntas
  .filter((q) => /Estr[eé]s/i.test(q.instrumento))
  .sort((a, b) => a.orden_narrativo - b.orden_narrativo); // 31, P020–P050

function excIndexDe(qGlobal) {
  for (let i = 0; i < EXCURSIONES.length; i++) {
    if (qGlobal < LIMITES_EXCURSION[i + 1]) return i;
  }
  return EXCURSIONES.length - 1;
}

export default function MexicoGame({ uid, usuario, haptiquenoLabel, avatarGlyph = "🍊", onFin }) {
  const init = usuario?.juego_mexico || {};
  const fotosColombia = usuario?.juego_colombia?.fotos || [];
  const [juego, setJuego] = useState(() => ({
    fase: init.fase || "aterrizaje",
    qGlobal: init.qGlobal || 0,
    excursionesHechas: init.excursionesHechas || [],
    fotos: init.fotos || [],
    completado: !!init.completado,
  }));
  const [overlay, setOverlay] = useState(null); // inventario | album
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
      setJuegoMexico(uid, next).catch(() => {});
      return next;
    });
  }
  function agregarFoto(nombre) {
    setJuego((prev) => {
      if (prev.fotos.includes(nombre)) return prev;
      const next = { ...prev, fotos: [...prev.fotos, nombre] };
      setJuegoMexico(uid, next).catch(() => {});
      return next;
    });
  }

  const excActual = excIndexDe(juego.qGlobal);
  const todasFotos = [...fotosColombia, ...juego.fotos];

  // Contexto para la cámara (carpeta del álbum según el momento).
  useEffect(() => {
    const map = { aterrizaje: "llegada_mx", sello: "llegada_mx", mariaca: "mariaca" };
    const folderId = map[juego.fase] || "recorrido_mx";
    const sceneKey = folderId === "mariaca" ? "mariaca" : "mexico";
    setContextoFoto({ folderId, country: "México", sceneKey, avatar: avatarGlyph });
  }, [juego.fase, avatarGlyph]);

  // --- Objetos del hub ---
  const objetos = useMemo(() => {
    return OBJETOS_MX.map((o) => {
      let locked = false;
      if (o.id === "salidaMX") locked = !juego.completado;
      return { id: o.id, x: o.x, y: o.y, emoji: o.emoji, nombre: o.nombre, tipo: o.tipo, locked, visible: true };
    });
  }, [juego.completado]);

  const misionTexto = juego.completado
    ? "México completado — ve a la Salida hacia Chile 🚪"
    : `Excursión con Mariaca — sube al carrito 🛺 (${juego.excursionesHechas.length}/3)`;

  // --- Interacciones del hub ---
  function onInteract(id) {
    if (id === "mariaca") return toast("👩🏻 Mariaca: ¡sube al carrito 🛺 para la siguiente parada!");
    if (id === "fotoMX") {
      agregarFoto("Momento en México");
      return toast("📷 Momento registrado: Momento en México");
    }
    if (id === "carrito") {
      if (juego.completado) return toast("Ya recorrimos todo México 🎉. Ve a la Salida 🚪.");
      return actualizar({ fase: "carrito" });
    }
    if (id === "salidaMX") {
      if (!juego.completado) return toast("🔒 Aún faltan excursiones con Mariaca.");
      onFin?.();
    }
  }

  // --- Preguntas de la excursión actual ---
  async function onAnswerExc(pregunta, valor, sliceIndex) {
    try {
      await conReintento(() => guardarRespuesta(uid, pregunta, valor));
    } catch (error) {
      console.error("guardarRespuesta failed:", error?.code, error?.message, error);
      throw error;
    }
    actualizar({ qGlobal: LIMITES_EXCURSION[excActual] + sliceIndex });
  }
  async function onCompleteExc() {
    const exc = EXCURSIONES[excActual];
    agregarFoto(exc.foto);
    const hechas = juego.excursionesHechas.includes(excActual)
      ? juego.excursionesHechas
      : [...juego.excursionesHechas, excActual];
    const finMexico = LIMITES_EXCURSION[excActual + 1] >= ESTRES.length;
    if (finMexico) {
      try {
        for (const b of experiencia.bloques.slice(2, 6)) {
          await otorgarLlaveSiBloqueCompleto(uid, b.preguntas, b.llave);
        }
      } catch (_) {}
      actualizar({ excursionesHechas: hechas, completado: true, fase: "completado" });
      toast("✅ ¡Experiencia completada!");
    } else {
      actualizar({ excursionesHechas: hechas, fase: "mundo" });
      toast(`✅ Experiencia completada — ${exc.titulo}`);
    }
  }

  // ===================== RENDER POR FASE =====================
  if (juego.fase === "aterrizaje") {
    return <LandingScreen onContinuar={() => actualizar({ fase: "sello" })} />;
  }

  if (juego.fase === "sello") {
    return (
      <BoardingPass
        haptiquenoLabel={haptiquenoLabel}
        avatarGlyph={avatarGlyph}
        sellos={[0, 1]}
        selloTitulo="BIENVENIDO A MÉXICO"
        botonTexto="Bajar del avión"
        onContinuar={() => actualizar({ fase: "mariaca" })}
      />
    );
  }

  if (juego.fase === "mariaca") {
    return (
      <NPCDialog
        nombre="Mariaca"
        emoji="👩🏻"
        avatarGlyph={avatarGlyph}
        color="#E5A000"
        lineas={MARIACA_BIENVENIDA}
        botonFinal="Explorar México 🌮"
        onFin={() => {
          agregarFoto("Llegada a México");
          actualizar({ fase: "mundo" });
        }}
      />
    );
  }

  if (juego.fase === "carrito") {
    const exc = EXCURSIONES[excActual];
    return (
      <CarritoTransition
        titulo={excActual === 0 ? "¡Vámonos!" : "Siguiente parada"}
        parada={exc.parada}
        onContinuar={() => actualizar({ fase: "excursion" })}
      />
    );
  }

  if (juego.fase === "excursion") {
    const exc = EXCURSIONES[excActual];
    const slice = ESTRES.slice(LIMITES_EXCURSION[excActual], LIMITES_EXCURSION[excActual + 1]);
    const startIndex = juego.qGlobal - LIMITES_EXCURSION[excActual];
    return (
      <MissionQuestions
        preguntas={slice}
        startIndex={Math.max(0, Math.min(startIndex, slice.length - 1))}
        intro={{
          emoji: exc.emoji,
          titulo: exc.titulo,
          subtitulo: exc.parada,
          npc: exc.npc,
          color: exc.color,
          boton: "Continuar la excursión",
        }}
        escenaLabel={`${exc.emoji} ${exc.titulo}`}
        pais="México"
        numeroBloque={3}
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
          <div style={{ fontSize: "3rem" }}>🌮🎉</div>
          <h1>México completado</h1>
          <p style={{ textAlign: "left" }}>
            Has recorrido México con Mariaca. El siguiente destino te espera.
          </p>
          <div className="btn-fila">
            {onFin && (
              <button className="btn btn-primario btn-cta" onClick={onFin}>
                ✈️ El siguiente destino
              </button>
            )}
            <button className="btn btn-secundario" onClick={() => actualizar({ fase: "mundo" })}>
              Ver el mapa de México
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- fase "mundo": hub explorable de México ----
  return (
    <div className="juego">
      <div className="juego-hud">
        <div className="hud-mision">🌮 México · {misionTexto}</div>
        <div className="hud-inv">
          {EXCURSIONES.map((e, i) => {
            const done = juego.excursionesHechas.includes(i);
            const actual = i === excActual && !juego.completado;
            return (
              <span key={e.id} className={`hud-item ${done ? "on" : ""}`} title={e.titulo} style={actual ? { boxShadow: "inset 0 0 0 2px #E5A000" } : undefined}>
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
        mundo={MUNDO_MX}
        muebles={MUEBLES_MX}
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
    </div>
  );
}
