const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Secciones de la portada que se rastrean, en el orden en que aparecen (ids de cada <Section>). */
export const SECCIONES_RASTREADAS = ["inicio", "proyectos", "manifiesto", "equipo", "servicios", "stack-tech", "contacto"];

// Ventana anti-duplicados: evita enviar dos veces la misma visita casi al mismo tiempo
// (por ejemplo, el doble montaje de React en desarrollo). Una visita nueva real,
// como volver a la portada más tarde, supera esta ventana y sí se registra.
const VENTANA_ANTIDUPLICADOS_MS = 2000;
const ultimosEnvios = new Map();

/**
 * Registra una visita en `POST /api/visitas`.
 * - `ruta`: página visitada (ej. "/" o "/proyectos/3").
 * - `seccion`: sección de la portada alcanzada (opcional).
 * Si hay sesión se envía el token para que cuente como visita autenticada.
 * Nunca lanza errores: las métricas no deben afectar la experiencia del usuario.
 */
export function registrarVisita(ruta, seccion = null) {
  if (typeof window === "undefined") return;

  const clave = `${ruta}|${seccion || ""}`;
  const ahora = Date.now();
  if (ahora - (ultimosEnvios.get(clave) || 0) < VENTANA_ANTIDUPLICADOS_MS) return;
  ultimosEnvios.set(clave, ahora);

  const token = window.localStorage?.getItem("quokka_token");
  try {
    fetch(`${API_BASE_URL}/api/visitas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ruta, ...(seccion ? { seccion } : {}) }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Se ignora cualquier fallo: el rastreo es opcional.
  }
}
