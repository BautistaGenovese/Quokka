"use client";

import { useEffect, useState } from "react";

/** Las geometrías se invalidan por tamaño; el scroll solo consulta la caché. */
export default function useActiveSection(items) {
  const [activeHref, setActiveHref] = useState(() => items.find(item => item.href.startsWith("#"))?.href);
  useEffect(() => {
    const anchors = items.filter(item => item.href.startsWith("#"));
    if (!anchors.length) return;
    let frame = 0, dirty = true, positions = [], maxScroll = 0, threshold = 106;
    let previous;
    const header = document.querySelector(".site-navbar");
    const update = () => {
      frame = 0;
      if (dirty) {
        dirty = false;
        positions = anchors.flatMap(item => {
          const target = document.getElementById(item.href.slice(1));
          return target ? [{ href: item.href, top: target.getBoundingClientRect().top + scrollY }] : [];
        });
        threshold = (header?.getBoundingClientRect().height ?? 82) + 24;
        maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      }
      let current = positions[0]?.href;
      for (const item of positions) if (item.top <= scrollY + threshold) current = item.href;
      if (scrollY > 0 && scrollY >= maxScroll - 2) current = positions.at(-1)?.href;
      if (current !== previous) { previous = current; setActiveHref(current); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const invalidate = () => { dirty = true; schedule(); };
    const observer = new ResizeObserver(invalidate);
    observer.observe(document.body);
    if (header) observer.observe(header);
    for (const item of anchors) {
      const target = document.getElementById(item.href.slice(1));
      if (target) observer.observe(target);
    }
    invalidate();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
    };
  }, [items]);
  return activeHref;
}
