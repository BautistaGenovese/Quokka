import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Technical section label rendered in mono uppercase (DESIGN.md §7.1). */
  label: string;
  /** Page title (Spanish copy supplied by each route). */
  title: string;
  /** Optional description content rendered under the title. */
  children?: ReactNode;
}

/**
 * Section header per DESIGN.md §7.1: mono index/label with a single `//`
 * prefix, Gabarito title, optional Source Sans description.
 * Server component — keep free of client hooks.
 */
export default function PageHeader({
  label,
  title,
  children,
}: PageHeaderProps) {
  return (
    <header className="pt-16 pb-10 md:pt-24">
      <p className="font-mono text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {`// ${label}`}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,6.8vw,5.6rem)] leading-[1] font-extrabold tracking-[-0.04em]">
        {title}
      </h1>
      {children ? (
        <div className="mt-4 max-w-[55ch] text-[1.15rem] leading-[1.6] text-muted-foreground">
          {children}
        </div>
      ) : null}
    </header>
  );
}
