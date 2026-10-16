/** Contorno estable. Solo su opacidad pulsa cuando existe un error. */
export default function FieldBorder({ invalid }) {
  return <span className="quokka-field-border" data-error={invalid} aria-hidden="true" />;
}
