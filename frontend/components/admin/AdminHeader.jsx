"use client";

import ArrowLink from "@/components/ui/arrow-link";
import Button from "@/components/ui/button";
import { logout } from "@/lib/auth-api";
import PalettePanel from "@/components/navigation/palette-panel";
import useAppearance from "@/hooks/use-appearance";
import QuokkaSling from "@/components/navigation/quokka-sling";

export default function AdminHeader({ usuario, onLogout }) {
  const { theme, mode, setTheme, setMode } = useAppearance();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    else window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--s-border)] bg-[var(--s-bg)]/80 backdrop-blur-md px-gutter py-4 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Identidad y breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <QuokkaSling />
            <a href="/" className="font-display text-xl font-bold tracking-tight text-[var(--s-fg)]">
              quokka
            </a>
          </div>
          <span className="text-[var(--s-border)]" aria-hidden="true">/</span>
          <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--s-action)]/15 text-[var(--s-action)] font-semibold border border-[var(--s-action)]/20">
            Panel Administrador
          </span>
        </div>

        {/* Acciones y usuario activo */}
        <div className="flex items-center gap-3">
          <PalettePanel
            theme={theme}
            mode={mode}
            onThemeChange={setTheme}
            onModeChange={setMode}
            triggerClassName="site-navbar-control"
          />

          {usuario && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[var(--s-fg)]">
                {usuario.nombre}
              </span>
              <span className="text-[11px] font-mono text-[var(--s-action)]">
                {usuario.email}
              </span>
            </div>
          )}

          <ArrowLink href="/" direction="left" className="hidden md:inline-flex text-xs">
            Volver al estudio
          </ArrowLink>

          {usuario && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              magnetic={false}
              className="text-xs"
            >
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
