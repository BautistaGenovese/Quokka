import { useId } from "react";
import Card from "@/components/ui/card";

/** Habilidades: priorizar lectura. El tilt se activa solo si se solicita. */
export default function SkillCard({ title, description, icon, tags = [], eyebrow = "Habilidad", tilt = false, ...rest }) {
  const titleId = useId();
  return (
    <Card {...rest} tilt={tilt} aria-labelledby={titleId}>
      <div className="card-content flex flex-col gap-4 p-8 sm:p-10">
        <div className="card-content flex items-center gap-4">
          {icon && <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-action text-3xl text-on-action">{icon}</div>}
          <div className="card-content min-w-0">
            <p data-card-depth="detail" className="mb-1 font-body text-xs font-extrabold uppercase tracking-widest">{eyebrow}</p>
            <h3 data-card-depth="title" id={titleId} className="font-body text-2xl font-extrabold">{title}</h3>
          </div>
        </div>
        <p data-card-depth="body" className="font-body text-lg font-normal">{description}</p>
        <ul data-card-depth="detail" aria-label="Áreas de trabajo" className="flex flex-wrap gap-2 pt-1">
          {tags.map(tag => <li key={tag} className="rounded-pill border border-surface-line px-3 py-1 font-pill text-xs font-semibold">{tag}</li>)}
        </ul>
      </div>
    </Card>
  );
}
