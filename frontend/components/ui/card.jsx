"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import Section from "@/components/layout/section";
import { gsap, MOTION } from "@/lib/gsap";

/** Contenedor compartido: no conoce proyectos, personas ni habilidades.
 * La superficie reinicia los roles de color igual que Section. El marco
 * exterior permanece quieto para medir el puntero sin realimentar el giro.
 * No convertirlo en un botón: sus enlaces y acciones conservan su semántica.
 */
export default function Card({ children, surface = "card", tilt = true, motion = "subtle", className = "", ref, ...rest }) {
  const frameRef = useRef(null);
  const panelRef = useRef(null);
  // El consumidor recibe el article, sin sustituir el ref usado por el tilt.
  useImperativeHandle(ref, () => panelRef.current);

  useEffect(() => {
    if (!tilt) return;
    const frame = frameRef.current;
    const panel = panelRef.current;
    const media = gsap.matchMedia(frameRef);
    // Táctil y movimiento reducido conservan exactamente el mismo contenido.
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const options = { duration: MOTION.card.duration, ease: MOTION.card.ease };
      const angle = motion === "expressive" ? MOTION.card.expressive : MOTION.card.subtle;
      const xTo = gsap.quickTo(panel, "rotationX", options);
      const yTo = gsap.quickTo(panel, "rotationY", options);
      let box = null;
      const enter = () => { box = frame.getBoundingClientRect(); };
      const reset = () => { xTo(0); yTo(0); };
      const move = event => {
        // No inclinar durante una acción o el foco de teclado. Así la card
        // no compite con las animaciones propias de Button ni mueve el foco.
        if (event.pointerType !== "mouse" || event.buttons === 1 || frame.matches(":focus-within") ||
            event.target.closest("a, button, input, select, textarea")) return reset();
        if (!box) return;
        const x = gsap.utils.clamp(-1, 1, (event.clientX - box.left) / box.width * 2 - 1);
        const y = gsap.utils.clamp(-1, 1, (event.clientY - box.top) / box.height * 2 - 1);
        // Por defecto acompaña; reservar expressive para cards destacadas.
        xTo(-y * angle); yTo(x * angle);
      };
      frame.addEventListener("pointerenter", enter);
      frame.addEventListener("pointermove", move);
      frame.addEventListener("pointerleave", reset);
      frame.addEventListener("pointercancel", reset);
      frame.addEventListener("focusin", reset);
      return () => {
        frame.removeEventListener("pointerenter", enter);
        frame.removeEventListener("pointermove", move);
        frame.removeEventListener("pointerleave", reset);
        frame.removeEventListener("pointercancel", reset);
        frame.removeEventListener("focusin", reset);
      };
    });
    return () => media.revert();
  }, [tilt, motion]);

  return (
    <div ref={frameRef} className={`quokka-card-frame ${className}`}>
      {/* overflow-hidden aplanaría los descendientes 3D. Recortar solamente
          previews/retratos en sus propios contenedores, nunca este panel. */}
      <Section {...rest} ref={panelRef} as="article" surface={surface} data-tilt={tilt ? "true" : undefined}
        className="quokka-card flex h-full flex-col rounded-card border border-surface-line">
        {children}
      </Section>
    </div>
  );
}
