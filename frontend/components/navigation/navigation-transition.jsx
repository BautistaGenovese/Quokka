"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import SectionTransition from "./section-transition";
import { getSectionTarget, navigateToSection } from "@/lib/section-navigation";

/** Una única cubierta persistente para anclas y rutas de toda la aplicación. */
export default function NavigationTransition() {
  const transition = useRef(null);
  const routeReady = useRef(null);
  const pending = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { routeReady.current?.(); }, [pathname]);
  useEffect(() => {
    let routeTimeout;
    const navigate = url => {
      const samePage = url.pathname === location.pathname && url.search === location.search;
      if (pending.current || transition.current?.isActive()) return;
      pending.current = true;
      window.dispatchEvent(new Event("quokka:navigation-start"));
      transition.current?.play(() => {
        if (samePage) {
          if (url.hash) navigateToSection(url.hash);
          else { history.pushState(null, "", url.pathname + url.search); window.scrollTo({ top: 0, behavior: "instant" }); }
          pending.current = false;
          return;
        }
        if (url.pathname === location.pathname) {
          router.push(url.pathname + url.search + url.hash); pending.current = false; return;
        }
        return new Promise(resolve => {
          const finish = () => {
            clearTimeout(routeTimeout); routeReady.current = null; pending.current = false; resolve();
          };
          routeReady.current = finish; routeTimeout = setTimeout(finish, 7000);
          try { router.push(url.pathname + url.search + url.hash); } catch { finish(); }
        });
      });
    };
    const click = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !["http:", "https:"].includes(url.protocol)) return;
      const samePage = url.pathname === location.pathname && url.search === location.search;
      if (samePage && url.hash && !getSectionTarget(url.hash)) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(url);
    };
    const requested = event => {
      if (typeof event.detail !== "string") return;
      const url = new URL(event.detail, location.href);
      if (url.origin !== location.origin || !["http:", "https:"].includes(url.protocol)) return;
      if (url.pathname === location.pathname && url.hash && !getSectionTarget(url.hash)) return;
      navigate(url);
    };
    window.addEventListener("quokka:navigate", requested);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("quokka:navigate", requested);
      document.removeEventListener("click", click, true);
      clearTimeout(routeTimeout);
      routeReady.current?.();
    };
  }, [router]);
  return <SectionTransition ref={transition} />;
}
