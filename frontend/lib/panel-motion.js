"use client";

import { gsap, MOTION } from "./gsap";

// Solo movimiento y geometría compartidos. Cada panel conserva su estado,
// foco, contenido y navegación. Invocar desde un callback contextSafe.
export function preparePanelEntry(panels) {
  gsap.set(panels, { x: 0, y: 0, rotation: 0 });
  gsap.set(panels, { x: (_, panel) => innerWidth - panel.getBoundingClientRect().left + MOTION.panel.clearance });
}

export function enterPanels(panels) {
  return gsap.timeline().to(panels, { x: 0, y: 0, rotation: 0, ...MOTION.panel.enter });
}

export function dropPanels(panels, onComplete) {
  return gsap.to(panels, {
    y: (_, panel) => {
      const rect = panel.getBoundingClientRect();
      // La diagonal también cubre la extensión de las esquinas al rotar.
      return Number(gsap.getProperty(panel, "y")) + innerHeight - rect.top + Math.hypot(rect.width, rect.height) + MOTION.panel.clearance;
    },
    rotation: index => MOTION.panel.rotations[index % MOTION.panel.rotations.length],
    ...MOTION.panel.fall, onComplete,
  });
}
