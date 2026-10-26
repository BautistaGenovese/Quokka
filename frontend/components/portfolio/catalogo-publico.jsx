"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button";
import usePanelResource from "@/hooks/use-recurso-panel";

function technologyAtSlot(technologies, step, slot) {
  return technologies[(step * 4 + slot) % technologies.length];
}

/** La portada lee el mismo catálogo que administra el panel. */
export default function PublicCatalog({ kind }) {
  const resource = usePanelResource(`/api/${kind}`);
  const [technologyStep, setTechnologyStep] = useState(0);
  const [technologyBoardVisible, setTechnologyBoardVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const technologies = resource.data;
  const visibleTechnologies = useMemo(() => Array.from(
    { length: Math.min(4, technologies.length) },
    (_, slot) => technologyAtSlot(technologies, technologyStep, slot),
  ), [technologies, technologyStep]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (kind !== "tecnologias" || technologies.length <= 4) return;
    const section = document.getElementById("stack-tech");
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setTechnologyBoardVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [kind, technologies.length]);

  useEffect(() => {
    if (kind !== "tecnologias" || technologies.length <= 4 || !technologyBoardVisible || reducedMotion) return;
    const timer = window.setInterval(() => {
      setTechnologyStep(current => current + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [kind, technologies.length, technologyBoardVisible, reducedMotion]);

  const label = kind === "servicios" ? "servicios" : "tecnologías";
  let content;
  if (resource.loading) content = <div role="status">
    <p className="sr-only">Cargando {label}…</p>
    <div className="studio-catalog-placeholder" aria-hidden="true"><span /><span /><span /></div>
  </div>;
  else if (resource.error) content = <div className="space-y-4 py-8"><p>No pudimos cargar {label} en este momento.</p><Button size="sm" variant="secondary" onClick={resource.reload}>Volver a intentar</Button></div>;
  else if (!resource.data.length) content = <p className="py-8">Pronto compartiremos {kind === "servicios" ? "nuestros servicios" : "nuestras herramientas"}.</p>;
  else if (kind === "tecnologias") content = <div className="studio-stack-list" role="list" aria-label="Herramientas del estudio">
    {visibleTechnologies.map((item, slot) => {
      const changing = technologyStep > 0;
      const previous = changing ? technologyAtSlot(technologies, technologyStep - 1, slot) : null;
      return <article key={slot} role="listitem" className="studio-stack-item" style={{ "--stack-row": slot }}>
        <div className="studio-stack-window">
          {previous && previous.id !== item.id && <h3 className="studio-stack-label studio-stack-label-exit" aria-hidden="true">{previous.nombre}</h3>}
          <h3 key={item.id} className={`studio-stack-label${changing ? " studio-stack-label-enter" : ""}`}>{item.nombre}</h3>
        </div>
      </article>;
    })}
  </div>;
  else content = <div className="studio-services">{resource.data.map((item, index) => <article className="studio-service-row" key={item.id}><span className="studio-service-number">{String(index + 1).padStart(2, "0")}</span><h3>{item.nombre_servicio}</h3><div><p>{item.descripcion}</p><ul className="studio-tags" aria-label={`Tecnologías de ${item.nombre_servicio}`}>{item.tecnologias.map(technology => <li key={technology.id}>{technology.nombre}</li>)}</ul></div></article>)}</div>;
  return <div className={`studio-catalog studio-catalog-${kind}`} aria-busy={resource.loading}>{content}</div>;
}
