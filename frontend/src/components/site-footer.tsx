// DESIGN.md §6 (footer: closing visual, minimal credits) / §9 (semantic
// `footer`). Server component — keep free of client hooks.
export default function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 text-muted-foreground md:py-16">
      <div className="wrap flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-foreground">
            Quokka Studio
          </p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">
            Diseño y desarrollo de experiencias web.
          </p>
        </div>
        <p className="font-mono text-[0.8rem] tracking-[0.08em]">
          © 2026 Quokka Studio
        </p>
      </div>
    </footer>
  );
}
