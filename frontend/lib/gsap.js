"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Punto común de registro. No modificar defaults globales: cada componente
// conserva el control de sus tiempos y limpia su propio contexto.
gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin);

export { gsap, useGSAP, ScrollTrigger };

// Vocabulario común, en segundos. Un preset describe una interacción, no
// un componente completo. No aplicar defaults globales ni animar colores aquí.
export const MOTION = {
  response: { duration: 0.24, ease: "power2.out" },
  change: { duration: 0.36, ease: "power2.inOut" },
  enter: { duration: 0.55, ease: "power3.out" },
  exit: { duration: 0.18, ease: "power2.in" },
  pull: { duration: 0.35, ease: "power3.out" },
  release: { duration: 0.7, ease: "elastic.out(1, 0.4)" },
  press: { scale: 0.96, duration: 0.08, ease: "power2.out" },
  unpress: { scale: 1, duration: 0.2, ease: "back.out(1.4)" },
  follower: { duration: 0.22, ease: "power3.out", radius: 9, expandedRatio: 0.85 },
  panel: {
    enter: { duration: 0.65, ease: "power3.out", stagger: 0.075 },
    fall: { delay: 0.08, duration: 0.42, ease: "power2.in", stagger: 0.035 },
    labels: { duration: 0.7, ease: "expo.out", stagger: 0.07 },
    rotations: [9, -12, 7], clearance: 40,
  },
  card: { duration: 0.35, ease: "power3.out", subtle: 4, expressive: 8 },
  text: { duration: 0.9, ease: "none", dotInterval: 0.5 },
  field: { duration: 0.36, ease: "power2.inOut", pulseDuration: 1.2 },
  options: {
    panel: { duration: 0.65, ease: "back.out(1.4)", easeReverse: "power3.out" },
    item: { duration: 0.35, ease: "back.out(1.4)", easeReverse: "power2.out" },
    reverseSpeed: 2,
  },
  section: { duration: 0.9 },
};

// La página elige protagonismo. strength/maxRotation siguen disponibles
// como ajuste explícito y magnetic=false siempre anula la atracción.
export const BUTTON_MOTION = {
  subtle: { strength: 0.12, maxRotation: 2, labelX: 3, labelY: 2,
    release: { duration: 0.45, ease: "back.out(1.2)" } },
  expressive: { strength: 0.28, maxRotation: 7, labelX: 7, labelY: 4,
    release: MOTION.release },
};
