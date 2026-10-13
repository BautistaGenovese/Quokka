"use client";

import { useRef } from "react";
import Section from "@/components/section";
import Button from "@/components/ui/button";
import { TeamAvatars, QuokkaPeek } from "@/components/brand-details";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import SectionTransition from "@/components/section-transition";
import { getSectionTarget, navigateToSection } from "@/lib/section-navigation";

const PORTFOLIO_LINKS = [
  { href: "#manifiesto", label: "Filosofía" },
  { href: "#equipo", label: "Equipo" },
  { href: "#servicios", label: "Servicios" },
  { href: "#stack-tech", label: "Stack" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#contacto", label: "Contacto" },
];
const REST_BEND = 0;
// En reposo el borde coincide con el límite del footer. Al animarse, el centro
// de la forma sube sobre la sección anterior y luego vuelve al borde plano.
// El cierre baja dentro del cuerpo para que no aparezca una costura de píxeles.
const EDGE_PATH = (bend = 0) => `M0 1000 Q500 ${1000 - 2 * bend} 1000 1000 V2020 H0Z`;
const REST_EDGE = EDGE_PATH(REST_BEND);

/** Cierre de Quokka. La página decide los destinos de navegación.
 * Inspirado en https://codepen.io/GreenSock/pen/bGeZvpO:
 * velocidad de entrada + retorno elástico de una curva SVG.
 */
export default function Footer({ links = PORTFOLIO_LINKS, homeHref = "#inicio", contactHref = "#contacto", teamHref = "#equipo", email, navbarRef }) {
  const root = useRef(null);
  const edge = useRef(null);
  const transition = useRef(null);
  const navigate = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || !root.current.contains(link) || link.target === "_blank" || link.hasAttribute("download")) return;
    const href = link.getAttribute("href");
    if (!getSectionTarget(href)) return;
    event.preventDefault();
    // Misma cubierta de dos colores, tiempos y navegación bajo cobertura.
    transition.current?.play(() => navigateToSection(href));
  };

  useGSAP((context, contextSafe) => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const curve = { bend: REST_BEND };
      let bounce;
      const draw = () => {
        edge.current?.setAttribute("d", EDGE_PATH(curve.bend));
      };
      const play = contextSafe(self => {
        bounce?.kill();
        const speed = gsap.utils.clamp(0, 1, Math.abs(self.getVelocity()) / 3500);
        bounce = gsap.fromTo(curve, { bend: 560 + speed * 140 }, {
          bend: REST_BEND,
          duration: 2.4 + speed * 0.4,
          ease: `elastic.out(1.15, ${0.3 - speed * 0.08})`,
          onUpdate: draw,
        });
      });
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        onEnter: play,
        onEnterBack: play,
      });
      const entrance = gsap.timeline({ scrollTrigger: { trigger: root.current.querySelector(".quokka-footer-top"), start: "top 90%", once: true } })
        .fromTo(".quokka-footer-letter", { yPercent: 105 }, { yPercent: 0, duration: 1, stagger: 0.065, ease: "expo.out" })
        .fromTo(".quokka-footer-peek", { yPercent: 110, rotation: 12 }, { yPercent: 0, rotation: -8, duration: 1, ease: "back.out(2)" }, 0.5);
      return () => {
        entrance.scrollTrigger?.kill();
        entrance.kill();
        trigger.kill();
        bounce?.kill();
        edge.current?.setAttribute("d", REST_EDGE);
      };
    });
    return () => media.revert();
  }, { scope: root });

  return (
    <Section as="footer" surface="deep" ref={root} onClick={navigate} className="quokka-footer" aria-label="Quokka Studio">
      <SectionTransition ref={transition} navbarRef={navbarRef} />
      <svg className="quokka-footer-edge" viewBox="0 0 1000 2000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path ref={edge} d={REST_EDGE} fill="var(--s-bg)" />
      </svg>
      <div className="quokka-footer-body px-gutter pb-6 sm:pb-8">
        <div className="mx-auto max-w-[1380px]">
          <div className="quokka-footer-top">
            <div className="quokka-footer-cta">
              <h2 className="font-display">¿Tenés un proyecto en mente?</h2>
              <div className="quokka-footer-actions"><Button href={contactHref} magnetic={false}>Escribinos</Button>{email && <a className="quokka-footer-mail font-mono" href={`mailto:${email}`}>{email}</a>}</div>

            </div>
            <div className="quokka-footer-columns">
              <nav aria-label="Navegar"><h3>Navegar</h3>{links.map(({ href, label }) => <a key={href} href={href} className="quokka-footer-link">{label}</a>)}</nav>
              <div><h3>Equipo</h3><TeamAvatars/><a href={teamHref} className="quokka-footer-link">Ver los perfiles</a></div>
              <nav aria-label="Redes"><h3>Seguinos</h3><a className="quokka-footer-link" href="https://github.com/BautistaGenovese/Quokka" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav>
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

