const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { requireAuth, requireRol, identificarUsuarioOpcional } = require("../middleware/autenticacion");
const { crearLimitadorSolicitudes } = require("../middleware/limitadorSolicitudes");

// Limitador para proteger la tabla de visitas contra flooding masivo (DoS de almacenamiento)
const limitadorVisitas = crearLimitadorSolicitudes({
    ventanaMs: 60 * 1000,   // 1 minuto
    maximoSolicitudes: 60,  // Hasta 60 eventos de visita/sección por minuto por IP
    mensaje: "Demasiadas solicitudes de registro de visitas.",
});

// Secciones de la portada que se registran (ids de las <Section> del frontend),
// en el orden en que aparecen en la página. Sirve también para ordenar el embudo.
const SECCIONES_PERMITIDAS = ["inicio", "manifiesto", "equipo", "servicios", "proyectos", "stack-tech", "contacto"];

// Páginas internas que NO se registran: solo interesa lo que ve el usuario final.
const RUTAS_EXCLUIDAS = ["/panel", "/iniciar-sesion"];

const LARGO_MAXIMO_RUTA = 255;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Indica si una cadena AAAA-MM-DD corresponde a una fecha real del calendario. */
function esFechaValida(texto) {
    if (!FORMATO_FECHA.test(texto)) return false;
    const fecha = new Date(`${texto}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

/**
 * Lee y valida desde/hasta/tipo de la query string.
 * Devuelve { error } si algo es inválido, o { desde, hasta, tipo } si está todo bien.
 */
function leerFiltros(query) {
    const hoy = new Date().toISOString().slice(0, 10);
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const desde = query.desde || hace30Dias;
    const hasta = query.hasta || hoy;
    const tipo = query.tipo === "registradas" ? "registradas" : "todas";

    if (!esFechaValida(desde) || !esFechaValida(hasta)) {
        return { error: "Las fechas deben tener formato AAAA-MM-DD y ser válidas." };
    }
    if (desde > hasta) {
        return { error: "La fecha 'desde' no puede ser posterior a 'hasta'." };
    }
    return { desde, hasta, tipo };
}

/**
 * POST /api/visitas  (público)
 * Recibe { ruta, seccion? }. Si llega un token válido se asocia la visita al usuario
 * (visita autenticada); si no, usuario_id queda en NULL (visita general).
 * - Páginas internas (/panel, /iniciar-sesion) se ignoran.
 * - `seccion` es opcional y debe ser una de SECCIONES_PERMITIDAS.
 */
router.post("/visitas", limitadorVisitas, identificarUsuarioOpcional, async (req, res) => {
    const cuerpo = req.body || {};
    const ruta = typeof cuerpo.ruta === "string" ? cuerpo.ruta.trim() : "";

    if (ruta === "") {
        return res.status(400).json({ ok: false, error: "Falta el campo 'ruta'." });
    }
    if (ruta.length > LARGO_MAXIMO_RUTA || !ruta.startsWith("/")) {
        return res.status(400).json({ ok: false, error: "El campo 'ruta' es inválido." });
    }

    // Validación de la sección (puede omitirse, pero si viene debe ser conocida)
    let seccion = null;
    if (cuerpo.seccion !== undefined && cuerpo.seccion !== null && cuerpo.seccion !== "") {
        if (typeof cuerpo.seccion !== "string" || !SECCIONES_PERMITIDAS.includes(cuerpo.seccion)) {
            return res.status(400).json({ ok: false, error: "El campo 'seccion' es inválido." });
        }
        seccion = cuerpo.seccion;
    }

    // Las páginas de administración y de acceso no se contabilizan (se responde igual 204)
    const rutaBase = ruta.split(/[?#]/)[0];
    if (RUTAS_EXCLUIDAS.some((excluida) => rutaBase === excluida || rutaBase.startsWith(`${excluida}/`))) {
        return res.status(204).end();
    }

    const usuarioId = req.user ? req.user.id : null;

    try {
        await db.query(
            "INSERT INTO visitas (ruta, usuario_id, seccion) VALUES ($1, $2, $3)",
            [ruta, usuarioId, seccion]
        );
        return res.status(201).end();
    } catch (error) {
        console.error("Error al registrar visita:", error);
        return res.status(500).json({ ok: false, error: "No se pudo registrar la visita." });
    }
});

/**
 * GET /api/metricas/visitas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&tipo=todas|registradas
 * Solo administrador. Devuelve por día: total, registradas (con sesión) y anonimas.
 */
router.get("/metricas/visitas", requireAuth, requireRol("administrador"), async (req, res) => {
    const filtros = leerFiltros(req.query);
    if (filtros.error) {
        return res.status(400).json({ ok: false, error: filtros.error });
    }
    const { desde, hasta, tipo } = filtros;

    try {
        const { rows } = await db.query(
            `SELECT DATE(fecha) AS dia,
                    COUNT(*)::int AS total,
                    COUNT(usuario_id)::int AS registradas,
                    (COUNT(*) - COUNT(usuario_id))::int AS anonimas
             FROM visitas
             WHERE DATE(fecha) BETWEEN $1::date AND $2::date
               AND ($3 = 'todas' OR usuario_id IS NOT NULL)
             GROUP BY DATE(fecha)
             ORDER BY dia`,
            [desde, hasta, tipo]
        );

        return res.json({ ok: true, desde, hasta, tipo, datos: rows });
    } catch (error) {
        console.error("Error al consultar métricas:", error);
        return res.status(500).json({ ok: false, error: "No se pudieron obtener las métricas." });
    }
});

/**
 * GET /api/metricas/secciones?desde=...&hasta=...&tipo=todas|registradas
 * Solo administrador. Cuenta cuántas veces se llegó a cada sección de la portada
 * (embudo de lectura), separando registradas y anonimas. Las secciones sin visitas
 * se devuelven en 0, siempre en el orden de la página.
 */
router.get("/metricas/secciones", requireAuth, requireRol("administrador"), async (req, res) => {
    const filtros = leerFiltros(req.query);
    if (filtros.error) {
        return res.status(400).json({ ok: false, error: filtros.error });
    }
    const { desde, hasta, tipo } = filtros;

    try {
        const { rows } = await db.query(
            `SELECT seccion,
                    COUNT(*)::int AS total,
                    COUNT(usuario_id)::int AS registradas,
                    (COUNT(*) - COUNT(usuario_id))::int AS anonimas
             FROM visitas
             WHERE seccion IS NOT NULL
               AND DATE(fecha) BETWEEN $1::date AND $2::date
               AND ($3 = 'todas' OR usuario_id IS NOT NULL)
             GROUP BY seccion`,
            [desde, hasta, tipo]
        );

        // Se completan con 0 las secciones sin registros y se ordenan según la página
        const porSeccion = new Map(rows.map((fila) => [fila.seccion, fila]));
        const datos = SECCIONES_PERMITIDAS.map((seccion) => (
            porSeccion.get(seccion) || { seccion, total: 0, registradas: 0, anonimas: 0 }
        ));

        return res.json({ ok: true, desde, hasta, tipo, datos });
    } catch (error) {
        console.error("Error al consultar métricas por sección:", error);
        return res.status(500).json({ ok: false, error: "No se pudieron obtener las métricas por sección." });
    }
});

router.limitadorVisitas = limitadorVisitas;

module.exports = router;
