"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";

/** Entrada única y discreta. Mueve este wrapper, nunca el transform del
 * Button/Card hijo. Sin JS o con movimiento reducido todo sigue visible. */
export default function Reveal({ children, className = "" }) {
  const root = useRef(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(root.current, { y: 18, opacity: 0, ...MOTION.enter,
        scrollTrigger: { trigger: root.current, start: "top 92%", once: true } });
    });
    return () => media.revert();
  }, { scope: root });
  return <div ref={root} className={className}>{children}</div>;
}
