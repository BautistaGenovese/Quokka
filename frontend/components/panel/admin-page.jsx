"use client";

import Navbar from "@/components/navigation/navbar";
import Section from "@/components/layout/section";
import AnimatedHeading from "@/components/ui/animated-heading";
import useAppearance from "@/hooks/use-appearance";
import CatalogProvider from "./catalog-provider";
import { ServiciosAdmin, TecnologiasAdmin, ConsultasAdmin, UsuariosAdmin, ProyectosAdmin, MetricasAdmin } from "./admin-modules";

export const ADMIN_LINKS = [
  { href: "#metricas-admin", label: "Métricas" },
  { href: "#consultas-admin", label: "Consultas y cotizaciones" },
  { href: "#proyectos-admin", label: "Proyectos y demos" },
  { href: "#servicios-admin", label: "Servicios" },
  { href: "#tecnologias-admin", label: "Tecnologías" },
  { href: "#usuarios-admin", label: "Usuarios" },
];

export default function AdminPage() {
  const appearance = useAppearance();
  return <CatalogProvider>
    <a className="studio-skip-link" href="#panel-content">Saltar al contenido</a>
    <Navbar items={ADMIN_LINKS} homeHref="/" panelHref={null}
      theme={appearance.theme} mode={appearance.mode} onThemeChange={appearance.setTheme} onModeChange={appearance.setMode}
      menuFooter={{ href: "/", label: "Volver al portafolio" }} />
    <main id="panel-content" tabIndex={-1} className="admin-page">
      <Section className="admin-intro">
        <div className="studio-shell">
          <p className="studio-eyebrow">Quokka / Administración</p>
          <AnimatedHeading as="h1">Panel de control.</AnimatedHeading>
          <p>Gestioná el contenido del estudio. Usá el menú para ir a cada sección.</p>
        </div>
      </Section>
      <MetricasAdmin />
      <ConsultasAdmin />
      <ProyectosAdmin />
      <ServiciosAdmin />
      <TecnologiasAdmin />
      <UsuariosAdmin />
    </main>
  </CatalogProvider>;
}
