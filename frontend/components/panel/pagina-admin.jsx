"use client";

import Navbar from "@/components/navigation/navbar";
import Section from "@/components/layout/section";
import AnimatedHeading from "@/components/ui/animated-heading";
import Button from "@/components/ui/button";
import useAppearance from "@/hooks/use-apariencia";
import useAuth from "@/hooks/use-autenticacion";
import CatalogProvider from "./proveedor-catalogo";
import { ServiciosAdmin, TecnologiasAdmin, ConsultasAdmin, UsuariosAdmin, ProyectosAdmin, MetricasAdmin } from "./modulos-admin";

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
  const { mounted, loading, user, roleLabel, canAccessPanel } = useAuth();

  if (mounted && !loading && !canAccessPanel) {
    return <>
      <a className="studio-skip-link" href="#panel-content">Saltar al contenido</a>
      <Navbar items={[]} homeHref="/" panelHref={null}
        theme={appearance.theme} mode={appearance.mode} onThemeChange={appearance.setTheme} onModeChange={appearance.setMode}
        menuFooter={{ href: "/", label: "Volver al portafolio" }} />
      <main id="panel-content" tabIndex={-1} className="admin-page">
        <Section className="admin-intro">
          <div className="studio-shell space-y-6">
            <p className="studio-eyebrow">Quokka / Acceso restringido</p>
            <AnimatedHeading as="h1">Sin permisos para el panel.</AnimatedHeading>
            {user ? (
              <p>
                Estás conectado como <strong>{user.nombre}</strong> con el rol de <strong>{roleLabel}</strong>. Solo las cuentas con rol de <strong>Operador</strong> o <strong>Administrador</strong> pueden ingresar al Panel de Control.
              </p>
            ) : (
              <p>
                Necesitás iniciar sesión con una cuenta de <strong>Operador</strong> o <strong>Administrador</strong> para acceder al Panel de Control.
              </p>
            )}
            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/" magnetic={false}>Volver al portafolio</Button>
              {!user && <Button href="/iniciar-sesion" variant="secondary" magnetic={false}>Iniciar sesión</Button>}
            </div>
          </div>
        </Section>
      </main>
    </>;
  }

  return <CatalogProvider>
    <a className="studio-skip-link" href="#panel-content">Saltar al contenido</a>
    <Navbar items={ADMIN_LINKS} homeHref="/" panelHref={null}
      theme={appearance.theme} mode={appearance.mode} onThemeChange={appearance.setTheme} onModeChange={appearance.setMode}
      menuFooter={{ href: "/", label: "Volver al portafolio" }} />
    <main id="panel-content" tabIndex={-1} className="admin-page">
      <Section className="admin-intro">
        <div className="studio-shell">
          <p className="studio-eyebrow">
            Quokka / Administración {mounted && user ? `· ${roleLabel}` : ""}
          </p>
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

