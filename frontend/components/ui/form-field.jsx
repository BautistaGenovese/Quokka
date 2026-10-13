"use client";

import { forwardRef, useId, useState } from "react";
import FieldIcon from "./field-icon";
import FieldBorder from "./field-border";

/** Estructura compartida por Input y Textarea. El ref apunta al control nativo,
 * para enfocar errores sin buscar elementos ni duplicar lógica de formulario.
 * No valida ni almacena valores: admite uso controlado o con FormData.
 */
const FormField = forwardRef(function FormField({
  as: Control, controlKind = Control, id, label, labelAccessory, description, error, required, icon,
  onFocus, onBlur, focusActive, placeholder = " ",
  className = "", wrapperClassName = "", "aria-describedby": describedBy,
  "aria-invalid": invalid, ...rest
}, ref) {
  const generatedId = useId();
  const [focused, setFocused] = useState(false);
  // Los campos de texto editan mientras tienen foco. Un selector, en cambio,
  // solo está activo mientras su lista está abierta; Radix devuelve el foco
  // al trigger al cerrar para conservar la navegación por teclado.
  const visuallyFocused = focusActive ?? focused;
  const hasError = Boolean(error) || invalid === true || invalid === "true";
  const iconKind = icon === false ? null : icon ?? (Control === "textarea" ? "message" : rest.type === "email" ? "mail" : "text");
  const fieldId = id || generatedId;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;
  const descriptions = [describedBy, description && helpId, error && errorId].filter(Boolean).join(" ");
  return (
    <div className={`quokka-field min-w-0 space-y-2 ${wrapperClassName}`} data-control={controlKind} data-focused={visuallyFocused} data-error={hasError} data-has-icon={Boolean(iconKind)}>
      <div className="quokka-field-frame">
        <Control {...rest} ref={ref} id={fieldId} required={required} placeholder={placeholder || " "}
          onFocus={event => { setFocused(true); onFocus?.(event); }}
          onBlur={event => { setFocused(false); onBlur?.(event); }}
          aria-invalid={hasError || invalid} aria-describedby={descriptions || undefined}
          className={`quokka-field-control font-body text-lg font-normal ${className}`} />
        <label htmlFor={fieldId} className="quokka-field-caption">{label}{required && <span aria-hidden="true"> *</span>}</label>
        {iconKind && <span className="quokka-field-icon" aria-hidden="true"><FieldIcon kind={iconKind} state={hasError ? "error" : focused ? "focus" : "idle"} /></span>}
        <FieldBorder invalid={hasError} focused={visuallyFocused} />
      </div>
      {labelAccessory && <div className="flex items-center gap-2">{labelAccessory}</div>}
      {description && <p id={helpId} className="font-body text-sm font-normal">{description}</p>}
      {/* El formulario anuncia el resultado; este texto queda asociado al
          campo para evitar múltiples alertas habladas al validar de una vez. */}
      {error && <p id={errorId} className="font-body text-sm font-normal text-error">{error}</p>}
    </div>
  );
});
export default FormField;
