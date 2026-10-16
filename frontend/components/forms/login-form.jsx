"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

/** Punto de integración: onSignIn({ email, password }) devuelve una promesa.
 * Sin adaptador valida la maqueta; no persiste credenciales ni crea sesiones. */
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
    if (!onSignIn) { setMessage("Campos validados. El inicio de sesión todavía no está habilitado."); return; }
    setStatus("loading");
    try { await onSignIn(values); setStatus("success"); setMessage("Sesión iniciada."); }
    catch { setStatus("error"); setMessage("No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo."); }
  }
  return <form onSubmit={submit} noValidate className="space-y-6">
    <fieldset disabled={status === "loading"} className="min-w-0 space-y-6">
      <Input name="email" type="email" label="Correo electrónico" autoComplete="username" required error={errors.email} onChange={() => edit("email")} />
      <Input name="password" type="password" label="Contraseña" autoComplete="current-password" required error={errors.password} onChange={() => edit("password")} />
      <Button type="submit" magnetic={false} status={status} fullWidth>Iniciar sesión</Button>
    </fieldset>
    <p role="status" className="min-h-6 text-sm">{message || "El inicio de sesión estará disponible próximamente."}</p>
  </form>;
}
