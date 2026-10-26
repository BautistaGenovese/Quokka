"use client";

import { useEffect, useRef, useImperativeHandle } from "react";

import Section from "@/components/layout/section";
import SiteMenu from "@/components/navigation/menu-sitio";
import PalettePanel from "@/components/navigation/panel-paletas";
import QuokkaSling from "./quokka-sling";
import useNavbarMotion from "@/hooks/use-navbar-motion";
import useAuth from "@/hooks/use-autenticacion";
import Button from "@/components/ui/button";
import AvatarUsuario from "@/components/navigation/avatar-usuario";

/** Cabecera de Quokka: identidad, navegación y acciones independientes.
 * La página aporta tema/modo y sus setters: una única fuente de estado.
 * SiteMenu administra su disparador y paneles; esta barra solo los organiza.
 */
const EMPTY_ITEMS = [];
export default function Navbar({ items = EMPTY_ITEMS, homeHref = "#inicio", ref,
  theme, mode, onThemeChange, onModeChange, panelHref = "/panel", portfolioHref = null, menuFooter }) {
  const menu = useRef(null);
  const palette = useRef(null);
  const request = useRef(0);
  const header = useRef(null);
  const { mounted, loading, user, roleLabel, canAccessPanel, logout } = useAuth();
  // La página puede compartir la medida real con transiciones del footer.
  useImperativeHandle(ref, () => header.current);

  const progress = useRef(null);
  useNavbarMotion(header, progress);
  // Una espera de cierre no puede abrir otro panel después del desmontaje.
  useEffect(() => () => { request.current++; }, []);
  // Esperar la caída completa evita que ambos paneles tapen la barra a la vez.
  // El contador descarta solicitudes antiguas si se alterna muy rápido.
  const requestOpen = async (otherPanel, open) => {
    const current = ++request.current;
    await otherPanel.current?.close();
    if (current === request.current) open();
  };

  const showPanelButton = Boolean(panelHref) && mounted && !loading && canAccessPanel;
  const showPortfolioButton = Boolean(portfolioHref);

  return (
    <>
    {/* Independiente del header: permanece visible cuando este se oculta. */}
    <div ref={progress} className="site-reading-progress" aria-hidden="true" />
    <Section ref={header} as="header" surface="page" className="site-navbar">
      <div className="site-navbar-inner">
      <div className="site-navbar-brand"><QuokkaSling /><a href={homeHref} aria-label="Quokka Studio, ir al inicio">quokka</a></div>
      <div className="site-menu-toolbar site-navbar-actions">
        {mounted && user && (
          <div className="site-navbar-session" aria-label={`Sesión activa: ${user.nombre}, rol ${roleLabel}`} title={`${user.nombre} · ${roleLabel}`}>
            <AvatarUsuario user={user} className="site-navbar-session-avatar" imageClassName="site-navbar-session-photo" />
            <span className="site-navbar-session-copy">
              <span className="site-navbar-session-name">{user.nombre}</span>
              <span className="site-navbar-session-role">{roleLabel}</span>
            </span>
          </div>
        )}
        {/* Estilo anterior de sesión conservado para restaurarlo fácilmente si hace falta:
        {mounted && user && (
          <div className="site-navbar-user-badge" aria-label={`Sesión activa: ${user.nombre}, rol ${roleLabel}`}>
            <span className="site-navbar-user-name">{user.nombre}</span>
            <span className="site-navbar-user-role">{roleLabel}</span>
          </div>
        )}
        */}
        {showPanelButton && <Button href={panelHref} magnetic={false} variant="secondary" className="site-navbar-control site-navbar-icon-control site-navbar-dashboard" aria-label="Panel de control" title="Panel de control"><svg className="site-navbar-dashboard-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect className="site-navbar-dashboard-bar site-navbar-dashboard-bar-one" x="3.75" y="11" width="3.5" height="9" rx=".7" /><rect className="site-navbar-dashboard-bar site-navbar-dashboard-bar-two" x="10.25" y="7" width="3.5" height="13" rx=".7" /><rect className="site-navbar-dashboard-bar site-navbar-dashboard-bar-three" x="16.75" y="4" width="3.5" height="16" rx=".7" /></svg></Button>}
        {showPortfolioButton && <Button href={portfolioHref} magnetic={false} variant="secondary" className="site-navbar-control site-navbar-icon-control site-navbar-portfolio" aria-label="Volver al portafolio" title="Volver al portafolio"><svg className="site-navbar-portfolio-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect className="site-navbar-portfolio-frame" x="3.5" y="4.5" width="17" height="15" rx="2" /><rect className="site-navbar-portfolio-card site-navbar-portfolio-card-one" x="6.5" y="8" width="5" height="8.5" rx=".7" /><rect className="site-navbar-portfolio-card site-navbar-portfolio-card-two" x="13" y="8" width="4.5" height="4" rx=".7" /><path className="site-navbar-portfolio-line" d="M13 15h4.5" /></svg></Button>}
        <PalettePanel ref={palette} theme={theme} mode={mode} onThemeChange={onThemeChange} onModeChange={onModeChange}
          triggerClassName="site-navbar-control"
          onRequestOpen={open => requestOpen(menu, open)} />
        <SiteMenu ref={menu} items={items} footerLink={menuFooter} user={mounted ? user : null} roleLabel={roleLabel} onLogout={mounted && user ? logout : undefined} triggerClassName="site-navbar-control"
          onRequestOpen={open => requestOpen(palette, open)} />
      </div>
      </div>
    </Section>
    </>
  );
}

