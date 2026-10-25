"use client";

import { useRef, useState } from "react";
import Section from "@/components/layout/section";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import ProjectPreview from "@/components/cards/vista-previa-proyecto";
import usePanelResource from "@/hooks/use-recurso-panel";
import useAuth from "@/hooks/use-autenticacion";
import { Feedback, PanelDialog, PanelHeading, ResourceState } from "./panel-compartido";
import { deleteCatalogRecord, saveCatalogRecord } from "@/lib/panel-api";
import { validateProjectForm } from "@/lib/proyectos";

const FIELDS = ["titulo", "descripcion", "tecnologias", "url_demo", "imagen_url", "imagen_public_id"];
const formatDate = value => value ? new Date(value).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" }) : "";

/** El administrador edita desde /api/admin/proyectos; el operador solo ve la lista pública. */
export default function ProjectsManager() {
  const { mounted, isAdmin } = useAuth();
  const resource = usePanelResource(isAdmin ? "/api/admin/proyectos" : "/api/proyectos");
  const [dialog, setDialog] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const hasWriteRole = !mounted || isAdmin;
  const canEdit = hasWriteRole && !resource.loading && !resource.error;
  const open = (mode, record = null) => { if (!hasWriteRole) return; setFeedback(null); setDialog({ mode, record }); };
  return <>
    <PanelHeading eyebrow="El contenido del estudio" title="Proyectos y demos" description="Los proyectos que se muestran en el portafolio. Solo las personas con rol administrador pueden modificarlos.">
      <Button size="sm" magnetic={false} iconLeft={<Plus size={18} />} disabled={!canEdit} onClick={() => open("edit")}>Crear proyecto</Button>
    </PanelHeading>
    <Feedback message={feedback} />
    <Section className="panel-sheet" surface="card" aria-label="Listado de proyectos">
      <div className="panel-list-toolbar"><div><h3>Tus proyectos</h3><p>{resource.loading ? "Cargando proyectos" : resource.error ? "Sin conexión" : `${resource.data.length} ${resource.data.length === 1 ? "proyecto" : "proyectos"}`}</p></div></div>
      <ResourceState resource={resource} empty="Todavía no hay proyectos">
        <ul className="panel-records">{resource.data.map((record, index) => <li key={record.id} className="panel-record"><span className="panel-record-index">{String(index + 1).padStart(2, "0")}</span>
          <div className="panel-record-copy"><div className="relative mb-3 h-24 w-40 overflow-hidden rounded-lg"><ProjectPreview src={record.imagen_url} alt={`Imagen de ${record.titulo}`} sizes="160px" /></div><h3>{record.titulo}</h3>{record.tecnologias && <p>{record.tecnologias}</p>}<p>Publicado el {formatDate(record.fecha_publicacion)}</p></div>
          <div className="panel-record-actions"><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label={`Editar ${record.titulo}`} disabled={!canEdit} onClick={() => open("edit", record)}><Pencil size={18} aria-hidden="true" /></Button><Button size="sm" variant="ghost" magnetic={false} className="panel-icon-button" aria-label={`Eliminar ${record.titulo}`} disabled={!canEdit} onClick={() => open("delete", record)}><Trash2 size={18} aria-hidden="true" /></Button></div></li>)}</ul>
      </ResourceState>
    </Section>
    {dialog && <ProjectDialog key={`${dialog.mode}-${dialog.record?.id || "new"}`} dialog={dialog} onClose={() => setDialog(null)} onDone={text => { setDialog(null); setFeedback({ text }); resource.reload(); }} />}
  </>;
}

function ProjectDialog({ dialog, onClose, onDone }) {
  const removing = dialog.mode === "delete";
  const record = dialog.record;
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map(field => [field, record?.[field] ?? ""])));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const bind = name => ({ name, value: values[name], error: fields[name], onChange: event => setValues(previous => ({ ...previous, [name]: event.target.value })) });
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    if (!removing) {
      const validation = validateProjectForm(values).fields;
      if (Object.keys(validation).length) { setFields(validation); return; }
    }
    lock.current = true; setBusy(true); setError(null); setFields({});
    try {
      if (removing) await deleteCatalogRecord("proyectos", record.id);
      else await saveCatalogRecord("proyectos", record?.id, values);
      onDone(removing ? "Proyecto eliminado." : record ? "Cambios guardados." : "Proyecto creado.");
    } catch (failure) {
      setFields(failure.fields || {});
      const denied = failure.status === 401 || failure.status === 403;
      setError({ error: true, text: denied ? "Tu sesión expiró o no tenés permisos para esta acción. Iniciá sesión nuevamente." : failure.message === "Failed to fetch" ? "No pudimos conectar con el servidor. Tus cambios siguen en el formulario." : failure.message });
    } finally { lock.current = false; setBusy(false); }
  }
  return <PanelDialog title={`${removing ? "Eliminar" : record ? "Editar" : "Crear"} proyecto`} onClose={onClose} busy={busy}><form className="panel-form" onSubmit={submit} noValidate>
    <fieldset disabled={busy} className="panel-form-fields">
      {removing ? <div className="panel-delete-copy"><p>Vas a eliminar <strong>{record.titulo}</strong>.</p><p>Se quitará del portafolio. Las imágenes ya subidas a Cloudinary no se borran. Esta acción no se puede deshacer.</p></div> : <>
        <Input label="Título" maxLength={150} required autoFocus {...bind("titulo")} />
        <Textarea label="Descripción" rows={4} maxLength={5000} {...bind("descripcion")} />
        <Input label="Tecnologías" description="Texto libre, por ejemplo: Next.js, PostgreSQL" maxLength={255} {...bind("tecnologias")} />
        <Input label="URL de la demo" type="url" maxLength={255} {...bind("url_demo")} />
        <Input label="URL de la imagen (Cloudinary)" type="url" maxLength={2048} {...bind("imagen_url")} />
        <Input label="Identificador de la imagen" maxLength={255} {...bind("imagen_public_id")} />
      </>}
    </fieldset>
    <Feedback message={error} />
    <div className="panel-form-actions"><Button size="sm" variant="ghost" magnetic={false} disabled={busy} onClick={onClose}>Cancelar</Button><Button size="sm" type="submit" magnetic={false} loading={busy} loadingLabel={removing ? "Eliminando…" : "Guardando…"}>{removing ? "Sí, eliminar" : "Guardar cambios"}</Button></div>
  </form></PanelDialog>;
}
