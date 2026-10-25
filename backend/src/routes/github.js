const express = require("express");
const router = express.Router();

// Integrantes del equipo y su usuario de GitHub. Es la única fuente de estos datos:
// el frontend solo conoce el nombre del integrante y recibe de aquí el avatar y el enlace.
// Se puede reemplazar con la variable de entorno GITHUB_USUARIOS, con el formato
// "Nombre Apellido:usuario,Otro Nombre:otrousuario".
const MIEMBROS_POR_DEFECTO = [
    { nombre: "Bautista Genovese", usuario: "BautistaGenovese" },
    { nombre: "Juan Girón", usuario: "juangiron06" },
    { nombre: "Lautaro Jándula", usuario: "codebylauti" },
    { nombre: "Ignacio Giangrieco", usuario: "xl5net" },
    { nombre: "Micaías Villa", usuario: "micaias05" },
];

const URL_API_GITHUB = "https://api.github.com";
const DURACION_CACHE_MS = 10 * 60 * 1000; // Perfiles correctos: 10 minutos
const DURACION_CACHE_ERROR_MS = 30 * 1000; // Perfiles fallidos: se reintenta pronto
const TIEMPO_MAXIMO_MS = 5000; // Tiempo máximo de espera por cada consulta a GitHub
const TAMANO_AVATAR = 600; // Lado en píxeles de la foto de perfil solicitada

// Caché en memoria por usuario, para no superar el límite de solicitudes de GitHub
// (60 por hora por IP sin token). Estructura: usuario -> { datos, expiraEn }.
const cache = new Map();

/** Lee la lista de integrantes desde GITHUB_USUARIOS o usa la lista por defecto. */
function obtenerMiembros() {
    const configurado = process.env.GITHUB_USUARIOS;
    if (!configurado || !configurado.trim()) return MIEMBROS_POR_DEFECTO;

    const miembros = configurado
        .split(",")
        .map((par) => par.split(":").map((parte) => parte.trim()))
        .filter(([nombre, usuario]) => nombre && usuario)
        .map(([nombre, usuario]) => ({ nombre, usuario }));
    return miembros.length > 0 ? miembros : MIEMBROS_POR_DEFECTO;
}

/** Solo se aceptan nombres de usuario válidos de GitHub (evita construir URLs raras). */
function esUsuarioValido(usuario) {
    return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(usuario);
}

/** Agrega el tamaño pedido a la URL del avatar para no descargar imágenes enormes. */
function avatarConTamano(urlAvatar) {
    if (typeof urlAvatar !== "string" || !urlAvatar) return null;
    try {
        const url = new URL(urlAvatar);
        url.searchParams.set("s", String(TAMANO_AVATAR));
        return url.toString();
    } catch {
        return null;
    }
}

/** Consulta `GET /users/:usuario` en GitHub y devuelve solo los campos que necesitamos. */
async function consultarPerfil(usuario) {
    const cabeceras = {
        Accept: "application/vnd.github+json",
        "User-Agent": "quokka-portfolio", // GitHub rechaza solicitudes sin User-Agent
        "X-GitHub-Api-Version": "2022-11-28",
    };
    // Opcional: con un token personal el límite sube a 5000 solicitudes por hora
    if (process.env.GITHUB_TOKEN) cabeceras.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const respuesta = await fetch(`${URL_API_GITHUB}/users/${encodeURIComponent(usuario)}`, {
        headers: cabeceras,
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    if (!respuesta.ok) {
        throw new Error(`GitHub respondió ${respuesta.status} para el usuario ${usuario}`);
    }
    const perfil = await respuesta.json();
    return {
        usuario: perfil.login || usuario,
        nombre_github: perfil.name || null,
        bio: perfil.bio || null,
        avatar_url: avatarConTamano(perfil.avatar_url),
        perfil_url: typeof perfil.html_url === "string" ? perfil.html_url : `https://github.com/${usuario}`,
    };
}

/**
 * Devuelve el perfil de un integrante usando la caché. Si GitHub falla:
 * - se reutiliza el último dato conocido (aunque haya vencido), o
 * - se devuelve el enlace al perfil sin avatar, marcado con `disponible: false`.
 */
async function obtenerPerfil(miembro) {
    const ahora = Date.now();
    const guardado = cache.get(miembro.usuario);
    if (guardado && guardado.expiraEn > ahora) return guardado.datos;

    try {
        const perfil = await consultarPerfil(miembro.usuario);
        const datos = { nombre: miembro.nombre, ...perfil, disponible: true };
        cache.set(miembro.usuario, { datos, expiraEn: ahora + DURACION_CACHE_MS });
        return datos;
    } catch (error) {
        console.error("Error al consultar GitHub:", error.message);
        if (guardado) {
            // Se conserva el dato anterior y se reintenta en poco tiempo
            cache.set(miembro.usuario, { datos: guardado.datos, expiraEn: ahora + DURACION_CACHE_ERROR_MS });
            return guardado.datos;
        }
        const datos = {
            nombre: miembro.nombre,
            usuario: miembro.usuario,
            nombre_github: null,
            bio: null,
            avatar_url: null,
            perfil_url: `https://github.com/${miembro.usuario}`,
            disponible: false,
        };
        cache.set(miembro.usuario, { datos, expiraEn: ahora + DURACION_CACHE_ERROR_MS });
        return datos;
    }
}

/**
 * GET /api/github/miembros  (alias: /api/github/equipo)
 * Público. Devuelve un arreglo con avatar, usuario, nombre, bio y enlace al perfil de
 * GitHub de cada integrante, para alimentar la galería del equipo (`TeamGallery`).
 */
async function listarMiembros(req, res) {
    try {
        const miembros = obtenerMiembros().filter((miembro) => esUsuarioValido(miembro.usuario));
        const perfiles = await Promise.all(miembros.map(obtenerPerfil));
        return res.json(perfiles);
    } catch (error) {
        console.error("Error al listar miembros de GitHub:", error);
        return res.status(500).json({ ok: false, error: "No se pudieron obtener los perfiles de GitHub." });
    }
}

router.get("/miembros", listarMiembros);
router.get("/equipo", listarMiembros);

/** Vacía la caché (se usa en las pruebas). */
router.limpiarCache = () => cache.clear();

module.exports = router;
