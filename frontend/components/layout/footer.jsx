"use client";

import { SITE_LINKS } from "@/lib/contenido-sitio";

import { useRef } from "react";
import Section from "@/components/layout/section";

import { TeamAvatars, QuokkaPeek } from "@/components/layout/detalles-marca";
import useFooterMotion, { FOOTER_REST_EDGE } from "@/hooks/use-movimiento-footer";

/** Navegación compacta, entrada del wordmark y curva con retorno elástico. */
export default function Footer({ links = SITE_LINKS, homeHref = "#inicio", teamHref = "#equipo" }) {
  const root = useRef(null);
  const edge = useRef(null);

  useFooterMotion(root, edge);

  return (
    <Section as="footer" surface="deep" ref={root} className="quokka-footer" aria-label="Quokka Studio">

      <svg className="quokka-footer-edge" viewBox="0 0 1000 2000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path ref={edge} d={FOOTER_REST_EDGE} fill="var(--s-bg)" />
      </svg>
      <div className="quokka-footer-body px-gutter pb-6 sm:pb-8">
        <div className="mx-auto max-w-[1380px]">
          <div className="quokka-footer-top">
            <nav aria-label="Navegar" className="quokka-footer-navigation"><h3>Navegar</h3><div className="quokka-footer-nav-grid">{links.map(({ href, label }) => <a key={href} href={href} className="quokka-footer-link">{label}</a>)}</div></nav>
            <div className="quokka-footer-columns">
              <div><h3>Equipo</h3><TeamAvatars/><a href={teamHref} className="quokka-footer-link">Ver los perfiles</a></div>
              <nav aria-label="Redes"><h3>Seguinos</h3><a className="quokka-footer-link" href="https://github.com/BautistaGenovese/Quokka" target="_blank" rel="noopener noreferrer">GitHub</a></nav>
            </div>
          </div>
          <div className="quokka-footer-wordmark">
            <a href={homeHref} aria-label="Quokka Studio, volver al inicio" className="quokka-footer-brand font-display">{"quokka.".split("").map((letter, index) => <span className="quokka-footer-letter" aria-hidden="true" key={index}>{letter}</span>)}</a>
            <QuokkaPeek className="quokka-footer-peek"/>
          </div>
          <div className="quokka-footer-bar font-mono"><p>TP Integrador · Lenguajes 4 · 2026</p></div>
        </div>
      </div>
    </Section>
  );
}

