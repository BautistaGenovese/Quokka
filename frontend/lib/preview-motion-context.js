"use client";

import { createContext } from "react";

// Canal local por slider. Publica velocidad sin renderizar React por frame;
// las previews fuera de un slider simplemente muestran su imagen estática.
export const PreviewMotionContext = createContext(null);
export function createPreviewMotion() {
  const listeners = new Set();
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    publish(velocity) { listeners.forEach(listener => listener(velocity)); },
  };
}
