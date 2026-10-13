"use client";

import { useEffect, useState } from "react";

/** Navbar y menú comparten el mismo criterio de sección activa, incluso
 * para destinos anidados y para el último bloque corto de una página. */
export default function useActiveSection(items) {
  const [activeHref, setActiveHref] = useState(items[0]?.href);
  useEffect(() => {
    let frame = 0;
    const anchors = items.filter(item => item.href.startsWith("#"));
    const update = () => {
      frame = 0;
      let current = anchors[0]?.href;
      for (const item of anchors) {
        const target = document.getElementById(item.href.slice(1));
        if (target && target.getBoundingClientRect().top <= 165) current = item.href;
      }
      if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) current = anchors.at(-1)?.href;
      setActiveHref(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);
  return activeHref;
}
