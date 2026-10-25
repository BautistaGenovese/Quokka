const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

/**
 * Consulta `GET /api/github/miembros` y devuelve el arreglo de perfiles
 * ({ nombre, usuario, avatar_url, bio, perfil_url, disponible }).
 * Lanza un error si el servidor no responde o la respuesta no es un arreglo.
 */
export async function obtenerMiembrosGithub({ signal } = {}) {
  const respuesta = await fetch(`${API_BASE_URL}/api/github/miembros`, { signal });
  if (!respuesta.ok) throw new Error("No pudimos cargar los perfiles de GitHub.");
  const datos = await respuesta.json().catch(() => null);
  if (!Array.isArray(datos)) throw new Error("Respuesta inesperada de los perfiles de GitHub.");
  return datos;
}

/** Normaliza un nombre para compararlo: minúsculas, sin tildes y sin espacios sobrantes. */
export function normalizarNombre(nombre) {
  return String(nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Acepta solo URLs http/https (el avatar y el enlace vienen de un servicio externo). */
function esUrlHttps(valor) {
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Combina los integrantes locales (nombre, rol, descripción) con los perfiles de GitHub.
 * Cada integrante se empareja por nombre. Si no hay perfil, se deja tal cual (sin foto
 * ni enlace): nunca se inventan datos.
 */
export function combinarEquipoConGithub(equipo, perfiles) {
  const porNombre = new Map(perfiles.map((perfil) => [normalizarNombre(perfil.nombre), perfil]));
  return equipo.map((integrante) => {
    const perfil = porNombre.get(normalizarNombre(integrante.name));
    if (!perfil) return integrante;
    return {
      ...integrante,
      ...(esUrlHttps(perfil.avatar_url) ? { portrait: perfil.avatar_url } : {}),
      ...(esUrlHttps(perfil.perfil_url) ? { profileHref: perfil.perfil_url } : {}),
    };
  });
}
