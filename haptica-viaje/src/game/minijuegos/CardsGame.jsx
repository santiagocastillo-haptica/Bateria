/**
 * CardsGame.jsx — minijuego de cartas (memoria). Encuentra las parejas.
 * No es apuesta ni azar con dinero: es un juego de memoria para resolver una
 * parte del misterio.
 */
import { useEffect, useMemo, useState } from "react";

const SIMBOLOS = ["☕", "🎯", "🐸", "🃏"]; // 4 parejas = 8 cartas

function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CardsGame({ onGanar }) {
  const cartas = useMemo(() => barajar([...SIMBOLOS, ...SIMBOLOS]).map((s, i) => ({ id: i, s })), []);
  const [volteadas, setVolteadas] = useState([]); // ids visibles temporalmente
  const [encontradas, setEncontradas] = useState([]); // símbolos resueltos
  const [bloqueo, setBloqueo] = useState(false);

  const ganó = encontradas.length === SIMBOLOS.length;

  useEffect(() => {
    if (volteadas.length === 2) {
      setBloqueo(true);
      const [a, b] = volteadas;
      const match = cartas[a].s === cartas[b].s;
      const t = setTimeout(() => {
        if (match) setEncontradas((e) => [...e, cartas[a].s]);
        setVolteadas([]);
        setBloqueo(false);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [volteadas, cartas]);

  function tocar(i) {
    if (bloqueo || volteadas.includes(i) || encontradas.includes(cartas[i].s)) return;
    setVolteadas((v) => [...v, i]);
  }

  return (
    <div className="pantalla">
      <div className="tarjeta">
        <div style={{ fontSize: "2.6rem" }}>🃏</div>
        <h1>Cartas</h1>
        <p className="sub">Encuentra las parejas para descubrir la pista.</p>

        <div className="cartas-grid">
          {cartas.map((c, i) => {
            const visible = volteadas.includes(i) || encontradas.includes(c.s);
            return (
              <button key={c.id} className={`carta ${visible ? "abierta" : ""}`} onClick={() => tocar(i)}>
                {visible ? c.s : "❓"}
              </button>
            );
          })}
        </div>

        {ganó && (
          <>
            <div className="puerta-abierta">¡Encontraste todas las parejas!</div>
            <div className="btn-fila">
              <button className="btn btn-primario" onClick={onGanar}>Reclamar recompensa 🪙</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
