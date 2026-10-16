/** Cada icono conserva su identidad y cambia sus trazos al editar. */
export default function FieldIcon({ kind = "text", state = "idle" }) {
  return <svg className={"field-symbol field-symbol-" + kind} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon-state={state}>
    <g className="field-symbol-content">
      {kind === "person" ? <><circle className="field-symbol-head" cx="12" cy="7" r="3.5" /><path className="field-symbol-detail" d="M5 21v-2a7 7 0 0 1 14 0v2" /></> :
        kind === "mail" ? <><rect x="3" y="5" width="18" height="14" rx="2" /><path className="field-symbol-detail field-mail-flap" d="m3 7 9 6 9-6" /></> :
          kind === "message" ? <><path d="M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-5 3V5a2 2 0 0 1 2-2Z" /><path className="field-symbol-detail" d="M7 9h10M7 13h6" /></> :
            <><path className="field-symbol-detail" d="M4 5h16M4 12h16" /><path className="field-symbol-bottom" d="M4 19h10" /></>}
    </g>
    <g className="field-symbol-error"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></g>
  </svg>;
}
