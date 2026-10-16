"use client";
import { useEffect } from "react";

/** Sticky estable: el scroll actualiza progreso e ink con posiciones cacheadas. */
export default function useNavbarMotion(headerRef, progressRef) {
  useEffect(() => {
    const header = headerRef.current, progress = progressRef.current;
    const mascot = header.querySelector("[data-scroll-quokka]");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, sections = [], max = 1, headerHeight = 82;
    const update = () => {
      frame = 0;
      const y = Math.max(0, scrollY);
      progress.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (mascot) mascot.style.transform = reduced.matches ? "none" : `translateY(${Math.sin(y / 95) * 2.5}px) rotate(${Math.sin(y / 150) * 13}deg)`;
      const section = sections.findLast(item => item.top <= y + headerHeight / 2);
      if (section && header.dataset.surface !== section.surface) header.dataset.surface = section.surface;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      headerHeight = header.offsetHeight;
      max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      sections = [...document.querySelectorAll('main > [data-surface], footer[data-surface]')].map(el => ({ top: el.getBoundingClientRect().top + scrollY, surface: el.dataset.surface }));
      schedule();
    };
    const size = new ResizeObserver(measure);
    size.observe(document.body); size.observe(header);
    reduced.addEventListener("change", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => { reduced.removeEventListener("change", schedule); cancelAnimationFrame(frame); size.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure); };
  }, [headerRef, progressRef]);
}
