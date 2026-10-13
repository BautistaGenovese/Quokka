"use client";

import { useId, useImperativeHandle, useRef, useState, useSyncExternalStore } from "react";
import Section from "@/components/section";
import Button from "@/components/ui/button.jsx";
import { gsap, useGSAP } from "@/lib/gsap";
import { preparePanelEntry, enterPanels, dropPanels } from "@/lib/panel-motion";
import { PALETTES } from "@/lib/palettes";

const subscribe = callback => {
  const media = matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const snapshot = () => matchMedia("(prefers-color-scheme: dark)").matches;
const serverSnapshot = () => false;
const COLOR_ROLES = ["bg-1", "bg-2", "bg-3", "deep", "color-1", "color-2", "color-3"];

/** Selector del prototipo: la página conserva el estado de tema y modo.
 * close() resuelve al terminar la caída, para alternar paneles sin solaparlos.
 * Las muestras de otras colecciones son previews; la tira actual usa tokens.
 */
export default function PalettePanel({ ref, theme, mode, onThemeChange, onModeChange, onRequestOpen, triggerClassName = "" }) {
  const id = useId();
  const panelId = `${id}-palette`;
  const titleId = `${id}-title`;
  const root = useRef(null);
  const dialog = useRef(null);
  const panel = useRef(null);
  const trigger = useRef(null);
  const actions = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [colorName, setColorName] = useState(null);
  const [chosenColor, setChosenColor] = useState(null);
  const systemDark = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const dark = mode === "dark" || (mode === "system" && systemDark);
  const collection = PALETTES.find(item => item.id === theme) ?? PALETTES[0];
  const names = collection.names[dark ? 1 : 0];
  useImperativeHandle(ref, () => ({ close: () => new Promise(resolve => {
    if (actions.current) actions.current.close(resolve);
    else resolve();
  }) }), []);

  useGSAP((context, contextSafe) => {
    const modal = dialog.current;
    const card = panel.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let animation;
    let wantsOpen = false;
    const closed = [];
    const finish = () => {
      if (wantsOpen) return;
      const returnFocus = modal.contains(document.activeElement);
      modal.close();
      if (returnFocus) trigger.current?.focus({ preventScroll: true });
      closed.splice(0).forEach(resolve => resolve());
    };
    const open = contextSafe(() => {
      animation?.kill(); wantsOpen = true; setExpanded(true);
      if (!modal.open) {
        modal.dataset.exiting = "false";
        modal.show(); modal.scrollTop = 0;
        preparePanelEntry(card);
      }
      modal.dataset.exiting = "false";
      if (reduced.matches) gsap.set(card, { x: 0, y: 0, rotation: 0 });
      else animation = enterPanels(card);
    });
    const close = contextSafe((afterClose) => {
      if (typeof afterClose === "function") {
        if (!modal.open) { afterClose(); return; }
        closed.push(afterClose);
      }
      if (!wantsOpen) return;
      animation?.kill(); wantsOpen = false; setExpanded(false);
      modal.dataset.exiting = "true";
      if (reduced.matches) finish();
      else {
        animation = dropPanels(card, finish);
      }
    });
    actions.current = { open, close };
    const escape = event => { if (event.key === "Escape" && modal.open) { event.preventDefault(); close(); } };
    const outside = event => { if (modal.open && !modal.contains(event.target) && !trigger.current?.contains(event.target)) close(); };
    const settle = contextSafe(() => {
      if (!reduced.matches) return;
      animation?.kill();
      if (wantsOpen) gsap.set(card, { x: 0, y: 0, rotation: 0 });
      else finish();
    });
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    reduced.addEventListener("change", settle);
    return () => {
      animation?.kill(); actions.current = null;
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      reduced.removeEventListener("change", settle);
      if (modal.open) modal.close();
      closed.splice(0).forEach(resolve => resolve());
    };
  }, { scope: root });

  return <div ref={root} className="palette-control">
    <Button ref={trigger} className={triggerClassName} type="button" variant="secondary" size="sm" magnetic={false} iconOnlyOnMobile aria-expanded={expanded} aria-controls={panelId}
      iconRight={<svg className="site-navbar-action-icon" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="10" r=".7" /><circle cx="10" cy="6.5" r=".7" /><circle cx="15" cy="7" r=".7" /></svg>}
      onClick={() => expanded ? actions.current?.close() : onRequestOpen ? onRequestOpen(() => actions.current?.open()) : actions.current?.open()}>Paleta</Button>
    <dialog ref={dialog} id={panelId} className="site-menu-dialog palette-dialog" aria-labelledby={titleId}>
      <div className="site-menu-panels palette-panels">
        <Section ref={panel} surface="page" className="palette-card side-panel">
          <div className="site-menu-heading"><h2 id={titleId} className="site-menu-title">Paleta de colores</h2>
            <Button autoFocus magnetic={false} variant="ghost" size="sm" className="site-menu-close" aria-label={expanded ? "Cerrar paleta" : "Reabrir paleta"}
              onClick={() => expanded ? actions.current?.close() : onRequestOpen ? onRequestOpen(() => actions.current?.open()) : actions.current?.open()}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </Button>
          </div>
          <div className="palette-modes" role="group" aria-label="Modo de color" data-dark={dark}>
            {[["light", "Claro"], ["dark", "Oscuro"]].map(([value, label]) => <button key={value} type="button" aria-pressed={value === (dark ? "dark" : "light")} onClick={() => onModeChange(value)}>{label}</button>)}
          </div>
          <div className="palette-choices" role="group" aria-label="Colección de colores">
            {PALETTES.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => { setColorName(null); setChosenColor(null); onThemeChange(item.id); }}>
              <span className="palette-preview" aria-hidden="true">{item.c[dark ? 1 : 0].slice(4).map(color => <i key={color} style={{ background: color }} />)}</span>{item.name}
            </button>)}
          </div>
          {/* Remontar este contenido reinicia solo la animación editorial;
              los controles mantienen su foco al cambiar tema o modo. */}
          <div key={`${theme}-${dark}`} className="palette-description">
            <h3>{Array.from(collection.name).map((letter, index) => <span aria-hidden="true" key={index} style={{ "--i": index * 1.5 }}>{letter === " " ? "\u00a0" : letter}</span>)}<span className="sr-only">{collection.name}</span></h3>
            <p className="palette-tag">{collection.tag}</p>
            <p className="palette-story">{collection.story.split(" ").map((word, index) => <span key={index} style={{ "--i": index }}>{word}</span>)}</p>
          </div>
          <ul className="palette-strip" aria-label="Colores de la colección" onPointerLeave={() => setColorName(chosenColor)}>
            {COLOR_ROLES.map((role, index) => <li key={role}><button type="button" style={{ background: `var(--palette-${role})` }} aria-label={names[index]} title={names[index]} aria-pressed={chosenColor === index}
              onPointerEnter={() => setColorName(index)} onFocus={() => setColorName(index)} onClick={() => { setChosenColor(index); setColorName(index); }} /></li>)}
          </ul>
          <p className="palette-color-name" aria-live="polite">{colorName === null ? "\u00a0" : names[colorName]}</p>
          <p className="palette-note">El sitio reparte estos colores entre sus secciones; en modo oscuro usa la versión nocturna de la misma colección</p>
        </Section>
      </div>
    </dialog>
  </div>;
}
