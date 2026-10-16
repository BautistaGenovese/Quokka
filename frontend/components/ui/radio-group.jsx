"use client";
import { forwardRef, useId } from "react";
import ChoiceField from "./choice-field";

/** Una sola opción por grupo. name agrupa radios nativos; si se omite, useId
 * evita que dos grupos independientes se desmarquen entre sí.
 * onValueChange recibe el valor; onChange del fieldset conserva el evento.
 */
const RadioGroup = forwardRef(function RadioGroup({ label, name, options = [], value, defaultValue,
  onValueChange, description, error, required, disabled, className = "",
  "aria-describedby": describedBy, "aria-invalid": invalid, ...props }, ref) {
  const generated = useId();
  const groupName = name || generated;
  const descriptions = [describedBy, description && `${generated}-help`, error && `${generated}-error`].filter(Boolean).join(" ");
  const hasError = Boolean(error) || invalid === true || invalid === "true";
  return <fieldset {...props} ref={ref} disabled={disabled} className={`quokka-radio-group space-y-3 ${className}`}
    data-error={hasError} aria-invalid={hasError || invalid} aria-describedby={descriptions || undefined}>
    <legend className="mb-2 font-body text-lg font-extrabold">{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {description && <p id={`${generated}-help`} className="font-body text-sm">{description}</p>}
    {options.map(option => <ChoiceField key={option.value} type="radio" name={groupName}
      label={option.label} description={option.description} value={option.value} required={required}
      disabled={disabled || option.disabled} aria-invalid={hasError} aria-describedby={descriptions || undefined}
      {...(value !== undefined ? { checked: value === option.value } : { defaultChecked: defaultValue === option.value })}
      onChange={event => onValueChange?.(event.target.value)} />)}
    {error && <p id={`${generated}-error`} className="font-body text-sm text-error">{error}</p>}
  </fieldset>;
});
export default RadioGroup;
