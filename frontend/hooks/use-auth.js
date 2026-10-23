"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const AUTH_EVENT = "quokka:auth-change";

export const ROLE_LABELS = {
  usuario: "Usuario",
  operador: "Operador",
  administrador: "Administrador",
};

// La sesión vive en localStorage y se lee como store externo:
// así no hace falta copiarla al estado con setState dentro de un efecto.
const subscribeNoop = () => () => {};

function subscribeSession(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(AUTH_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(AUTH_EVENT, onChange);
  };
}

// useSyncExternalStore exige el mismo objeto mientras no cambie el valor guardado.
let cachedRaw = null;
let cachedUser = null;

function readStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("quokka_user");
  const token = window.localStorage.getItem("quokka_token");
  if (!raw || !token) return null;
  if (raw === cachedRaw) return cachedUser;
  try {
    cachedUser = JSON.parse(raw);
  } catch {
    cachedUser = null;
  }
  cachedRaw = raw;
  return cachedUser;
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export default function useAuth() {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const user = useSyncExternalStore(subscribeSession, readStoredUser, () => null);
  // Solo se verifica el token presente al montar; sin token no hay nada que cargar.
  const [initialToken] = useState(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("quokka_token"),
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = initialToken;
    if (!token) return;

    let cancelled = false;
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (res.status === 401) {
          window.localStorage.removeItem("quokka_token");
          window.localStorage.removeItem("quokka_user");
          notifyAuthChange();
          return;
        }
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data?.usuario && !cancelled) {
          if (data.token) window.localStorage.setItem("quokka_token", data.token);
          window.localStorage.setItem("quokka_user", JSON.stringify(data.usuario));
          notifyAuthChange();
        }
      })
      .catch(() => {
        // Si el backend no está accesible temporalmente, conservamos la sesión local
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialToken]);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("quokka_token");
    window.localStorage.removeItem("quokka_user");
    notifyAuthChange();
    window.location.href = "/";
  }, []);

  return {
    mounted,
    loading: !mounted || (initialToken !== null && checking),
    user,
    roleLabel: user?.rol ? ROLE_LABELS[user.rol] || user.rol : null,
    isAdmin: user?.rol === "administrador",
    isOperator: user?.rol === "operador",
    canAccessPanel: user?.rol === "administrador" || user?.rol === "operador",
    logout,
  };
}
