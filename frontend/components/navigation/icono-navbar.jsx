/** Siluetas que cambian con hover, foco y aria-expanded del disparador. */
export default function NavbarIcon({ kind }) {
  return <svg className="navbar-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    {kind === "menu" ? <>
      <path className="nav-menu-line nav-menu-top" d="M5 7h14" />
      <path className="nav-menu-line nav-menu-middle" d="M5 12h14" />
      <path className="nav-menu-line nav-menu-bottom" d="M5 17h14" />
    </> : <>
      <rect className="nav-swatch nav-swatch-one" x="4" y="4" width="6" height="6" rx="1.5" />
      <rect className="nav-swatch nav-swatch-two" x="14" y="4" width="6" height="6" rx="1.5" />
      <rect className="nav-swatch nav-swatch-three" x="4" y="14" width="6" height="6" rx="1.5" />
      <rect className="nav-swatch nav-swatch-four" x="14" y="14" width="6" height="6" rx="1.5" />
      <path className="nav-palette-close nav-palette-close-one" d="M5 7h14" />
      <path className="nav-palette-close nav-palette-close-two" d="M5 17h14" />
    </>}
  </svg>;
}
