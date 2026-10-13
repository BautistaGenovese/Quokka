"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Tooltip from "@/components/ui/tooltip";
import Select from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox";
import RadioGroup from "@/components/ui/radio-group";

/** El formulario decide validación y foco; Input/Textarea solo presentan
 * estados. Este ejemplo no realiza ninguna petición ni almacena datos. */
export default function ContactFormDemo() {
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = {};
    if (!String(data.get("name")).trim()) next.name = "Ingresá tu nombre.";
    if (!String(data.get("email")).trim() || !form.elements.email.validity.valid) next.email = "Ingresá un correo válido.";
    if (String(data.get("message")).trim().length < 10) next.message = "Escribí al menos 10 caracteres.";
    if (!data.get("projectType")) next.projectType = "Elegí un tipo de proyecto.";
    if (!data.get("stage")) next.stage = "Elegí en qué etapa estás.";
    setErrors(next);
    setSubmitted(!Object.keys(next).length);
    if (Object.keys(next).length) {
      const control = form.elements[Object.keys(next)[0]];
      // Un grupo de radios devuelve RadioNodeList, no un único input.
      // El select de Radix conserva un control oculto para FormData.
      if (control?.tagName === "SELECT") form.querySelector('[role="combobox"]')?.focus();
      else (control instanceof RadioNodeList ? control[0] : control)?.focus();
    }
  }
  const edit = name => {
    setErrors(previous => ({ ...previous, [name]: undefined }));
    setSubmitted(false);
  };
  function reset() {
    formRef.current.reset(); setErrors({}); setSubmitted(false);
  }
  return <form ref={formRef} noValidate onSubmit={submit} className="space-y-6">
    <p className="font-body text-lg">Probá enviar con campos vacíos para ver el borde de error. Al corregirlos, el contorno vuelve a su forma normal. Esta prueba no envía datos.</p>
    <div className="grid gap-6 sm:grid-cols-2">
      <Input label="Tu nombre" name="name" autoComplete="name" icon="person" required error={errors.name} onChange={() => edit("name")} />
      <Input label="Tu correo" name="email" type="email" autoComplete="email" required error={errors.email} onChange={() => edit("email")}
        labelAccessory={<Tooltip label="Ayuda sobre el correo" content="Usá un correo con formato nombre@dominio.com. En esta prueba no enviamos ni guardamos tus datos." />} />
    </div>
    <Textarea label="¿Qué te gustaría crear?" name="message" rows={4} required minLength={10} error={errors.message} onChange={() => edit("message")}
      description="Al menos 10 caracteres. Podés ajustar la altura hasta 240 px." />
    <Select label="Tipo de proyecto" name="projectType" defaultValue="" required error={errors.projectType} onValueChange={() => edit("projectType")}>
      <option value="" disabled>Elegí una opción</option>
      <option value="web">Sitio web</option>
      <option value="demo">Demo interactiva</option>
      <option value="app">Aplicación</option>
    </Select>
    <RadioGroup label="¿En qué etapa estás?" name="stage" required error={errors.stage} onValueChange={() => edit("stage")}
      options={[{ value: "idea", label: "Tengo una idea", description: "Quiero explorar las posibilidades." },
        { value: "design", label: "Ya tengo un diseño", description: "Quiero convertirlo en algo que funcione." },
        { value: "development", label: "Estoy desarrollando", description: "Quiero mejorar lo que ya existe." }]} />
    <Checkbox name="updates" value="yes" label="Me interesa conocer otras demos" description="Opción de prueba: no genera ninguna suscripción." />
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip label="Cómo funcionan estas opciones" content="El selector elige el tipo de proyecto; las opciones permiten una sola etapa; la casilla es independiente. Podés usar todos con teclado o táctil.">¿Qué elijo?</Tooltip>
      <Tooltip label="Datos de la prueba" variant="accent" content="Todo queda en esta página. Reiniciar borra los valores y los errores del formulario.">Sobre esta prueba</Tooltip>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <Button type="submit" magnetic={false} iconRight={submitted ? <Check size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}>{submitted ? "Campos listos" : "Probar formulario"}</Button>
      <Button variant="secondary" magnetic={false} onClick={reset}>Reiniciar</Button>
    </div>
    <p role="status" className="min-h-6 font-body">{submitted ? "Todo bien. No se envió ningún dato." : Object.values(errors).some(Boolean) ? "Revisá los campos marcados." : "Los campos con * son obligatorios."}</p>
  </form>;
}
