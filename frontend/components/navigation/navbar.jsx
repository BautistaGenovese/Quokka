"use client";

import { useEffect, useRef, useImperativeHandle } from "react";

import Section from "@/components/layout/section";
import SiteMenu from "@/components/navigation/site-menu";
import PalettePanel from "@/components/navigation/palette-panel";
import QuokkaSling from "./quokka-sling";
import useNavbarMotion from "@/hooks/use-navbar-motion";

/** Cabecera de Quokka: identidad, navegación y acciones independientes.
 * La página aporta tema/modo y sus setters: una única fuente de estado.
 * SiteMenu administra su disparador y paneles; esta barra solo los organiza.
 */
const EMPTY_ITEMS = [];
export default function Navbar({ items = EMPTY_ITEMS, homeHref = "#inicio", ref,
  theme, mode, onThemeChange, onModeChange }) {
  const menu = useRef(null);
  const palette = useRef(null);
  const request = useRef(0);
  const header = useRef(null);
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
  return (
    <>
    {/* Independiente del header: permanece visible cuando este se oculta. */}
    <div ref={progress} className="site-reading-progress" aria-hidden="true" />
    <Section ref={header} as="header" surface="page" className="site-navbar">
      <div className="site-navbar-inner">
      <div className="site-navbar-brand"><QuokkaSling /><a href={homeHref} aria-label="Quokka Studio, ir al inicio">quokka</a></div>
      <div className="site-menu-toolbar site-navbar-actions">
        <PalettePanel ref={palette} theme={theme} mode={mode} onThemeChange={onThemeChange} onModeChange={onModeChange}
          triggerClassName="site-navbar-control"
          onRequestOpen={open => requestOpen(menu, open)} />
        <SiteMenu ref={menu} items={items} triggerClassName="site-navbar-control"
          onRequestOpen={open => requestOpen(palette, open)} />
      </div>
      </div>
    </Section>
    </>
  );
}
