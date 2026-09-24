/**
 * JuliDashboard.jsx — panel administrativo de seguimiento de la batería (Sección L).
 *
 * Fuente de verdad del UNIVERSO de colaboradores: TABLA_DATOS_BATERIA.xlsx,
 * embebido en src/data/colaboradores.js (COLABORADORES). El dashboard SIEMPRE
 * muestra una fila por cada persona del roster, exista o no todavía como
 * usuario en Firestore — nunca al revés.
 *
 * Fuente de verdad del AVANCE: la cantidad REAL de documentos en
 * usuarios/{uid}/respuestas/{preguntaId} (getRespuestasUsuario), agrupados
 * por instrumento/bloque a partir de experiencia.json. Los campos
 * dgIndex/qGlobal/completado/progreso/fase son solo auxiliares de UI y
 * jamás se usan para calcular el semáforo.
 *
 * Semáforo (límites exactos, sin aproximar):
 *   🔴 respondidas <= floor(total/2)
 *   🟡 floor(total/2) < respondidas < total
 *   🟢 respondidas === total
 *
 * Seguridad: esta pantalla solo es alcanzable si JuliApp.jsx autorizó la
 * sesión (custom claim role:'juli' O correo en la lista cerrada de
 * administradores). Las Security Rules (esJuli() || esAdminHaptica()) son
 * la barrera real; esto es solo la UI.
 */
import { useEffect, useMemo, useState } from "react";
import { cerrarSesion, MODO_DEMO } from "../state/authProvider.js";
import experiencia from "../data/experiencia.json";
import { COLABORADORES } from "../data/colaboradores.js";
import {
  listarUsuarios,
  resolverBloqueoTecnico,
  getRespuestasUsuario,
} from "../state/firestore.js";

const INSTRUMENTOS = [
  "Ficha de Datos Generales",
  "Cuestionario para la Evaluación del Estrés - Tercera Versión",
  "Cuestionario de Factores Psicosociales Extralaborales",
  "Cuestionario de Factores de Riesgo Psicosocial Intralaboral - Forma A",
];
const INSTRUMENTOS_CORTO = {
  "Ficha de Datos Generales": "Datos generales",
  "Cuestionario para la Evaluación del Estrés - Tercera Versión": "Estrés",
  "Cuestionario de Factores Psicosociales Extralaborales": "Extralaboral",
  "Cuestionario de Factores de Riesgo Psicosocial Intralaboral - Forma A": "Intralaboral",
};

// --- Universo fijo de preguntas (204), derivado de experiencia.json ---
const IDS_POR_INSTRUMENTO = (() => {
  const m = {};
  INSTRUMENTOS.forEach((i) => (m[i] = []));
  experiencia.preguntas.forEach((q) => {
    (m[q.instrumento] = m[q.instrumento] || []).push(q.id);
  });
  return m;
})();
const TOTAL_PREGUNTAS = experiencia.preguntas.length; // 204

// --- 15 bloques narrativos (llave), para el detalle por colaborador ---
const BLOQUES = experiencia.bloques.map((b) => ({
  llave: b.llave,
  nombre: b.bloque || b.llave,
  ids: b.preguntas,
}));

function limiteSemaforo(respondidas, total) {
  if (!total) return { color: "gris", icono: "⚪", texto: "—" };
  if (respondidas >= total) return { color: "verde", icono: "🟢", texto: "Completo" };
  if (respondidas > Math.floor(total / 2)) return { color: "amarillo", icono: "🟡", texto: "En curso" };
  return { color: "rojo", icono: "🔴", texto: "Inicial" };
}

function fecha(ts) {
  try {
    if (!ts) return "—";
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-CO");
  } catch {
    return "—";
  }
}

/** Fusiona el roster (Excel) con los usuarios reales de Firestore y sus respuestas. */
function useTableroColaboradores() {
  const [usuariosFs, setUsuariosFs] = useState(null); // null = no cargado aún
  const [respuestasPorUid, setRespuestasPorUid] = useState({}); // uid -> respuestas[]
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const usuarios = await listarUsuarios();
      setUsuariosFs(usuarios);
      const entradas = await Promise.all(
        usuarios.map(async (u) => {
          try {
            return [u.uid, await getRespuestasUsuario(u.uid)];
          } catch {
            return [u.uid, null]; // no se pudo leer; se muestra como dato faltante, no como 0
          }
        })
      );
      setRespuestasPorUid(Object.fromEntries(entradas));
    } catch (e) {
      setError("No fue posible cargar los colaboradores. ¿Tienes permisos de administración activos?");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const { filas, noAsociados } = useMemo(() => {
    if (!usuariosFs) return { filas: [], noAsociados: [] };
    const usuariosPorCorreo = new Map(
      usuariosFs.map((u) => [(u.correo || "").toLowerCase(), u])
    );

    // Colaboradores del Excel que SÍ tienen usuario correspondiente en Firestore.
    const correosUsadosDelExcel = new Set();

    const filas = COLABORADORES.map((c) => {
      const correoLower = c.correo.toLowerCase();
      const u = usuariosPorCorreo.get(correoLower);
      if (u) correosUsadosDelExcel.add(correoLower);

      if (!u) {
        // En el Excel, sin usuario en Firestore todavía: 🔴 No iniciado.
        // NUNCA se crea un usuario ni se inventan respuestas.
        return {
          colaborador: c,
          uid: null,
          usuarioFs: null,
          respuestas: [],
          iniciado: false,
          faltaLectura: false,
          porInstrumento: Object.fromEntries(
            INSTRUMENTOS.map((i) => [i, { respondidas: 0, total: IDS_POR_INSTRUMENTO[i].length }])
          ),
          respondidasTotal: 0,
          ultimaActividad: null,
          bloqueadoTecnico: false,
        };
      }

      const respuestas = respuestasPorUid[u.uid];
      const faltaLectura = respuestas === undefined; // aún cargando
      const listaRespuestas = respuestas || [];
      const idsRespondidos = new Set(listaRespuestas.map((r) => r.id));

      const porInstrumento = Object.fromEntries(
        INSTRUMENTOS.map((i) => {
          const ids = IDS_POR_INSTRUMENTO[i];
          const respondidas = ids.filter((id) => idsRespondidos.has(id)).length;
          return [i, { respondidas, total: ids.length }];
        })
      );

      const ultimaActividad = listaRespuestas.reduce((max, r) => {
        const t = r.fecha_hora?.toMillis ? r.fecha_hora.toMillis() : 0;
        return t > max ? t : max;
      }, 0);

      return {
        colaborador: c,
        uid: u.uid,
        usuarioFs: u,
        respuestas: listaRespuestas,
        iniciado: true,
        faltaLectura,
        porInstrumento,
        respondidasTotal: idsRespondidos.size,
        ultimaActividad: ultimaActividad || u.progreso?.fecha_fin || u.fecha_creacion || null,
        bloqueadoTecnico: !!u.progreso?.bloqueado_tecnico,
      };
    });

    // Usuarios reales en Firestore cuyo correo NO aparece en el Excel/roster:
    // discrepancia de correo — se reporta como alerta, nunca se asume ni se
    // fusiona automáticamente con nadie del roster.
    const noAsociados = usuariosFs.filter(
      (u) => !correosUsadosDelExcel.has((u.correo || "").toLowerCase())
    );

    return { filas, noAsociados };
  }, [usuariosFs, respuestasPorUid]);

  return { filas, noAsociados, cargando, error, recargar: cargar };
}

export default function JuliDashboard({ user }) {
  const { filas, noAsociados, cargando, error, recargar } = useTableroColaboradores();
  const [ocupado, setOcupado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const preguntasById = useMemo(() => {
    const m = {};
    experiencia.preguntas.forEach((q) => (m[q.id] = q));
    return m;
  }, []);

  const filasConEstado = useMemo(
    () =>
      filas.map((f) => ({
        ...f,
        estado: !f.iniciado
          ? { color: "rojo", icono: "🔴", texto: "No iniciado" }
          : f.respondidasTotal === 0
          ? { color: "rojo", icono: "🔴", texto: "No iniciado" }
          : limiteSemaforo(f.respondidasTotal, TOTAL_PREGUNTAS),
      })),
    [filas]
  );

  const filasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filasConEstado.filter((f) => {
      if (filtroEstado !== "todos" && f.estado.color !== filtroEstado) return false;
      if (!q) return true;
      return (
        f.colaborador.nombre.toLowerCase().includes(q) ||
        f.colaborador.seudonimo.toLowerCase().includes(q) ||
        f.colaborador.correo.toLowerCase().includes(q)
      );
    });
  }, [filasConEstado, busqueda, filtroEstado]);

  const resumen = useMemo(() => {
    const total = filasConEstado.length;
    const noIniciado = filasConEstado.filter((f) => f.estado.texto === "No iniciado").length;
    const rojo = filasConEstado.filter((f) => f.estado.color === "rojo" && f.estado.texto !== "No iniciado").length;
    const amarillo = filasConEstado.filter((f) => f.estado.color === "amarillo").length;
    const verde = filasConEstado.filter((f) => f.estado.color === "verde").length;
    return { total, noIniciado, rojo, amarillo, verde };
  }, [filasConEstado]);

  async function marcarResuelto(uid) {
    setOcupado(uid);
    try {
      await resolverBloqueoTecnico(uid);
      await recargar();
    } finally {
      setOcupado(null);
    }
  }

  function verDetalle(f) {
    setDetalle(f);
  }

  async function exportar(f) {
    if (!f.uid) return;
    setOcupado(f.uid);
    try {
      const porInstrumento = {};
      f.respuestas
        .slice()
        .sort((a, b) => (a.numero_oficial || 0) - (b.numero_oficial || 0))
        .forEach((r) => {
          (porInstrumento[r.instrumento] = porInstrumento[r.instrumento] || []).push({
            id_interno: r.id,
            numero_oficial: r.numero_oficial,
            opcion_seleccionada: r.opcion_seleccionada,
          });
        });
      const salida = {
        colaborador: f.colaborador.correo,
        seudonimo: f.colaborador.seudonimo,
        tipo_vinculacion: f.usuarioFs?.tipo_vinculacion,
        consentimiento: f.usuarioFs?.consentimiento,
        estado: f.estado.texto,
        exportado: new Date().toISOString(),
        documentos: {
          "Consentimiento Informado": f.usuarioFs?.consentimiento,
          ...Object.fromEntries(INSTRUMENTOS.map((i) => [i, porInstrumento[i] || []])),
        },
      };
      const blob = new Blob([JSON.stringify(salida, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${f.colaborador.correo.replace(/[@.]/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="app">
      <div className="topbar">
        <span className="marca">Háptica · Panel administrativo</span>
        <div className="acciones">
          {MODO_DEMO && <span className="chip-btn" style={{ cursor: "default" }}>🧪 Demo</span>}
          <button className="chip-btn" onClick={recargar}>Actualizar</button>
          <button className="chip-btn" onClick={() => cerrarSesion()}>Cerrar sesión</button>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <h2>Seguimiento de la batería psicosocial</h2>
        <p className="sub">
          Universo: {COLABORADORES.length} colaboradores (TABLA_DATOS_BATERIA.xlsx) · 204 preguntas oficiales.
        </p>

        {error && <div className="aviso">{error}</div>}

        {noAsociados.length > 0 && (
          <div className="aviso">
            ⚠️ {noAsociados.length} usuario(s) en Firestore con un correo que NO está en el Excel de
            colaboradores: {noAsociados.map((u) => u.correo).join(", ")}. No se fusionaron
            automáticamente con nadie del roster; revisa manualmente si es una discrepancia de escritura.
          </div>
        )}

        <div className="resumen-cards" style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}>
          <ResumenCard label="Colaboradores" valor={resumen.total} />
          <ResumenCard label="🔴 No iniciado" valor={resumen.noIniciado} />
          <ResumenCard label="🔴 En curso (≤50%)" valor={resumen.rojo} />
          <ResumenCard label="🟡 En curso (>50%)" valor={resumen.amarillo} />
          <ResumenCard label="🟢 Completado" valor={resumen.verde} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <input
            className="campo"
            style={{ maxWidth: 280 }}
            placeholder="Buscar por nombre, seudónimo o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="campo" style={{ maxWidth: 220 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="rojo">🔴 Rojo (incl. no iniciado)</option>
            <option value="amarillo">🟡 Amarillo</option>
            <option value="verde">🟢 Verde</option>
          </select>
        </div>

        {cargando ? (
          <p><span className="spinner" /> Cargando…</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  {INSTRUMENTOS.map((i) => (
                    <th key={i}>{INSTRUMENTOS_CORTO[i]}</th>
                  ))}
                  <th>Avance total</th>
                  <th>Estado</th>
                  <th>Última actividad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filasFiltradas.map((f) => (
                  <tr key={f.colaborador.correo}>
                    <td>
                      <strong>{f.colaborador.seudonimo}</strong>
                      <div className="sub" style={{ fontSize: "0.75rem" }}>{f.colaborador.correo}</div>
                    </td>
                    {INSTRUMENTOS.map((i) => {
                      const { respondidas, total } = f.porInstrumento[i];
                      const s = f.iniciado ? limiteSemaforo(respondidas, total) : { icono: "🔴" };
                      return (
                        <td key={i} style={{ whiteSpace: "nowrap" }}>
                          {s.icono} {respondidas}/{total}
                        </td>
                      );
                    })}
                    <td style={{ whiteSpace: "nowrap" }}>
                      {f.respondidasTotal}/{TOTAL_PREGUNTAS}
                      {f.faltaLectura && <span title="No se pudieron leer las respuestas"> ⚠️</span>}
                    </td>
                    <td>
                      <span className={`badge ${f.estado.color === "verde" ? "completado" : f.bloqueadoTecnico ? "bloqueado" : "activo"}`}>
                        {f.estado.icono} {f.estado.texto}
                      </span>
                    </td>
                    <td>{fecha(f.ultimaActividad)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="chip-btn" disabled={!f.iniciado} onClick={() => verDetalle(f)}>
                          Ver detalle
                        </button>
                        {f.bloqueadoTecnico && (
                          <button className="chip-btn" disabled={ocupado === f.uid} onClick={() => marcarResuelto(f.uid)}>
                            Marcar resuelto
                          </button>
                        )}
                        <button className="chip-btn" disabled={!f.iniciado || ocupado === f.uid} onClick={() => exportar(f)}>
                          Exportar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalle && (
        <DetalleColaborador
          fila={detalle}
          preguntasById={preguntasById}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  );
}

function ResumenCard({ label, valor }) {
  return (
    <div className="tarjeta" style={{ padding: "10px 16px", minWidth: 120 }}>
      <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{valor}</div>
      <div className="sub" style={{ fontSize: "0.8rem" }}>{label}</div>
    </div>
  );
}

function DetalleColaborador({ fila, preguntasById, onClose }) {
  const idsRespondidos = useMemo(() => new Set(fila.respuestas.map((r) => r.id)), [fila]);

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 860, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h2>{fila.colaborador.seudonimo} · {fila.colaborador.nombre}</h2>
        <p className="sub">
          {fila.colaborador.correo} · {fila.estado.icono} {fila.estado.texto} ·{" "}
          {fila.respondidasTotal}/{TOTAL_PREGUNTAS} respuestas registradas
        </p>

        <h3 style={{ marginTop: 16 }}>Por instrumento</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla">
            <thead>
              <tr><th>Instrumento</th><th>Avance</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {INSTRUMENTOS.map((i) => {
                const { respondidas, total } = fila.porInstrumento[i];
                const s = limiteSemaforo(respondidas, total);
                return (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>{respondidas}/{total}</td>
                    <td>{s.icono} {s.texto}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: 16 }}>Por bloque narrativo (15)</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla">
            <thead>
              <tr><th>Bloque</th><th>Avance</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {BLOQUES.map((b) => {
                const respondidas = b.ids.filter((id) => idsRespondidos.has(id)).length;
                const s = limiteSemaforo(respondidas, b.ids.length);
                return (
                  <tr key={b.llave}>
                    <td>{b.nombre}</td>
                    <td>{respondidas}/{b.ids.length}</td>
                    <td>{s.icono} {s.texto}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: 16 }}>Respuestas registradas</h3>
        {fila.respuestas.length === 0 ? (
          <p className="sub">Este participante aún no ha registrado respuestas.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla">
              <thead>
                <tr><th>#</th><th>Instrumento</th><th>Pregunta</th><th>Respuesta</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {fila.respuestas
                  .slice()
                  .sort((a, b) => (a.numero_oficial || 0) - (b.numero_oficial || 0))
                  .map((r) => {
                    const q = preguntasById[r.id];
                    return (
                      <tr key={r.id}>
                        <td>{r.numero_oficial}</td>
                        <td style={{ fontSize: "0.75rem" }}>{r.instrumento}</td>
                        <td>{q?.texto_exacto || r.id}</td>
                        <td><strong>{r.opcion_seleccionada}</strong></td>
                        <td style={{ fontSize: "0.75rem" }}>{fecha(r.fecha_hora)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        <div className="btn-fila">
          <button className="btn btn-secundario" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
