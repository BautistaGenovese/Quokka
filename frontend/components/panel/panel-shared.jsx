"use client";

import { useEffect, useId, useRef } from "react";
import Button from "@/components/ui/button";
import Section from "@/components/layout/section";
import { X } from "lucide-react";

export function PanelHeading({ eyebrow, title, description, children }) {
  return <header className="panel-heading"><div><p className="studio-eyebrow">{eyebrow}</p><h2>{title}</h2><p className="panel-description">{description}</p></div>{children}</header>;
}

export function ResourceState({ resource, empty, children, contacts = false }) {
  if (resource.loading) return <p className="panel-state" role="status">Cargando…</p>;
  if (resource.error) return <div className="panel-state" role="alert"><h3>{contacts && resource.error.status === 404 ? "La bandeja todavía no está disponible" : "No pudimos cargar los datos"}</h3><p>{contacts && resource.error.status === 404 ? "La gestión de consultas se habilitará cuando esté conectado el módulo de contacto." : "Revisá la conexión con el servidor e intentá nuevamente."}</p><Button size="sm" variant="secondary" magnetic={false} onClick={resource.reload}>Volver a intentar</Button></div>;
  if (!resource.data.length) return <div className="panel-state"><h3>{empty}</h3><p>Los registros aparecerán acá cuando estén disponibles.</p></div>;
  return children;
}

export function Feedback({ message }) {
  return message ? <p className="panel-feedback" role={message.error ? "alert" : "status"} data-error={Boolean(message.error)}>{message.text}</p> : null;
}

/** Diálogo nativo: Escape, modalidad y foco. Las acciones esperan la API. */
export function PanelDialog({ title, children, onClose, busy = false }) {
  const titleId = useId();
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="panel-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) closeRef.current(); }}>
    <Section as="div" surface="page" className="panel-dialog-body"><div className="panel-dialog-heading"><h2 id={titleId}>{title}</h2><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label="Cerrar" disabled={busy} onClick={onClose}><X size={20} aria-hidden="true" /></Button></div>{children}</Section>
  </dialog>;
}
