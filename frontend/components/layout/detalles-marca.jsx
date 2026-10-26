"use client";

import { TEAM } from "@/lib/contenido-sitio";
import Image from "next/image";
import { useState } from "react";

/** Símbolo vectorial de Quokka. Sin IDs compartidos entre instancias. */
export function QuokkaLogo() {
  return <svg className="site-navbar-mascot" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <g stroke="var(--palette-deep)" strokeWidth="2.5" strokeLinejoin="round" fill="var(--quokka-fur)">
      <circle cx="14" cy="16" r="8" /><circle cx="50" cy="16" r="8" />
      <ellipse cx="32" cy="36" rx="23" ry="21" />
      <ellipse cx="32" cy="43" rx="13" ry="10" fill="var(--quokka-muzzle)" />
    </g>
    <g fill="var(--quokka-muzzle)"><circle cx="14" cy="16" r="3.5" /><circle cx="50" cy="16" r="3.5" /></g>
    <g fill="var(--palette-color-1)" opacity=".7"><circle cx="17" cy="40" r="3" /><circle cx="47" cy="40" r="3" /></g>
    <g fill="var(--palette-deep)"><circle cx="23" cy="30" r="2.8" /><circle cx="41" cy="30" r="2.8" /><ellipse cx="32" cy="37" rx="4.5" ry="3.2" /></g>
    <path d="M22 45q10 10 20 0" fill="none" stroke="var(--palette-deep)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}

/** Iniciales y nombres del equipo, desde una única fuente de contenido. */
export function TeamAvatars({ members = TEAM }) {
  return <div className="quokka-team" aria-label={`Equipo: ${members.map(member => member.name).join(", ")}`}>
    {members.map(member => <Avatar key={member.name} member={member} />)}
  </div>;
}

function Avatar({ member: { name, portrait } }) {
  const [failed, setFailed] = useState(null);
  return <span aria-hidden="true">{portrait && failed !== portrait
    ? <Image src={portrait} width={40} height={40} sizes="40px" alt="" onError={() => setFailed(portrait)} />
    : name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("")}</span>;
}

/** Mascota del cierre, adaptada a los roles de la superficie. */
export function QuokkaPeek({ className = "" }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <g fill="var(--s-action)" stroke="var(--s-bg)" strokeWidth="2.5">
      <circle cx="14" cy="16" r="8"/><circle cx="50" cy="16" r="8"/>
      <ellipse cx="32" cy="36" rx="23" ry="21"/>
    </g>
    <g fill="var(--s-alt)"><circle cx="14" cy="16" r="3.5"/><circle cx="50" cy="16" r="3.5"/><ellipse cx="32" cy="43" rx="13" ry="10"/></g>
    <g fill="var(--s-bg)"><circle cx="23" cy="30" r="2.8"/><circle cx="41" cy="30" r="2.8"/><ellipse cx="32" cy="37" rx="4.5" ry="3.2"/></g>
    <path d="M22 45q10 10 20 0" stroke="var(--s-bg)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>;
}
