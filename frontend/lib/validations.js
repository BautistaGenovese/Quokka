import { z } from "zod"

// ─── Password rules ──────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula.")
  .regex(/[0-9]/, "Debe contener al menos un número.")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
    "Debe contener al menos un carácter especial."
  )

// ─── Register schema ─────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(80, "El nombre no puede superar 80 caracteres.")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "El nombre solo puede contener letras."),

    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresá un correo electrónico válido."),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Confirmá tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

// ─── Login schema ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresá un correo electrónico válido."),

  password: z.string().min(1, "La contraseña es obligatoria."),
})
