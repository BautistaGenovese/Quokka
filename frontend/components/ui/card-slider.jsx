"use client";

import { Children, useId, useRef, useState } from "react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import Button from "./button";
import { PreviewMotionContext, createPreviewMotion } from "@/lib/preview-motion-context";

gsap.registerPlugin(Draggable, InertiaPlugin);

/** Carrusel circular sin duplicar cards ni sus IDs/enlaces.
 * GSAP anima una posición continua; wrap coloca cada card alrededor del
 * centro. React solo actualiza el índice accesible al terminar el recorrido.
 * El slider controla el movimiento exterior; Card puede inclinar su panel
 * interior y conservar el relieve sin compartir transforms con el arrastre.
 */
export default function CardSlider({ children, label = "Demos", className = "" }) {
  const slides = Children.toArray(children);
  // Al agregar, quitar o reordenar elementos, descartar también el índice y
  // los tweens antiguos. Los keys estables identifican las cards del consumidor.
  // Cambiar su contenido sin cambiar sus keys conserva la posición actual.
  const collectionKey = JSON.stringify(slides.map((slide, index) => slide.key ?? index));
  return <SliderTrack key={collectionKey} slides={slides} label={label} className={className} />;
}

function SliderTrack({ slides, label, className }) {
  const count = slides.length;
  const id = useId();
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const navigateRef = useRef(null);
  const [active, setActive] = useState(0);
  const [previewMotion] = useState(createPreviewMotion);
  const index = count ? active % count : 0;

  useGSAP((context, contextSafe) => {
    if (!count) return;
    const viewport = viewportRef.current;
    const nodes = Array.from(viewport.children);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const position = { value: 0 };
    let target = 0;
    let step = 1;
    let tween;
    let drag;
    let lastPosition = 0, lastTime = performance.now();
    const draw = (emitMotion = true) => {
      const now = performance.now();
      // Medir el desplazamiento circular, no el salto numérico al envolver
      // el índice. El shader recibe px/s tanto al arrastrar como con flechas.
      const delta = count > 1 ? gsap.utils.wrap(-count / 2, count / 2, position.value - lastPosition) : 0;
      if (emitMotion && Math.abs(delta) > .00001) {
        previewMotion.publish(delta * step / Math.max(.001, (now - lastTime) / 1000));
      }
      lastPosition = position.value; lastTime = now;
      nodes.forEach((node, i) => {
        const offset = count === 1 ? 0 : gsap.utils.wrap(-count / 2, count / 2, i - position.value);
        // Las laterales bajan solo al 90%, sin desvanecerse. La curva suave
        // evita un salto al cruzar el centro; siguen saliendo por los bordes.
        const distance = Math.min(1, Math.abs(offset));
        const scale = reduced.matches ? 1 : .9 + .1 * (1 + Math.cos(distance * Math.PI)) / 2;
        gsap.set(node, {
          x: offset * step,
          scale,
          opacity: 1,
          zIndex: Math.round((count - Math.abs(offset)) * 10),
        });
      });
    };
    const settle = () => {
      target = position.value = gsap.utils.wrap(0, count, Math.round(position.value));
      draw(false); setActive(target);
    };
    const go = contextSafe(next => {
      tween?.kill();
      drag?.tween?.kill();
      target = next;
      tween = gsap.to(position, {
        value: target, ...MOTION.slider, duration: reduced.matches ? 0 : MOTION.slider.duration,
        onUpdate: draw,
        onComplete: settle,
      });
    });
    // Si se pulsa una flecha durante la inercia, continuar desde la posición
    // visible, no desde el destino del último clic previo al arrastre.
    navigateRef.current = delta => go((drag?.isThrowing ? Math.round(position.value) : target) + delta);
    const measure = () => {
      const cardWidth = nodes[0].offsetWidth;
      // El salto circular tiene que ocurrir completamente fuera de pantalla,
      // incluso con pocas cards o un monitor muy ancho. No duplicamos IDs.
      step = Math.max(cardWidth + 48, (viewport.clientWidth + cardWidth + 96) / count);
      viewport.style.height = `${Math.max(...nodes.map(node => node.offsetHeight)) + 32}px`;
      draw(false);
    };
    const observer = new ResizeObserver(measure);
    nodes.forEach(node => observer.observe(node));
    observer.observe(viewport);
    measure();

    // Un proxy desacopla el arrastre de los transforms de cada card. Draggable
    // distingue el gesto del clic y permite el scroll vertical en celulares.
    const proxy = document.createElement("div");
    let start = 0;
    drag = count > 1 ? Draggable.create(proxy, {
      type: "x", trigger: viewport, dragClickables: false,
      minimumMovement: 4, allowNativeTouchScrolling: true,
      // InertiaPlugin conserva la velocidad del gesto y frena gradualmente.
      // snap alinea el destino, sin volver a lanzar otra animación al terminar.
      inertia: !reduced.matches, throwResistance: 1400,
      minDuration: 0.35, maxDuration: 1.2, overshootTolerance: 0,
      snap: { x: value => start * step - Math.round(start - value / step) * step },
      onPress: function () { tween?.kill(); start = position.value + this.x / step; },
      onDrag: function () { position.value = start - this.x / step; draw(); },
      onDragEnd: function () { if (reduced.matches) go(Math.round(position.value)); },
      onThrowUpdate: function () { position.value = start - this.x / step; draw(); },
      onThrowComplete: settle,
    })[0] : null;
    const onPreference = () => {
      if (drag) drag.vars.inertia = !reduced.matches;
      go(Math.round(position.value));
    };
    reduced.addEventListener("change", onPreference);
    return () => {
      navigateRef.current = null;
      observer.disconnect(); drag?.kill(); tween?.kill();
      reduced.removeEventListener("change", onPreference);
      viewport.style.removeProperty("height");
    };
  }, { scope: rootRef, dependencies: [count, previewMotion], revertOnUpdate: true });

  if (!count) return null;
  return (
    <PreviewMotionContext.Provider value={previewMotion}>
    <div ref={rootRef} role="region" aria-roledescription="carrusel" aria-label={label} className={className}>
      <div id={id} ref={viewportRef} data-cursor-quiet="true" className="card-slider-viewport rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        tabIndex={count > 1 ? 0 : undefined} aria-label="Usá las flechas izquierda y derecha para cambiar de demo"
        // Evitar el drag nativo de archivos de imagen; Draggable es el dueño
        // del gesto y sigue permitiendo el scroll vertical en pantallas táctiles.
        onDragStart={event => event.preventDefault()}
        onKeyDown={event => {
          // No capturar flechas usadas en controles dentro de una card.
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); navigateRef.current?.(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        {slides.map((slide, i) => (
          <div key={slide.key} className="card-slider-slide" role="group" aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`} aria-hidden={i !== index} inert={i !== index}>
            {slide}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-5">
        <Button variant="secondary" magnetic={false} size="sm" disabled={count < 2} aria-label="Demo anterior" aria-controls={id} onClick={() => navigateRef.current?.(-1)}>←</Button>
        <Button variant="secondary" magnetic={false} size="sm" disabled={count < 2} aria-label="Demo siguiente" aria-controls={id} onClick={() => navigateRef.current?.(1)}>→</Button>
      </div>
    </div>
    </PreviewMotionContext.Provider>
  );
}
