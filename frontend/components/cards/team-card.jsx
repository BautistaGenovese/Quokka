import { useId } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

/** Sin foto real, usar iniciales en vez de inventar una identidad visual. */
export default function TeamCard({ name, role, description, portrait, profileHref, tilt = true, ...rest }) {
  const titleId = useId();
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("");
  return (
    <Card {...rest} tilt={tilt} aria-labelledby={titleId}>
      {/* En móvil se apila; desde sm el retrato ocupa la columna izquierda.
          Ninguna altura fija: el texto puede crecer sin recortarse. */}
      <div className="card-content flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:gap-8 sm:p-10">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-card bg-action font-serif italic text-4xl font-semibold text-on-action sm:h-36 sm:w-36" aria-hidden="true">
          {portrait || initials}
        </div>
        <div className="card-content flex min-w-0 flex-1 flex-col gap-4">
          <p data-card-depth="detail" className="font-body text-xs font-extrabold uppercase tracking-widest">Equipo</p>
          <div className="card-content">
          <h3 data-card-depth="title" id={titleId} className="font-body text-2xl font-extrabold">{name}</h3>
          <p data-card-depth="body" className="mt-1 font-body text-lg font-extrabold">{role}</p>
          </div>
          <p data-card-depth="body" className="font-body text-lg font-normal">{description}</p>
          {profileHref && <div className="pt-1"><Button href={profileHref} magnetic={false} variant="secondary" size="sm">Ver perfil</Button></div>}
        </div>
      </div>
    </Card>
  );
}
