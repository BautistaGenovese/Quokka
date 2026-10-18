"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { loginRequest } from "@/lib/auth-api";

/** Punto de integración: onSignIn({ email, password }) devuelve una promesa.
 * Si no se pasa onSignIn, utiliza loginRequest del backend automáticamente. */
export default function LoginForm({ onSignIn }) {
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const edit = name => { setErrors(previous => ({ ...previous, [name]: undefined })); setStatus("idle"); setMessage(""); };
  async function submit(event) {
    event.preventDefault();
    if (status === "loading") return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const next = {};
    if (!values.email || !form.elements.email.validity.valid) next.email = "Ingresá un correo válido.";
    if (!values.password) next.password = "Ingresá tu contraseña.";
    setErrors(next);
    if (Object.keys(next).length) { form.elements[Object.keys(next)[0]]?.focus(); return; }
    
    setStatus("loading");
    try {
      if (onSignIn) {
        await onSignIn(values);
      } else {
        const res = await loginRequest(values);
        if (res?.usuario?.rol === "administrador") {
          window.location.href = "/admin";
          return;
        }
      }
      setStatus("success");
      setMessage("Sesión iniciada correctamente.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.");
    }
  }

  function fillAdmin(event) {
    event.preventDefault();
    const form = event.currentTarget.closest("form");
    if (!form) return;
    form.elements.email.value = "admin@quokka.studio";
    form.elements.password.value = "Admin123!";
    edit("email");
    edit("password");
  }

  return <form onSubmit={submit} noValidate className="space-y-6">
    <fieldset disabled={status === "loading"} className="min-w-0 space-y-6">
      <Input name="email" type="email" label="Correo electrónico" autoComplete="username" required error={errors.email} onChange={() => edit("email")} />
      <Input name="password" type="password" label="Contraseña" autoComplete="current-password" required error={errors.password} onChange={() => edit("password")} />
      <Button type="submit" magnetic={false} status={status} fullWidth>Iniciar sesión</Button>
    </fieldset>

    <div className="flex flex-col gap-3 text-center text-sm text-[var(--muted-foreground)]">
      <p role="status" className="min-h-6">{message || "El inicio de sesión estará disponible próximamente."}</p>
      <button
        type="button"
        onClick={fillAdmin}
        className="text-xs text-[var(--primary)] underline hover:opacity-80 transition-opacity"
      >
        🔑 Cargar credenciales de Administrador (admin@quokka.studio)
      </button>
      <p>
        ¿No tenés cuenta aún?{" "}
        <a href="/register" className="font-semibold text-[var(--primary)] underline">
          Crear cuenta
        </a>
      </p>
    </div>
  </form>;
}
