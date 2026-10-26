"use client";

export default function NavigationLoadingIndicator({ active }) {
  return (
    <div className="navigation-loading" data-active={active ? "true" : "false"}
      role="status" aria-live="polite" aria-atomic="true" aria-hidden={!active}>
      <span className="navigation-loading-label">Cargando</span>
      <span className="navigation-loading-track" role="progressbar" aria-label="Cargando página">
        <span className="navigation-loading-progress" />
      </span>
    </div>
  );
}
