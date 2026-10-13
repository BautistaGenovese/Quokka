"use client";

import { useRef, useState } from "react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Button from "@/components/ui/button";
import Tooltip from "@/components/ui/tooltip";

/** Contenido real de contacto, compuesto con la UI existente. El consumidor
 * podrá conectar onSubmitMessage; sin él solo validamos, sin simular envíos. */
export default function ContactForm({ onSubmitMessage }) {
  const formRef = useRef(null);
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
    if (String(values.name).trim().length < 3) next.name = "Ingresá al menos 3 caracteres.";
    if (!values.email || !form.elements.email.validity.valid) next.email = "Ingresá un correo válido.";
    if (!values.type) next.type = "Elegí una categoría.";
    if (String(values.message).trim().length < 15) next.message = "Escribí al menos 15 caracteres.";
    setErrors(next);
    if (Object.keys(next).length) {
      setMessage("Revisá los campos marcados.");
      const name = Object.keys(next)[0];
      if (name === "type") form.querySelector('[role="combobox"]')?.focus();
      else form.elements[name]?.focus();
      return;
    }
    if (!onSubmitMessage) { setStatus("success"); setMessage("Mensaje validado. El envío por correo todavía no está conectado."); return; }
    setStatus("loading");
    try { await onSubmitMessage(values); setStatus("success"); setMessage("Tu mensaje fue enviado."); }
    catch { setStatus("error"); setMessage("No se pudo enviar el mensaje. Probá de nuevo."); }
  }
  return <form ref={formRef} noValidate onSubmit={submit} className="space-y-6">
    {/* fieldset tiene un mínimo intrínseco nativo: permitir que se comprima
        para que las etiquetas largas no ensanchen la página en celulares. */}
    <fieldset disabled={status === "loading"} className="min-w-0 space-y-6">
    <div className="grid gap-6 sm:grid-cols-2">
      <Input name="name" label="Nombre completo" autoComplete="name" icon="person" required minLength={3} error={errors.name} onChange={() => edit("name")} />
      <Input name="email" label="Correo electrónico" type="email" autoComplete="email" required error={errors.email} onChange={() => edit("email")}
        labelAccessory={<Tooltip label="Ayuda sobre el correo" content="Usá un correo con formato nombre@dominio.com. El envío se conectará al backend del proyecto." />} />
    </div>
    <Select name="type" label="Tipo de consulta" defaultValue="" required error={errors.type} onValueChange={() => edit("type")}>
      <option value="" disabled>Seleccioná una categoría</option>
      <option value="cotizacion">Cotización de proyecto integral</option>
      <option value="asesoria">Asesoría técnica y arquitectura</option>
      <option value="general">Consulta general</option>
    </Select>
    <Textarea name="message" label="Mensaje detallado" rows={4} required minLength={15} error={errors.message} onChange={() => edit("message")} description="Contanos sobre tu idea y los tiempos estimados. Mínimo 15 caracteres." />
    <Button type="submit" magnetic={false} status={status} successLabel={onSubmitMessage ? "¡Enviado!" : "Mensaje validado"}>{onSubmitMessage ? "Enviar mensaje" : "Validar mensaje"}</Button>
    </fieldset>
    <p role="status" className="min-h-6 font-body text-sm">{message || (!onSubmitMessage ? "Página de pruebas: este formulario valida los campos, pero todavía no envía datos." : "Los campos con * son obligatorios.")}</p>
  </form>;
}
