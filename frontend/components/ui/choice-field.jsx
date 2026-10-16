"use client";

import { forwardRef, useId } from "react";

/** Base visual compartida. El input sigue siendo nativo: foco, teclado,
 * checked/defaultChecked, disabled y reset no dependen de estado duplicado.
 * La marca animada es decorativa; toda la etiqueta amplía el área de clic.
 */
const ChoiceField = forwardRef(function ChoiceField({ type = "checkbox", label, description, error,
  id, className = "", wrapperClassName = "", "aria-describedby": describedBy,
  "aria-invalid": invalid, ...props }, ref) {
  const generated = useId();
  const fieldId = id || generated;
  const descriptions = [describedBy, description && `${fieldId}-help`, error && `${fieldId}-error`].filter(Boolean).join(" ");
  const hasError = Boolean(error) || invalid === true || invalid === "true";
  return <div className={`quokka-choice ${wrapperClassName}`} data-error={hasError}>
    <label className="quokka-choice-label" htmlFor={fieldId}>
      <span className="quokka-choice-marker">
        <input {...props} ref={ref} id={fieldId} type={type} aria-invalid={hasError || invalid}
          aria-describedby={descriptions || undefined} className={`quokka-choice-control ${className}`} />
        <span className="quokka-choice-mark" aria-hidden="true" />
      </span>
      <span className="quokka-choice-copy"><span className="font-body text-lg font-semibold">{label}{props.required && <span aria-hidden="true"> *</span>}</span>
        {description && <span id={`${fieldId}-help`} className="block font-body text-sm font-normal">{description}</span>}
      </span>
    </label>
    {error && <p id={`${fieldId}-error`} className="mt-2 font-body text-sm text-error">{error}</p>}
  </div>;
});
export default ChoiceField;
