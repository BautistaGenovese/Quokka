"use client";

import { useEffect } from "react";
import { registrarVisita, SECCIONES_RASTREADAS } from "@/lib/visitas-api";

/**
 * Registra hasta qué sección de la portada llega la persona.
 * Cada sección se informa una sola vez por carga de página, la primera vez que su
 * parte superior entra en el 65% superior de la pantalla (no se repite al subir y bajar).
 * Si hay una sección que no existe en el DOM, simplemente se omite.
 */
export default function useRastreadorSecciones(ruta = "/", secciones = SECCIONES_RASTREADAS) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const yaRegistradas = new Set();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const seccion = entrada.target.id;
          if (yaRegistradas.has(seccion)) continue;
          yaRegistradas.add(seccion);
          observador.unobserve(entrada.target);
          registrarVisita(ruta, seccion);
        }
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 0 },
    );

    for (const id of secciones) {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    }

    // Se libera el observador al salir de la página
    return () => observador.disconnect();
  }, [ruta, secciones]);
}
