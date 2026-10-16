import Section from "@/components/layout/section";
import SectionHeading from "./section-heading";
import CardSlider from "@/components/ui/card-slider";
import DemoCard from "@/components/cards/demo-card";
import DemoPreview from "@/components/cards/demo-preview";
import { PROJECTS } from "@/lib/site-content";

/** Una tarjeta por propuesta; no repetir el mismo bloqueo cuatro veces. */
export default function ProjectGallery() {
  return <Section id="proyectos" tabIndex={-1} surface="deep" className="menu-destination studio-section studio-projects">
    <div className="studio-shell">
      <SectionHeading number="04" label="En el taller" description="Cuatro propuestas, todavía en desarrollo. Un vistazo al universo de aplicaciones que estamos construyendo.">
        Ideas que empiezan<br /><span className="word-color">a tomar</span> <span className="word-outline">forma.</span>
      </SectionHeading>
    </div>
    <CardSlider label="Propuestas de proyectos de Quokka" className="demo-showcase">
      {PROJECTS.map(project => <DemoCard key={project.id} title={project.title} description={project.description} tilt
        preview={<DemoPreview src={project.preview} alt={'Maqueta ilustrativa de ' + project.title + '; demo en desarrollo'} />} />)}
    </CardSlider>
    <p className="studio-project-note">Propuestas en desarrollo · Las imágenes son maquetas de las aplicaciones.</p>
  </Section>;
}
