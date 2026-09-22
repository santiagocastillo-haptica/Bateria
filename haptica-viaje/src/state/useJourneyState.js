/**
 * useJourneyState.js — hook de navegación (Sección F/J).
 * - Genera los pasos desde experiencia.json (buildJourneySteps).
 * - Arranca en progreso.paso_actual (RESUME); nunca en el paso 0.
 * - Al avanzar, persiste el paso en Firestore (fuente de verdad del resume).
 */
import { useCallback, useMemo, useState } from "react";
import { buildJourneySteps } from "./buildJourneySteps.js";
import { setPaso } from "./firestore.js";

/** Nombre del bloque asociado a un paso, o undefined si el paso no es de bloque. */
export function nombreBloqueDePaso(step) {
  if (!step) return undefined;
  if (step.tipo === "pregunta") return step.bloque; // string
  if (step.tipo === "intro_bloque" || step.tipo === "llave") {
    return step.bloque?.bloque; // objeto bloque -> su nombre
  }
  return undefined;
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function useJourneyState(experiencia, { uid, initialIndex = 1 }) {
  const steps = useMemo(() => buildJourneySteps(experiencia), [experiencia]);
  // Nunca arrancar en 0 (login ya superado); resume al paso guardado.
  const [index, setIndex] = useState(() => clamp(initialIndex ?? 1, 1, steps.length - 1));

  const step = steps[index];

  const irA = useCallback(
    async (n) => {
      const destino = clamp(n, 0, steps.length - 1);
      setIndex(destino);
      if (uid) {
        try {
          await setPaso(uid, destino, nombreBloqueDePaso(steps[destino]));
        } catch (_) {
          // Firestore encola offline y sincroniza al reconectar (Sección J).
        }
      }
    },
    [steps, uid]
  );

  const avanzar = useCallback(() => irA(index + 1), [irA, index]);

  return { steps, index, step, total: steps.length, avanzar, irA, setIndex };
}
