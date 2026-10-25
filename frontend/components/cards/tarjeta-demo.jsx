import { useId } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Section from "@/components/layout/section";
import DemoPreview from "./vista-previa-demo";

/** Variante visual para explorar demos: la preview ocupa el protagonismo.
 * El slot admite capturas, vídeos o SVG; esta card no conoce el slider ni
 * carga sitios externos. El contenedor decide su ancho y la superficie.
 * Conserva el tilt de Card sin interferir con el transform del carrusel.
 */
export default function DemoCard({ title, description, preview, demoHref, locked = false,
  surface = "muted", tilt = true, className = "", ...rest }) {
  const titleId = useId();
  // No difuminar ni tapar la demo real: en este estado NO montamos su slot,
  // nombre, descripción o enlace. La textura es genérica y usa el mismo
  // DemoPreview; la decisión de acceso viene del consumidor.
  if (locked) return <Card {...rest} surface={surface} tilt={tilt}
    className={`demo-card demo-card-locked ${className}`} aria-labelledby={titleId} data-locked="true">
    <div className="demo-card-preview">
      <DemoPreview src="/previews/locked.svg" alt="" />
    </div>
    <Section as="div" surface="deep" className="demo-card-locked-content">
      <span className="demo-card-locked-badge">Solo para miembros</span>
      <div className="demo-card-locked-message">
        <span className="demo-card-lock"><LockKeyhole size={28} aria-hidden="true" /></span>
        <h3 id={titleId} className="demo-card-title">Las demos te esperan</h3>
        <p>Registrate para explorar y probar los proyectos.</p>
      </div>
    </Section>
  </Card>;
  return <Card {...rest} surface={surface} tilt={tilt}
    className={`demo-card ${className}`} aria-labelledby={titleId}>
    {/* Recortar solo la imagen conserva el espacio 3D del panel y del texto. */}
    {preview && <div className="demo-card-preview">{preview}</div>}
    <Section as="div" surface="deep" className="card-content demo-card-caption">
      <div className="min-w-0">
        <h3 id={titleId} className="demo-card-title">{title}</h3>
      </div>
      {demoHref && <Button href={demoHref} variant="secondary" size="sm"
        magnetic={false} className="demo-card-open" aria-label={`Abrir ${title}`}>
        <ArrowUpRight size={20} aria-hidden="true" />
      </Button>}
      {description && <div className="demo-card-description"><p>{description}</p></div>}
    </Section>
  </Card>;
}
