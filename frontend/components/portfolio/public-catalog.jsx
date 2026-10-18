"use client";

import Button from "@/components/ui/button";
import usePanelResource from "@/hooks/use-panel-resource";

/** La portada lee el mismo catálogo que administra el panel. */
export default function PublicCatalog({ kind }) {
  const resource = usePanelResource(`/api/${kind}`);
  const label = kind === "servicios" ? "servicios" : "tecnologías";
  if (resource.loading) return <p role="status" className="py-8">Cargando {label}…</p>;
  if (resource.error) return <div className="space-y-4 py-8"><p>No pudimos cargar {label} en este momento.</p><Button size="sm" variant="secondary" onClick={resource.reload}>Volver a intentar</Button></div>;
  if (!resource.data.length) return <p className="py-8">Pronto compartiremos {kind === "servicios" ? "nuestros servicios" : "nuestras herramientas"}.</p>;
  if (kind === "tecnologias") return <div className="studio-stack-list">{resource.data.map((item, index) => <article key={item.id}><span className="studio-stack-index">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.nombre}</h3></div></article>)}</div>;
  return <div className="studio-services">{resource.data.map((item, index) => <article className="studio-service-row" key={item.id}><span className="studio-service-number">{String(index + 1).padStart(2, "0")}</span><h3>{item.nombre_servicio}</h3><div><p>{item.descripcion}</p><ul className="studio-tags" aria-label={`Tecnologías de ${item.nombre_servicio}`}>{item.tecnologias.map(technology => <li key={technology.id}>{technology.nombre}</li>)}</ul></div></article>)}</div>;
}
