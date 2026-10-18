"use client";

import { useEffect, useState } from "react";
import Section from "@/components/layout/section";
import Button from "@/components/ui/button";
import ArrowLink from "@/components/ui/arrow-link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import {
  getStoredUser,
  fetchCurrentUser,
  loginRequest,
  logout,
} from "@/lib/auth-api";

export default function AdminPage() {
  const [usuario, setUsuario] = useState(null);
  const [comprobando, setComprobando] = useState(true);

  // Estados del mini login de acceso directo
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    async function verificarSesion() {
      setComprobando(true);
      const guardado = getStoredUser();
      if (guardado) {
        setUsuario(guardado);
      }
      try {
        const actual = await fetchCurrentUser();
        if (actual) {
          setUsuario(actual);
        }
      } catch {
        // En caso de error o token expirado
      } finally {
        setComprobando(false);
      }
    }

    verificarSesion();

    const handleAuthChange = () => {
      setUsuario(getStoredUser());
    };
    window.addEventListener("quokka:auth-change", handleAuthChange);
    return () => window.removeEventListener("quokka:auth-change", handleAuthChange);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const data = await loginRequest({
        email: loginEmail,
        password: loginPassword,
      });
      setUsuario(data.usuario);
    } catch (err) {
      setLoginError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCargarAdminPrueba = async () => {
    setLoginEmail("admin@quokka.studio");
    setLoginPassword("Admin123!");
    setLoginError("");
    setLoginLoading(true);
    try {
      const data = await loginRequest({
        email: "admin@quokka.studio",
        password: "Admin123!",
      });
      setUsuario(data.usuario);
    } catch (err) {
      setLoginError(err.message || "Asegurate de que el backend esté corriendo.");
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Cargando verificación inicial de sesión
  if (comprobando) {
    return (
      <Section surface="page" className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-[var(--s-action)] border-t-transparent" />
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--s-fg)]/60">
            Verificando credenciales de administrador…
          </p>
        </div>
      </Section>
    );
  }

  // 2. Si no ha iniciado sesión: Mostrar pantalla de ingreso exclusivo
  if (!usuario) {
    return (
      <Section surface="page" className="min-h-screen flex flex-col">
        <AdminHeader usuario={null} />
        <main className="flex-1 flex items-center justify-center px-gutter py-12">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-block text-3xl">🛡️</span>
              <p className="studio-eyebrow text-xs uppercase font-mono tracking-widest text-[var(--s-action)]">
                Seguridad & Control de Accesos
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--s-fg)]">
                Panel de Administrador
              </h1>
              <p className="text-sm text-[var(--s-fg)]/70">
                Esta sección es exclusiva para la gestión de usuarios. Iniciá sesión con una cuenta de Administrador.
              </p>
            </div>

            <Section surface="card" className="rounded-2xl border border-[var(--s-border)] p-6 md:p-8 space-y-5 shadow-xl">
              {loginError && (
                <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--s-fg)]">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@quokka.studio"
                    className="w-full rounded-lg border border-[var(--s-border)] bg-[var(--s-bg)] px-3 py-2 text-sm text-[var(--s-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--s-action)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--s-fg)]">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[var(--s-border)] bg-[var(--s-bg)] px-3 py-2 text-sm text-[var(--s-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--s-action)]"
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={loginLoading}
                  magnetic={false}
                  className="mt-2 text-sm"
                >
                  {loginLoading ? "Verificando…" : "Ingresar al Panel"}
                </Button>
              </form>

              <div className="pt-2 border-t border-[var(--s-border)] text-center space-y-2">
                <button
                  type="button"
                  onClick={handleCargarAdminPrueba}
                  className="text-xs text-[var(--s-action)] underline hover:opacity-80 transition-opacity font-medium"
                >
                  🔑 Ingresar con Administrador de prueba (1 clic)
                </button>

                <p className="text-xs text-[var(--s-fg)]/60">
                  ¿Querés registrarte primero?{" "}
                  <a href="/register" className="font-semibold text-[var(--s-action)] underline">
                    Crear cuenta
                  </a>
                </p>
              </div>
            </Section>

            <div className="text-center">
              <ArrowLink href="/" direction="left" className="text-xs">
                Volver al estudio
              </ArrowLink>
            </div>
          </div>
        </main>
      </Section>
    );
  }

  // 3. Si inició sesión pero NO es administrador: Acceso denegado (Requisito estricto de cátedra)
  if (usuario.rol !== "administrador") {
    return (
      <Section surface="page" className="min-h-screen flex flex-col">
        <AdminHeader usuario={usuario} onLogout={() => setUsuario(null)} />
        <main className="flex-1 flex items-center justify-center px-gutter py-12">
          <Section surface="card" className="w-full max-w-md rounded-2xl border border-rose-500/30 p-8 text-center space-y-5 shadow-xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 text-2xl">
              🚫
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-[var(--s-fg)]">
                Acceso Denegado
              </h1>
              <p className="text-sm text-[var(--s-fg)]/70">
                Tu cuenta actual está registrada con el rol{" "}
                <span className="font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[var(--s-bg)] border border-[var(--s-border)]">
                  {usuario.rol}
                </span>.
              </p>
            </div>
            <p className="text-xs text-[var(--s-fg)]/60 leading-relaxed">
              La visualización y gestión del registro de usuarios es de uso exclusivo para
              cuentas con rol de <strong>Administrador</strong>.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  logout();
                  setUsuario(null);
                }}
                magnetic={false}
                fullWidth
              >
                Cerrar sesión e ingresar como Admin
              </Button>
              <ArrowLink href="/" direction="left" className="justify-center text-xs pt-2">
                Volver a la portada pública
              </ArrowLink>
            </div>
          </Section>
        </main>
      </Section>
    );
  }

  // 4. Usuario autenticado como Administrador: Renderizar Panel de Control Completo
  return (
    <Section surface="page" className="min-h-screen flex flex-col">
      <AdminHeader usuario={usuario} onLogout={() => setUsuario(null)} />
      <main className="flex-1 px-gutter py-8 md:py-12 max-w-7xl mx-auto w-full">
        <AdminUsersTable adminUsuario={usuario} />
      </main>
    </Section>
  );
}
