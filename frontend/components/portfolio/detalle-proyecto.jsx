"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/navigation/navbar";
import Section from "@/components/layout/section";
import ArrowLink from "@/components/ui/arrow-link";
import Button from "@/components/ui/button";
import ProjectPreview from "@/components/cards/vista-previa-proyecto";
import useAppearance from "@/hooks/use-apariencia";
import useAuth from "@/hooks/use-autenticacion";
import { panelRequest } from "@/lib/panel-api";
import { isHttpUrl } from "@/lib/proyectos";
import { registrarVisita } from "@/lib/visitas-api";

const LINKS = [{ href: "/#proyectos", label: "Volver a proyectos" }];
const formatDate = value => value ? new Date(value).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" }) : null;

/** La redirección es solo UX; el 401 del backend es la protección real. */
export default function ProjectDetail({ id }) {
  const { theme, mode, setTheme, setMode } = useAppearance();
  const { mounted, loading: authLoading, user } = useAuth();
  const [state, setState] = useState({ status: "loading", project: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setState({ status: "loading", project: null }); setAttempt(value => value + 1); }, []);
  const ready = mounted && !authLoading;
  const loggedIn = Boolean(user);

  useEffect(() => {
    if (!ready) return;
    const toLogin = () => window.location.replace("/iniciar-sesion?next=" + encodeURIComponent("/proyectos/" + id));
    if (!loggedIn) { toLogin(); return; }
    const controller = new AbortController();
    panelRequest("/api/proyectos/" + id, { signal: controller.signal }).then(
      data => { if (!controller.signal.aborted) setState(data?.proyecto ? { status: "ready", project: data.proyecto } : { status: "error", project: null }); },
      error => {
        if (controller.signal.aborted) return;
        if (error.status === 401) toLogin();
        else setState({ status: error.status === 404 ? "notfound" : "error", project: null });
      },
    );
    return () => controller.abort();
  }, [ready, loggedIn, id, attempt]);

  const { status, project } = state;
  // Métricas: se registra una visita al detalle solo cuando el proyecto se cargó
  // correctamente, es decir, cuando la persona realmente pudo verlo.
  useEffect(() => { if (status === "ready") registrarVisita("/proyectos/" + id); }, [status, id]);
  const date = formatDate(project?.fecha_publicacion);
  return <>
    <Navbar items={LINKS} homeHref="/" theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
    <Section as="main" surface="page" className="min-h-[calc(100dvh-82px)] px-gutter py-section">
      <div className="mx-auto max-w-3xl space-y-8">
        <ArrowLink href="/#proyectos" direction="left">Volver a proyectos</ArrowLink>
        {status === "loading" && <p role="status">Cargando proyecto…</p>}
        {status === "notfound" && <div className="space-y-3"><h1 className="font-display text-4xl font-extrabold">No encontramos este proyecto</h1><p>Puede que haya sido eliminado o que el enlace no sea correcto.</p></div>}
        {status === "error" && <div className="space-y-4" role="alert"><h1 className="font-display text-4xl font-extrabold">No pudimos cargar el proyecto</h1><p>Revisá la conexión con el servidor e intentá nuevamente.</p><Button size="sm" variant="secondary" magnetic={false} onClick={retry}>Volver a intentar</Button></div>}
        {status === "ready" && <article className="space-y-6">
          <div className="space-y-3"><p className="studio-eyebrow">Proyecto{date ? ` · ${date}` : ""}</p><h1 className="font-display text-5xl font-extrabold tracking-tight">{project.titulo}</h1></div>
          <div className="relative aspect-[8/5] overflow-hidden rounded-[1.125rem]"><ProjectPreview src={project.imagen_url} alt={"Imagen del proyecto " + project.titulo} sizes="(max-width: 768px) 100vw, 768px" /></div>
          {project.descripcion && <p className="whitespace-pre-line">{project.descripcion}</p>}
          {project.tecnologias && <p className="font-mono text-sm uppercase tracking-widest opacity-70">{project.tecnologias}</p>}
          {isHttpUrl(project.url_demo) && <Button href={project.url_demo} target="_blank" rel="noopener noreferrer" magnetic={false}>Ver demo</Button>}
        </article>}
      </div>
    </Section>
  </>;
}
