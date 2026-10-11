import Link from "next/link";

// DESIGN.md §7.3 — global navigation labels (Spanish UI copy). Each entry maps
// to an App Router route; the two dashboard sub-views are reachable from Panel,
// so the global nav stays minimal instead of duplicating them.
const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/contact-me", label: "Contáctame" },
  { href: "/dashboard", label: "Panel" },
] as const;

// DESIGN.md §7.2/§7.3 — brand links to the site root; sticky translucent
// surface, accent hover/focus-visible states, and wrapping layout on small
// screens. Server component: active-route highlighting is intentionally
// omitted because it would require `usePathname` (a client hook), and DESIGN
// forbids indicating the active item by color alone anyway.
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
        <Link
          href="/"
          className="font-display text-[1.25rem] font-extrabold tracking-[-0.03em] text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Quokka Studio
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-block py-1 font-body text-[0.95rem] font-semibold text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
