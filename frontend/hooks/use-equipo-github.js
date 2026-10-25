"use client";

import { useEffect, useMemo, useState } from "react";
import { combinarEquipoConGithub, obtenerMiembrosGithub } from "@/lib/github-api";

/**
 * Devuelve el equipo con la foto de perfil y el enlace de GitHub de cada integrante.
 * Mientras carga, o si la API falla, devuelve el equipo local sin foto ni enlace
 * (la galería muestra las iniciales y no dibuja el botón de GitHub).
 */
export default function useEquipoGithub(equipo) {
  const [perfiles, setPerfiles] = useState([]);

  useEffect(() => {
    const controlador = new AbortController();
    obtenerMiembrosGithub({ signal: controlador.signal }).then(
      (datos) => { if (!controlador.signal.aborted) setPerfiles(datos); },
      () => {}, // Si falla se conserva el equipo local; no se muestra ningún error
    );
    return () => controlador.abort();
  }, []);

  return useMemo(() => combinarEquipoConGithub(equipo, perfiles), [equipo, perfiles]);
}
