"use client";

import { useState } from "react";
import Image from "next/image";
import { PROJECT_IMAGE_FALLBACK } from "@/lib/projects";

/** Imagen de proyecto: usa la URL de Cloudinary y cae una sola vez a la imagen por defecto. */
export default function ProjectPreview({ src, alt, sizes = "(max-width: 768px) 82vw, 608px" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const url = src && failedSrc !== src ? src : PROJECT_IMAGE_FALLBACK;
  return <div className="demo-preview-media"><Image src={url} alt={alt} fill sizes={sizes} draggable={false} onError={() => { if (url !== PROJECT_IMAGE_FALLBACK) setFailedSrc(src); }} /></div>;
}
