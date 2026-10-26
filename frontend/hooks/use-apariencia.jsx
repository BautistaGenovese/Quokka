"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { PALETTES } from "@/lib/paletas";

const AppearanceContext = createContext(null);
const STORAGE_KEYS = {
  theme: "quokka_appearance_theme",
  mode: "quokka_appearance_mode",
  cursorFollowerEnabled: "quokka_cursor_follower_enabled",
};
const DEFAULT_PREFERENCES = { theme: "sonrisa", mode: "system", cursorFollowerEnabled: true };

function readPreferences() {
  const theme = window.localStorage.getItem(STORAGE_KEYS.theme);
  const mode = window.localStorage.getItem(STORAGE_KEYS.mode);
  return {
    theme: PALETTES.some(palette => palette.id === theme) ? theme : DEFAULT_PREFERENCES.theme,
    mode: mode === "light" || mode === "dark" ? mode : "system",
    cursorFollowerEnabled: window.localStorage.getItem(STORAGE_KEYS.cursorFollowerEnabled) !== "false",
  };
}

/** El layout conserva una sola apariencia durante la navegación entre rutas. */
export function AppearanceProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const { theme, mode, cursorFollowerEnabled } = preferences;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.pal = theme;
    root.dataset.cursorFollower = String(cursorFollowerEnabled);
    if (mode === "system") delete root.dataset.theme;
    else root.dataset.theme = mode;
  }, [theme, mode, cursorFollowerEnabled]);
  useEffect(() => {
    try {
      // Restaurar preferencias persistidas al hidratar el proveedor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferences(readPreferences());
    } catch { /* Si el almacenamiento está bloqueado, se conserva el valor predeterminado. */ }
    const syncTab = event => {
      if (event.key === null || Object.values(STORAGE_KEYS).includes(event.key)) {
        try { setPreferences(readPreferences()); }
        catch { /* Un almacenamiento inaccesible conserva la apariencia actual. */ }
      }
    };
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);
  const setTheme = useCallback(value => {
    const next = PALETTES.some(palette => palette.id === value) ? value : DEFAULT_PREFERENCES.theme;
    setPreferences(previous => ({ ...previous, theme: next }));
    try { window.localStorage.setItem(STORAGE_KEYS.theme, next); }
    catch { /* El cambio sigue activo durante esta sesión. */ }
  }, []);
  const setMode = useCallback(value => {
    const next = value === "light" || value === "dark" ? value : "system";
    setPreferences(previous => ({ ...previous, mode: next }));
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEYS.mode);
      else window.localStorage.setItem(STORAGE_KEYS.mode, next);
    } catch { /* El cambio sigue activo durante esta sesión. */ }
  }, []);
  const setCursorFollowerEnabled = useCallback(value => {
    const next = Boolean(value);
    setPreferences(previous => ({ ...previous, cursorFollowerEnabled: next }));
    try { window.localStorage.setItem(STORAGE_KEYS.cursorFollowerEnabled, String(next)); }
    catch { /* El ajuste sigue funcionando durante esta sesión. */ }
  }, []);
  return <AppearanceContext.Provider value={{ theme, mode, setTheme, setMode, cursorFollowerEnabled, setCursorFollowerEnabled }}>{children}</AppearanceContext.Provider>;
}

export default function useAppearance() {
  const appearance = useContext(AppearanceContext);
  if (!appearance) throw new Error("useAppearance requiere AppearanceProvider en el layout.");
  return appearance;
}
