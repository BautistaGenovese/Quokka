"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MOTION } from "@/lib/gsap";

/** Reemplazo de texto independiente del transform magnético del contenido.
 * React mantiene el nombre accesible completo; GSAP solo modifica una copia
 * visual. Así un lector de pantalla nunca recibe palabras a medio escribir.
 */
export default function ButtonLabel({ children, loading, loadingLabel, resultLabel }) {
  // Acepta etiquetas antiguas con «…»; el ciclo controla sus propios puntos.
  const base = String(loadingLabel).replace(/[.\u2026]+\s*$/, "");
  const text = String(loading ? base : resultLabel ?? children);
  const [initialText] = useState(text);
  const visualRef = useRef(null);

  useEffect(() => {
    const visual = visualRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let tween;
    let dots;
    const stop = () => { tween?.kill(); dots?.kill(); };
    const finish = () => {
      visual.textContent = loading && preference.matches ? `${text}...` : text;
      if (loading && !preference.matches) {
        let count = 0;
        dots = gsap.timeline({ repeat: -1 }).to({}, {
          duration: MOTION.text.dotInterval,
          onComplete: () => {
            count = (count + 1) % 4;
            visual.textContent = text + ".".repeat(count);
          },
        });
      }
    };

    if (preference.matches || visual.textContent === text) finish();
    else {
      // TextPlugin trabaja con HTML. Escapar mediante textContent conserva
      // literalmente etiquetas personalizadas como «Enviar <consulta>».
      const escaped = document.createElement("span");
      escaped.textContent = text;
      tween = gsap.to(visual, {
        text: { value: escaped.innerHTML, padSpace: true },
        duration: MOTION.text.duration,
        ease: MOTION.text.ease,
        onComplete: finish,
      });
    }
    const onPreference = () => { stop(); finish(); };
    preference.addEventListener("change", onPreference);
    // Interrumpir desde el texto visible actual: una respuesta rápida no deja
    // una animación anterior escribiendo encima del nuevo estado.
    return () => {
      stop();
      preference.removeEventListener("change", onPreference);
    };
  }, [text, loading]);

  return (
    <span className="button-label inline-grid min-w-0 max-w-full [grid-template-columns:minmax(0,1fr)]">
      <span className="sr-only" aria-live="polite" aria-atomic="true">{loading ? `${base}...` : text}</span>
      {/* Las etiquetas reservan el tamaño mayor sin duplicar el nombre. Todas permiten saltos de línea, incluso con palabras largas. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{children}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{base}...</span>
      {resultLabel && <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{resultLabel}</span>}
      <span ref={visualRef} aria-hidden="true" className="col-start-1 row-start-1 whitespace-pre-wrap [overflow-wrap:anywhere]">{initialText}</span>
    </span>
  );
}
