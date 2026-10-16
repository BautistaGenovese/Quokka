import { ArrowLeft, ArrowRight } from "lucide-react";
import "./arrow-link.css";

/** Enlace de navegación: un único destino y una flecha circular decorativa.
 * direction indica el regreso o avance; respeta movimiento reducido. */
export default function ArrowLink({ href, children, direction = "right", className = "", ...rest }) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;
  return <a {...rest} href={href} className={`arrow-link ${className}`} data-direction={direction}>
    <span className="arrow-link-icon" aria-hidden="true"><Icon size={20} /></span>
    <span>{children}</span>
  </a>;
}
