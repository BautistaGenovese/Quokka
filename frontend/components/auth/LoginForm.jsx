"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { loginSchema } from "@/lib/validations"
import { loginRequest } from "@/lib/auth-api"
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

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  })

  async function onSubmit(data) {
    setIsLoading(true);
    setServerError("");
    try {
      const response = await loginRequest({
        email: data.email,
        password: data.password,
      });

      if (response?.usuario?.rol === "administrador") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setServerError(error.message || "Correo o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillAdminCredentials() {
    form.setValue("email", "admin@quokka.studio", { shouldValidate: true });
    form.setValue("password", "Admin123!", { shouldValidate: true });
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
              <div className="flex items-center justify-between">
                <FormLabel>Contraseña</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--primary)] hover:underline"
                  tabIndex={-1}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
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
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
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
          id="login-submit-btn"
        >
          {isLoading ? (
            <>
              <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Ingresando…
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              Iniciar sesión
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={fillAdminCredentials}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] underline transition-colors text-center"
        >
          🔑 Cargar credenciales de Administrador de prueba
        </button>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--primary)] underline-offset-4 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </form>
    </Form>
  )
}
