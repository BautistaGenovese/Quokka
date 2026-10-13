"use client";

import { useRef } from "react";
import Image from "next/image";
import usePreviewShader from "@/hooks/use-preview-shader";

/** Imagen accesible siempre presente; el canvas es solo una mejora visual.
 * shader=false permite usar exactamente el mismo encuadre sin WebGL. */
export default function DemoPreview({ src, alt, shader = true,
  sizes = "(max-width: 768px) 82vw, 608px" }) {
  const rootRef = useRef(null), imageRef = useRef(null), canvasRef = useRef(null);
  usePreviewShader(rootRef, imageRef, canvasRef, shader, src);
  return <div ref={rootRef} className="demo-preview-media">
    <Image ref={imageRef} src={src} alt={alt} fill sizes={sizes} draggable={false} />
    <canvas ref={canvasRef} className="demo-preview-shader" aria-hidden="true" />
  </div>;
}
