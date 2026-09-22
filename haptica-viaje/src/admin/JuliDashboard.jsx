/**
 * JuliDashboard.jsx — panel de Juli (Sección L + trazabilidad de respuestas).
 * - Tabla de colaboradores (estado/progreso).
 * - "Ver detalle": consulta las respuestas de UN participante (rol autorizado),
 *   identificando instrumento, número y texto oficial de la pregunta.
 * - "Marcar resuelto": limpia bloqueo técnico + cierra tickets.
 * - "Exportar": archivo con la estructura de los documentos oficiales.
 * La privacidad entre participantes la garantizan las reglas de Firestore
 * (solo el dueño o el rol "juli" pueden leer respuestas).
 */
import { useEffect, useMemo, useState } from "react";
import { cerrarSesion, MODO_DEMO } from "../state/authProvider.js";
import experiencia from "../data/experiencia.json";
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

function estadoDe(u) {
  if (u.progreso?.bloqueado_tecnico) return "bloqueado";
  return u.progreso?.estado || "activo";
}
function fecha(ts) {
  try {
    if (!ts) return "—";
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
    return d.toLocaleString("es-CO");
  } catch {
    return "—";
  }
}

export default function JuliDashboard({ user }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(null);
  const [detalle, setDetalle] = useState(null); // { usuario, respuestas }

  const preguntasById = useMemo(() => {
    const m = {};
    experiencia.preguntas.forEach((q) => (m[q.id] = q));
    return m;
  }, []);

  async function refrescar() {
    setCargando(true);
    setError("");
    try {
      setUsuarios(await listarUsuarios());
    } catch (e) {
      setError("No fue posible cargar los colaboradores. ¿Tienes el rol 'juli' activo?");
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    refrescar();
  }, []);

  async function marcarResuelto(uid) {
    setOcupado(uid);
    try {
      await resolverBloqueoTecnico(uid);
      await refrescar();
    } finally {
      setOcupado(null);
    }
  }

  async function verDetalle(u) {
    setOcupado(u.uid);
    try {
      const respuestas = await getRespuestasUsuario(u.uid);
      respuestas.sort((a, b) => (a.numero_oficial || 0) - (b.numero_oficial || 0));
      setDetalle({ usuario: u, respuestas });
    } catch (e) {
      setError("No fue posible consultar las respuestas.");
    } finally {
      setOcupado(null);
    }
  }

  async function exportar(u) {
    setOcupado(u.uid);
    try {
      const respuestas = await getRespuestasUsuario(u.uid);
      const porInstrumento = {};
      respuestas
        .sort((a, b) => (a.numero_oficial || 0) - (b.numero_oficial || 0))
        .forEach((r) => {
          (porInstrumento[r.instrumento] = porInstrumento[r.instrumento] || []).push({
            id_interno: r.id,
            numero_oficial: r.numero_oficial,
            opcion_seleccionada: r.opcion_seleccionada,
          });
        });
      const salida = {
        colaborador: u.correo,
        tipo_vinculacion: u.tipo_vinculacion,
        consentimiento: u.consentimiento,
        estado: estadoDe(u),
        exportado: new Date().toISOString(),
        documentos: {
          "Consentimiento Informado": u.consentimiento,
          ...Object.fromEntries(INSTRUMENTOS.map((i) => [i, porInstrumento[i] || []])),
        },
      };
      const blob = new Blob([JSON.stringify(salida, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${u.correo.replace(/[@.]/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("No fue posible exportar. Revisa permisos de Firestore.");
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="app">
      <div className="topbar">
        <span className="marca">Háptica · Panel de Juli</span>
        <div className="acciones">
          {MODO_DEMO && <span className="chip-btn" style={{ cursor: "default" }}>🧪 Demo</span>}
          <button className="chip-btn" onClick={refrescar}>Actualizar</button>
          <button className="chip-btn" onClick={() => cerrarSesion()}>Cerrar sesión</button>
        </div>
      </div>

      <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto", width: "100%" }}>
        <h2>Colaboradores</h2>
        {error && <div className="aviso">{error}</div>}
        {cargando ? (
          <p><span className="spinner" /> Cargando…</p>
        ) : usuarios.length === 0 ? (
          <p className="sub">Aún no hay colaboradores registrados.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Vinculación</th>
                  <th>Bloque actual</th>
                  <th>Estado</th>
                  <th>Última actividad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const est = estadoDe(u);
                  const badge =
                    est === "completado" ? "completado" : est === "bloqueado" ? "bloqueado" : "activo";
                  const llaves = u.progreso?.llaves_obtenidas?.length || 0;
                  return (
                    <tr key={u.uid}>
                      <td>{u.correo}</td>
                      <td>{u.tipo_vinculacion || "—"}</td>
                      <td>
                        {u.progreso?.bloque_actual || "—"}
                        <div className="sub" style={{ fontSize: "0.75rem" }}>{llaves}/15 llaves</div>
                      </td>
                      <td><span className={`badge ${badge}`}>{est}</span></td>
                      <td>{fecha(u.progreso?.fecha_fin || u.fecha_creacion)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="chip-btn" disabled={ocupado === u.uid} onClick={() => verDetalle(u)}>
                            Ver detalle
                          </button>
                          {est === "bloqueado" && (
                            <button className="chip-btn" disabled={ocupado === u.uid} onClick={() => marcarResuelto(u.uid)}>
                              Marcar resuelto
                            </button>
                          )}
                          <button className="chip-btn" disabled={ocupado === u.uid} onClick={() => exportar(u)}>
                            Exportar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalle && (
        <DetalleRespuestas
          usuario={detalle.usuario}
          respuestas={detalle.respuestas}
          preguntasById={preguntasById}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  );
}

function DetalleRespuestas({ usuario, respuestas, preguntasById, onClose }) {
  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h2>Respuestas · {usuario.correo}</h2>
        <p className="sub">
          {usuario.tipo_vinculacion || "—"} · {respuestas.length} respuestas registradas ·
          consentimiento: {usuario.consentimiento?.estado || "—"}
        </p>
        {respuestas.length === 0 ? (
          <p className="sub">Este participante aún no ha registrado respuestas.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Instrumento</th>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {respuestas.map((r) => {
                  const q = preguntasById[r.id];
                  return (
                    <tr key={r.id}>
                      <td>{r.numero_oficial}</td>
                      <td style={{ fontSize: "0.75rem" }}>{r.instrumento}</td>
                      <td>{q?.texto_exacto || r.id}</td>
                      <td><strong>{r.opcion_seleccionada}</strong></td>
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
