/**
 * SceneVisual.jsx — placeholder visual de una escena (Sección N).
 * Color sólido del país + ícono SVG simple + label + escena.
 * Chile (bloques 8/9/10): huellas de Lorenzo y Lila; bloque 10: memoria de Botas.
 * En Fase 2, si placeholders.js define `imagen`, se muestra esa imagen en vez del ícono.
 */
import { getPlaceholder, BOTAS_COLOR, AVATAR_COLOR } from "../data/placeholders.js";

function Icono({ iconKey, stroke }) {
  const p = { fill: "none", stroke, strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round" };
  const shapes = {
    maleta: <><rect x="16" y="22" width="32" height="26" rx="3" {...p} /><path d="M26 22v-6h12v6" {...p} /></>,
    boleto: <><rect x="12" y="22" width="40" height="20" rx="3" {...p} /><path d="M32 22v20" {...p} strokeDasharray="3 4" /></>,
    canasta: <><path d="M16 26h32l-4 22H20z" {...p} /><path d="M22 26a10 10 0 0 1 20 0" {...p} /></>,
    banca: <><path d="M14 34h36M18 34v10M46 34v10" {...p} /><path d="M14 30h36" {...p} /></>,
    noria: <><circle cx="32" cy="32" r="16" {...p} /><path d="M32 16v32M16 32h32M20 20l24 24M44 20L20 44" {...p} /></>,
    taza: <><path d="M18 24h24v12a12 12 0 0 1-24 0z" {...p} /><path d="M42 26h6a5 5 0 0 1 0 10h-6" {...p} /></>,
    mapa: <><circle cx="32" cy="26" r="8" {...p} /><path d="M32 34c0 6-8 10-8 14h16c0-4-8-8-8-14z" {...p} /></>,
    puerta_casa: <><path d="M18 46V28l14-12 14 12v18z" {...p} /><rect x="28" y="34" width="8" height="12" {...p} /></>,
    huella: <><ellipse cx="32" cy="38" rx="9" ry="7" {...p} /><circle cx="22" cy="28" r="3" {...p} /><circle cx="32" cy="24" r="3" {...p} /><circle cx="42" cy="28" r="3" {...p} /></>,
    mesa: <><path d="M14 30h36M18 30v14M46 30v14" {...p} /></>,
    escritorio: <><path d="M14 28h36v6H14zM18 34v12M46 34v12M30 34v12" {...p} /></>,
    junta: <><ellipse cx="32" cy="32" rx="18" ry="10" {...p} /><circle cx="14" cy="32" r="2.5" {...p} /><circle cx="50" cy="32" r="2.5" {...p} /><circle cx="32" cy="20" r="2.5" {...p} /><circle cx="32" cy="44" r="2.5" {...p} /></>,
    pasillo: <><rect x="16" y="20" width="12" height="26" rx="2" {...p} /><rect x="36" y="20" width="12" height="26" rx="2" {...p} /></>,
    equipo: <><circle cx="22" cy="28" r="6" {...p} /><circle cx="42" cy="28" r="6" {...p} /><circle cx="32" cy="40" r="6" {...p} /></>,
    puerta_grande: <><rect x="20" y="14" width="24" height="34" rx="3" {...p} /><circle cx="38" cy="32" r="2.2" {...p} /></>,
    generico: <><circle cx="32" cy="32" r="14" {...p} /></>,
  };
  return (
    <svg width="72" height="72" viewBox="0 0 64 64" role="img" aria-hidden="true">
      {shapes[iconKey] || shapes.generico}
    </svg>
  );
}

export default function SceneVisual({ numeroBloque, pais, escenaNombre }) {
  const ph = getPlaceholder(numeroBloque, pais);
  const stroke = ph.textoColor;

  return (
    <div className="escena" style={{ background: ph.color, color: ph.textoColor }}>
      <span className="pais-chip">{pais}</span>
      {ph.imagen ? (
        <img src={ph.imagen} alt={ph.label} style={{ maxHeight: 96 }} />
      ) : (
        <Icono iconKey={ph.iconKey} stroke={stroke} />
      )}
      <span className="label-escena">{ph.label}</span>
      {escenaNombre && (
        <span className="sub" style={{ color: ph.textoColor, opacity: 0.9, fontSize: "0.85rem" }}>
          {escenaNombre}
        </span>
      )}

      <div className="escena-personajes">
        <span className="chip-persona" style={{ background: AVATAR_COLOR, color: "#FFFFFF" }}>
          🧍 Tú · avatar Naranja
        </span>
        {ph.personaje && (
          <span className="chip-persona" style={{ background: "rgba(255,255,255,0.85)", color: "#0D1B1D" }}>
            🧑 {ph.personaje.nombre} · {ph.personaje.rol}
          </span>
        )}
      </div>

      {ph.companeros && (
        <div className="companeros" style={{ color: ph.textoColor }}>
          {Array.from({ length: ph.companeros.huellas }).map((_, i) => (
            <span key={i} className="huella" aria-hidden="true">🐾</span>
          ))}
          <span>{ph.companeros.label}</span>
        </div>
      )}
      {ph.companeros?.memoriaBotas && (
        <div className="botas" style={{ color: BOTAS_COLOR }}>
          <span aria-hidden="true">✦</span>
          <span>En memoria de Botas</span>
        </div>
      )}
    </div>
  );
}
