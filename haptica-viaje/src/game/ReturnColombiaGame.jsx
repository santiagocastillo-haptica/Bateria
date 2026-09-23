/**
 * ReturnColombiaGame.jsx — ZONA 4: el gran regreso a Colombia (Circuito Final).
 * Reutiliza TODOS los sistemas. Anfitriones Santi y Cami. 8 estaciones
 * (misterio + Tejo + Carritos + Rana + Cartas + Bolos + Verdad/Reto + misterio
 * final), cada una con su minijuego y un pequeño bloque del Cuestionario
 * Intralaboral (123 preguntas, P082–P204) repartido en ORDEN oficial.
 * Las preguntas NO se tocan; la creatividad está en el juego.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import experiencia from "../data/experiencia.json";
import LandingScreen from "./LandingScreen.jsx";
import { setContextoFoto } from "./album/fotoContexto.js";
import { totalFotos } from "./album/albumManager.js";
import FinalAlbumShowcase from "./album/FinalAlbumShowcase.jsx";
import FarewellScreen from "./FarewellScreen.jsx";
import Confetti from "../components/Confetti.jsx";
import BoardingPass from "./BoardingPass.jsx";
import NPCDialog from "./NPCDialog.jsx";
import MissionQuestions from "./MissionQuestions.jsx";
import CodePuzzle from "./CodePuzzle.jsx";
import Album from "./Album.jsx";
import Inventory from "./Inventory.jsx";
import PrecisionGame from "./minijuegos/PrecisionGame.jsx";
import CarritosGame from "./minijuegos/CarritosGame.jsx";
import CardsGame from "./minijuegos/CardsGame.jsx";
import TruthDareGame from "./minijuegos/TruthDareGame.jsx";
import { ACTIVIDADES, SANTI_CAMI_BIENVENIDA, CODIGO_FINAL, PREGUNTA_FINAL, PISTA_EXTRA_FINAL, SANTI, CAMI } from "./regresoData.js";
import { guardarRespuesta, otorgarLlaveSiBloqueCompleto, setJuegoRegreso } from "../state/firestore.js";
import { conReintento } from "../state/retry.js";

const INTRA = experiencia.preguntas
  .filter((q) => /Intralaboral/i.test(q.instrumento))
  .sort((a, b) => a.orden_narrativo - b.orden_narrativo); // 123, P082–P204

// Fronteras de los 8 bloques (reparto equilibrado, en orden oficial).
const N = ACTIVIDADES.length;
const LIMITES = Array.from({ length: N + 1 }, (_, i) => Math.round((i * INTRA.length) / N));

const hostDe = (h) => (h === "cami" ? CAMI : SANTI);

export default function ReturnColombiaGame({ uid, usuario, haptiquenoLabel, avatarGlyph = "🍊" }) {
  const init = usuario?.juego_regreso || {};
  const fotosPrevias = [
    ...(usuario?.juego_colombia?.fotos || []),
    ...(usuario?.juego_mexico?.fotos || []),
    ...(usuario?.juego_chile?.fotos || []),
  ];
  const [juego, setJuego] = useState(() => ({
    fase: init.fase || "aterrizaje",
    actIndex: init.actIndex || 0,
    qGlobal: init.qGlobal || 0,
    actividadesHechas: init.actividadesHechas || [],
    piezas: init.piezas || [],
    fotos: init.fotos || [],
    subfase: init.subfase || "juego",
    completado: !!init.completado,
  }));
  const [overlay, setOverlay] = useState(null); // album | inventario
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
      setJuegoRegreso(uid, next).catch(() => {});
      return next;
    });
  }
  function fusionar(fn) {
    setJuego((prev) => {
      const next = fn(prev);
      setJuegoRegreso(uid, next).catch(() => {});
      return next;
    });
  }
  const todasFotos = [...fotosPrevias, ...juego.fotos];

  // Contexto para la cámara (carpeta del álbum según la actividad).
  useEffect(() => {
    let folderId = "regreso";
    if (juego.fase === "actividad") {
      const ACT = ACTIVIDADES[juego.actIndex];
      const m = { misterio_inicial: "regreso", tejo: "tejo", carritos: "carritos", bolorana: "bolorana", cartas: "cartas", bolos: "bolos", verdadreto: "verdadreto", final: "ultima_puerta" };
      folderId = m[ACT?.id] || "regreso";
    } else if (juego.fase === "sello" || juego.fase === "finale") {
      folderId = "final";
    }
    const sceneKey = folderId === "regreso" ? "regreso_haptica" : folderId;
    setContextoFoto({ folderId, country: "Colombia", sceneKey, avatar: avatarGlyph });
  }, [juego.fase, juego.actIndex, avatarGlyph]);

  // ------- avanzar dentro de una actividad -------
  function ganarJuego() {
    const ACT = ACTIVIDADES[juego.actIndex];
    fusionar((prev) => {
      const fotos = ACT.foto && !prev.fotos.includes(ACT.foto) ? [...prev.fotos, ACT.foto] : prev.fotos;
      const piezas = ACT.pieza && !prev.piezas.some((p) => p.pos === ACT.pieza.pos)
        ? [...prev.piezas, ACT.pieza] : prev.piezas;
      return { ...prev, fotos, piezas, subfase: "preguntas" };
    });
    toast("🪙 ¡Recompensa obtenida!");
  }

  async function onAnswer(pregunta, valor, sliceIndex) {
    const ACT = ACTIVIDADES[juego.actIndex];
    try {
      await conReintento(() => guardarRespuesta(uid, pregunta, valor, { actividad: ACT.id, etapa: "regreso" }));
    } catch (error) {
      console.error("guardarRespuesta failed:", error?.code, error?.message, error);
      throw error;
    }
    actualizar({ qGlobal: LIMITES[juego.actIndex] + sliceIndex });
  }
  async function onCompleteBloque() {
    const ACT = ACTIVIDADES[juego.actIndex];
    const nuevo = juego.actIndex + 1;
    const hechas = [...new Set([...juego.actividadesHechas, ACT.id])];
    if (nuevo >= ACTIVIDADES.length) {
      try {
        for (const b of experiencia.bloques.slice(10, 15)) {
          await otorgarLlaveSiBloqueCompleto(uid, b.preguntas, b.llave);
        }
      } catch (_) {}
      actualizar({ actividadesHechas: hechas, actIndex: nuevo, completado: true, fase: "sello" });
    } else {
      actualizar({ actividadesHechas: hechas, actIndex: nuevo, fase: "mundo", subfase: "juego" });
      toast("✅ Actividad completada — has avanzado en el recorrido.");
    }
  }

  // ===================== RENDER POR FASE =====================
  if (juego.fase === "aterrizaje") {
    return (
      <LandingScreen
        titulo="REGRESANDO A COLOMBIA"
        destino="🏠"
        iconoTitulo="🏠"
        boton="¡Hemos vuelto!"
        onContinuar={() => actualizar({ fase: "santicami" })}
      />
    );
  }

  if (juego.fase === "santicami") {
    return (
      <NPCDialog
        color="#FA4616"
        escenaEmojis={[SANTI.emoji, CAMI.emoji]}
        avatarGlyph={avatarGlyph}
        lineas={SANTI_CAMI_BIENVENIDA}
        botonFinal="Empezar el Circuito Final"
        onFin={() => {
          fusionar((prev) => ({
            ...prev,
            fotos: prev.fotos.includes("Regreso a Háptica") ? prev.fotos : [...prev.fotos, "Regreso a Háptica"],
            fase: "mundo",
          }));
        }}
      />
    );
  }

  if (juego.fase === "sello") {
    return (
      <BoardingPass
        haptiquenoLabel={haptiquenoLabel}
        avatarGlyph={avatarGlyph}
        sellos={[0, 1, 2, 3]}
        selloTitulo="REGRESO A CASA"
        botonTexto="Ver el gran cierre"
        onContinuar={() => {
          fusionar((prev) => ({
            ...prev,
            fotos: prev.fotos.includes("Momento final") ? prev.fotos : [...prev.fotos, "Momento final"],
            fase: "finale",
          }));
        }}
      />
    );
  }

  if (juego.fase === "finale") {
    return (
      <div className="pantalla">
        <Confetti />
        <div className="tarjeta cierre-grande">
          <div className="cierre-emoji">🎉</div>
          <h1>Travesía completada</h1>
          <div className="mundo-haptiqueno">🍊 {haptiquenoLabel}</div>
          <p>Has recorrido Háptica: Colombia, México, Chile y el regreso a casa.</p>

          <div className="cierre-mapa">
            <span className="cierre-parada"><span className="cp-ico">🏠</span><b>Bogotá</b><i>✓</i></span>
            <span className="cierre-linea" />
            <span className="cierre-parada"><span className="cp-ico">🌮</span><b>México</b><i>✓</i></span>
            <span className="cierre-linea" />
            <span className="cierre-parada"><span className="cp-ico">⛰️</span><b>Chile</b><i>✓</i></span>
            <span className="cierre-linea" />
            <span className="cierre-parada"><span className="cp-ico">🏠</span><b>Regreso</b><i>✓</i></span>
          </div>

          <div className="cierre-tesoros">
            <div className="tesoro"><span>🛂</span><b>Pasaporte</b><i>4 sellos</i></div>
            <div className="tesoro"><span>📷</span><b>Álbum</b><i>{totalFotos()} recuerdos</i></div>
            <div className="tesoro"><span>🗺️</span><b>Mapa</b><i>completo</i></div>
            <div className="tesoro"><span>🎒</span><b>Inventario</b><i>listo</i></div>
          </div>

          <p style={{ fontWeight: 700 }}>Gracias por ser parte de esta travesía.</p>
          <div className="btn-fila">
            <button className="btn btn-primario btn-cta" onClick={() => actualizar({ fase: "album_final" })}>
              📷 Ver mis recuerdos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (juego.fase === "album_final") {
    return <FinalAlbumShowcase onContinuar={() => actualizar({ fase: "despedida" })} />;
  }

  if (juego.fase === "despedida") {
    return <FarewellScreen uid={uid} haptiquenoLabel={haptiquenoLabel} avatarGlyph={avatarGlyph} />;
  }

  if (juego.fase === "actividad") {
    const ACT = ACTIVIDADES[juego.actIndex];
    const host = hostDe(ACT.host);

    if (juego.subfase === "preguntas") {
      const slice = INTRA.slice(LIMITES[juego.actIndex], LIMITES[juego.actIndex + 1]);
      const startIndex = juego.qGlobal - LIMITES[juego.actIndex];
      return (
        <MissionQuestions
          preguntas={slice}
          startIndex={Math.max(0, Math.min(startIndex, slice.length - 1))}
          intro={{
            emoji: ACT.emoji,
            titulo: ACT.titulo,
            subtitulo: "Circuito Final · Colombia",
            npc: ACT.npc,
            npcNombre: host.nombre,
            npcEmoji: host.emoji,
            color: "#FA4616",
            boton: "Continuar",
          }}
          escenaLabel={`${ACT.emoji} ${ACT.titulo}`}
          pais="Colombia"
          numeroBloque={11}
          onAnswer={onAnswer}
          onComplete={onCompleteBloque}
        />
      );
    }

    // subfase "juego"
    if (ACT.tipo === "nota") {
      return (
        <div className="pantalla">
          <div className="tarjeta">
            <div style={{ fontSize: "2.6rem" }}>{ACT.emoji}</div>
            <h1>{ACT.titulo}</h1>
            <div className="dialogo-caja" style={{ marginTop: 8 }}>
              <div className="dialogo-nombre">{host.emoji} {host.nombre}</div>
              <div className="dialogo-texto">{ACT.intro}</div>
            </div>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={ganarJuego}>🔎 Investigar y comenzar</button>
            </div>
          </div>
        </div>
      );
    }
    if (ACT.tipo === "precision") {
      return <PrecisionGame tema={ACT.tema} emoji={ACT.emoji} onGanar={ganarJuego} />;
    }
    if (ACT.tipo === "carritos") {
      return <CarritosGame onGanar={ganarJuego} />;
    }
    if (ACT.tipo === "cartas") {
      return <CardsGame onGanar={ganarJuego} />;
    }
    if (ACT.tipo === "verdadreto") {
      return <TruthDareGame onGanar={ganarJuego} />;
    }
    if (ACT.tipo === "mystery-final") {
      return (
        <div className="pantalla">
          <div className="tarjeta">
            <div style={{ fontSize: "2.6rem" }}>{ACT.emoji}</div>
            <h1>{ACT.titulo}</h1>
            <p style={{ textAlign: "left" }}>{ACT.intro}</p>
          </div>
          <CodePuzzle
            titulo="El gran misterio final"
            emoji="🔐"
            pregunta={PREGUNTA_FINAL}
            pistaExtra={PISTA_EXTRA_FINAL}
            textoFaltan="Completa las actividades del circuito para reunir las pistas."
            pistas={juego.piezas}
            faltan={3 - juego.piezas.length}
            onProbar={(code) => {
              if (code === CODIGO_FINAL) {
                toast("🔓 ¡La última puerta se abre!");
                ganarJuego();
                return true;
              }
              return false;
            }}
            onClose={() => {}}
          />
        </div>
      );
    }
  }

  // ---- fase "mundo": mapa del Circuito Final ----
  return (
    <div className="juego">
      <div className="juego-hud">
        <div className="hud-mision">🗺️ Circuito Final · El último recorrido</div>
        <div className="hud-inv">
          <span className="hud-item on" title="Piezas del misterio">🧩 {juego.piezas.length}</span>
          <button className="chip-btn" onClick={() => setOverlay("inventario")}>🎒</button>
          <button className="chip-btn" onClick={() => setOverlay("album")}>📷 {todasFotos.length}</button>
        </div>
      </div>

      <div className="circuito">
        <div className="circuito-titulo">🗺️ Circuito Final</div>
        {ACTIVIDADES.map((a, i) => {
          const done = i < juego.actIndex || juego.actividadesHechas.includes(a.id);
          const actual = i === juego.actIndex && !juego.completado;
          const locked = i > juego.actIndex;
          return (
            <div key={a.id} className={`estacion ${done ? "done" : ""} ${actual ? "actual" : ""} ${locked ? "locked" : ""}`}>
              <span className="estacion-emoji">{done ? "✓" : locked ? "🔒" : a.emoji}</span>
              <div className="estacion-info">
                <div className="estacion-titulo">{a.titulo}</div>
                <div className="estacion-estado">{done ? "Completada" : actual ? "Disponible" : "Bloqueada"}</div>
              </div>
              {actual && (
                <button className="btn btn-primario estacion-btn" onClick={() => actualizar({ fase: "actividad", subfase: "juego" })}>
                  Jugar ▶
                </button>
              )}
            </div>
          );
        })}
      </div>

      {mensaje && <div className="juego-toast">{mensaje}</div>}
      {overlay === "album" && <Album fotos={todasFotos} onClose={() => setOverlay(null)} />}
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
    </div>
  );
}
