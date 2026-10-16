"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION } from "@/lib/gsap";

/** Un único desplazamiento para copias idénticas. Al envolver la posición
 * por el ancho de una copia no hay un principio/final visible, tampoco cuando
 * se invierte la dirección. React nunca se actualiza por frame.
 */
export default function useMarqueeMotion(rootRef, trackRef, { speed, direction, followScroll, paused, onCopiesChange }) {
  const controls = useRef(null);
  useGSAP((context, contextSafe) => {
    const element = rootRef.current;
    const rail = trackRef.current;
    const groups = [...rail.children];
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const baseDirection = direction === "right" ? -1 : 1;
    const velocity = { value: baseDirection };
    const setX = gsap.quickSetter(rail, "x", "px");
    let width = 0, offset = 0, visible = false, ticking = false;
    let stopped = paused, alive = true, turn, lastDirection = baseDirection;
    gsap.set(rail, { x: 0 });

    const measure = () => {
      if (!alive) return;
      const progress = width ? offset / width : 0;
      // Medir el contenido real: estirar el grupo con minWidth creaba aire
      // vacío al final. Repetimos frases completas hasta cubrir la ventana
      // más una vuelta, incluso con una sola palabra en monitores anchos.
      width = groups[0].getBoundingClientRect().width;
      if (width) onCopiesChange(Math.max(2, Math.ceil(element.clientWidth / width) + 1));
      offset = progress * width;
      setX(-offset);
    };
    const tick = (time, delta) => {
      if (!width) return;
      // Limitar delta evita saltos al recuperar una pestaña o un frame lento.
      offset = ((offset + speed * velocity.value * Math.min(delta, 50) / 1000) % width + width) % width;
      setX(-offset);
    };
    const sync = () => {
      const run = visible && !stopped && speed > 0 && !media.matches && !document.hidden;
      if (run && !ticking) gsap.ticker.add(tick);
      if (!run && ticking) gsap.ticker.remove(tick);
      ticking = run;
      element.dataset.running = String(run);
    };
    const steer = contextSafe(scrollDirection => {
      const next = baseDirection * scrollDirection;
      if (next === lastDirection) return;
      lastDirection = next;
      element.dataset.direction = next > 0 ? "left" : "right";
      turn?.kill();
      // Atraviesa velocidad cero suavemente, en lugar de invertir de golpe.
      turn = gsap.to(velocity, { value: next, ...MOTION.enter, duration: media.matches ? 0 : MOTION.enter.duration });
    });
    element.dataset.direction = direction;
    controls.current = next => { stopped = next; sync(); };
    const resize = new ResizeObserver(measure);
    resize.observe(element); resize.observe(groups[0]);
    measure();
    document.fonts.ready.then(measure);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; sync();
    });
    intersection.observe(element);
    const scroll = followScroll ? ScrollTrigger.create({
      trigger: element, start: "top bottom", end: "bottom top",
      onUpdate: self => steer(self.direction),
      onEnter: self => steer(self.direction), onEnterBack: self => steer(self.direction),
    }) : null;
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      alive = false; controls.current = null;
      gsap.ticker.remove(tick); turn?.kill(); scroll?.kill();
      resize.disconnect(); intersection.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, { scope: rootRef, dependencies: [speed, direction, followScroll, onCopiesChange], revertOnUpdate: true });
  // Pausar/reanudar no reconstruye el loop ni pierde su posición.
  useEffect(() => { controls.current?.(paused); }, [paused]);
}
