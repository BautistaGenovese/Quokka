/** Navegación interna compartida por menú y footer. Solo modifica la página
 * cuando existe el destino; no intercepta URLs externas ni hashes vacíos. */
export function getSectionTarget(href) {
  if (typeof href !== "string" || !href.startsWith("#") || href.length < 2) return null;
  try { return document.getElementById(decodeURIComponent(href.slice(1))); }
  catch { return null; }
}

export function navigateToSection(href) {
  const target = getSectionTarget(href);
  if (!target) return;
  if (location.hash !== href) history.pushState(null, "", href);
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: "instant", block: "start" });
}
