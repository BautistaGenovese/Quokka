"use client";

import { gsap, useGSAP, MOTION, BUTTON_MOTION } from "@/lib/gsap";

/** Movimiento de Button. No conoce temas, colores ni acciones de negocio.
 * GSAP es el único dueño de transform en el botón y su contenido.
 * Un contexto por componente limpia tweens y listeners al desmontar o al
 * cambiar disabled/loading/props. No hay estado React ni rAF por movimiento.
 */
export default function useButtonMotion(ref, contentRef, { inactive, href, magnetic, strength, maxRotation, motion = "expressive" }) {
  useGSAP((context, contextSafe) => {
    const el = ref.current;
    const content = contentRef.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const profile = BUTTON_MOTION[motion] ?? BUTTON_MOTION.subtle;
    if (inactive) {
      // Al cambiar loading/disabled se desmonta el controlador interactivo.
      // El nuevo contexto debe devolver explícitamente cuerpo Y contenido:
      // revertir los quickTo no garantiza restaurar su posición de reposo.
      delete el.dataset.pressed;
      delete el.dataset.pressSource;
      const duration = reduced.matches ? 0 : MOTION.response.duration;
      gsap.to(el, { x: 0, y: 0, rotation: 0, scale: 1, ...MOTION.response, duration, overwrite: "auto" });
      gsap.to(content, { x: 0, y: 0, ...MOTION.response, duration, overwrite: "auto" });
      return;
    }
    // Al salir de loading, revertOnUpdate deshace también el tween de retorno
    // y restaura su punto de partida (que podía estar inclinado). Fijar el
    // reposo ANTES de crear quickTo evita capturar de nuevo esa postura vieja.
    // useGSAP lo ejecuta antes de pintar: no aparece un frame torcido.
    gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 });
    gsap.set(content, { x: 0, y: 0 });
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const movement = Number.isFinite(strength) ? gsap.utils.clamp(0, 1, strength) : 0.28;
    const rotationLimit = Number.isFinite(maxRotation) ? gsap.utils.clamp(0, 15, maxRotation) : 7;
    let hovering = false;
    let rotation = 0;
    let returning = null;

    // quickTo reutiliza un tween por propiedad. Al reentrar durante el rebote
    // se retoma desde el valor REAL, sin saltar a un valor anterior cacheado.
    const xTo = gsap.quickTo(el, "x", MOTION.pull);
    const yTo = gsap.quickTo(el, "y", MOTION.pull);
    const rotateTo = gsap.quickTo(el, "rotation", MOTION.pull);
    const labelXTo = gsap.quickTo(content, "x", MOTION.pull);
    const labelYTo = gsap.quickTo(content, "y", MOTION.pull);
    const pausePull = () => [xTo, yTo, rotateTo, labelXTo, labelYTo].forEach(to => to.tween.pause());
    const to = (fn, node, property, value) => fn(value, Number(gsap.getProperty(node, property)) || 0);
    const releasePress = contextSafe(() => {
      if (!el.dataset.pressed) return;
      delete el.dataset.pressed;
      delete el.dataset.pressSource;
      if (!reduced.matches) {
        gsap.to(el, { ...MOTION.unpress, overwrite: "auto" });
        to(rotateTo, el, "rotation", rotation);
      }
    });
    const leave = contextSafe(() => {
      releasePress();
      if (!hovering) return;
      hovering = false;
      rotation = 0;
      releasePress();
      pausePull();
      returning?.kill();
      // Solo sobrescribe posición/giro, no la recuperación de escala.
      returning = gsap.timeline()
        .to(el, { x: 0, y: 0, rotation: 0, ...profile.release, overwrite: "auto" }, 0)
        .to(content, { x: 0, y: 0, ...profile.release, overwrite: "auto" }, 0);
    });
    const onMove = contextSafe((event) => {
      const inside = el.contains(event.target);
      if (!inside && el.dataset.pressSource !== "keyboard") releasePress();
      if (!inside || event.pointerType !== "mouse" || !fine.matches || reduced.matches || !magnetic) {
        leave();
        return;
      }
      hovering = true;
      returning?.kill();
      const box = el.getBoundingClientRect();
      const x = Number(gsap.getProperty(el, "x")) || 0;
      const y = Number(gsap.getProperty(el, "y")) || 0;
      const nx = gsap.utils.clamp(-1, 1, (event.clientX - (box.left + box.width / 2 - x)) / (el.offsetWidth / 2));
      const ny = gsap.utils.clamp(-1, 1, (event.clientY - (box.top + box.height / 2 - y)) / (el.offsetHeight / 2));
      rotation = nx * ny * rotationLimit;
      to(xTo, el, "x", nx * el.offsetWidth / 2 * movement);
      to(yTo, el, "y", ny * el.offsetHeight / 2 * movement);
      to(rotateTo, el, "rotation", rotation * (el.dataset.pressed ? 0.25 : 1));
      // Texto e iconos se mueven juntos, con límites que preservan el padding.
      const contentStrength = Math.min(1.5, movement / profile.strength);
      to(labelXTo, content, "x", nx * profile.labelX * contentStrength);
      to(labelYTo, content, "y", ny * profile.labelY * contentStrength);
    });
    const press = contextSafe((event) => {
      if (event.type === "pointerdown" && event.button !== 0) return;
      if (event.type === "keydown" && (event.repeat || !(event.key === "Enter" || (!href && event.key === " ")))) return;
      el.dataset.pressed = "true";
      el.dataset.pressSource = event.type === "keydown" ? "keyboard" : event.pointerType;
      if (!reduced.matches) {
        gsap.to(el, { ...MOTION.press, overwrite: "auto" });
        to(rotateTo, el, "rotation", rotation * 0.25);
      }
    });
    const reset = contextSafe(() => {
      hovering = false;
      rotation = 0;
      returning?.kill();
      // Conservar los tweens reutilizables de quickTo. Matarlos hace que
      // pierdan sus propiedades y no puedan retomar después del foco.
      pausePull();
      gsap.killTweensOf(el, "scale");
      gsap.set(el, { x: 0, y: 0, rotation: 0, scale: 1 });
      gsap.set(content, { x: 0, y: 0 });
      delete el.dataset.pressed;
      delete el.dataset.pressSource;
    });
    const onFocus = () => { if (el.matches(":focus-visible")) reset(); };
    const onKeyUp = (event) => { if (event.key === "Enter" || event.key === " ") releasePress(); };
    el.addEventListener("pointerdown", press);
    el.addEventListener("keydown", press);
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", releasePress);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", leave);
    window.addEventListener("pointerup", releasePress);
    window.addEventListener("pointercancel", reset);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", leave, { passive: true, capture: true });
    reduced.addEventListener("change", reset);
    fine.addEventListener("change", reset);
    return () => {
      delete el.dataset.pressed;
      delete el.dataset.pressSource;
      el.removeEventListener("pointerdown", press);
      el.removeEventListener("keydown", press);
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", releasePress);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerup", releasePress);
      window.removeEventListener("pointercancel", reset);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", leave, true);
      reduced.removeEventListener("change", reset);
      fine.removeEventListener("change", reset);
    };
  }, { scope: ref, dependencies: [inactive, href, magnetic, strength, maxRotation, motion], revertOnUpdate: true });
}
