"use client";
import { useEffect } from "react";

/** La rueda vertical conserva el scroll de la página. El carrusel acepta
 * gestos horizontales o Shift + rueda, además del arrastre y sus controles. */
export default function useScrollCarousel(root, api, count) {
  useEffect(() => {
    const el = root.current;
    if (!el || count < 2) return;
    let distance = 0, previousTime = 0, previousStep = -Infinity;
    const reset = () => { distance = 0; previousTime = 0; previousStep = -Infinity; };
    const wheel = event => {
      // Conservar el zoom del navegador y los controles nativos anidados.
      if (event.ctrlKey || event.target.closest?.("input, textarea, select, [contenteditable=true]")) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!horizontal && !event.shiftKey) return;
      event.preventDefault();
      event.stopPropagation();
      const raw = horizontal ? event.deltaX : event.deltaY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1;
      const delta = raw * unit;
      const now = event.timeStamp;
      if (now - previousTime > 180 || delta * distance < 0) distance = 0;
      previousTime = now;
      distance += delta;
      if (Math.abs(distance) < 60 || now - previousStep < 240) return;
      if (distance > 0) api.current?.next();
      else api.current?.prev();
      previousStep = now;
      distance = 0;
    };
    // Capture evita que el manejador horizontal de la galería lo duplique.
    el.addEventListener("wheel", wheel, { passive: false, capture: true });
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("wheel", wheel, true);
      el.removeEventListener("pointerleave", reset);
    };
  }, [root, api, count]);
}
