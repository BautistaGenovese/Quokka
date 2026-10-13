"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/section";
import Navbar from "@/components/navbar";
import Button from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import TeamCard from "@/components/cards/team-card";
import SkillCard from "@/components/cards/skill-card";
import DemoCard from "@/components/cards/demo-card";
import DemoPreview from "@/components/cards/demo-preview";
import CardSlider from "@/components/ui/card-slider";
import Marquee from "@/components/ui/marquee";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import useAppearance from "@/hooks/use-appearance";
import { TEAM, SITE_LINKS, SERVICES, TECHNOLOGIES, PROJECTS } from "@/lib/site-content";

/** Nueva página de pruebas del portfolio: contenido separado del layout,
 * componentes compartidos y controles de simulación expresamente señalados.
 * Timeline, métricas y administración se incorporarán con sus componentes. */
export default function PortfolioPreview() {
  const { theme, mode, setTheme, setMode } = useAppearance();
  const navbar = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  return <>
    <Navbar ref={navbar} items={SITE_LINKS} theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
    <main>
      <Section id="inicio" tabIndex={-1} surface="deep" className="menu-destination px-gutter py-section">
        <Reveal className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-7">
            <p className="font-mono text-sm font-semibold uppercase tracking-widest">Quokka Studio · Lenguajes IV · 2026</p>
            <h1 className="font-body text-title font-extrabold leading-none">Cinco <span className="font-serif italic">mentes,</span><br />un estudio <span className="font-serif italic">fullstack.</span></h1>
            <p className="max-w-xl font-body text-lead">Combinamos desarrollo backend, diseño de interfaces y animaciones con GSAP para construir experiencias digitales con personalidad.</p>
            <div className="flex flex-wrap gap-4"><Button href="#proyectos" motion="expressive">Ver proyectos</Button><Button href="#contacto" variant="secondary" magnetic={false}>Iniciar proyecto</Button></div>
            <p className="font-mono text-xs">Página de pruebas del portfolio · <Link href="/componentes" className="underline underline-offset-4">Laboratorio de componentes</Link></p>
          </div>
          <Image src="/quokka-hero.webp" alt="Quokka, mascota del equipo" width={340} height={701} sizes="(max-width: 1024px) 50vw, 340px" priority className="mx-auto h-auto max-h-80 w-auto max-w-full object-contain sm:max-h-96" />
        </Reveal>
      </Section>
      <Section id="manifiesto" tabIndex={-1} surface="card" className="menu-destination px-gutter py-section">
        <Reveal className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2"><h2 className="font-body text-4xl font-extrabold">Ingeniería con <span className="font-serif italic">pulso artístico.</span></h2><div className="space-y-5 font-body text-lg"><p>Creemos que una experiencia memorable nace del equilibrio entre código estructurado y diseño de movimiento.</p><p>Somos cinco integrantes que compartimos una misma base de componentes, colores y criterios de interacción. Cada animación acompaña al contenido y cada módulo tiene una responsabilidad clara.</p></div></Reveal>
      </Section>
      <Section id="equipo" tabIndex={-1} surface="page" className="menu-destination px-gutter py-section">
        <div className="mx-auto max-w-6xl space-y-10">
          <Reveal><p className="mb-3 font-mono text-xs uppercase tracking-widest">El colectivo</p><h2 className="font-body text-4xl font-extrabold">Cinco personas, una misma base.</h2><p className="mt-4 max-w-2xl font-body text-lg">Nuestro reparto de trabajo para el proyecto de Lenguajes IV.</p></Reveal>
          <div className="space-y-6">{TEAM.map(member => <TeamCard key={member.name} {...member} surface="card" />)}</div>
        </div>
      </Section>
      <Section id="servicios" tabIndex={-1} surface="muted" className="menu-destination px-gutter py-section">
        <div className="mx-auto max-w-6xl space-y-10"><Reveal><h2 className="font-body text-4xl font-extrabold">Servicios & alcance.</h2><p className="mt-4 max-w-2xl font-body text-lg">Los frentes de desarrollo que reúne Quokka: interfaces, servidor y movimiento.</p></Reveal><div className="grid items-start gap-6 lg:grid-cols-3">{SERVICES.map(service => <SkillCard key={service.title} {...service} eyebrow="Servicio" surface="card" />)}</div></div>
      </Section>
      <Section id="stack-tech" tabIndex={-1} surface="card" className="menu-destination px-gutter py-section">
        <div className="mx-auto max-w-6xl space-y-10"><Reveal><h2 className="font-body text-4xl font-extrabold">Nuestro stack.</h2><p className="mt-4 max-w-2xl font-body text-lg">Las herramientas presentes en el entorno actual del proyecto.</p></Reveal><div className="grid items-start gap-6 md:grid-cols-2">{TECHNOLOGIES.map(technology => <SkillCard key={technology.title} {...technology} eyebrow="Tecnología" surface="page" />)}</div></div>
      </Section>
      <Section id="proyectos" tabIndex={-1} surface="deep" className="menu-destination py-section">
        <Reveal className="mx-auto mb-10 max-w-6xl px-gutter"><h2 className="font-body text-4xl font-extrabold">Proyectos con acceso protegido.</h2><p className="mt-4 max-w-2xl font-body text-lg">Las cuatro propuestas del prototipo, todavía en desarrollo. Las demos requerirán una cuenta cuando se integre la autenticación.</p></Reveal>
        <CardSlider label="Propuestas de proyectos de Quokka" className="demo-showcase">
          {PROJECTS.map(project => <DemoCard key={project.id} title={project.title} description={project.description} locked={!unlocked}
            preview={<DemoPreview src={project.preview} alt={`Maqueta ilustrativa de ${project.title}; demo en desarrollo`} />} />)}
        </CardSlider>
        <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3 px-gutter text-center"><Button magnetic={false} aria-pressed={unlocked} onClick={() => setUnlocked(value => !value)}>{unlocked ? "Volver a vista bloqueada" : "Registrarse (prueba)"}</Button><p className="font-body text-sm" role="status">{unlocked ? "Vista registrada simulada. Las imágenes son maquetas; no se creó ninguna cuenta." : "Este control solo permite probar los estilos del acceso protegido."}</p></div>
      </Section>
      <Section as="div" surface="secondary"><Marquee size="sm" speed={32} items={["React", "Node.js", "GSAP", "Código compartido", "Diseño con intención"]} label="Quokka en movimiento" /></Section>
      <Section id="contacto" tabIndex={-1} surface="card" className="menu-destination footer-predecessor px-gutter py-section">
        <div className="mx-auto max-w-3xl"><Reveal className="mb-10"><h2 className="font-body text-4xl font-extrabold">Hablemos de tu próximo desafío.</h2><p className="mt-4 font-body text-lg">Contanos tu idea, pedí una cotización o consultanos sobre arquitectura y desarrollo.</p></Reveal><ContactForm /></div>
      </Section>
    </main>
    <Footer navbarRef={navbar} links={SITE_LINKS} homeHref="#inicio" contactHref="#contacto" teamHref="#equipo" />
  </>;
}
