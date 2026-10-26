"use client";

import ArrowLink from "@/components/ui/arrow-link";
import useAppearance from "@/hooks/use-apariencia";
import Section from "@/components/layout/section";
import Navbar from "./navbar";
import LoginForm from "@/components/forms/formulario-login";

const LINKS = [{ href: "/", label: "Volver al estudio" }];

export default function LoginPage() {
  const { theme, mode, setTheme, setMode } = useAppearance();
  return <>
    <a className="studio-skip-link" href="#login-content">Saltar al contenido</a>
    <Navbar items={LINKS} homeHref="/" theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
    <Section as="main" id="login-content" tabIndex={-1} surface="page" className="menu-destination min-h-[calc(100dvh-82px)] px-gutter py-section">
      <div className="mx-auto max-w-md space-y-8">
        <ArrowLink href="/" direction="left">Volver al estudio</ArrowLink>
        <div className="space-y-3"><p className="studio-eyebrow">Tu espacio en Quokka</p><h1 className="font-display text-5xl font-extrabold tracking-tight">Qué bueno verte.</h1><p>Ingresá con tu correo y contraseña.</p></div>
        <LoginForm />
      </div>
    </Section>
  </>;
}
