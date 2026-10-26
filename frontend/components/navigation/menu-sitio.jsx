"use client";

import { useId, useImperativeHandle, useRef, useState } from "react";
import useActiveSection from "@/hooks/use-active-section";
import Section from "@/components/layout/section";
import NavbarIcon from "@/components/navigation/icono-navbar";
import Button from "@/components/ui/button.jsx";
import AvatarUsuario from "@/components/navigation/avatar-usuario";
import { LogOut } from "lucide-react";

import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import { preparePanelEntry, enterPanels, dropPanels } from "@/lib/movimiento-panel";

/** Navegación por anclas: items = [{ href: "#inicio", label: "Inicio" }].
 * El dialog NO modal flota sobre la página: el fondo sigue siendo interactivo
 * y conserva su scroll. No hay backdrop ni bloqueo de body.
 * GSAP solo mueve los paneles; Section sigue siendo dueña de sus colores.
 * El morphing comienza junto al cierre y navega bajo cobertura total.
 */
const EMPTY_ITEMS = [];
const LOGIN_LINK = { href: "/iniciar-sesion", label: "Iniciar sesión" };

export default function SiteMenu({ items = EMPTY_ITEMS, ref, onRequestOpen, triggerClassName = "", footerLink = LOGIN_LINK, user = null, roleLabel = null, onLogout }) {
  const id = useId();
  const menuId = `${id}-menu`;
  const titleId = `${id}-title`;
  const root = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const actions = useRef(null);

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

    let wantsOpen = false;
    let animation = null;
    const closed = [];

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
      wantsOpen = true;
      panels.forEach(panel => { panel.inert = false; });
      setExpanded(true);
      if (!modal.open) {
        modal.dataset.exiting = "false";
        modal.show(); trigger.current?.focus({ preventScroll: true });
        // El dialog conserva su scroll entre aperturas. Volver al comienzo
        // evita que una visita anterior al bloque inferior recorte el menú.
        modal.scrollTop = 0;
        panels.forEach(panel => { panel.scrollTop = 0; });
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
    const close = contextSafe((afterClose) => {
      if (afterClose) {
        if (!modal.open) { afterClose(); return; }
        closed.push(afterClose);
      }
      // Escape/clics repetidos durante la caída no reinician la transición.
      if (!wantsOpen) return;
      animation?.kill();
      wantsOpen = false;

      setExpanded(false);
      if (modal.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true });
      panels.forEach(panel => { panel.inert = true; });
      modal.dataset.exiting = "true";
      if (reduced.matches) {
        finishClose();
      } else {
        // Misma caída interrumpible que PalettePanel, incluidos espera y giro.
        animation = dropPanels(panels, finishClose);
      }
    });
    actions.current = { open, close, dismiss: resolve => {
      close(resolve);
    } };

    // Al ser no modal, Tab puede continuar por la página. Escape funciona
    // también con el foco afuera; un clic exterior cierra sin consumirlo.
    const escape = (event) => {
      if (event.key === "Escape" && modal.open) { event.preventDefault(); close(); }
    };
    const outside = (event) => {
      if (modal.open && !modal.contains(event.target) && !trigger.current?.contains(event.target)) close();
    };
    // Tab y clic exterior usan la misma caída que la X y Escape.
    const focusOutside = event => {
      if (!modal.open || modal.contains(event.target) || trigger.current?.contains(event.target)) return;
      close();
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
    const navigation = () => close();
    window.addEventListener("quokka:navigation-start", navigation);
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    reduced.addEventListener("change", mediaChange);
    return () => {
      actions.current = null;
      animation?.kill();
      window.removeEventListener("quokka:navigation-start", navigation);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
      reduced.removeEventListener("change", mediaChange);
      if (modal.open) modal.close();
      closed.splice(0).forEach(resolve => resolve());
    };
  }, { scope: root });

  return (
    <div ref={root} className="site-menu">

      {/* Solo el acceso y los paneles. Navbar organiza la cabecera aparte. */}
      <Button magnetic={false} variant="secondary" ref={trigger} className={`${triggerClassName} site-navbar-icon-control`} type="button" aria-label={expanded ? "Cerrar menú" : "Menú"} title={expanded ? "Cerrar menú" : "Menú"} aria-expanded={expanded}
          aria-controls={menuId} onClick={() => expanded ? actions.current?.close() : onRequestOpen ? onRequestOpen(() => actions.current?.open()) : actions.current?.open()}>
          <NavbarIcon kind="menu" />
      </Button>
      <dialog ref={dialog} id={menuId} className="site-menu-dialog" aria-labelledby={titleId}>
        <div className="site-menu-panels">
          <Section surface="page" data-menu-panel className="site-menu-main side-panel">
            <div className="site-menu-heading">
              <h2 id={titleId} className="site-menu-title">Menú</h2>
            </div>
            <nav aria-label="Secciones">
              <ol className="site-menu-links">
                {items.map(({ href, label, description }) => (
                  <li key={href}><a href={href} aria-current={activeHref === href ? "location" : undefined}>
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
            {user && onLogout ? (
              <div className="site-menu-login flex flex-wrap items-center gap-3">
                <div className="site-menu-account" aria-label={`Sesión activa: ${user.nombre}, rol ${roleLabel}`}>
                  <AvatarUsuario user={user} className="site-menu-account-avatar" imageClassName="site-menu-account-photo" />
                  <span className="site-menu-account-copy"><strong>{user.nombre}</strong><small>{roleLabel}</small></span>
                </div>
                {footerLink !== LOGIN_LINK && <Button href={footerLink.href} magnetic={false} variant="secondary">{footerLink.label}</Button>}
                <Button type="button" magnetic={false} variant="secondary" className="site-menu-logout-text" onClick={onLogout}>
                  Cerrar sesión ({roleLabel})
                </Button>
                <Button type="button" magnetic={false} variant="secondary" className="site-menu-logout-icon site-navbar-icon-control" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={onLogout}>
                  <LogOut size={20} aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Button href={footerLink.href} magnetic={false} variant="secondary" className="site-menu-login">{footerLink.label}</Button>
            )}
          </Section>

        </div>
      </dialog>
    </div>
  );
}

