"use client";

import { Children, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import Button from "./button";
import CarouselMobileControls from "./carousel-mobile-controls";
import CardSwap, { Card } from "./CardSwap";
import useScrollCarousel from "@/hooks/use-carrusel-scroll";

/** Adapta CardSwap de React Bits a las demos y controles de Quokka. */
export default function CardSlider({ children, details, label = "Demos", className = "" }) {
  const slides = Children.toArray(children);
  const collectionKey = JSON.stringify(slides.map((slide, index) => slide.key ?? index));
  return <SwapTrack key={collectionKey} slides={slides} details={details} label={label} className={className} />;
}

function SwapTrack({ slides, details, label, className }) {
  const root = useRef(null);
  const viewportId = useId();
  const swap = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reading, setReading] = useState(false);
  useScrollCarousel(root, swap, slides.length);

  if (!slides.length) return null;
  return (
    <div className={`quokka-card-swap ${details ? "quokka-card-swap-editorial" : ""} ${className}`}>
      <div ref={root} className="quokka-card-swap-track">
        <div id={viewportId} className="quokka-card-swap-viewport" data-cursor-quiet="true">
          <CardSwap ref={swap} width={608} height={380} label={label}
            autoplay={!paused && !reading} hoverSpread={details ? 0 : 0.12} onChange={setActive}>
            {slides.map((slide, index) => (
              <Card key={slide.key}>
                <div className="quokka-card-swap-content" role="group" aria-roledescription="diapositiva"
                  aria-label={`${index + 1} de ${slides.length}`}>
                  {slide}
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
      {details && <div className="demo-showcase-details"
        onPointerEnter={event => { if (event.pointerType === "mouse") setReading(true); }}
        onPointerLeave={() => setReading(false)} onFocusCapture={() => setPaused(true)}>
        <div className="demo-showcase-detail-stack" aria-live={paused || reading ? "polite" : "off"} aria-atomic="true">
          {details.map((detail, index) => <div key={slides[index]?.key ?? index}
            className="demo-showcase-detail" aria-hidden={index !== active} inert={index !== active}>
            <p className="demo-showcase-index">{String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</p>
            {detail}
          </div>)}
        </div>
      </div>}
      {slides.length > 1 && <div className="demo-showcase-controls">
        <CarouselMobileControls label={label} controls={viewportId} onPrevious={() => swap.current?.prev()} onNext={() => swap.current?.next()} />
        <Button type="button" variant="secondary" size="sm" magnetic={false}
          aria-controls={viewportId} aria-pressed={paused} onClick={() => setPaused(value => !value)}
          aria-label={paused ? "Reanudar cambio automático" : "Pausar cambio automático"}>
          <span className="inline-flex items-center gap-2">
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {paused ? "Reanudar" : "Pausar"}
          </span>
        </Button>
      </div>}
    </div>
  );
}
