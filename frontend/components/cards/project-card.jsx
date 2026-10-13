import { useId } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

/** La vista previa es un slot: admite imagen, SVG o una composición propia.
 * Omitir una URL elimina esa acción; no publicar enlaces ficticios con '#'. */
export default function ProjectCard({ title, description, technologies = [], preview, demoHref, codeHref, tilt = true, ...rest }) {
  const titleId = useId();
  return (
    <Card {...rest} tilt={tilt} aria-labelledby={titleId}>
      {preview && <div className="overflow-hidden rounded-t-card border-b border-surface-line">{preview}</div>}
      <div className="card-content flex flex-1 flex-col gap-4 p-8 sm:p-10">
        <p data-card-depth="detail" className="font-body text-xs font-extrabold uppercase tracking-widest">Proyecto / demo</p>
        {/* El nombre de la demo es el acento editorial de esta variante. */}
        <h3 data-card-depth="title" id={titleId} className="font-serif text-2xl font-semibold">{title}</h3>
        <p data-card-depth="body" className="font-body text-lg font-normal">{description}</p>
        <ul data-card-depth="detail" aria-label="Tecnologías" className="flex flex-wrap gap-2">
          {technologies.map(item => <li key={item} className="rounded-pill border border-surface-line px-3 py-1 font-pill text-xs font-semibold">{item}</li>)}
        </ul>
        {(demoHref || codeHref) && <div className="mt-auto flex flex-wrap gap-3 pt-4">
          {demoHref && <Button href={demoHref} magnetic={false} size="sm">Ver demo</Button>}
          {codeHref && <Button href={codeHref} magnetic={false} variant="secondary" size="sm">Ver código</Button>}
        </div>}
      </div>
    </Card>
  );
}
