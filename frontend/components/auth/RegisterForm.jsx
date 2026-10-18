"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react"

import { registerSchema } from "@/lib/validations"
import { registerRequest } from "@/lib/auth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched", // validate on blur, then on change after first touch
  })

  const password = form.watch("password")

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  }
  const strengthCount = Object.values(passwordChecks).filter(Boolean).length
  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"]
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
  ]

  async function onSubmit(data) {
    setIsLoading(true)
    setServerError("")
    try {
      await registerRequest({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      })
      setIsSubmitted(true)
    } catch (error) {
      setServerError(error.message || "No se pudo registrar la cuenta. Revisá los datos ingresados.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          ¡Cuenta creada!
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Revisá tu correo para confirmar tu cuenta.
        </p>
        <Link href="/login" className="mt-2">
          <Button size="lg" className="px-8">
            Ir al inicio de sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        {/* Server-side error banner */}
        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-3 py-2.5 text-sm text-[var(--destructive)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3.25a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 4.75Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
            {serverError}
          </div>
        )}

        {/* Nombre */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: María García"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mín. 8 caracteres"
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strengthCount
                            ? strengthColors[strengthCount]
                            : "bg-[var(--border)]"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                    <span>Seguridad: {strengthLabels[strengthCount]}</span>
                    <div className="flex gap-3">
                      {[
                        { key: "length", label: "8+" },
                        { key: "uppercase", label: "A-Z" },
                        { key: "number", label: "0-9" },
                        { key: "special", label: "#@!" },
                      ].map(({ key, label }) => (
                        <span
                          key={key}
                          className={
                            passwordChecks[key]
                              ? "text-emerald-400"
                              : "opacity-50"
                          }
                        >
                          ✓ {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full gap-2"
          disabled={isLoading}
          id="register-submit-btn"
        >
          {isLoading ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creando cuenta…
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              Crear cuenta
            </>
          )}
        </Button>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] underline-offset-4 hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      </form>
    </Form>
  )
}
