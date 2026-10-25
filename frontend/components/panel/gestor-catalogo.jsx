"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Section from "@/components/layout/section";
import { Plus, Pencil, Trash2, ArrowUpRight, X } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { usePanelCatalog } from "./proveedor-catalogo";
import { Feedback, PanelDialog, PanelHeading, ResourceState } from "./panel-compartido";
import { deleteCatalogRecord, saveCatalogRecord } from "@/lib/panel-api";
import useAuth from "@/hooks/use-autenticacion";

const config = {
  servicios: { title: "Servicios", singular: "servicio", field: "nombre_servicio", description: "Dale forma a lo que ofrece el estudio. Cada cambio se refleja en el portafolio." },
  tecnologias: { title: "Tecnologías", singular: "tecnología", field: "nombre_tecnologia", description: "Las herramientas del estudio, en un catálogo compartido para tus servicios." },
};

export default function CatalogManager({ kind }) {
  const catalog = usePanelCatalog();
  const { mounted, isAdmin } = useAuth();
  const resource = catalog[kind];
  const settings = config[kind];
  const isService = kind === "servicios";
  const plural = settings.title.toLocaleLowerCase("es");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const nameOf = record => isService ? record.nombre_servicio : record.nombre;
  const records = resource.data.filter(record => `${nameOf(record)} ${record.descripcion || ""} ${(record.tecnologias || []).map(item => item.nombre).join(" ")}`.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es")));
  const hasWriteRole = !mounted || isAdmin;
  const canEdit = hasWriteRole && !resource.loading && !resource.error && (!isService || (!catalog.tecnologias.loading && !catalog.tecnologias.error));
  const open = (mode, record = null) => { if (!hasWriteRole) return; setFeedback(null); setDialog({ mode, record }); };
  return <>
    <PanelHeading eyebrow="El contenido del estudio" title={settings.title} description={settings.description}><Button size="sm" magnetic={false} iconLeft={<Plus size={18} />} disabled={!canEdit} onClick={() => open("edit")}>Crear {settings.singular}</Button></PanelHeading>
    <Feedback message={feedback} />
    {isService && catalog.tecnologias.error && <div className="panel-inline-notice" role="alert"><p>No pudimos cargar las tecnologías. Recargá el catálogo para crear o editar servicios.</p><Button size="sm" variant="ghost" magnetic={false} onClick={catalog.tecnologias.reload}>Recargar tecnologías</Button></div>}
    <Section className="panel-sheet" surface={isService ? "page" : "card"} aria-label={`Listado de ${plural}`}>
      <div className="panel-list-toolbar"><div><h3>Tu catálogo</h3><p>{resource.loading ? "Cargando catálogo" : resource.error ? "Sin conexión" : `${resource.data.length} ${resource.data.length === 1 ? settings.singular : plural}`}</p></div><Input wrapperClassName="panel-search" type="search" label={`Buscar ${plural}`} icon={false} value={search} onChange={event => setSearch(event.target.value)} /></div>
      <ResourceState resource={resource} empty={`Todavía no hay ${plural}`}>
        {!records.length ? <p className="panel-state">No hay resultados para “{search}”.</p> : <ul className="panel-records">{records.map((record, index) => <li key={record.id} className="panel-record"><span className="panel-record-index">{String(index + 1).padStart(2, "0")}</span><div className="panel-record-copy"><h3>{nameOf(record)}</h3>{isService && <><p>{record.descripcion}</p><ul className="panel-tags" aria-label="Tecnologías asociadas">{record.tecnologias?.map(technology => <li key={technology.id}>{technology.nombre}</li>)}</ul></>}{!isService && <p>Disponible en el catálogo de herramientas</p>}</div><div className="panel-record-actions"><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label={`Editar ${nameOf(record)}`} disabled={!canEdit} onClick={() => open("edit", record)}><Pencil size={18} aria-hidden="true" /></Button><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label={`Eliminar ${nameOf(record)}`} disabled={!hasWriteRole} onClick={() => open("delete", record)}><Trash2 size={18} aria-hidden="true" /></Button></div></li>)}</ul>}
      </ResourceState>
    </Section>
    <p className="panel-footnote"><ArrowUpRight size={16} aria-hidden="true" /><Link href={isService ? "/#servicios" : "/#stack-tech"}>Ver {plural} en el portafolio</Link></p>
    {dialog && <CatalogDialog key={`${dialog.mode}-${dialog.record?.id || "new"}`} kind={kind} settings={settings} dialog={dialog} technologies={catalog.tecnologias.data} onClose={() => setDialog(null)} onDone={text => { setDialog(null); setFeedback({ text }); catalog.servicios.reload(); catalog.tecnologias.reload(); }} />}
  </>;
}

function CatalogDialog({ kind, settings, dialog, technologies, onClose, onDone }) {
  const isService = kind === "servicios";
  const removing = dialog.mode === "delete";
  const record = dialog.record;
  const [name, setName] = useState(record?.nombre_servicio || record?.nombre || "");
  const [description, setDescription] = useState(record?.descripcion || "");
  const [selected, setSelected] = useState(record?.tecnologias?.map(item => item.id) || []);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const validation = {};
    if (!removing) {
      if (name.trim().length < (isService ? 3 : 1)) validation[settings.field] = isService ? "Ingresá al menos 3 caracteres." : "Ingresá un nombre.";
      if (isService && description.trim().length < 10) validation.descripcion = "Escribí al menos 10 caracteres.";
      if (Object.keys(validation).length) { setFields(validation); return; }
    }
    lock.current = true; setBusy(true); setError(null); setFields({});
    try {
      if (removing) await deleteCatalogRecord(kind, record.id);
      else await saveCatalogRecord(kind, record?.id, { [settings.field]: name.trim(), ...(isService ? { descripcion: description.trim(), tecnologia_ids: selected } : {}) });
      onDone(removing ? "Registro eliminado." : record ? "Cambios guardados." : "Registro creado.");
    } catch (failure) {
      setFields(failure.fields || {});
      setError({ error: true, text: failure.status === 409 ? "Ya existe una tecnología con ese nombre." : failure.message === "Failed to fetch" ? "No pudimos conectar con el servidor. Tus cambios siguen en el formulario." : failure.message });
    } finally { lock.current = false; setBusy(false); }
  }
  const title = `${removing ? "Eliminar" : record ? "Editar" : "Crear"} ${settings.singular}`;
  return <PanelDialog title={title} onClose={onClose} busy={busy}><form className="panel-form" onSubmit={submit}>
    <fieldset disabled={busy} className="panel-form-fields">
      {removing ? <div className="panel-delete-copy"><p>Vas a eliminar <strong>{name}</strong>.</p><p>{isService ? "Se quitará del portafolio. Sus tecnologías se conservan en el catálogo." : "También se quitará de los servicios que la utilizan. Los servicios se conservan."} Esta acción no se puede deshacer.</p></div> : <>
        <Input label={isService ? "Nombre del servicio" : "Nombre de la tecnología"} name={settings.field} value={name} onChange={event => setName(event.target.value)} maxLength={100} minLength={isService ? 3 : 1} required error={fields[settings.field]} autoFocus />
        {isService && <>
          <Textarea label="Descripción" name="descripcion" value={description} onChange={event => setDescription(event.target.value)} minLength={10} maxLength={5000} required rows={4} error={fields.descripcion} />
          <Select label="Tecnologías del servicio" value="" placeholder={selected.length === technologies.length && technologies.length ? "Todas las tecnologías agregadas" : "Agregar tecnología"}
            disabled={!technologies.length || selected.length === technologies.length}
            description={technologies.length ? "Seleccioná una opción para agregarla. Podés elegir varias o guardar sin tecnologías." : "El catálogo está vacío. Podés agregar tecnologías desde su sección."}
            error={fields.tecnologia_ids}
            onValueChange={value => setSelected(previous => previous.includes(Number(value)) ? previous : [...previous, Number(value)])}>
            {technologies.filter(item => !selected.includes(item.id)).map(item => <option key={item.id} value={String(item.id)}>{item.nombre}</option>)}
          </Select>
          {selected.length > 0 && <ul className="panel-selected-technologies" aria-label="Tecnologías seleccionadas">{selected.map(id => <li key={id}><span>{technologies.find(item => item.id === id)?.nombre || `Tecnología #${id}`}</span><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label={`Quitar ${technologies.find(item => item.id === id)?.nombre || `tecnología ${id}`}`} onClick={() => setSelected(previous => previous.filter(item => item !== id))}><X size={15} aria-hidden="true" /></Button></li>)}</ul>}
        </>}
      </>}
    </fieldset>
    <Feedback message={error} />
    <div className="panel-form-actions"><Button size="sm" variant="ghost" magnetic={false} disabled={busy} onClick={onClose}>Cancelar</Button><Button size="sm" type="submit" magnetic={false} loading={busy} loadingLabel={removing ? "Eliminando…" : "Guardando…"}>{removing ? "Sí, eliminar" : "Guardar cambios"}</Button></div>
  </form></PanelDialog>;
}
