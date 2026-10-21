import Section from "@/components/layout/section";
import CatalogManager from "./catalog-manager";
import ContactsManager from "./contacts-manager";
import UsersManager from "./users-manager";
import ProjectsManager from "./projects-manager";
import { PanelHeading } from "./panel-shared";

function AdminSection({ id, surface = "page", children }) {
  return <Section id={id} tabIndex={-1} surface={surface} className="admin-module menu-destination"><div className="studio-shell">{children}</div></Section>;
}

export function ServiciosAdmin() {
  return <AdminSection id="servicios-admin" surface="card"><CatalogManager kind="servicios" /></AdminSection>;
}

export function TecnologiasAdmin() {
  return <AdminSection id="tecnologias-admin"><CatalogManager kind="tecnologias" /></AdminSection>;
}

export function ConsultasAdmin() {
  return <AdminSection id="consultas-admin" surface="card"><ContactsManager /></AdminSection>;
}

export function UsuariosAdmin() {
  return <AdminSection id="usuarios-admin"><UsersManager /></AdminSection>;
}

export function ProyectosAdmin() {
  return <AdminSection id="proyectos-admin" surface="card"><ProjectsManager /></AdminSection>;
}

export function MetricasAdmin() {
  return <AdminSection id="metricas-admin"><PanelHeading eyebrow="Próximamente" title="Métricas" description="Las estadísticas de visitas se incorporarán en esta sección." /></AdminSection>;
}
