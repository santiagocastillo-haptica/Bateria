/**
 * App.jsx — orquestador de la experiencia del colaborador.
 * Auth (@haptica.co) + resume desde Firestore + navegación por pasos +
 * guardado inmediato + llaves/puertas + pausa de Juli + soporte + bloqueo técnico.
 */
import { useEffect, useMemo, useState } from "react";
import { observarAuth, cerrarSesion, esDominioValido } from "./state/authProvider.js";
import experiencia from "./data/experiencia.json";
import { useJourneyState } from "./state/useJourneyState.js";
import {
  ensureUsuario,
  getUsuario,
  setConsentimiento,
  guardarRespuesta,
  otorgarLlaveSiBloqueCompleto,
  guardarPausaJuli,
  crearSoporte,
  marcarCompletado,
} from "./state/firestore.js";

import LoginScreen from "./components/LoginScreen.jsx";
import ConsentScreen from "./components/ConsentScreen.jsx";
import WorldBlockScreen from "./components/WorldBlockScreen.jsx";
import QuestionScreen from "./components/QuestionScreen.jsx";
import KeyEarnedScreen from "./components/KeyEarnedScreen.jsx";
import TransitionScreen from "./components/TransitionScreen.jsx";
import JuliPauseScreen from "./components/JuliPauseScreen.jsx";
import ClosingScreen from "./components/ClosingScreen.jsx";
import PassportPanel from "./components/PassportPanel.jsx";
import HelpReportModal from "./components/HelpReportModal.jsx";
import ErrorScreen from "./components/ErrorScreen.jsx";
import ColombiaGame from "./game/ColombiaGame.jsx";
import MexicoGame from "./game/MexicoGame.jsx";
import ChileGame from "./game/ChileGame.jsx";
import ReturnColombiaGame from "./game/ReturnColombiaGame.jsx";
import CameraButton from "./game/album/CameraButton.jsx";
import { BIENVENIDA_CUERPO } from "./data/textos.js";
import { haptiquenoLabel, etiquetaParticipante } from "./identidad.js";
import { resolverPerfil } from "./userProfile.js";
import { ES_REVIEW } from "./config/appMode.js";
import ReviewBar from "./components/ReviewBar.jsx";
import { getPlaceholder } from "./data/placeholders.js";
import { conReintento } from "./state/retry.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [authListo, setAuthListo] = useState(false);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);

  const preguntasById = useMemo(() => {
    const m = {};
    experiencia.preguntas.forEach((q) => (m[q.id] = q));
    return m;
  }, []);

  // --- Sesión ---
  useEffect(() => {
    return observarAuth(async (u) => {
      setAuthListo(true);
      if (!u) {
        setUser(null);
        setUsuario(null);
        return;
      }
      if (!esDominioValido(u.email)) {
        await cerrarSesion();
        setUser(null);
        setUsuario(null);
        return;
      }
      setUser(u);
      setCargandoUsuario(true);
      try {
        const datos = await ensureUsuario(u);
        setUsuario(datos);
      } finally {
        setCargandoUsuario(false);
      }
    });
  }, []);

  if (!authListo) return <Cargando />;
  if (!user) return <LoginScreen />;
  if (cargandoUsuario || !usuario) return <Cargando />;

  return (
    <Journey
      user={user}
      usuario={usuario}
      setUsuario={setUsuario}
      preguntasById={preguntasById}
    />
  );
}

function Cargando() {
  return (
    <div className="pantalla">
      <div className="tarjeta">
        <span className="spinner" /> <span style={{ marginLeft: 8 }}>Cargando…</span>
      </div>
    </div>
  );
}

function Journey({ user, usuario, setUsuario, preguntasById }) {
  const uid = user.uid;
  const { steps, index, step, avanzar, irA } = useJourneyState(experiencia, {
    uid,
    initialIndex: usuario?.progreso?.paso_actual ?? 1,
  });

  const [llaves, setLlaves] = useState(usuario?.progreso?.llaves_obtenidas || []);
  const perfil = useMemo(() => resolverPerfil(user), [user]);
  // Identidad visible = nombre real del correo corporativo; el ID Haptiqueño NN
  // se conserva para el pasaporte y la administración.
  const etiquetaHaptiqueno = etiquetaParticipante(perfil, usuario?.haptiqueno);
  const idHaptiqueno = haptiquenoLabel(usuario?.haptiqueno);
  const [zona, setZona] = useState(() => {
    if (!usuario?.juego_colombia?.completado) return "colombia";
    if (!usuario?.juego_mexico?.completado) return "mexico";
    if (!usuario?.juego_chile?.completado) return "chile";
    return "regreso";
  });
  const [rechazado, setRechazado] = useState(usuario?.consentimiento?.estado === "rechazado");
  const [mostrarPasaporte, setMostrarPasaporte] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [bloqueado, setBloqueado] = useState(!!usuario?.progreso?.bloqueado_tecnico);

  // --- Efecto: otorgar llave al llegar a un paso "llave" (idempotente) ---
  useEffect(() => {
    if (step?.tipo !== "llave") return;
    const bloque = step.bloque;
    (async () => {
      const ok = await otorgarLlaveSiBloqueCompleto(uid, bloque.preguntas, bloque.llave);
      if (ok) setLlaves((prev) => (prev.includes(bloque.llave) ? prev : [...prev, bloque.llave]));
    })();
  }, [step, uid]);

  // --- Efecto: marcar completado al llegar al cierre ---
  useEffect(() => {
    if (step?.tipo === "cierre") marcarCompletado(uid).catch(() => {});
  }, [step, uid]);

  // --- Handlers ---
  async function onAyudaEnviar(mensaje) {
    await crearSoporte(uid, mensaje, index);
  }

  if (bloqueado) {
    return (
      <div className="app">
        <ErrorScreen
          onPedirAyuda={() => setMostrarAyuda(true)}
          onReintentar={async () => {
            const fresco = await getUsuario(uid);
            if (fresco && !fresco.progreso?.bloqueado_tecnico) {
              setUsuario(fresco);
              setBloqueado(false);
            }
          }}
        />
        {mostrarAyuda && (
          <HelpReportModal onEnviar={onAyudaEnviar} onClose={() => setMostrarAyuda(false)} />
        )}
      </div>
    );
  }

  function contenido() {
    // Tras el consentimiento, la experiencia es el mundo jugable por zonas.
    if (step.tipo !== "login" && step.tipo !== "bienvenida" && step.tipo !== "consentimiento") {
      if (zona === "colombia") {
        return (
          <ColombiaGame
            uid={uid}
            usuario={usuario}
            haptiquenoLabel={etiquetaHaptiqueno}
            avatarGlyph={perfil.avatarGlyph}
            onFin={() => setZona("mexico")}
          />
        );
      }
      if (zona === "mexico") {
        return (
          <MexicoGame
            uid={uid}
            usuario={usuario}
            haptiquenoLabel={etiquetaHaptiqueno}
            avatarGlyph={perfil.avatarGlyph}
            onFin={() => setZona("chile")}
          />
        );
      }
      if (zona === "chile") {
        return (
          <ChileGame
            uid={uid}
            usuario={usuario}
            haptiquenoLabel={etiquetaHaptiqueno}
            avatarGlyph={perfil.avatarGlyph}
            onFin={() => setZona("regreso")}
          />
        );
      }
      return (
        <ReturnColombiaGame
          uid={uid}
          usuario={usuario}
          haptiquenoLabel={etiquetaHaptiqueno}
          avatarGlyph={perfil.avatarGlyph}
        />
      );
    }

    switch (step.tipo) {
      case "bienvenida":
        return (
          <div className="pantalla">
            <div className="tarjeta">
              <div style={{ fontSize: "3rem" }}>🍊</div>
              <h1>Bienvenido, {etiquetaHaptiqueno}</h1>
              <p className="sub">Tu travesía está a punto de comenzar.</p>
              <div className="mundo-haptiqueno" style={{ marginTop: 10 }}>🍊 {etiquetaHaptiqueno}</div>
              <p style={{ textAlign: "left", marginTop: 8 }}>{BIENVENIDA_CUERPO}</p>
              <div className="btn-fila">
                <button className="btn btn-primario" onClick={avanzar}>
                  Comenzar la travesía
                </button>
              </div>
            </div>
          </div>
        );

      case "consentimiento":
        return (
          <ConsentScreen
            onAceptar={async () => {
              await setConsentimiento(uid, "aceptado");
              await avanzar();
            }}
          />
        );

      case "intro_bloque":
        return (
          <WorldBlockScreen
            bloque={step.bloque}
            numeroBloque={step.numeroBloque}
            haptiquenoLabel={etiquetaHaptiqueno}
            llavesCount={llaves.length}
            esMaleta={step.numeroBloque === 1}
            onContinuar={avanzar}
          />
        );

      case "pregunta": {
        const pregunta = preguntasById[step.id];
        if (!pregunta) return <div className="pantalla"><div className="tarjeta">Pregunta no encontrada: {step.id}</div></div>;
        const bloqueDe = experiencia.bloques[step.bloqueIndex];
        const totalBloque = bloqueDe?.preguntas.length || 0;
        const posEnBloque = (bloqueDe?.preguntas.indexOf(step.id) ?? -1) + 1;
        const pais = bloquePaisDe(step);
        const escenaLabel = getPlaceholder(step.numeroBloque, pais).label;
        return (
          <QuestionScreen
            key={pregunta.id}
            pregunta={pregunta}
            numeroBloque={step.numeroBloque}
            pais={pais}
            escenaLabel={escenaLabel}
            posEnBloque={posEnBloque}
            totalBloque={totalBloque}
            onSubmit={async (valor) => {
              try {
                // Reintento acotado: cubre errores transitorios (ej. justo
                // después del popup de Google, mientras el token de auth se
                // propaga al canal de Firestore).
                await conReintento(() => guardarRespuesta(uid, pregunta, valor));
              } catch (error) {
                console.error("guardarRespuesta failed:", error?.code, error?.message, error);
                throw error;
              }
              await avanzar();
            }}
          />
        );
      }

      case "llave":
        return <KeyEarnedScreen bloque={step.bloque} onContinuar={avanzar} />;

      case "transicion":
        return (
          <TransitionScreen nombre={step.transicion} momento={step.momento} onContinuar={avanzar} />
        );

      case "pausa_juli":
        return (
          <JuliPauseScreen
            onContinuar={async (comentario) => {
              await guardarPausaJuli(uid, comentario);
              await avanzar();
            }}
          />
        );

      case "cierre":
        return <ClosingScreen llavesObtenidas={llaves} />;

      default:
        return <div className="pantalla"><div className="tarjeta">Paso desconocido.</div></div>;
    }
  }

  // País del bloque del paso actual (para el color de la pregunta).
  function bloquePaisDe(s) {
    const nombre = s.bloque; // en paso "pregunta" es el string del bloque
    const b = experiencia.bloques.find((x) => x.bloque === nombre);
    return b?.pais;
  }

  const mostrarTopbar = step.tipo !== "cierre";
  const enJuego =
    step.tipo !== "login" && step.tipo !== "bienvenida" && step.tipo !== "consentimiento" && !rechazado;

  return (
    <div className="app">
      {mostrarTopbar && (
        <div className="topbar">
          <span className="marca">🍊 {etiquetaHaptiqueno}</span>
          <div className="acciones">
            <span className="chip-btn" style={{ cursor: "default" }}>🔑 {llaves.length}</span>
            <button className="chip-btn" onClick={() => setMostrarPasaporte(true)}>
              🛂 Pasaporte
            </button>
            <button className="chip-btn" onClick={() => setMostrarAyuda(true)}>
              🆘 Necesito ayuda
            </button>
          </div>
        </div>
      )}

      {contenido()}

      {mostrarPasaporte && (
        <PassportPanel
          haptiquenoLabel={etiquetaHaptiqueno}
          idHaptiqueno={idHaptiqueno}
          avatarGlyph={perfil.avatarGlyph}
          sellos={[
            llaves.includes("LLAVE-CO-02") ? 0 : null,
            llaves.includes("LLAVE-MX-04") ? 1 : null,
            llaves.includes("LLAVE-CL-04") ? 2 : null,
            llaves.some((k) => k.startsWith("LLAVE-CO2-05")) ? 3 : null,
          ].filter((v) => v !== null)}
          onClose={() => setMostrarPasaporte(false)}
        />
      )}
      {mostrarAyuda && (
        <HelpReportModal onEnviar={onAyudaEnviar} onClose={() => setMostrarAyuda(false)} />
      )}

      {enJuego && <CameraButton />}

      {ES_REVIEW && (
        <ReviewBar
          zona={zona}
          setZona={setZona}
          onReset={() => {
            Object.keys(localStorage)
              .filter((k) => k.startsWith("haptica"))
              .forEach((k) => localStorage.removeItem(k));
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
