"use client";

import { useEffect, useState } from "react";

/** Una fuente de apariencia por página. Navbar y las secciones consumen
 * estos mismos valores; los componentes UI nunca consultan la ruta. */
export default function useAppearance() {
  const [theme, setTheme] = useState("eucalipto");
  const [mode, setMode] = useState("system");
  useEffect(() => {
    const root = document.documentElement;
    const previous = { pal: root.dataset.pal, theme: root.dataset.theme };
    root.dataset.pal = theme;
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
    return () => {
      for (const key of ["pal", "theme"]) {
        if (previous[key] == null) delete root.dataset[key];
        else root.dataset[key] = previous[key];
      }
    };
  }, [theme, mode]);
  return { theme, mode, setTheme, setMode };
}
