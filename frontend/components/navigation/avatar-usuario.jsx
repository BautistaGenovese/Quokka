"use client";

import { useState } from "react";
import Image from "next/image";

const PROFILE_IMAGE_FIELDS = ["picture", "foto_perfil_url", "foto_perfil", "google_picture", "avatar_url"];

/** Acepta solo fotos HTTPS de Google; el API podrá añadir cualquiera de estos campos. */
export function getGoogleProfileImage(user) {
  for (const field of PROFILE_IMAGE_FIELDS) {
    const candidate = user?.[field];
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" && (url.hostname === "googleusercontent.com" || url.hostname.endsWith(".googleusercontent.com"))) {
        return url.href;
      }
    } catch { /* Un valor que no sea URL se trata como foto ausente. */ }
  }
  return null;
}

export function getUserInitials(user) {
  return user?.nombre?.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase("es-AR")).join("") || "?";
}

export default function AvatarUsuario({ user, className = "", imageClassName = "" }) {
  const src = getGoogleProfileImage(user);
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <span className={className} aria-hidden="true">
      {showImage ? (
        <Image src={src} alt="" width={40} height={40} sizes="40px" className={imageClassName} onError={() => setFailedSrc(src)} />
      ) : getUserInitials(user)}
    </span>
  );
}
