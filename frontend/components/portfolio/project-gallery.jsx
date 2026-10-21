"use client";

import Section from "@/components/layout/section";
import SectionHeading from "./section-heading";
import CardSlider from "@/components/ui/card-slider";
import DemoCard from "@/components/cards/demo-card";
import DemoPreview from "@/components/cards/demo-preview";
import ProjectPreview from "@/components/cards/project-preview";
import usePanelResource from "@/hooks/use-panel-resource";
import useAuth from "@/hooks/use-auth";
import { toGalleryCards } from "@/lib/projects";

/** Las tarjetas no consultan la API: lo hace esta galería. Cada proyecto real es una tarjeta;
 * las muestras de site-content solo aparecen si la API falla o viene vacía. */
export default function ProjectGallery() {
  const resource = usePanelResource("/api/proyectos");
  const { mounted, user } = useAuth();
  const cards = toGalleryCards(resource, { loggedIn: mounted && Boolean(user) });
  const showingSamples = cards?.[0]?.sample;
  return <Section id="proyectos" tabIndex={-1} surface="deep" className="menu-destination studio-section studio-projects">
    <div className="studio-shell">
      <SectionHeading number="04" label="En el taller" description="Un vistazo al universo de aplicaciones que estamos construyendo.">
        Ideas que empiezan<br /><span className="word-color">a tomar</span> <span className="word-outline">forma.</span>
      </SectionHeading>
    </div>
    {!cards ? <p role="status" className="studio-project-note">Cargando proyectos…</p> : <CardSlider label="Proyectos de Quokka" className="demo-showcase">
      {cards.map(card => <DemoCard key={card.key} title={card.title} locked={card.locked} demoHref={card.demoHref} tilt
        description={[card.description, card.technologies].filter(Boolean).join(" · ")}
        preview={card.sample
          ? <DemoPreview src={card.preview} alt={'Maqueta ilustrativa de ' + card.title + '; demo en desarrollo'} />
          : <ProjectPreview src={card.imageUrl} alt={'Imagen del proyecto ' + card.title} />} />)}
    </CardSlider>}
    {showingSamples && <p className="studio-project-note">Propuestas en desarrollo · Las imágenes son maquetas de las aplicaciones.</p>}
  </Section>;
}
