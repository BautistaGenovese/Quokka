"use client";

import SlingButton from "@/components/ui/SlingButton";
import { QuokkaLogo } from "@/components/layout/detalles-marca";

export default function QuokkaSling() {
  const home = () => {
    if (location.pathname !== "/") { window.dispatchEvent(new CustomEvent("quokka:navigate", { detail: "/" })); return; }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  };
  return <SlingButton size={40} strokeWidth={2} armAt={22} maxPull={100} particles={0}
    padColor="transparent" wellColor="transparent" iconColor="var(--s-fg)" accentColor="var(--s-action)" bandColor="var(--s-line)"
    ariaLabel="Quokka, volver al inicio" hint="Clic o Enter para subir suavemente al inicio. Estirá y soltá para hacer llover Quokkas. Escape cancela el gesto."
    onTap={home} onSend={() => window.dispatchEvent(new Event("quokka:rain"))}>
    <span className="site-navbar-mascot-motion" data-scroll-quokka><QuokkaLogo /></span>
  </SlingButton>;
}
