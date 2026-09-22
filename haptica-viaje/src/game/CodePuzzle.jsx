/**
 * CodePuzzle.jsx — sistema REUTILIZABLE de acertijos con código numérico.
 * Reemplaza al antiguo MysteryLock y se usa en todos los misterios del juego.
 *
 * - Muestra la pregunta/instrucción y las pistas encontradas (sin revelar la
 *   respuesta: el jugador debe deducirla).
 * - Teclado de N dígitos (por defecto 3).
 * - Intentos ilimitados: nunca bloquea la experiencia.
 * - Tras varios fallos ofrece una pista adicional.
 */
import { useState } from "react";

export default function CodePuzzle({
  titulo = "El mensaje perdido",
  emoji = "🕵️",
  pregunta,
  pistas = [],
  faltan = 0,
  longitud = 3,
  pistaExtra,
  onProbar,
  onClose,
  textoFaltan = "Sigue explorando para encontrar las pistas que faltan.",
}) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [verPista, setVerPista] = useState(false);

  const ordenadas = [...pistas].sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0));

  function pulsar(d) {
    if (codigo.length >= longitud) return;
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
      setIntentos((n) => n + 1);
      setCodigo("");
    }
  }

  return (
    <div className="modal-fondo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{emoji} {titulo}</h2>

        <div className="pistas">
          <div className="pistas-titulo">Pistas encontradas</div>
          {ordenadas.length === 0 && <p className="sub">Aún no has encontrado pistas. Explora el lugar.</p>}
          {ordenadas.map((p, i) => (
            <div key={p.pos ?? i} className="pista">
              <span className="pista-num">{(p.pos ?? i) + 1}</span>
              <span>{p.texto}</span>
            </div>
          ))}
          {faltan > 0 && <p className="sub">{textoFaltan} (faltan {faltan})</p>}
        </div>

        {faltan === 0 ? (
          <>
            {pregunta && <div className="puzzle-pregunta">{pregunta}</div>}
            <div className="codigo-slots">
              {Array.from({ length: longitud }).map((_, i) => (
                <div key={i} className={`slot ${codigo[i] ? "lleno" : ""}`}>{codigo[i] || "•"}</div>
              ))}
            </div>
            {error && <p className="texto-error">Ese no es. Revisa las pistas e inténtalo otra vez.</p>}

            {intentos >= 2 && pistaExtra && (
              verPista ? (
                <div className="raw-hint">💡 {pistaExtra}</div>
              ) : (
                <button className="btn btn-secundario" onClick={() => setVerPista(true)}>
                  💡 ¿Necesitas una pista?
                </button>
              )
            )}

            <div className="keypad">
              {["1","2","3","4","5","6","7","8","9","borrar","0","abrir"].map((t) => {
                if (t === "borrar") return <button key={t} className="key" onClick={borrar}>⌫</button>;
                if (t === "abrir") return (
                  <button key={t} className="key key-ok" disabled={codigo.length < longitud} onClick={abrir}>✓</button>
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
