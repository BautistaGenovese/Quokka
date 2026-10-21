import { PROJECTS } from "./site-content";

export const PROJECT_IMAGE_FALLBACK = "/previews/proyecto.svg";

const count = text => [...text].length;

function parse(value) {
  try { return new URL(value); } catch { return null; }
}

export function isHttpUrl(value) {
  if (typeof value !== "string") return false;
  const url = parse(value);
  return Boolean(url && ["http:", "https:"].includes(url.protocol) && url.hostname && !url.username && !url.password);
}

export function isCloudinaryUrl(value) {
  if (typeof value !== "string") return false;
  const url = parse(value);
  return Boolean(url && url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.port && !url.username && !url.password);
}

/** Replica las reglas del servidor para avisar antes de enviar; el backend sigue siendo la autoridad. */
export function validateProjectForm(values) {
  const get = key => String(values?.[key] ?? "").trim();
  const fields = {};
  const titulo = get("titulo");
  if (count(titulo) < 3) fields.titulo = "Ingresá al menos 3 caracteres.";
  else if (count(titulo) > 150) fields.titulo = "El título no puede superar los 150 caracteres.";
  if (count(get("descripcion")) > 5000) fields.descripcion = "La descripción no puede superar los 5000 caracteres.";
  if (count(get("tecnologias")) > 255) fields.tecnologias = "Las tecnologías no pueden superar los 255 caracteres.";
  const demo = get("url_demo");
  if (demo && (count(demo) > 255 || !isHttpUrl(demo))) fields.url_demo = "Ingresá una URL válida que empiece con http:// o https://.";
  const image = get("imagen_url");
  if (image && (count(image) > 2048 || !isCloudinaryUrl(image))) fields.imagen_url = "La imagen debe ser una URL de Cloudinary (https://res.cloudinary.com/...).";
  const publicId = get("imagen_public_id");
  if (publicId) {
    if (!image) fields.imagen_public_id = "Cargá la URL de la imagen antes del identificador.";
    else if (count(publicId) > 255) fields.imagen_public_id = "El identificador no puede superar los 255 caracteres.";
  }
  return { isValid: Object.keys(fields).length === 0, fields };
}

/**
 * Tarjetas de la galería. Devuelve null mientras carga. Las muestras estáticas solo
 * aparecen si la API falla o viene vacía, nunca mezcladas, y no enlazan ni se bloquean.
 */
export function toGalleryCards({ data, loading, error }, { loggedIn }) {
  if (loading) return null;
  if (error || !Array.isArray(data) || !data.length) {
    return PROJECTS.map(project => ({ key: project.id, title: project.title, description: project.description, preview: project.preview, sample: true, locked: false }));
  }
  return data.map(project => ({
    key: String(project.id), title: project.titulo, description: project.descripcion || "", imageUrl: project.imagen_url, sample: false,
    locked: !loggedIn, ...(loggedIn ? { demoHref: `/proyectos/${project.id}` } : {}),
  }));
}
