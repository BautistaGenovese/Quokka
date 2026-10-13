"use client";

import { useRef, useSyncExternalStore } from "react";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";

gsap.registerPlugin(MorphSVGPlugin);

// Dos trazos por icono, en el mismo viewBox. GSAP interpola sus curvas,
// no reemplaza un SVG por otro ni modifica el árbol de React.
const SHAPES = {
  person: ["M16 7a4 4 0 1 1-8 0a4 4 0 1 1 8 0Z", "M5 21v-2a7 7 0 0 1 14 0v2"],
  mail: ["M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M3 7l9 6l9-6"],
  message: ["M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-5 3V5a2 2 0 0 1 2-2Z", "M7 9h10M7 13h6"],
  text: ["M4 5h16M4 12h16", "M4 19h10"],
  // Silueta más ancha y regular a 45°: punta definida, cuerpo paralelo y
  // remate redondeado. Las dos separaciones coinciden con sus esquinas.
  pencil: ["M16 4a2.828 2.828 0 0 1 4 4L9 19l-6 2 2-6L16 4Z", "M14 6l4 4M5 15l4 4"],
  error: ["M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0Z", "M9 9l6 6M15 9l-6 6"],
};
const subscribe = callback => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const snapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverSnapshot = () => false;

/** Iconos compartidos por Input y Textarea.
 * Error tiene prioridad sobre foco. overwrite permite interrumpir un morph
 * desde su forma actual si el usuario cambia de estado rápidamente.
 */
export default function FieldIcon({ kind = "text", state = "idle" }) {
  const svg = useRef(null);
  const reduced = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const resting = SHAPES[kind] ?? SHAPES.person;
  const target = state === "error" ? SHAPES.error : state === "focus" ? SHAPES.pencil : resting;
  useGSAP(() => {
    const paths = svg.current.querySelectorAll("path");
    paths.forEach((path, index) => {
      if (reduced) {
        gsap.killTweensOf(path);
        gsap.set(path, { attr: { d: target[index] } });
      } else {
        gsap.to(path, {
          morphSVG: { shape: target[index], shapeIndex: "auto" },
          ...MOTION.change, overwrite: true,
        });
      }
    });
    // Sin revertOnUpdate: cada cambio parte de la geometría visible.
    // useGSAP conserva el contexto y revierte todo al desmontar.
  }, { scope: svg, dependencies: [kind, state, reduced] });
  return <svg ref={svg} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon-state={state}>
    {resting.map((d, index) => <path key={index} d={d} />)}
  </svg>;
}
