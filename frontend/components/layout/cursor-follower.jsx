"use client";

import { gsap, useGSAP, MOTION } from "@/lib/gsap";

/**
 * Un único círculo ampliado, sin rellenos animados independientes.
 * Una bolita exterior de 18px mantiene la continuidad durante la retirada.
 * Libre vive en body e invierte el fondo. En Button se mueve al contexto
 * del botón, detrás del texto: conserva su centro y radio actuales, cambia
 * al color local de hover y crece hasta un RADIO del 85% del ancho.
 * Sigue al puntero en ambos modos. Al salir se contrae todavía dentro del
 * botón y se retira hacia el cursor antes de volver a body.
 */
export default function CursorFollower() {
  useGSAP((context, contextSafe) => {
    // Nodo decorativo gestionado aquí, fuera del árbol de React: podemos
    // trasladar el MISMO elemento entre body y Button sin recrearlo.
    const el = document.createElement("div");
    el.className = "cursor-follower";
    el.setAttribute("aria-hidden", "true");
    el.dataset.visible = "false";
    el.dataset.mode = "free";
    el.style.width = el.style.height = `${MOTION.follower.radius * 2}px`;
    document.body.appendChild(el);
    // Continuación exterior durante la retirada: el círculo grande sigue
    // recortado dentro del botón, pero la bolita debe verse afuera desde que
    // su centro sale. Comparte exactamente la trayectoria del seguidor.
    // Nunca se agranda y se apaga en el mismo frame en que vuelve el nodo
    // principal a body: no hay aparición tardía ni círculo gigante exterior.
    const tip = document.createElement("div");
    tip.className = "cursor-follower";
    tip.dataset.visible = "false";
    tip.dataset.mode = "free";
    tip.dataset.cursorTip = "true";
    tip.setAttribute("aria-hidden", "true");
    tip.style.width = tip.style.height = `${MOTION.follower.radius * 2}px`;
    document.body.appendChild(tip);

    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let target = null;
    let leaving = false;
    let pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0, radius: MOTION.follower.radius };
    let visible = false;
    let ticking = false;
    let desiredRadius = MOTION.follower.radius;
    // GSAP interpola el estado; el ticker solo dibuja y coordina el cambio
    // de contexto. No hay una segunda física ni requestAnimationFrame propio.
    const options = { duration: MOTION.follower.duration, ease: MOTION.follower.ease };
    const xTo = gsap.quickTo(current, "x", options);
    const yTo = gsap.quickTo(current, "y", options);
    const radiusTo = gsap.quickTo(current, "radius", options);
    const setCircle = gsap.quickSetter(el, "css");
    const setTip = gsap.quickSetter(tip, "css");
    const resize = (radius) => {
      if (radius === desiredRadius) return;
      desiredRadius = radius;
      radiusTo(radius, current.radius);
    };

    const attach = (next) => {
      leaving = false;
      if (next === target) return;
      if (target) {
        delete target.dataset.cursorFill;
        delete target.dataset.cursorInk;
      }
      target = next;
      if (target) {
        target.dataset.cursorFill = "true";
        target.appendChild(el);
      } else {
        document.body.appendChild(el);
      }
      el.dataset.mode = target ? "button" : "free";
      // No tocar current ni opacity: entrar/salir no reinicia el seguidor.
      // En modo libre, CSS limita la parte visible a 9px de radio mientras
      // el radio interno se contrae. Así no se expone el círculo ampliado
      // cuando pierde el recorte del botón al volver a body.
    };

    const paint = () => {
      let x = current.x, y = current.y;
      if (target) {
        const box = target.getBoundingClientRect();
        const styles = getComputedStyle(target);
        const width = parseFloat(styles.width) || target.offsetWidth;
        const height = parseFloat(styles.height) || target.offsetHeight;
        const angle = (Number(gsap.getProperty(target, "rotation")) || 0) * Math.PI / 180;
        const scale = Number(gsap.getProperty(target, "scaleX")) || 1;
        const dx = (x - (box.left + box.width / 2)) / scale;
        const dy = (y - (box.top + box.height / 2)) / scale;
        // Mantener el par de texto del relleno mientras el círculo todavía
        // cubre el centro del botón durante la retirada, aunque :hover terminó.
        if (Math.hypot(dx, dy) < current.radius) target.dataset.cursorInk = "true";
        else delete target.dataset.cursorInk;
        // Convertir el centro de pantalla al contexto local, compensando
        // traslación y giro magnéticos. El círculo sigue al mouse, nunca
        // se fija al centro del botón ni al punto inicial de entrada.
        x = Math.cos(angle) * dx + Math.sin(angle) * dy + width / 2 - target.clientLeft;
        y = -Math.sin(angle) * dx + Math.cos(angle) * dy + height / 2 - target.clientTop;
        // ::before solo aporta el color de la variante; NO se expande.
        // Leerlo permite reaccionar a cambios de tema/modo durante hover.
        el.style.backgroundColor = getComputedStyle(target, "::before").backgroundColor;
      } else {
        el.style.removeProperty("background-color");
      }
      setCircle({ x: x - MOTION.follower.radius, y: y - MOTION.follower.radius, scale: target ? current.radius / MOTION.follower.radius : 1 });
      const outsideTarget = target && !target.contains(document.elementFromPoint(current.x, current.y));
      tip.dataset.visible = visible && leaving && outsideTarget ? "true" : "false";
      setTip({ x: current.x - MOTION.follower.radius, y: current.y - MOTION.follower.radius });
    };

    const tick = () => {
      if (!visible) return;
      if (target && (!target.isConnected || target.dataset.cursorButton !== "true")) attach(null);
      const radius = target && !leaving ? (parseFloat(getComputedStyle(target).width) || target.offsetWidth) * MOTION.follower.expandedRatio : MOTION.follower.radius;
      resize(radius);
      if (target && leaving) {
        const box = target.getBoundingClientRect();
        // Mantener el círculo detrás del botón durante la retirada. Solo
        // devolverlo a body cuando ya es pequeño o salió completamente
        // del rectángulo: no cortar de golpe la parte de fondo aún visible.
        const outside = current.x + current.radius < box.left ||
          current.x - current.radius > box.right ||
          current.y + current.radius < box.top ||
          current.y - current.radius > box.bottom;
        if (current.radius < 9.5 || outside) attach(null);
      }
      paint();
      // Con el botón activo sigue sus transformaciones y cambios de tema.
      // Libre se desconecta al terminar los tres tweens, sin ticker en reposo.
      if (!leaving && ![xTo, yTo, radiusTo].some(to => to.tween.isActive()) && (!target || !gsap.isTweening(target))) {
        gsap.ticker.remove(tick);
        ticking = false;
      }
    };
    const wake = () => {
      if (!ticking) {
        gsap.ticker.add(tick);
        ticking = true;
      }
    };

    const hide = contextSafe(() => {
      visible = false;
      attach(null);
      gsap.ticker.remove(tick);
      ticking = false;
      [xTo, yTo, radiusTo].forEach(to => to.tween.pause());
      el.dataset.visible = "false";
      tip.dataset.visible = "false";
    });
    const onMove = contextSafe((event) => {
      if (event.pointerType !== "mouse" || !fine.matches || reduced.matches) {
        hide();
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      if (!visible) {
        Object.assign(current, pointer, { radius: MOTION.follower.radius });
        desiredRadius = MOTION.follower.radius;
        visible = true;
        el.dataset.visible = "true";
      }
      // Pointer capture/:active durante un clic sostenido puede conservar
      // event.target. Hit-test real para que salir siempre retire el fondo.
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const next = hit?.closest('[data-cursor-button="true"]') ?? null;
      // La preview y el arrastre son protagonistas aquí. Sus acciones siguen
      // recibiendo relleno; fuera de ellas queda únicamente el cursor nativo.
      if (!next && hit?.closest('[data-cursor-quiet="true"]')) { hide(); return; }
      if (next) attach(next); // Reentrar cancela la retirada sin reiniciar radio.
      else if (target) leaving = true;
      // Pintar al cambiar de contenedor evita un frame con coordenadas del
      // contenedor anterior. Es el mismo círculo con la misma geometría.
      paint();
      xTo(pointer.x, current.x);
      yTo(pointer.y, current.y);
      resize(target && !leaving ? (parseFloat(getComputedStyle(target).width) || target.offsetWidth) * MOTION.follower.expandedRatio : MOTION.follower.radius);
      wake();
    });
    const onOut = (event) => { if (!event.relatedTarget) hide(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("blur", hide);
    window.addEventListener("keydown", hide);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    fine.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      hide();
      el.remove();
      tip.remove();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", hide);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("scroll", hide, true);
      fine.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
    };
  }, []);

  return null;
}
