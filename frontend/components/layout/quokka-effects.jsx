"use client";
import { capturePointer, releasePointer } from "@/lib/pointer-capture";

import { useEffect, useRef, useState } from "react";
import { QuokkaLogo } from "./brand-details";
import SwipeToast from "@/components/ui/SwipeToast";
import { createQuokkaRain, MAX_QUOKKAS } from "@/lib/quokka-rain";
import "./quokka-effects.css";

export default function QuokkaEffects() {
  const sprites = useRef([]);
  const engine = useRef(null);
  const gesture = useRef(null);
  const sequence = useRef(0);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const rain = createQuokkaRain({ nodes: sprites.current, getViewport: () => ({ width: innerWidth, height: innerHeight }),
      requestFrame: requestAnimationFrame, cancelFrame: cancelAnimationFrame, now: () => performance.now() });
    engine.current = rain;
    const clear = () => { rain.clear(); gesture.current = null; };
    const launch = () => {
      const count = reduced.matches ? 0 : rain.launch();
      setToast({ id: ++sequence.current, reduced: !count });
    };
    const visibility = () => { if (document.hidden) clear(); };
    const preference = () => { if (reduced.matches) clear(); };
    const escape = event => { if (event.key === "Escape") clear(); };
    window.addEventListener("quokka:rain", launch);
    window.addEventListener("quokka:navigation-start", clear);
    window.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", preference);
    return () => {
      clear(); engine.current = null;
      window.removeEventListener("quokka:rain", launch);
      window.removeEventListener("quokka:navigation-start", clear);
      window.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", preference);
    };
  }, []);
  const release = event => {
    const grab = gesture.current;
    if (!grab || grab.pointer !== event.pointerId) return;
    gesture.current = null;
    engine.current?.release(grab.index, event.type !== "pointerup");
    releasePointer(event.currentTarget, event.pointerId);
  };
  return <>
    <div className="quokka-rain" aria-hidden="true"
      onPointerDown={event => {
        if (event.button !== 0 || gesture.current) return;
        const sprite = event.target.closest("[data-rain-index]");
        if (!sprite) return;
        const index = Number(sprite.dataset.rainIndex);
        if (!engine.current?.grab(index, event.clientX, event.clientY)) return;
        event.preventDefault();
        capturePointer(event.currentTarget, event.pointerId);
        gesture.current = { index, pointer: event.pointerId };
      }}
      onPointerMove={event => { const grab = gesture.current; if (grab?.pointer === event.pointerId) engine.current?.move(grab.index, event.clientX, event.clientY); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      {Array.from({ length: MAX_QUOKKAS }, (_, index) => <span key={index} ref={node => { sprites.current[index] = node; }} data-rain-index={index} className="quokka-rain-sprite"><QuokkaLogo /></span>)}
    </div>
    {toast && <SwipeToast key={toast.id} title={toast.reduced ? "Un saludo del colectivo" : "¡Lluvia de Quokkas!"}
      description={toast.reduced ? "Respetamos tu preferencia de movimiento reducido." : "Agarralos y revolealos. Pasan de largo; no se acumulan."}
      background="var(--palette-deep)" color="var(--theme-on-deep)" fuseColor="var(--palette-color-1)"
      duration={5000} closeButton actionLabel={toast.reduced ? "Listo" : "Detener lluvia"}
      onAction={() => engine.current?.clear()} onClose={() => setToast(null)} />}
  </>;
}
