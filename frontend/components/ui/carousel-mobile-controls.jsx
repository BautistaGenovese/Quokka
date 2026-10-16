"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./button";
import "./carousel-mobile-controls.css";

export default function CarouselMobileControls({ label, controls, onPrevious, onNext }) {
  return <div className="carousel-mobile-controls" role="group" aria-label={`Controles de ${label}`}>
    <Button type="button" variant="secondary" magnetic={false} aria-label={`${label}: anterior`} aria-controls={controls} onClick={onPrevious}><ChevronLeft size={22} aria-hidden="true" /></Button>
    <Button type="button" variant="secondary" magnetic={false} aria-label={`${label}: siguiente`} aria-controls={controls} onClick={onNext}><ChevronRight size={22} aria-hidden="true" /></Button>
  </div>;
}
