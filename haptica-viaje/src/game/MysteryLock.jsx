/**
 * MysteryLock.jsx — MYSTERY / PUZZLE. "El mensaje perdido".
 * Muestra las pistas encontradas (dígito + posición) y un teclado para abrir
 * la caja fuerte con el código de 3 dígitos deducido.
 */
import { useState } from "react";

export default function MysteryLock({ pistas, faltan, onProbar, onClose }) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState(false);

  const ordenadas = [...pistas].sort((a, b) => a.pos - b.pos);

  function pulsar(d) {
    if (codigo.length >= 3) return;
    setError(false);
    setCodigo(codigo + d);
  }
  function borrar() {
    setError(false);
    setCodigo(codigo.slice(0, -1));
  }
  function abrir() {
    const ok = onProbar(codigo);
    if (!ok) {
      setError(true);
      setCodigo("");
    }
  }

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>🕵️ El mensaje perdido</h2>

        <div className="pistas">
          <div className="pistas-titulo">Pistas encontradas</div>
          {pistas.length === 0 && <p className="sub">Aún no has encontrado pistas. Explora la oficina.</p>}
          {ordenadas.map((p) => (
            <div key={p.pos} className="pista">
              <span className="pista-num">Dígito {p.pos + 1}</span>
              <span>{p.texto}</span>
            </div>
          ))}
          {faltan > 0 && <p className="sub">Faltan {faltan} pista(s) por descubrir.</p>}
        </div>

        {faltan === 0 ? (
          <>
            <p className="sub">Une las pistas y abre la caja fuerte con el código de 3 dígitos.</p>
            <div className="codigo-slots">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`slot ${codigo[i] ? "lleno" : ""}`}>{codigo[i] || "•"}</div>
              ))}
            </div>
            {error && <p className="texto-error">Código incorrecto. Revisa las pistas.</p>}
            <div className="keypad">
              {["1","2","3","4","5","6","7","8","9","borrar","0","abrir"].map((t) => {
                if (t === "borrar") return <button key={t} className="key" onClick={borrar}>⌫</button>;
                if (t === "abrir") return (
                  <button key={t} className="key key-ok" disabled={codigo.length < 3} onClick={abrir}>✓</button>
                );
                return <button key={t} className="key" onClick={() => pulsar(t)}>{t}</button>;
              })}
            </div>
          </>
        ) : (
          <div className="btn-fila">
            <button className="btn btn-secundario" onClick={onClose}>Seguir explorando</button>
          </div>
        )}
      </div>
    </div>
  );
}
