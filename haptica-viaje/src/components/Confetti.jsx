/**
 * Confetti.jsx — celebración breve al completar una etapa. Solo decorativo.
 */
import { useMemo } from "react";

const COLORES = ["#FA4616", "#00BCA0", "#E5A000", "#FBE3B0", "#006663"];

export default function Confetti({ piezas = 28 }) {
  const trozos = useMemo(
    () =>
      Array.from({ length: piezas }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.4 + Math.random() * 1.6,
        color: COLORES[i % COLORES.length],
        giro: Math.random() * 360,
      })),
    [piezas]
  );

  return (
    <div className="confeti" aria-hidden="true">
      {trozos.map((t) => (
        <span
          key={t.id}
          className="confeti-trozo"
          style={{
            left: `${t.left}%`,
            background: t.color,
            animationDelay: `${t.delay}s`,
            animationDuration: `${t.dur}s`,
            transform: `rotate(${t.giro}deg)`,
          }}
        />
      ))}
    </div>
  );
}
