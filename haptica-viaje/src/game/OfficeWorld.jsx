/**
 * OfficeWorld.jsx — WORLD + PLAYER (canvas 2D top-down).
 * Movimiento WASD / flechas / D-pad táctil. Colisión con muebles y bordes.
 * Detecta el objeto interactivo más cercano y avisa (prompt "Presiona E").
 * No contiene lógica de juego: al interactuar llama onInteract(id).
 */
import { useEffect, useRef, useState } from "react";
import { MUNDO as MUNDO_DEF, MUEBLES as MUEBLES_DEF } from "./officeData.js";

const R = 15; // radio del jugador
const VEL = 2.6; // velocidad px/frame
const RADIO_INTERACCION = 60;

function colisiona(px, py, rects) {
  for (const m of rects) {
    if (
      px + R > m.x && px - R < m.x + m.w &&
      py + R > m.y && py - R < m.y + m.h
    ) return true;
  }
  return false;
}

export default function OfficeWorld({
  objetos,
  onInteract,
  paused,
  misionTexto,
  mundo = MUNDO_DEF,
  muebles = MUEBLES_DEF,
  avatarGlyph = "🍊",
  playerStart = { x: 360, y: 360 },
}) {
  const canvasRef = useRef(null);
  const player = useRef({ x: playerStart.x, y: playerStart.y });
  const keys = useRef({});
  const touchDir = useRef({ x: 0, y: 0 });
  const objetosRef = useRef(objetos);
  const pausedRef = useRef(paused);
  const onInteractRef = useRef(onInteract);
  const cercaRef = useRef(null);
  const [cerca, setCerca] = useState(null);

  const tRef = useRef(0);
  const mundoRef = useRef(mundo);
  const mueblesRef = useRef(muebles);
  const avatarRef = useRef(avatarGlyph);
  const misionRef = useRef(misionTexto);
  objetosRef.current = objetos;
  pausedRef.current = paused;
  onInteractRef.current = onInteract;
  mundoRef.current = mundo;
  mueblesRef.current = muebles;
  avatarRef.current = avatarGlyph;
  misionRef.current = misionTexto;

  // Interactuar con el objeto cercano (usa refs para evitar closures obsoletos).
  function interactuar() {
    if (pausedRef.current) return;
    const c = cercaRef.current;
    if (c) onInteractRef.current(c.id);
  }

  useEffect(() => {
    function down(e) {
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (k === "e") {
        e.preventDefault();
        interactuar();
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    }
    function up(e) {
      keys.current[e.key.toLowerCase()] = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    function paso() {
      // --- update ---
      if (!pausedRef.current) {
        const k = keys.current;
        let dx = (k["a"] || k["arrowleft"] ? -1 : 0) + (k["d"] || k["arrowright"] ? 1 : 0);
        let dy = (k["w"] || k["arrowup"] ? -1 : 0) + (k["s"] || k["arrowdown"] ? 1 : 0);
        dx += touchDir.current.x;
        dy += touchDir.current.y;
        if (dx || dy) {
          const len = Math.hypot(dx, dy) || 1;
          const nx = player.current.x + (dx / len) * VEL;
          const ny = player.current.y + (dy / len) * VEL;
          const minX = R + 6, maxX = mundoRef.current.ancho - R - 6;
          const minY = R + 6, maxY = mundoRef.current.alto - R - 6;
          const cx = Math.max(minX, Math.min(maxX, nx));
          const cy = Math.max(minY, Math.min(maxY, ny));
          if (!colisiona(cx, player.current.y, mueblesRef.current)) player.current.x = cx;
          if (!colisiona(player.current.x, cy, mueblesRef.current)) player.current.y = cy;
        }
        // objeto más cercano interactuable
        let mejor = null, mejorD = RADIO_INTERACCION;
        for (const o of objetosRef.current) {
          if (o.visible === false) continue;
          const d = Math.hypot(o.x - player.current.x, o.y - player.current.y);
          if (d < mejorD) { mejorD = d; mejor = o; }
        }
        if ((mejor && mejor.id) !== (cercaRef.current && cercaRef.current.id)) {
          cercaRef.current = mejor;
          setCerca(mejor ? { id: mejor.id, nombre: mejor.nombre, locked: mejor.locked } : null);
        }
      }
      tRef.current += 1;
      dibujar(ctx);
      raf = requestAnimationFrame(paso);
    }
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, []);

  function dibujar(ctx) {
    const mundo = mundoRef.current;
    const muebles = mueblesRef.current;
    // piso
    ctx.fillStyle = mundo.piso;
    ctx.fillRect(0, 0, mundo.ancho, mundo.alto);
    // borde/pared
    ctx.lineWidth = 12;
    ctx.strokeStyle = mundo.borde;
    ctx.strokeRect(6, 6, mundo.ancho - 12, mundo.alto - 12);

    // muebles (esquinas cuadradas, sin redondeo — identidad de marca)
    for (const m of muebles) {
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font = "12px \"Gotham\", \"Montserrat\", \"Helvetica Neue\", Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(m.label, m.x + m.w / 2, m.y + m.h / 2 + 4);
    }

    // objetos
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const o of objetosRef.current) {
      if (o.visible === false) continue;
      const resaltar = cercaRef.current && cercaRef.current.id === o.id;
      // pequeño vaivén para NPCs "vivos" (Lorenzo/Lila)
      const ox = o.wander ? Math.sin(tRef.current / 22 + o.x) * 7 : 0;
      const oy = o.wander ? Math.cos(tRef.current / 30 + o.y) * 4 : 0;
      const dx = o.x + ox, dy = o.y + oy;
      // halo
      ctx.beginPath();
      ctx.arc(dx, dy, 20, 0, Math.PI * 2);
      ctx.fillStyle = resaltar ? "rgba(250,70,22,0.28)" : "rgba(255,255,255,0.55)";
      ctx.fill();
      ctx.font = "26px serif";
      ctx.fillText(o.emoji, dx, dy + 1);
      if (o.locked) {
        ctx.font = "14px serif";
        ctx.fillText("🔒", dx + 14, dy - 12);
      }
    }

    // jugador (Haptiqueño)
    ctx.beginPath();
    ctx.arc(player.current.x, player.current.y + 14, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fill();
    ctx.font = "30px serif";
    ctx.fillText(avatarRef.current, player.current.x, player.current.y);

    // prompt del objeto cercano
    if (cercaRef.current) {
      const o = cercaRef.current;
      const txt = "Presiona E · " + o.nombre;
      ctx.font = "bold 13px \"Gotham\", \"Montserrat\", \"Helvetica Neue\", Arial, sans-serif";
      const w = ctx.measureText(txt).width + 20;
      const bx = o.x, by = o.y - 34;
      ctx.fillStyle = "rgba(13,27,29,0.92)";
      ctx.fillRect(bx - w / 2, by - 14, w, 24);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(txt, bx, by - 1);
    }

    // etiqueta de misión (esquina)
    if (misionRef.current) {
      ctx.textAlign = "left";
      ctx.font = "bold 13px \"Gotham\", \"Montserrat\", \"Helvetica Neue\", Arial, sans-serif";
      ctx.fillStyle = "rgba(13,27,29,0.6)";
      ctx.fillText(misionRef.current, 18, 26);
      ctx.textAlign = "center";
    }
  }

  // D-pad táctil
  function setDir(x, y) { touchDir.current = { x, y }; }
  const dpad = (label, x, y) => (
    <button
      className="dpad-btn"
      onPointerDown={(e) => { e.preventDefault(); setDir(x, y); }}
      onPointerUp={() => setDir(0, 0)}
      onPointerLeave={() => setDir(0, 0)}
      onPointerCancel={() => setDir(0, 0)}
    >
      {label}
    </button>
  );

  return (
    <div className="mundo-wrap">
      <canvas
        ref={canvasRef}
        width={mundo.ancho}
        height={mundo.alto}
        className="mundo-canvas"
      />
      <div className="mundo-controles">
        <div className="dpad">
          <div />
          {dpad("▲", 0, -1)}
          <div />
          {dpad("◀", -1, 0)}
          <button
            className="dpad-btn accion"
            disabled={!cerca}
            onClick={interactuar}
          >
            {cerca ? "E" : "·"}
          </button>
          {dpad("▶", 1, 0)}
          <div />
          {dpad("▼", 0, 1)}
          <div />
        </div>
      </div>
      <p className="mundo-ayuda">
        Muévete con <strong>WASD</strong> o las flechas. Acércate a un objeto y presiona
        <strong> E</strong> (o el botón central) para interactuar.
      </p>
    </div>
  );
}
