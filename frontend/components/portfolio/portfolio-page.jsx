"use client";

import SectionHeading from "@/components/portfolio/section-heading";
import AnimatedHeading from "@/components/ui/animated-heading";


import Section from "@/components/layout/section";
import Navbar from "@/components/navigation/navbar";
import StudioHero from "@/components/portfolio/hero-section";
import ProjectGallery from "@/components/portfolio/project-gallery";
import TeamGallery from "@/components/portfolio/team-gallery";
import Marquee from "@/components/ui/marquee";
import ContactForm from "@/components/forms/contact-form";
import Footer from "@/components/layout/footer";
import useAppearance from "@/hooks/use-appearance";
import { submitContactRequest } from "@/lib/contact-api";
import { TEAM, SITE_LINKS } from "@/lib/site-content";
import PublicCatalog from "@/components/portfolio/public-catalog";

export default function PortfolioPage() {
  const { theme, mode, setTheme, setMode } = useAppearance();
  return <>
    <a className="studio-skip-link" href="#contenido">Saltar al contenido</a>
    <Navbar items={SITE_LINKS} theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
    <main id="contenido" tabIndex={-1} className="quokka-portfolio">
      <StudioHero />
      <Section id="manifiesto" tabIndex={-1} surface="deep" className="menu-destination studio-section studio-manifesto">
        <div className="studio-shell">
          <p className="studio-eyebrow"><span>01</span> Nuestra manera de hacer</p>
          <div className="studio-manifesto-grid"><AnimatedHeading as="h2">La técnica<br />también tiene<br /><span className="word-wave">un lado salvaje.</span></AnimatedHeading><div className="studio-manifesto-copy"><p>Creemos en el encuentro entre la ingeniería y el pulso artístico. En las interfaces que se entienden, el código que tiene estructura y el movimiento que acompaña.</p><p>Somos cinco integrantes construyendo una misma experiencia. Cada uno aporta su mirada; el cuidado por los detalles es compartido.</p></div></div>
        </div>
      </Section>
      <Section id="equipo" tabIndex={-1} surface="page" className="menu-destination studio-section studio-team">
        <div className="studio-shell"><SectionHeading number="02" label="El colectivo" description="Cinco miradas distintas, una misma base. Girá las tarjetas para descubrir qué aporta cada persona.">Buenas ideas.<br />Mejor <span className="word-color">en</span> <span className="word-outline">equipo.</span></SectionHeading></div>
        <TeamGallery members={TEAM} />
      </Section>
      <Section id="servicios" tabIndex={-1} surface="card" className="menu-destination studio-section">
        <div className="studio-shell"><SectionHeading number="03" label="Lo que hacemos" description="Del primer boceto a la lógica que lo hace posible. Pensamos cada parte como un mismo sistema.">Damos forma<br /><span className="word-wave">a lo que imaginás.</span></SectionHeading>
          <PublicCatalog kind="servicios" />
        </div>
      </Section>
      <ProjectGallery />
      <Section id="stack-tech" tabIndex={-1} surface="page" className="menu-destination studio-section">
        <div className="studio-shell studio-stack-layout"><SectionHeading number="05" label="Las herramientas" description="El oficio también está en elegir con qué construir.">Nuestra caja<br />de <mark className="word-marker">herramientas.</mark></SectionHeading><PublicCatalog kind="tecnologias" /></div>
      </Section>
      <Section as="div" surface="primary" className="studio-marquee"><Marquee size="sm" speed={22} items={["Curiosidad", "Código compartido", "Diseño con intención", "Ideas en movimiento"]} label="El pulso de Quokka" /></Section>
      <Section id="contacto" tabIndex={-1} surface="card" className="menu-destination studio-section footer-predecessor">
        <div className="studio-shell studio-contact-layout"><div><p className="studio-eyebrow"><span>06</span> Empecemos por una idea</p><AnimatedHeading as="h2">Contanos<br /><span className="word-wave">qué te mueve.</span></AnimatedHeading><p className="studio-contact-copy">Una idea en una servilleta. Un desafío técnico. Algo que todavía no sabés cómo nombrar. Nos interesa escucharlo.</p></div><Section as="div" surface="page" className="studio-contact-form"><ContactForm onSubmitMessage={submitContactRequest} /></Section></div>
      </Section>
    </main>
    <Footer links={SITE_LINKS} homeHref="#inicio" teamHref="#equipo" />
  </>;
}
