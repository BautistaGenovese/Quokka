"use client";

import { gsap, useGSAP, MOTION } from "@/lib/gsap";

/** Un solo observador coordina barra, giro y visibilidad, sin estado React
 * por frame. Animar top evita alterar el contenedor de los dialogs fixed. */
export default function useNavbarMotion(headerRef, mascotRef, progressRef) {
  useGSAP((context, contextSafe) => {
    const header = headerRef.current, mascot = mascotRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const move = gsap.quickTo(header, "top", MOTION.response);
    const rotate = gsap.quickTo(mascot, "rotation", { duration: 0.5, ease: "power2.out" });
    const setProgress = gsap.quickSetter(progressRef.current, "scaleX");
    let previousY = Math.max(0, scrollY), offset = 0, frame = 0;
    const update = contextSafe(() => {
      frame = 0;
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const y = Math.max(0, Math.min(max, scrollY)), delta = y - previousY;
      const progress = max ? y / max : 0, height = header.offsetHeight;
      const focused = header.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
      const busy = header.querySelector("dialog[open]") || document.querySelector('.section-transition[data-active="true"]');
      setProgress(progress);
      if (reduced.matches) {
        move.tween.pause(); rotate.tween.pause();
        gsap.set(header, { top: 0 }); gsap.set(mascot, { rotation: 0 }); offset = 0;
      } else {
        rotate(progress * 360);
        // Subir revela inmediatamente; bajar acumula una retirada gradual.
        // Un panel abierto o el foco de teclado mantienen accesible la barra.
        if (busy || focused || y <= height || delta < -1) offset = 0;
        else if (delta > 0) offset = Math.min(height, offset + delta);
        move(-offset);
      }
      previousY = y;
    });
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const reveal = contextSafe(() => { offset = 0; move(0); schedule(); });
    const panels = new MutationObserver(schedule);
    // Las cubiertas del menú/footer viven en portals. Solo observar estos
    // dos atributos evita reaccionar a los estilos que GSAP escribe por frame.
    panels.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open", "data-active"] });
    const size = new ResizeObserver(schedule);
    size.observe(header); size.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    header.addEventListener("focusin", reveal);
    reduced.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame); panels.disconnect(); size.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      header.removeEventListener("focusin", reveal);
      reduced.removeEventListener("change", schedule);
    };
  }, { scope: headerRef });
}
