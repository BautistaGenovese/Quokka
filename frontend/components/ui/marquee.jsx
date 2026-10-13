"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import Button from "./button";
import useMarqueeMotion from "@/hooks/use-marquee-motion";

/** Separador de texto, independiente de la página y del tema.
 * items: strings; speed: px/segundo; direction: left/right al bajar el scroll;
 * followScroll: invierte al subir; pauseOnHover: pausa con mouse (no con tacto).
 * size: sm (compacto), md (habitual) o lg (protagonista); todos son responsive.
 * Hereda Section. Las copias son decorativas: lectores de pantalla reciben
 * el contenido una sola vez. Movimiento reducido muestra texto estático.
 */
export default function Marquee({ items = [], size = "md", speed = 70, direction = "left", followScroll = true,
  pauseOnHover = true, showControls = false, label = "Ideas en movimiento", className = "" }) {
  const texts = items.filter(item => typeof item === "string" && item.trim());
  // Una lista vacía no monta observadores ni un control de pausa sin contenido.
  return texts.length ? <MarqueeContent texts={texts}
    size={["sm", "md", "lg"].includes(size) ? size : "md"}
    speed={Number.isFinite(speed) ? Math.max(0, speed) : 70} direction={direction === "right" ? "right" : "left"}
    followScroll={followScroll} pauseOnHover={pauseOnHover} showControls={showControls} label={label} className={className} /> : null;
}

function MarqueeContent({ texts, size, speed, direction, followScroll, pauseOnHover, showControls, label, className }) {
  const root = useRef(null), track = useRef(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [copies, setCopies] = useState(2);
  useMarqueeMotion(root, track, { speed, direction, followScroll, onCopiesChange: setCopies, paused: paused || (pauseOnHover && hovered) });
  return <div ref={root} role="region" aria-label={label} data-size={size} className={`quokka-marquee ${className}`}>
    <div className={showControls ? "quokka-marquee-controls" : "quokka-marquee-controls quokka-marquee-controls-hidden"}>
      {showControls && <span className="font-mono text-xs font-semibold uppercase tracking-widest">{label}</span>}
      <Button size="sm" variant="secondary" magnetic={false} aria-pressed={paused} disabled={speed === 0}
        onClick={() => setPaused(previous => !previous)} iconLeft={paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}>
        {paused ? "Reanudar" : "Pausar"}
      </Button>
    </div>
    <p className="quokka-marquee-summary">{texts.join(" · ")}</p>
    <div className="quokka-marquee-viewport" aria-hidden="true"
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}>
      <div ref={track} className="quokka-marquee-track">
        {Array.from({ length: copies }, (_, copy) => <div key={copy} className="quokka-marquee-group">
          {texts.map((text, index) => <span key={index} className="quokka-marquee-item">
            <span className={index % 2 ? "font-serif italic font-normal" : "font-body font-extrabold"}>{text}</span>
            <span className="quokka-marquee-separator">✳</span>
          </span>)}
        </div>)}
      </div>
    </div>
  </div>;
}
