"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const ROLE_LABELS = {
  usuario: "Usuario",
  operador: "Operador",
  administrador: "Administrador",
};

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("quokka_user");
    const token = window.localStorage.getItem("quokka_token");
    if (!raw || !token) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    setMounted(true);
    const initialUser = readStoredUser();
    setUser(initialUser);

    const token = typeof window !== "undefined" ? window.localStorage.getItem("quokka_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (res.status === 401) {
          window.localStorage.removeItem("quokka_token");
          window.localStorage.removeItem("quokka_user");
          if (!cancelled) setUser(null);
          return;
        }
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data?.usuario && !cancelled) {
          if (data.token) window.localStorage.setItem("quokka_token", data.token);
          window.localStorage.setItem("quokka_user", JSON.stringify(data.usuario));
          setUser(data.usuario);
        }
      })
      .catch(() => {
        // Si el backend no está accesible temporalmente, conservamos la sesión local
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const onStorage = () => syncFromStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener("quokka:auth-change", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("quokka:auth-change", onStorage);
    };
  }, [syncFromStorage]);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("quokka_token");
    window.localStorage.removeItem("quokka_user");
    setUser(null);
    window.dispatchEvent(new Event("quokka:auth-change"));
    window.location.href = "/";
  }, []);

  return {
    mounted,
    loading,
    user,
    roleLabel: user?.rol ? ROLE_LABELS[user.rol] || user.rol : null,
    isAdmin: user?.rol === "administrador",
    isOperator: user?.rol === "operador",
    canAccessPanel: user?.rol === "administrador" || user?.rol === "operador",
    logout,
  };
}
