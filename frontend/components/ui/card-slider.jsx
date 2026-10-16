"use client";

import { Children, useId, useRef } from "react";
import CarouselMobileControls from "./carousel-mobile-controls";
import CardSwap, { Card } from "./CardSwap";
import useScrollCarousel from "@/hooks/use-scroll-carousel";

/** Adapta CardSwap de React Bits a las demos y controles de Quokka. */
export default function CardSlider({ children, label = "Demos", className = "" }) {
  const slides = Children.toArray(children);
  const collectionKey = JSON.stringify(slides.map((slide, index) => slide.key ?? index));
  return <SwapTrack key={collectionKey} slides={slides} label={label} className={className} />;
}

function SwapTrack({ slides, label, className }) {
  const root = useRef(null);
  const viewportId = useId();
  const swap = useRef(null);
  useScrollCarousel(root, swap, slides.length);

  if (!slides.length) return null;
  return (
    <div ref={root} className={`quokka-card-swap ${className}`}>
      <div id={viewportId} className="quokka-card-swap-viewport" data-cursor-quiet="true">
        <CardSwap ref={swap} width={608} height={380} label={label}>
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
      {slides.length > 1 && <CarouselMobileControls label={label} controls={viewportId} onPrevious={() => swap.current?.prev()} onNext={() => swap.current?.next()} />}
    </div>
  );
}
