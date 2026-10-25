"use client";

import { useRef, useState } from "react";
import { Inbox, RefreshCw, Send } from "lucide-react";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Section from "@/components/layout/section";
import usePanelResource from "@/hooks/use-recurso-panel";
import { replyToContact } from "@/lib/panel-api";
import { Feedback, PanelHeading, ResourceState } from "./panel-compartido";

const labels = { cotizacion: "Cotización", asesoria: "Asesoría", general: "Consulta general", consulta: "Consulta general" };
const date = value => new Date(value).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

export default function ContactsManager() {
  const resource = usePanelResource("/api/operador/contactos");
  const [status, setStatus] = useState("todos");
  const [type, setType] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [sending, setSending] = useState(false);
  const records = resource.data.filter(item => (status === "todos" || item.estado === status) && (type === "todos" || (type === "general" ? ["general", "consulta"].includes(item.tipo) : item.tipo === type))).sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
  const current = records.find(item => item.id === selected) || records[0];
  return <>
    <PanelHeading eyebrow="Conversaciones que empiezan" title="Consultas y cotizaciones" description="Cada proyecto empieza con una conversación. Leé las solicitudes y respondé desde tu bandeja."><Button size="sm" variant="secondary" magnetic={false} iconLeft={<RefreshCw size={17} />} disabled={resource.loading || sending} onClick={resource.reload}>Actualizar</Button></PanelHeading>
    <Feedback message={feedback} />
    <div className="panel-filters"><Select label="Estado" value={status} disabled={sending} onValueChange={value => { setStatus(value); setFeedback(null); }}><option value="todos">Todos los estados</option><option value="pendiente">Pendientes</option><option value="respondido">Respondidos</option></Select><Select label="Tipo de consulta" value={type} disabled={sending} onValueChange={value => { setType(value); setFeedback(null); }}><option value="todos">Todos los tipos</option><option value="cotizacion">Cotizaciones</option><option value="asesoria">Asesorías</option><option value="general">Consultas generales</option></Select></div>
    <Section surface="page" className="panel-sheet" aria-label="Bandeja de consultas"><ResourceState resource={resource} empty="Todavía no recibiste consultas" contacts>
      {!records.length ? <p className="panel-state">No hay consultas con estos filtros.</p> : <div className="panel-inbox"><div className="panel-inbox-list"><h3 className="panel-inbox-label"><Inbox size={17} aria-hidden="true" />{records.length} solicitudes</h3>{records.map(item => <Button key={item.id} type="button" variant="ghost" magnetic={false} className="panel-message-preview" disabled={sending} aria-pressed={item.id === current?.id} onClick={() => { setSelected(item.id); setFeedback(null); }}><span className="panel-message-preview-content"><span className="panel-message-meta"><span className="panel-badge">{labels[item.tipo]}</span><span>{item.estado === "pendiente" ? "Pendiente" : "Respondido"}</span></span><strong>{item.nombre}</strong><span className="panel-message-excerpt">{item.mensaje}</span><time dateTime={item.creado_en}>{date(item.creado_en)}</time></span></Button>)}</div>{current && <ContactDetail key={current.id} contact={current} reply={drafts[current.id] || ""} onReplyChange={value => setDrafts(previous => ({ ...previous, [current.id]: value }))} onBusyChange={setSending} onSent={() => { setDrafts(previous => ({ ...previous, [current.id]: "" })); setFeedback({ text: "Respuesta enviada por correo." }); resource.reload(); }} />}</div>}
    </ResourceState></Section>
  </>;
}

function ContactDetail({ contact, reply, onReplyChange, onBusyChange, onSent }) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState(null);
  async function send(event) {
    event.preventDefault();
    if (lock.current) return;
    if (reply.trim().length < 10) { setError({ error: true, text: "Escribí una respuesta de al menos 10 caracteres." }); return; }
    lock.current = true; setBusy(true); onBusyChange(true); setError(null);
    try { await replyToContact(contact.id, reply.trim()); onSent(); }
    catch (failure) { setError({ error: true, text: failure.status === 404 ? "El envío de respuestas todavía no está disponible. Tu texto se conserva para volver a intentar." : failure.fields?.respuesta || "No pudimos enviar la respuesta. Tu texto se conserva; revisá la conexión e intentá nuevamente." }); }
    finally { lock.current = false; setBusy(false); onBusyChange(false); }
  }
  return <article className="panel-message-detail"><header><p className="studio-eyebrow">{labels[contact.tipo]} · #{contact.id}</p><h3>{contact.nombre}</h3><p>{contact.email}</p><time dateTime={contact.creado_en}>{date(contact.creado_en)}</time></header><p className="panel-message-body">{contact.mensaje}</p>
    {contact.estado === "respondido" ? <section className="panel-sent-reply"><h3>Respuesta enviada</h3><p className="panel-message-body">{contact.respuesta}</p>{contact.respondido_en && <time dateTime={contact.respondido_en}>{date(contact.respondido_en)}</time>}</section> : <form className="panel-form" onSubmit={send}><Textarea label="Tu respuesta" name="respuesta" value={reply} onChange={event => onReplyChange(event.target.value)} minLength={10} maxLength={5000} rows={6} required disabled={busy} description={`Se enviará por correo a ${contact.email}.`} /><Feedback message={error} /><div className="panel-form-actions"><Button type="submit" size="sm" magnetic={false} iconLeft={<Send size={16} />} loading={busy} loadingLabel="Enviando…">Enviar respuesta</Button></div></form>}
  </article>;
}
