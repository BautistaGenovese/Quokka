"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";

/** Decoración independiente del control nativo: foco senoidal y error serrado.
 * La fase recorre TODO el perímetro, incluidas las esquinas, sin mover el texto.
 * Los estados se mezclan suavemente y el error tiene prioridad sobre el foco.
 */
export default function FieldBorder({ invalid, focused }) {
  const svg = useRef(null), path = useRef(null), animate = useRef(null);
  useGSAP((context, contextSafe) => {
    const frame = svg.current.parentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const progress = { focus: 0, error: 0 };
    let phase = 0, tween, stopPulse, pulseActive = false, perimeter = 0, points = [];
    let target = { invalid: false, focused: false }, visible = true, ticking = false;
    const render = () => {
      if (!points.length) return;
      // Un número entero de ondas evita una costura donde se cierra el SVG.
      const waves = Math.max(1, Math.round(perimeter / 48));
      const teeth = Math.max(1, Math.round(perimeter / 24));
      const d = points.map(({ x, y, nx, ny, distance }, index) => {
        const angle = distance * Math.PI * 2;
        const sine = Math.sin(angle * waves - phase);
        const tooth = 2 / Math.PI * Math.asin(Math.sin(angle * teeth - phase));
        const offset = sine * progress.focus * 2 + tooth * progress.error * 3.5;
        return `${index ? "L" : "M"}${(x + nx * offset).toFixed(2)},${(y + ny * offset).toFixed(2)}`;
      }).join("");
      path.current.setAttribute("d", `${d}Z`);
      svg.current.dataset.ready = "true";
    };
    const measure = () => {
      const width = frame.offsetWidth, height = frame.offsetHeight;
      svg.current.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const r = Math.min(15, height / 4), p = 1;
      const horizontal = width - 2 * p - 2 * r, vertical = height - 2 * p - 2 * r;
      const arc = Math.PI * r / 2;
      perimeter = 2 * horizontal + 2 * vertical + 4 * arc;
      // Posiciones y normales se calculan al redimensionar, no en cada frame.
      const segments = [
        { length: horizontal, sample: t => [p + r + horizontal * t, p, 0, -1] },
        { length: arc, cx: width - p - r, cy: p + r, angle: -Math.PI / 2 },
        { length: vertical, sample: t => [width - p, p + r + vertical * t, 1, 0] },
        { length: arc, cx: width - p - r, cy: height - p - r, angle: 0 },
        { length: horizontal, sample: t => [width - p - r - horizontal * t, height - p, 0, 1] },
        { length: arc, cx: p + r, cy: height - p - r, angle: Math.PI / 2 },
        { length: vertical, sample: t => [p, height - p - r - vertical * t, -1, 0] },
        { length: arc, cx: p + r, cy: p + r, angle: Math.PI },
      ];
      points = [];
      let distance = 0;
      for (const segment of segments) {
        const count = Math.max(1, Math.ceil(segment.length / 2));
        for (let i = 0; i < count; i++) {
          const t = i / count, angle = segment.angle + t * Math.PI / 2;
          const [x, y, nx, ny] = segment.sample ? segment.sample(t) :
            [segment.cx + r * Math.cos(angle), segment.cy + r * Math.sin(angle), Math.cos(angle), Math.sin(angle)];
          points.push({ x, y, nx, ny, distance: (distance + segment.length * t) / perimeter });
        }
        distance += segment.length;
      }
      render();
    };
    const tick = (time, delta) => {
      phase += Math.min(delta, 50) / 1000 * 2.2;
      render();
    };
    const syncTicker = () => {
      const run = !media.matches && visible && !document.hidden &&
        pulseActive;
      if (run && !ticking) gsap.ticker.add(tick);
      if (!run && ticking) gsap.ticker.remove(tick);
      ticking = Boolean(run);
    };
    const change = contextSafe(state => {
      target = state;
      tween?.kill();
      stopPulse?.kill();
      // Señalar el cambio sin movimiento permanente mientras se escribe.
      // Al terminar se conserva la forma de foco/error, solo se detiene la fase.
      pulseActive = !media.matches && (state.invalid || state.focused);
      if (pulseActive) stopPulse = gsap.delayedCall(MOTION.field.pulseDuration, () => {
        pulseActive = false;
        syncTicker();
      });
      tween = gsap.to(progress, {
        focus: state.focused && !state.invalid ? 1 : 0, error: state.invalid ? 1 : 0,
        duration: media.matches ? 0 : MOTION.field.duration,
        ease: MOTION.field.ease,
        onUpdate: render, onComplete: syncTicker,
      });
      syncTicker();
    });
    animate.current = change;
    const observer = new ResizeObserver(measure);
    observer.observe(frame); measure();
    // Pausamos fuera de pantalla, con la pestaña oculta o movimiento reducido.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; syncTicker();
    });
    intersection.observe(frame);
    const preference = () => change(target);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", syncTicker);
    return () => {
      animate.current = null;
      observer.disconnect(); intersection.disconnect(); tween?.kill(); stopPulse?.kill();
      gsap.ticker.remove(tick);
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", syncTicker);
    };
  }, { scope: svg });
  useEffect(() => { animate.current?.({ invalid, focused }); }, [invalid, focused]);
  return <svg ref={svg} className="quokka-field-border" aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <path ref={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}
