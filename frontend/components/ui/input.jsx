"use client";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormField from "./form-field";

/** Campo de entrada de una línea. Para type="password" incorpora un botón accesible
 * que alterna la visibilidad del texto, salvo que se desactive con passwordToggle={false}.
 */
const Input = forwardRef(function Input({
  type = "text",
  passwordToggle,
  passwordVisible,
  onPasswordVisibleChange,
  endAction,
  ...props
}, ref) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isPassword = type === "password";
  const canTogglePassword = isPassword && passwordToggle !== false;
  const isControlled = typeof passwordVisible === "boolean";
  const isVisible = canTogglePassword ? (isControlled ? passwordVisible : internalVisible) : false;
  const resolvedType = isPassword && isVisible ? "text" : type;

  const toggleVisibility = () => {
    const next = !isVisible;
    if (!isControlled) setInternalVisible(next);
    onPasswordVisibleChange?.(next);
  };

  const resolvedEndAction = endAction ?? (canTogglePassword
    ? ({ fieldId }) => (
        <button
          type="button"
          className="quokka-password-toggle"
          aria-controls={fieldId}
          aria-pressed={isVisible}
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onMouseDown={event => event.preventDefault()}
          onClick={toggleVisibility}
        >
          {isVisible
            ? <EyeOff size={20} strokeWidth={1.8} aria-hidden="true" />
            : <Eye size={20} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      )
    : undefined);

  return (
    <FormField
      {...props}
      ref={ref}
      as="input"
      type={resolvedType}
      endAction={resolvedEndAction}
    />
  );
});
export default Input;
