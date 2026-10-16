"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppearanceContext = createContext(null);

/** El layout conserva una sola apariencia durante la navegación entre rutas. */
export function AppearanceProvider({ children }) {
  const [theme, setTheme] = useState("sonrisa");
  const [mode, setMode] = useState("light");
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pal = theme;
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
  }, [theme, mode]);
  return <AppearanceContext.Provider value={{ theme, mode, setTheme, setMode }}>{children}</AppearanceContext.Provider>;
}

export default function useAppearance() {
  const appearance = useContext(AppearanceContext);
  if (!appearance) throw new Error("useAppearance requiere AppearanceProvider en el layout.");
  return appearance;
}
