"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import useAuth from "@/hooks/use-autenticacion";
import useAppearance from "@/hooks/use-apariencia";
import { safeNextPath } from "@/lib/redireccion-segura";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** Lee ?next= al momento de redirigir (sin useSearchParams) y solo acepta rutas internas. */
function redirectAfterLogin() {
  return safeNextPath(new URLSearchParams(window.location.search).get("next"));
}

/** Punto de integración: onSignIn({ email, password }) devuelve una promesa. */
export default function LoginForm({ onSignIn }) {
  const { mounted, user, roleLabel, canAccessPanel, logout } = useAuth();
  const { mode } = useAppearance();
  const [authMode, setAuthMode] = useState("login"); // "login" | "registro"
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const googleBtnRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPrefersDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const googleButtonTheme = mode === "dark" || (mode === "system" && prefersDark) ? "filled_black" : "outline";

  const isRegister = authMode === "registro";

  const edit = name => {
    setErrors(previous => ({ ...previous, [name]: undefined }));
    setStatus("idle");
    setMessage("");
  };

  function toggleMode() {
    setAuthMode(prev => (prev === "login" ? "registro" : "login"));
    setErrors({});
    setStatus("idle");
    setMessage("");
  }

  const handleGoogleCredential = useCallback(async response => {
    if (!response?.credential) return;
    setStatus("loading");
    setMessage("Verificando cuenta con Google...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al autenticar con Google.");
      }
      if (typeof window !== "undefined" && data?.token) {
        localStorage.setItem("quokka_token", data.token);
        localStorage.setItem("quokka_user", JSON.stringify(data.usuario));
        window.dispatchEvent(new Event("quokka:auth-change"));
      }
      setStatus("success");
      setMessage(`¡Bienvenido/a, ${data?.usuario?.nombre || "Usuario"}! Sesión iniciada.`);
      setTimeout(() => {
        window.location.href = redirectAfterLogin();
      }, 1000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "No se pudo iniciar sesión con Google.");
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleReady || (mounted && user)) return;
    if (window.google?.accounts?.id && googleBtnRef.current) {

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });

        googleBtnRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: googleButtonTheme,
          size: "large",
          shape: "pill",
          text: isRegister ? "signup_with" : "continue_with",
          width: 360,
          logo_alignment: "left",
        });
    }
  }, [googleReady, isRegister, mounted, user, handleGoogleCredential, googleButtonTheme]);

  async function submit(event) {
    event.preventDefault();
    if (status === "loading") return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const next = {};

    if (isRegister && String(values.nombre || "").trim().length < 2) {
      next.nombre = "El nombre debe tener al menos 2 caracteres.";
    }
    if (!values.email || !form.elements.email.validity.valid) {
      next.email = "Ingresá un correo válido.";
    }
    if (!values.password) {
      next.password = "Ingresá tu contraseña.";
    } else if (isRegister && String(values.password).length < 6) {
      next.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrors(next);
    if (Object.keys(next).length) {
      form.elements[Object.keys(next)[0]]?.focus();
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      if (onSignIn && !isRegister) {
        await onSignIn(values);
      } else {
        const endpoint = isRegister ? "/api/auth/registro" : "/api/auth/login";
        const payload = isRegister
          ? { nombre: String(values.nombre).trim(), email: values.email, password: values.password }
          : { email: values.email, password: values.password };

        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data?.fields && typeof data.fields === "object") {
            setErrors(data.fields);
          }
          throw new Error(data?.error || (isRegister ? "No se pudo crear la cuenta." : "Credenciales inválidas."));
        }
        if (typeof window !== "undefined" && data?.token) {
          localStorage.setItem("quokka_token", data.token);
          localStorage.setItem("quokka_user", JSON.stringify(data.usuario));
          window.dispatchEvent(new Event("quokka:auth-change"));
        }
      }
      setStatus("success");
      setMessage(isRegister ? "¡Cuenta creada con éxito! Redirigiendo..." : "Sesión iniciada. Redirigiendo...");
      setTimeout(() => {
        window.location.href = redirectAfterLogin();
      }, 1000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "No se pudo completar la operación. Revisá tus datos e intentá de nuevo.");
    }
  }

  if (mounted && user && status !== "success") {
    return (
      <div className="space-y-6 rounded-[1.125rem] border border-[var(--s-line)] bg-card p-6">
        <div className="space-y-2">
          <p className="studio-eyebrow">Sesión activa · {roleLabel}</p>
          <h2 className="font-display text-2xl font-bold">{user.nombre}</h2>
          <p className="text-sm opacity-80">{user.email}</p>
        </div>
        <div className="space-y-3 pt-2">
          <Button href="/" magnetic={false} fullWidth>
            Volver al portafolio
          </Button>
          {canAccessPanel && (
            <Button href="/panel" variant="secondary" magnetic={false} fullWidth>
              Ir al Panel de Control
            </Button>
          )}
          <Button type="button" variant="secondary" magnetic={false} fullWidth onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset disabled={status === "loading"} className="min-w-0 space-y-5">
          {isRegister && (
            <Input
              name="nombre"
              type="text"
              label="Nombre completo"
              autoComplete="name"
              icon="person"
              required
              minLength={2}
              error={errors.nombre}
              onChange={() => edit("nombre")}
            />
          )}
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            autoComplete="username"
            required
            error={errors.email}
            onChange={() => edit("email")}
          />
          <Input
            name="password"
            type="password"
            label={isRegister ? "Contraseña (mín. 6 caracteres)" : "Contraseña"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={isRegister ? 6 : undefined}
            error={errors.password}
            onChange={() => edit("password")}
          />
          <Button type="submit" magnetic={false} status={status} fullWidth>
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </Button>
        </fieldset>
      </form>

      {message && (
        <p role="status" className="text-sm text-center text-[var(--s-fg)] opacity-85">
          {message}
        </p>
      )}

      {GOOGLE_CLIENT_ID && <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive"
        onReady={() => setGoogleReady(true)} onError={() => setGoogleError(true)} />
      {/* Divisor con la paleta de la superficie (sin fondos oscuros fijos) */}
      <div className="relative my-7 flex items-center justify-center">
        <div className="w-full border-t border-[var(--s-line,currentColor)] opacity-25" />
        <span className="absolute bg-[var(--s-bg)] px-4 font-mono text-xs uppercase tracking-widest text-[var(--s-fg)] opacity-60">
          o continuá con
        </span>
      </div>

      {/* Botón de Google centrado con forma redondeada 'pill' */}
      <div className="flex justify-center">
        <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
      </div>
      {googleError && <p role="status" className="text-sm text-center">No pudimos cargar Google. Podés continuar con correo y contraseña.</p>}
      </>}

      {/* Alternar entre Iniciar Sesión y Registrarse con botón estilizado */}
      <div className="pt-6 border-t border-[var(--s-line,currentColor)] border-opacity-20 text-center space-y-3">
        <p className="font-body text-sm text-[var(--s-fg)] opacity-70">
          {isRegister ? "¿Ya tenés una cuenta registrada?" : "¿No tenés cuenta todavía?"}
        </p>
        <Button
          type="button"
          variant="secondary"
          className="bg-card"
          fullWidth
          magnetic={false}
          disabled={status === "loading"}
          onClick={toggleMode}
        >
          {isRegister ? "Iniciar sesión con tu cuenta" : "Registrate manualmente"}
        </Button>
      </div>
    </div>
  );
}


