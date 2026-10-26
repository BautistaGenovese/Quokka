"use client";

import { useEffect, useState } from "react";

const MINIMUM_VISIBLE_MS = 450;
const MAXIMUM_WAIT_MS = 2600;

function nextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

export default function InitialPageLoader() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();
    const timeout = new Promise(resolve => setTimeout(resolve, MAXIMUM_WAIT_MS));
    const heroImages = [...document.querySelectorAll("#inicio img")]
      .filter(image => !image.complete)
      .map(image => new Promise(resolve => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }));
    const assetsReady = Promise.allSettled([
      document.fonts?.ready ?? Promise.resolve(),
      ...heroImages,
    ]);

    const revealPage = async () => {
      await Promise.race([assetsReady, timeout]);
      const remaining = Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - startedAt));
      if (remaining) await new Promise(resolve => setTimeout(resolve, remaining));
      await nextFrame();
      await nextFrame();
      if (!cancelled) setActive(false);
    };

    revealPage();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="initial-page-loading" data-active={active ? "true" : "false"}
      role="status" aria-live="polite" aria-atomic="true" aria-hidden={!active}>
      <div className="initial-page-loading-content">
        <span className="initial-page-loading-label">Cargando</span>
        <span className="initial-page-loading-track" role="progressbar" aria-label="Cargando página">
          <span className="initial-page-loading-progress" />
        </span>
      </div>
    </div>
  );
}
