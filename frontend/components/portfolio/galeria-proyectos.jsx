"use client";

import Section from "@/components/layout/section";
import SectionHeading from "./encabezado-seccion";
import CardSlider from "@/components/ui/card-slider";
import DemoPreview from "@/components/cards/vista-previa-demo";
import ProjectPreview from "@/components/cards/vista-previa-proyecto";
import usePanelResource from "@/hooks/use-recurso-panel";
import useAuth from "@/hooks/use-autenticacion";
import Button from "@/components/ui/button";
import { toGalleryCards } from "@/lib/proyectos";

/** Las tarjetas no consultan la API: lo hace esta galería. Cada proyecto real es una tarjeta;
 * las muestras de site-content solo aparecen si la API falla o viene vacía. */
export default function ProjectGallery() {
  const resource = usePanelResource("/api/proyectos");
  const { mounted, user } = useAuth();
  const cards = toGalleryCards(resource, { loggedIn: mounted && Boolean(user) });
  const showingSamples = cards?.[0]?.sample;
  return <Section id="proyectos" tabIndex={-1} surface="deep" className="menu-destination studio-section studio-projects">
    <div className="studio-shell">
      <SectionHeading number="01" label="Proyectos y demos" description="Proyectos reales. Ideas en movimiento.">
        Ideas que ya <span className="word-color">podés</span> <span className="word-outline">explorar.</span>
      </SectionHeading>
    </div>
    {!cards ? <div role="status" className="quokka-card-swap quokka-card-swap-editorial demo-showcase-loading">
      <span className="sr-only">Cargando proyectos…</span>
      <div className="quokka-card-swap-viewport demo-showcase-placeholder" aria-hidden="true" />
      <div className="demo-showcase-details demo-showcase-placeholder" aria-hidden="true" />
      <div className="demo-showcase-controls" aria-hidden="true" />
    </div> : <CardSlider label="Proyectos de Quokka" className="demo-showcase"
      details={cards.map(card => <ProjectDetails key={card.key} card={card} />)}>
      {cards.map(card => <div key={card.key} className="demo-card-preview">
          {card.sample
            ? <DemoPreview src={card.preview} alt={'Maqueta ilustrativa de ' + card.title + '; demo en desarrollo'} />
            : <ProjectPreview src={card.imageUrl} alt={'Imagen del proyecto ' + card.title} />}
        </div>)}
    </CardSlider>}
    {showingSamples && <p className="studio-project-note">Propuestas en desarrollo · Las imágenes son maquetas de las aplicaciones.</p>}
  </Section>;
}

function ProjectDetails({ card }) {
  return <div>
    <h3 className="demo-showcase-title">{card.title}</h3>
    {card.description && <p className="demo-showcase-description">{card.description}</p>}
    {!card.locked && card.technologies && <p className="demo-showcase-technologies">{card.technologies}</p>}
    {!card.sample && <Button className="demo-showcase-action" size="sm"
      href={card.locked ? `/iniciar-sesion?next=${encodeURIComponent(`/proyectos/${encodeURIComponent(card.key)}`)}` : card.demoHref}
      variant="secondary" magnetic={false}>{card.locked ? "Explorar con mi cuenta" : "Ver proyecto"}</Button>}
    {card.locked && <p className="demo-showcase-access">Detalles y demo con tu cuenta.</p>}
  </div>;
}
