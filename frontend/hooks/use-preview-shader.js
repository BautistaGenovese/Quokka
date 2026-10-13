"use client";

import { useContext, useEffect } from "react";
import { gsap, MOTION } from "@/lib/gsap";
import { PreviewMotionContext } from "@/lib/preview-motion-context";
import createImageShader from "@/lib/create-image-shader";

/** Solo dibuja durante un impulso del slider y su retirada de 650 ms.
 * No hay ticker permanente: imagen quieta = cero renders WebGL por frame.
 * Desmontar, salir de pantalla o pedir movimiento reducido cancela el efecto.
 */
export default function usePreviewShader(rootRef, imageRef, canvasRef, enabled, src) {
  const motion = useContext(PreviewMotionContext);
  useEffect(() => {
    if (!enabled || !motion) return;
    const root = rootRef.current, image = imageRef.current, canvas = canvasRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let renderer, tween, visible = false, alive = true;
    const state = { velocity: 0 };
    const render = () => renderer?.render(state.velocity);
    const reset = () => { tween?.kill(); state.velocity = 0; render(); };
    const resize = () => { renderer?.resize(root.clientWidth, root.clientHeight); render(); };
    const removeRenderer = () => {
      reset(); canvas.style.opacity = "0";
      renderer?.dispose(); renderer = null;
    };
    const initialize = () => {
      if (!alive || reduced.matches || !image.complete || !image.naturalWidth || renderer) return;
      renderer = createImageShader(canvas, image);
      if (renderer) { resize(); canvas.style.opacity = "1"; }
    };
    const preference = () => { if (reduced.matches) removeRenderer(); else initialize(); };
    const lost = () => { tween?.kill(); canvas.style.opacity = "0"; renderer = null; };
    const visibility = () => { if (document.hidden) reset(); };
    const unsubscribe = motion.subscribe(velocity => {
      if (!renderer || !visible || document.hidden || reduced.matches) return;
      tween?.kill();
      state.velocity = gsap.utils.clamp(-1, 1, velocity / MOTION.shader.velocityScale);
      render();
      tween = gsap.to(state, { velocity: 0, duration: MOTION.shader.duration, ease: MOTION.shader.ease, onUpdate: render });
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset(); else render();
    });
    const observer = new ResizeObserver(resize);
    intersection.observe(root); observer.observe(root);
    image.addEventListener("load", initialize);
    canvas.addEventListener("webglcontextlost", lost);
    reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    initialize();
    return () => {
      alive = false; unsubscribe(); intersection.disconnect(); observer.disconnect();
      image.removeEventListener("load", initialize);
      canvas.removeEventListener("webglcontextlost", lost);
      reduced.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      removeRenderer();
    };
  }, [enabled, motion, rootRef, imageRef, canvasRef, src]);
}
