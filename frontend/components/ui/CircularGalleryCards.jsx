"use client";
import { capturePointer, releasePointer } from "@/lib/captura-puntero";

import { useEffect, useImperativeHandle, useRef } from "react";
import "./CircularGallery.css";

const wrap = (value, length) => ((value % length) + length) % length;

/** Recorrido de CircularGallery con tarjetas DOM para admitir FlipCard. */
export default function CircularGalleryCards({ ref, items, renderItem, bend = 3,
  scrollEase = 0.05, gap = 0.26, onActiveChange, className = "", style, ...rest }) {
  const root = useRef(null);
  const engine = useRef(null);
  const settings = useRef({ onActiveChange, bend, scrollEase, gap });
  useEffect(() => { settings.current = { onActiveChange, bend, scrollEase, gap }; engine.current?.wake(); });
  useImperativeHandle(ref, () => ({
    next: instant => engine.current?.move(1, instant),
    prev: instant => engine.current?.move(-1, instant),
    goTo: index => engine.current?.goTo(index),
  }), []);

  const count = items.length;
  useEffect(() => {
    if (!count) return;
    const el = root.current;
    const nodes = [...el.querySelectorAll(".circular-gallery-card-slot")];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let position = 0, target = 0, active = 0, frame = 0, last = 0;
    let width = 1, height = 1, cardWidth = 280, cardHeight = 360, spacing = 1;
    let drag = null, suppressClick = false;
    const announce = index => {
      const next = wrap(index, count);
      if (next !== active) { active = next; settings.current.onActiveChange?.(next); }
    };
    const draw = () => {
      const depth = Math.abs(settings.current.bend) * height / 16.57;
      const half = Math.max(width, height * 1.9) / 2;
      const radius = depth ? (half * half + depth * depth) / (2 * depth) : Infinity;
      nodes.forEach((node, i) => {
        const offset = wrap(i - position + count / 2, count) - count / 2;
        const x = offset * spacing;
        const reach = Math.min(Math.abs(x), half, radius * 0.999);
        const y = depth ? (radius - Math.sqrt(radius * radius - reach * reach)) * Math.sign(settings.current.bend) : 0;
        const angle = depth ? Math.sign(x) * Math.asin(reach / radius) * Math.sign(settings.current.bend) * 180 / Math.PI : 0;
        node.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`;
        const visible = Math.abs(x) < width / 2 + cardWidth / 2;
        node.style.visibility = visible ? "visible" : "hidden";
        node.style.zIndex = String(Math.round(100 - Math.abs(offset)));
        const centered = Math.abs(offset) < 0.5;
        node.inert = !centered;
        node.setAttribute("aria-hidden", String(!centered));
      });
    };
    const tick = time => {
      frame = 0;
      const dt = last ? Math.min(50, time - last) : 1000 / 60;
      last = time;
      const follow = preference.matches ? 1 : 1 - Math.pow(1 - Math.min(1, Math.max(0.001, settings.current.scrollEase)), dt / (1000 / 60));
      position += (target - position) * follow;
      if (Math.abs(target - position) < 0.001) position = target;
      draw();
      if (position !== target) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    function wake() { if (!frame) frame = requestAnimationFrame(tick); }
    const go = (next, instant = false) => {
      target = next;
      announce(Math.round(target));
      if (instant || preference.matches) { position = target; draw(); }
      else wake();
    };
    const measure = () => {
      width = el.clientWidth; height = el.clientHeight;
      cardHeight = Math.min(400, height * 0.67);
      cardWidth = Math.min(300, cardHeight * 0.75, width * 0.78);
      // Reservar suficiente recorrido para monitores anchos sin un salto visible.
      spacing = Math.max(cardWidth * (1 + settings.current.gap), (width + cardWidth) / count);
      nodes.forEach(node => {
        node.style.width = `${cardWidth}px`;
        node.style.height = `${cardHeight}px`;
      });
      draw(); wake();
    };
    const down = event => {
      if (event.button !== 0 || event.target.closest("a, input, select, textarea")) return;
      if (drag) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: target, moved: false };
      suppressClick = false;
    };
    const move = event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx) && event.pointerType === "touch") { drag = null; return; }
        drag.moved = true;
        suppressClick = true;
        capturePointer(el, event.pointerId);
        el.setAttribute("data-dragging", "");
      }
      target = drag.start - dx / spacing;
      announce(Math.round(target)); wake();
    };
    const up = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const moved = drag.moved;
      drag = null;
      el.removeAttribute("data-dragging");
      releasePointer(el, event.pointerId);
      if (moved) go(Math.round(target));
    };
    const click = event => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    };
    const key = event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      if (step) go(Math.round(target) + step, true);
      else go(Math.round(target) - wrap(Math.round(target), count) + (event.key === "End" ? count - 1 : 0), true);
      el.focus({ preventScroll: true });
    };
    engine.current = {
      wake,
      move: (direction, instant) => go(Math.round(target) + direction, instant),
      goTo: index => {
        const base = Math.round(target) - wrap(Math.round(target), count) + index;
        go([base - count, base, base + count].reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best));
      },
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("click", click, true);
    el.addEventListener("keydown", key);
    preference.addEventListener("change", wake);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); engine.current = null;
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("lostpointercapture", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("keydown", key);
      preference.removeEventListener("change", wake);
    };
  }, [count]);

  return <div ref={root} className={`circular-gallery circular-gallery--cards ${className}`}
    style={style} role="region" aria-roledescription="carrusel" tabIndex={0} {...rest}>
    {Array.from({ length: count }, (_, slot) => {
      const index = slot % count;
      return <div key={slot} className="circular-gallery-card-slot" aria-hidden={slot !== 0} inert={slot !== 0}
        style={{ visibility: slot === 0 ? "visible" : "hidden" }}>
        {renderItem(items[index], index)}
      </div>;
    })}
  </div>;
}
