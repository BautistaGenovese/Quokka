import Link from "next/link"

/**
 * Shared layout wrapper for authentication pages.
 * Renders a centered card with the Quokka logo / brand,
 * a title and subtitle, and wraps the form content.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-12">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[520px] w-[520px] rounded-full bg-[var(--primary)] opacity-[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-2 focus-visible:outline-none"
        >
          {/* Quokka logo mark */}
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
              aria-hidden="true"
            >
              {/* Simplified quokka-ish face */}
              <circle cx="12" cy="10" r="7" />
              <path d="M9 13.5c.8 1 2.2 1.5 3 1.5s2.2-.5 3-1.5" />
              <circle cx="9.5" cy="9" r="1" fill="currentColor" stroke="none" />
              <circle cx="14.5" cy="9" r="1" fill="currentColor" stroke="none" />
              <path d="M7 5.5C5.5 4 4 4.5 3.5 6" />
              <path d="M17 5.5C18.5 4 20 4.5 20.5 6" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Quokka
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl backdrop-blur-sm">
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} Quokka. Todos los derechos reservados.
        </p>
      </div>
    </main>
  )
}
