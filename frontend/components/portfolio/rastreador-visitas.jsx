"use client";

import useRastreadorSecciones from "@/hooks/use-rastreador-secciones";

/**
 * Componente invisible que registra qué secciones de la portada alcanza la persona.
 * Se monta solo en la portada pública; /panel e /iniciar-sesion no se rastrean.
 */
export default function RastreadorVisitas() {
  useRastreadorSecciones("/");
  return null;
}
