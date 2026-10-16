"use client";

import Link from "next/link";
import useAppearance from "@/hooks/use-appearance";
import Section from "@/components/layout/section";
import Navbar from "./navbar";
import LoginForm from "@/components/forms/login-form";

const LINKS = [{ href: "/", label: "Volver al estudio" }];

export default function LoginPage() {
  const { theme, mode, setTheme, setMode } = useAppearance();
  return <>
    <Navbar items={LINKS} theme={theme} mode={mode} onThemeChange={setTheme} onModeChange={setMode} />
    <Section as="main" surface="page" className="min-h-[calc(100dvh-82px)] px-gutter py-section">
      <div className="mx-auto max-w-md space-y-8">
        <Link href="/" className="studio-text-link">← Volver al estudio</Link>
        <div className="space-y-3"><p className="studio-eyebrow">Tu espacio en Quokka</p><h1 className="font-display text-5xl font-extrabold tracking-tight">Qué bueno verte.</h1><p>Ingresá con tu correo y contraseña.</p></div>
        <LoginForm />
      </div>
    </Section>
  </>;
}
