"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AppearanceContext = createContext(null);
const CURSOR_FOLLOWER_STORAGE_KEY = "quokka_cursor_follower_enabled";

/** El layout conserva una sola apariencia durante la navegación entre rutas. */
export function AppearanceProvider({ children }) {
  const [theme, setTheme] = useState("sonrisa");
  const [mode, setMode] = useState("light");
  const [cursorFollowerEnabled, setCursorFollowerEnabledState] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pal = theme;
    root.dataset.cursorFollower = String(cursorFollowerEnabled);
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
  }, [theme, mode, cursorFollowerEnabled]);
  useEffect(() => {
    try {
      // Restaurar la preferencia persistida al hidratar el proveedor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCursorFollowerEnabledState(window.localStorage.getItem(CURSOR_FOLLOWER_STORAGE_KEY) !== "false");
    } catch { /* Si el almacenamiento está bloqueado, se conserva el valor predeterminado. */ }
    const syncTab = event => {
      if (event.key === CURSOR_FOLLOWER_STORAGE_KEY) setCursorFollowerEnabledState(event.newValue !== "false");
    };
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);
  const setCursorFollowerEnabled = useCallback(value => {
    const next = Boolean(value);
    setCursorFollowerEnabledState(next);
    try { window.localStorage.setItem(CURSOR_FOLLOWER_STORAGE_KEY, String(next)); }
    catch { /* El ajuste sigue funcionando durante esta sesión. */ }
  }, []);
  return <AppearanceContext.Provider value={{ theme, mode, setTheme, setMode, cursorFollowerEnabled, setCursorFollowerEnabled }}>{children}</AppearanceContext.Provider>;
}

export default function useAppearance() {
  const appearance = useContext(AppearanceContext);
  if (!appearance) throw new Error("useAppearance requiere AppearanceProvider en el layout.");
  return appearance;
}
