"use client";

import { useId, useImperativeHandle, useRef, useState } from "react";
import useActiveSection from "@/hooks/use-active-section";
import Section from "@/components/section";
import Button from "@/components/ui/button.jsx";
import SectionTransition from "@/components/section-transition";

import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { preparePanelEntry, enterPanels, dropPanels } from "@/lib/panel-motion";
import { navigateToSection } from "@/lib/section-navigation";

/** Navegación por anclas: items = [{ href: "#inicio", label: "Inicio" }].
 * El dialog NO modal flota sobre la página: el fondo sigue siendo interactivo
 * y conserva su scroll. No hay backdrop ni bloqueo de body.
 * GSAP solo mueve los paneles; Section sigue siendo dueña de sus colores.
 * El morphing comienza junto al cierre y navega bajo cobertura total.
 */
const EMPTY_ITEMS = [];

export default function SiteMenu({ items = EMPTY_ITEMS, ref, onRequestOpen, navbarRef, triggerClassName = "" }) {
  const id = useId();
  const menuId = `${id}-menu`;
  const titleId = `${id}-title`;
  const accountId = `${id}-account`;
  const aboutId = `${id}-about`;
  const root = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const actions = useRef(null);
  const transition = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const activeHref = useActiveSection(items);
  // Navbar espera el cierre visual antes de abrir el panel de paleta.
  useImperativeHandle(ref, () => ({ close: () => new Promise(resolve => {
    if (actions.current) actions.current.dismiss(resolve);
    else resolve();
  }) }), []);

  useGSAP((context, contextSafe) => {
    const modal = dialog.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const panels = modal.querySelectorAll("[data-menu-panel]");
    // Consultar en cada apertura permite reemplazar items sin animar nodos
    // retirados por React ni reiniciar el estado de los paneles existentes.
    let labels = [];
    let lines = [];
    let destination = null;
    let wantsOpen = false;
    let animation = null;
    const closed = [];

    const navigate = () => {
      if (!destination) return;
      const href = destination;
      destination = null;
      navigateToSection(href);
    };
    const finishClose = () => {
      if (wantsOpen) return;
      const returnFocus = modal.contains(document.activeElement);
      modal.close();
      // El foco vuelve al disparador al cerrar normalmente. Al navegar va
      // al destino, para que el siguiente Tab continúe en la nueva sección.
      if (returnFocus) trigger.current?.focus({ preventScroll: true });
      closed.splice(0).forEach(resolve => resolve());
    };

    // Entrada lateral y caída son movimientos distintos. Interrumpir mata
    // solo el tween anterior: el nuevo parte de la posición visual actual.
    const open = contextSafe(() => {
      animation?.kill();
      labels = modal.querySelectorAll(".site-menu-link-label");
      lines = modal.querySelectorAll(".site-menu-link-line");
      transition.current?.cancel();
      wantsOpen = true;
      destination = null;
      setExpanded(true);
      if (!modal.open) {
        modal.dataset.exiting = "false";
        modal.show();
        // El dialog conserva su scroll entre aperturas. Volver al comienzo
        // evita que una visita anterior al bloque inferior recorte el menú.
        modal.scrollTop = 0;
        // Medimos después de show: antes el dialog no tiene layout.
        preparePanelEntry(panels);
        // La propuesta revela el texto desde abajo y dibuja cada separador.
        // Solo reiniciamos al abrir desde cerrado; una interrupción continúa
        // desde su posición visual y no vuelve a esconder los enlaces.
        if (labels.length) gsap.set(labels, { yPercent: 110 });
        if (lines.length) gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
      }
      modal.dataset.exiting = "false";
      if (reduced.matches) {
        gsap.set(panels, { x: 0, y: 0, rotation: 0 });
        if (labels.length) gsap.set(labels, { yPercent: 0 });
        if (lines.length) gsap.set(lines, { scaleX: 1 });
      } else {
        animation = enterPanels(panels);
        // Un menú vacío también es válido mientras llegan sus datos.
        if (labels.length) animation.to(labels, {
          yPercent: 0, ...MOTION.panel.labels,
        }, 0.15);
        if (lines.length) animation.to(lines, {
          scaleX: 1, ...MOTION.panel.labels,
        }, 0);
      }
    });
    const close = contextSafe((href = null, afterClose) => {
      if (afterClose) {
        if (!modal.open) { afterClose(); return; }
        closed.push(afterClose);
      }
      // Escape/clics repetidos durante la caída no reinician la transición.
      if (!wantsOpen) return;
      animation?.kill();
      wantsOpen = false;
      destination = href;
      setExpanded(false);
      modal.dataset.exiting = "true";
      if (reduced.matches) {
        finishClose();
      } else {
        // Misma caída interrumpible que PalettePanel, incluidos espera y giro.
        animation = dropPanels(panels, finishClose);
      }
      // Arranca en el mismo evento, no en onComplete de la caída.
      // X, Escape, disparador y clic exterior solo cierran. La cubierta
      // pertenece exclusivamente a la navegación por enlaces del menú.
      if (href) {
        if (transition.current) transition.current.play(navigate);
        else navigate();
      }
    });
    actions.current = { open, close, dismiss: resolve => {
      destination = null;
      transition.current?.cancel();
      close(null, resolve);
    } };

    // Al ser no modal, Tab puede continuar por la página. Escape funciona
    // también con el foco afuera; un clic exterior cierra sin consumirlo.
    const escape = (event) => {
      if (event.key === "Escape" && modal.open) { event.preventDefault(); close(); }
    };
    const outside = (event) => {
      if (modal.open && !modal.contains(event.target) && !trigger.current?.contains(event.target)) close();
    };
    const mediaChange = () => {
      if (!reduced.matches) return;
      animation?.kill();
      if (wantsOpen) {
        gsap.set(panels, { x: 0, y: 0, rotation: 0 });
        if (labels.length) gsap.set(labels, { yPercent: 0 });
        if (lines.length) gsap.set(lines, { scaleX: 1 });
      }
      if (!wantsOpen) finishClose();
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    reduced.addEventListener("change", mediaChange);
    return () => {
      actions.current = null;
      animation?.kill();
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      reduced.removeEventListener("change", mediaChange);
      if (modal.open) modal.close();
      closed.splice(0).forEach(resolve => resolve());
    };
  }, { scope: root });

  return (
    <div ref={root} className="site-menu">
      <SectionTransition ref={transition} navbarRef={navbarRef} />
      {/* Solo el acceso y los paneles. Navbar organiza la cabecera aparte. */}
      <Button ref={trigger} className={triggerClassName} type="button" variant="secondary" size="sm" magnetic={false} iconOnlyOnMobile aria-expanded={expanded}
          iconRight={<span className="site-navbar-bars site-navbar-action-icon" aria-hidden="true" />}
          aria-controls={menuId} onClick={() => expanded ? actions.current?.close() : onRequestOpen ? onRequestOpen(() => actions.current?.open()) : actions.current?.open()}>
          Menú
      </Button>
      <dialog ref={dialog} id={menuId} className="site-menu-dialog" aria-labelledby={titleId}>
        <div className="site-menu-panels">
          <Section surface="page" data-menu-panel className="site-menu-main side-panel">
            <div className="site-menu-heading">
              <h2 id={titleId} className="site-menu-title">Menú</h2>
              {/* Permite invertir el cierre mientras todavía está animándose. */}
              <Button type="button" variant="ghost" magnetic={false} size="sm" autoFocus className="site-menu-close" aria-controls={menuId}
                aria-label={expanded ? "Cerrar menú" : "Reabrir menú"}
                aria-expanded={expanded} onClick={() => expanded ? actions.current?.close() : actions.current?.open()}>
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </Button>
            </div>
            <nav aria-label="Secciones">
              <ol className="site-menu-links">
                {items.map(({ href, label, description }) => (
                  <li key={href}><a href={href} aria-current={activeHref === href ? "location" : undefined} onClick={event => {
                    // Mantiene los atajos nativos para abrir en otra pestaña.
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !href.startsWith("#")) return;
                    event.preventDefault(); actions.current?.close(href);
                  }}>
                    <span className="site-menu-link-line" aria-hidden="true" />
                    <span className="site-menu-link-content"><span className="site-menu-link-label">{label}</span>
                    </span>
                    {description && <span className="site-menu-link-description">{description}</span>}
                    <span className="site-menu-link-line site-menu-link-line-bottom" aria-hidden="true" />
                  </a></li>
                ))}
              </ol>
            </nav>
            <p className="site-menu-help"><kbd>Esc</kbd> para cerrar</p>
          </Section>
          <Section surface="card" data-menu-panel className="site-menu-account" aria-labelledby={accountId}>
            <div className="site-menu-account-heading">
              <span className="site-menu-account-avatar" aria-hidden="true">◌</span>
              <div><h3 id={accountId}>Tu cuenta</h3><p>Un espacio para explorar los proyectos y las demos de Quokka.</p></div>
            </div>
            {/* Categorías informativas; no son controles ni accesos implementados. */}
            <ul className="site-menu-chips" aria-label="Contenido de la cuenta"><li>Demos interactivas</li><li>Proyectos</li></ul>
            {/* Plantilla autorizada: no hay rutas ni autenticación todavía.
                Button conserva foco, presión y estilos; no hay acciones. */}
            <div className="site-menu-account-actions">
              <Button type="button" size="sm" magnetic={false}>Iniciar sesión</Button><Button type="button" size="sm" variant="secondary" magnetic={false}>Crear cuenta</Button>
            </div>
          </Section>
          <Section surface="deep" data-menu-panel className="site-menu-about" aria-labelledby={aboutId}>
            {/* Siluetas decorativas del equipo; colores de la colección activa. */}
            <div className="site-menu-team" aria-hidden="true">{[1, 2, 3, 4, 5].map(member => <span key={member}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg></span>)}</div>
            <div className="site-menu-about-heading"><h3 id={aboutId}>Quokka</h3><span>Cinco integrantes · Lenguajes IV</span></div>
            <p>Proyecto universitario · 2026</p>
            <div className="site-menu-about-links"><Button variant="secondary" magnetic={false} size="sm" href="https://github.com/BautistaGenovese/Quokka" target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only">: repositorio de Quokka (abre en otra pestaña)</span></Button></div>
            
          </Section>
        </div>
      </dialog>
    </div>
  );
}


