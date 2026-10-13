"use client";

import { forwardRef, useImperativeHandle, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Section from "@/components/section";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";

// El SVG usa porcentajes para mantener la cobertura al redimensionar.
// Mismo algoritmo y parámetros de GSAP / Blake Bowen:
// https://codepen.io/GreenSock/pen/qBedXpg (SVG Shape Overlays).
// El borde no interpola formas prefijadas: anima diez alturas independientes.
const POINTS = 10;
const POINT_DELAY = 0.3;
const LAYER_DELAY = 0.25;
const DURATION = 0.9;
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Transición invocada por menú o footer, nunca por el scroll natural.
 * play(onCovered) ejecuta la navegación UNA vez, bajo cobertura total.
 * El portal evita el stacking context de Navbar y conserva su propio
 * contexto Section para heredar la colección global sin colores fijos.
 */
const SectionTransition = forwardRef(function SectionTransition({ navbarRef }, ref) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const root = useRef(null);
  const actions = useRef(null);
  useImperativeHandle(ref, () => ({
    play(onCovered) { actions.current ? actions.current.play(onCovered) : onCovered(); },
    cancel() { actions.current?.cancel(); },
  }), []);

  useGSAP((context, contextSafe) => {
    if (!mounted) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let timeline = null;
    let cover = null;
    const paths = [...root.current.querySelectorAll("path")];
    const heights = paths.map(() => Array(POINTS).fill(100));
    // El Navbar es una pieza independiente: medirlo evita duplicar su alto
    // en CSS y mantiene el recorte correcto en móvil y al cambiar fuentes.
    const measureNavbar = () => {
      // Reservar su altura también si estaba oculta por el scroll: durante
      // la navegación vuelve a mostrarse y la cubierta queda debajo de ella.
      const bottom = navbarRef?.current?.offsetHeight ?? 0;
      root.current.style.setProperty("--navbar-bottom", `${Math.max(0, bottom)}px`);
    };
    const observer = new ResizeObserver(measureNavbar);
    const navbar = navbarRef?.current;
    if (navbar) observer.observe(navbar);
    window.addEventListener("resize", measureNavbar);
    measureNavbar();
    // Curvas cúbicas con controles en el punto medio, igual que la demo.
    // La apertura sube desde abajo; el cierre retira la cubierta hacia arriba.
    const render = opening => {
      heights.forEach((values, layer) => {
        let d = opening ? `M0 0V${values[0]}C` : `M0 ${values[0]}C`;
        for (let point = 0; point < POINTS - 1; point++) {
          const x = (point + 1) * 100 / (POINTS - 1);
          const control = x - 50 / (POINTS - 1);
          d += `${control} ${values[point]} ${control} ${values[point + 1]} ${x} ${values[point + 1]} `;
        }
        paths[layer].setAttribute("d", d + (opening ? "V100H0Z" : "V0H0Z"));
      });
    };
    const navigate = () => { const callback = cover; cover = null; callback?.(); };
    const hide = contextSafe(() => {
      gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
      root.current.dataset.active = "false";
    });
    const cancel = contextSafe(() => { timeline?.kill(); cover = null; hide(); });
    // Cada pasada comparte los retrasos aleatorios entre capas, tal como
    // el original. La salida invierte el orden de las dos capas.
    const addPass = (opening, start) => {
      const delays = Array.from({ length: POINTS }, () => Math.random() * POINT_DELAY);
      timeline.call(() => {
        heights.forEach(values => values.fill(100));
        render(opening);
      }, [], start);
      heights.forEach((values, layer) => {
        const layerDelay = (opening ? layer : paths.length - layer - 1) * LAYER_DELAY;
        values.forEach((_, point) => timeline.to(values, {
          [point]: 0, duration: DURATION, ease: "power2.inOut",
          onUpdate: () => render(opening),
        }, start + delays[point] + layerDelay));
      });
    };
    const play = contextSafe((onCovered) => {
      // No se acumulan navegaciones mientras la pantalla está cubierta.
      if (cover || timeline?.isActive()) return;
      if (reduced.matches) { onCovered(); return; }
      cover = onCovered;
      measureNavbar();
      root.current.dataset.active = "true";
      gsap.set(root.current, { autoAlpha: 1, pointerEvents: "auto" });
      heights.forEach(values => values.fill(100));
      render(true);
      timeline = gsap.timeline({ onComplete: hide });
      addPass(true, 0);
      const coveredAt = timeline.duration();
      timeline.call(navigate, [], coveredAt);
      addPass(false, coveredAt);
      // Conserva la curva y los desfases proporcionales del original, pero
      // ambas pasadas duran 900 ms: un poco más de aire que la caída.
      timeline.duration(MOTION.section.duration);
    });
    // Si la preferencia cambia durante la transición, completar navegación
    // y liberar la capa de inmediato. El desmontaje solo limpia, no navega.
    const settle = contextSafe(() => {
      if (!reduced.matches) return;
      timeline?.kill(); navigate(); hide();
    });
    const preventScroll = event => { if (root.current.dataset.active === "true") event.preventDefault(); };
    const preventKeys = event => {
      if (root.current.dataset.active === "true" && ["Tab", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) event.preventDefault();
    };
    actions.current = { play, cancel };
    reduced.addEventListener("change", settle);
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("keydown", preventKeys);
    return () => {
      timeline?.kill(); cover = null; actions.current = null;
      observer.disconnect();
      window.removeEventListener("resize", measureNavbar);
      reduced.removeEventListener("change", settle);
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("keydown", preventKeys);
    };
  }, { scope: root, dependencies: [mounted, navbarRef], revertOnUpdate: true });

  return mounted ? createPortal(
    <Section as="div" surface="primary" ref={root} className="section-transition" aria-hidden="true" data-active="false">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path /><path /></svg>
    </Section>, document.body,
  ) : null;
});

export default SectionTransition;
