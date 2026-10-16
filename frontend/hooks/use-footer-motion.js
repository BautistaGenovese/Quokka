"use client";

import { useEffect } from "react";

const edgePath = bend => `M0 1000 Q500 ${1000 - 2 * bend} 1000 1000 V2020 H0Z`;
export const FOOTER_REST_EDGE = edgePath(0);

/** Observadores y animaciones locales. Sin contextos GSAP anidados/revert. */
export default function useFooterMotion(rootRef, edgeRef) {
  useEffect(() => {
    const root = rootRef.current, edge = edgeRef.current;
    const wordmark = root.querySelector(".quokka-footer-wordmark");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, entered = false, introduced = false;
    let animations = [];
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0;
      animations.forEach(animation => animation.cancel()); animations = [];
      edge.setAttribute("d", FOOTER_REST_EDGE);
    };
    const bounce = () => {
      cancelAnimationFrame(frame);
      let start;
      const tick = time => {
        start ??= time;
        const elapsed = (time - start) / 1000;
        if (elapsed >= 1.8) { frame = 0; edge.setAttribute("d", FOOTER_REST_EDGE); return; }
        const bend = 340 * Math.exp(-3.2 * elapsed) * Math.cos(11 * elapsed);
        edge.setAttribute("d", edgePath(bend));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === root) {
          if (entry.isIntersecting && !entered && !reduced.matches) bounce();
          entered = entry.isIntersecting;
          if (!entered) { cancelAnimationFrame(frame); frame = 0; edge.setAttribute("d", FOOTER_REST_EDGE); }
        } else if (entry.isIntersecting && !introduced) {
          introduced = true;
          observer.unobserve(wordmark);
          if (reduced.matches) continue;
          animations = [...root.querySelectorAll(".quokka-footer-letter")].map((letter, index) => letter.animate(
            [{ transform: "translateY(105%)" }, { transform: "translateY(0)" }],
            { duration: 800, delay: index * 45, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
          ));
          const peek = root.querySelector(".quokka-footer-peek");
          if (peek) animations.push(peek.animate(
            [{ transform: "translateY(110%) rotate(12deg)" }, { transform: "translateY(0) rotate(-8deg)" }],
            { duration: 800, delay: 200, easing: "cubic-bezier(.34,1.3,.64,1)", fill: "backwards" },
          ));
        }
      }
    });
    const preference = () => { if (reduced.matches) stop(); };
    const visibility = () => { if (document.hidden) stop(); };
    observer.observe(root); if (wordmark) observer.observe(wordmark);
    reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect(); stop();
      reduced.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [rootRef, edgeRef]);
}
