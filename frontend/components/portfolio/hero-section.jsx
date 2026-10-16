"use client";

import AnimatedHeading from "@/components/ui/animated-heading";
import HalftoneReveal from "@/components/ui/HalftoneReveal";

import { useEffect, useRef } from "react";
import Image from "next/image";

import Section from "@/components/layout/section";
import Button from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";

export default function StudioHero() {
  const art = useRef(null);
  useEffect(() => {
    const media = gsap.matchMedia(art);
    // Un único gesto de llegada en la ilustración. El texto se puede leer
    // desde el primer paint; la interacción no depende de una entrada.
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(art.current, { y: 24, opacity: 0, duration: 0.7, ease: "power3.out" });
    });
    return () => media.revert();
  }, []);

  return <Section id="inicio" tabIndex={-1} surface="page" className="menu-destination studio-hero">
    <div className="studio-shell">
      <div className="studio-hero-meta"><p>Estudio digital independiente</p><span>Lenguajes IV · 2026</span></div>
      <div className="studio-hero-grid">
        <div className="studio-hero-copy">
          <p className="studio-eyebrow">Cinco mentes. Un mismo instinto.</p>
          <AnimatedHeading as="h1">Código con<br /><mark className="word-marker">instinto.</mark><span className="studio-title-dot" aria-hidden="true">✳</span></AnimatedHeading>
          <p className="studio-hero-lead">Diseñamos, desarrollamos y le damos movimiento a ideas que merecen salir de la pantalla.</p>
          <div className="studio-hero-actions"><Button href="#proyectos" motion="subtle" iconRight={<ArrowUpRight size={19} aria-hidden="true" />}>Explorar proyectos</Button><Button href="#contacto" variant="ghost" magnetic={false}>Conversemos</Button></div>
        </div>
        <div ref={art} className="studio-hero-art">
          <Section as="figure" surface="muted" className="studio-specimen">
            <div className="studio-specimen-top"><span>Quokka / 01</span><span aria-hidden="true">↗</span></div>
            <div className="studio-specimen-orbit" aria-hidden="true" />
            <div className="quokka-halftone">
              <Image src="/quokka-hero.webp" alt="Quokka, mascota del equipo" width={340} height={701} sizes="(max-width: 760px) 180px, 240px" priority />
              <HalftoneReveal src="/quokka-hero.webp" fit="contain" mode="color" shape="dot"
                cellSize={6} angle={45} revealRadius={80} paperColor="currentColor"
                reverse style={{ color: "var(--s-bg)" }} />
            </div>
            <figcaption>La curiosidad<br /><span className="word-color">es nuestro punto de partida.</span></figcaption>
          </Section>
          <span className="studio-art-note">Ideas salvajes.<br />Código bien pensado.</span>
        </div>
      </div>
      <div className="studio-hero-bottom"><a href="#manifiesto">Conocé el estudio <ArrowDownRight size={19} aria-hidden="true" /></a><p>Diseño · Desarrollo · Movimiento</p></div>
    </div>
  </Section>;
}
