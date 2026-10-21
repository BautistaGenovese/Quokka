const db = require('../config/db');
const initDb = require('../config/initDb');
const servicioCorreo = require('../services/correo.service');
const {
  sanitizarValorCabecera,
  ETIQUETAS_TIPO,
} = servicioCorreo;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIPOS_VALIDOS = Object.keys(ETIQUETAS_TIPO);
const ESTADOS_VALIDOS = ['pendiente', 'respondido'];

/**
 * Valida y sanitiza los campos del formulario de contacto.
 * Acepta tanto nombres de campos en español (`nombre`, `email`, `tipo`, `mensaje`)
 * como los enviados desde el formulario público si llegaran con alias.
 */
function validarPayloadContacto(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const erroresPorDefecto = {
      nombre: 'Ingresá al menos 2 caracteres.',
      name: 'Ingresá al menos 2 caracteres.',
      email: 'Ingresá un correo válido.',
      tipo: 'Elegí una categoría.',
      type: 'Elegí una categoría.',
      mensaje: 'Escribí al menos 10 caracteres.',
      message: 'Escribí al menos 10 caracteres.',
    };
    return {
      esValido: false,
      fields: erroresPorDefecto,
      sanitizado: {
        nombre: '',
        email: '',
        tipo: '',
        mensaje: '',
      },
    };
  }

  const nombreBruto = typeof body.nombre === 'string' ? body.nombre : body.name;
  const emailBruto = body.email;
  const tipoBruto = typeof body.tipo === 'string' ? body.tipo : body.type;
  const mensajeBruto = typeof body.mensaje === 'string' ? body.mensaje : body.message;

  const nombre = typeof nombreBruto === 'string' ? sanitizarValorCabecera(nombreBruto) : '';
  const email = typeof emailBruto === 'string' ? sanitizarValorCabecera(emailBruto) : '';
  const tipo = typeof tipoBruto === 'string' ? tipoBruto.trim() : '';
  const mensaje = typeof mensajeBruto === 'string'
    ? mensajeBruto.replace(/\0/g, '').trim()
    : '';

  const fields = {};

  if (nombre.length < 3) {
    const mensajeError = 'Ingresá al menos 3 caracteres.';
    fields.nombre = mensajeError;
    fields.name = mensajeError;
  } else if (nombre.length > 100) {
    const mensajeError = 'El nombre no puede superar los 100 caracteres.';
    fields.nombre = mensajeError;
    fields.name = mensajeError;
  }

  if (!email || !REGEX_EMAIL.test(email) || email.length > 255) {
    fields.email = 'Ingresá un correo válido.';
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    const mensajeError = 'Elegí una categoría válida (cotización, asesoría o consulta general).';
    fields.tipo = mensajeError;
    fields.type = mensajeError;
  }

  if (mensaje.length < 15) {
    const mensajeError = 'Escribí al menos 15 caracteres.';
    fields.mensaje = mensajeError;
    fields.message = mensajeError;
  } else if (mensaje.length > 5000) {
    const mensajeError = 'El mensaje no puede superar los 5000 caracteres.';
    fields.mensaje = mensajeError;
    fields.message = mensajeError;
  }

  return {
    esValido: Object.keys(fields).length === 0,
    fields,
    sanitizado: {
      nombre,
      email,
      tipo,
      mensaje,
    },
  };
}

/**
 * Valida y sanitiza la respuesta enviada por el Operador desde el panel.
 */
function validarPayloadRespuestaContacto(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      esValido: false,
      fields: {
        respuesta: 'Escribí una respuesta de al menos 10 caracteres.',
      },
      sanitizado: {
        respuesta: '',
      },
    };
  }

  const respuestaBruta = body.respuesta;
  const respuesta = typeof respuestaBruta === 'string'
    ? respuestaBruta.replace(/\0/g, '').trim()
    : '';

  const fields = {};

  if (respuesta.length < 10) {
    fields.respuesta = 'Escribí una respuesta de al menos 10 caracteres.';
  } else if (respuesta.length > 5000) {
    fields.respuesta = 'La respuesta no puede superar los 5000 caracteres.';
  }

  return {
    esValido: Object.keys(fields).length === 0,
    fields,
    sanitizado: {
      respuesta,
    },
  };
}

/**
 * POST /api/contacto (y alias /api/contact)
 * Recibe una solicitud de cotización, asesoría técnica o consulta general,
 * la almacena en la tabla `mensajes_contacto` en español mediante consultas parametrizadas
 * con estado 'pendiente' y dispara la notificación por correo al equipo.
 */
async function crearSolicitudContacto(req, res) {
  const { esValido, fields, sanitizado } = validarPayloadContacto(req.body);

  if (!esValido) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  const { nombre, email, tipo, mensaje } = sanitizado;

  try {
    await initDb();

    const resultadoInsercion = await db.query(
      `INSERT INTO mensajes_contacto (nombre, email, tipo, mensaje, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING id, nombre, email, tipo, mensaje, estado, creado_en`,
      [nombre, email, tipo, mensaje]
    );

    const registro = resultadoInsercion.rows[0];

    try {
      await servicioCorreo.enviarNotificacionContacto({
        id: registro.id,
        nombre: registro.nombre,
        email: registro.email,
        tipo: registro.tipo,
        mensaje: registro.mensaje,
        creado_en: registro.creado_en,
      });
    } catch (errorCorreo) {
      console.error('⚠️ Solicitud guardada en mensajes_contacto, pero falló el envío de correo:', errorCorreo.message);
    }

    return res.status(201).json({
      ok: true,
      message: 'Tu solicitud fue recibida. Te responderemos a la brevedad.',
    });
  } catch (error) {
    console.error('❌ Error al procesar solicitud de contacto:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo procesar la solicitud en este momento. Intentá nuevamente.',
    });
  }
}

/**
 * GET /api/operador/contactos
 * Lista los mensajes recibidos en `mensajes_contacto`, opcionalmente filtrados por `estado` y `tipo`.
 */
async function listarSolicitudesContacto(req, res) {
  const estadoFiltro = typeof req.query?.estado === 'string' ? req.query.estado.trim().toLowerCase() : '';
  const tipoFiltro = typeof req.query?.tipo === 'string' ? req.query.tipo.trim().toLowerCase() : '';

  if (estadoFiltro && estadoFiltro !== 'todos' && !ESTADOS_VALIDOS.includes(estadoFiltro)) {
    return res.status(400).json({
      ok: false,
      error: 'El filtro de estado debe ser pendiente o respondido.',
    });
  }

  if (tipoFiltro && tipoFiltro !== 'todos' && !TIPOS_VALIDOS.includes(tipoFiltro)) {
    return res.status(400).json({
      ok: false,
      error: 'El filtro de tipo no es válido.',
    });
  }

  try {
    await initDb();

    const condiciones = [];
    const parametros = [];

    if (estadoFiltro && estadoFiltro !== 'todos') {
      parametros.push(estadoFiltro);
      condiciones.push(`estado = $${parametros.length}`);
    }

    if (tipoFiltro && tipoFiltro !== 'todos') {
      if (tipoFiltro === 'general' || tipoFiltro === 'consulta') {
        parametros.push(['general', 'consulta']);
        condiciones.push(`tipo = ANY($${parametros.length}::text[])`);
      } else {
        parametros.push(tipoFiltro);
        condiciones.push(`tipo = $${parametros.length}`);
      }
    }

    const clausulaWhere = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const resultado = await db.query(
      `SELECT id, nombre, email, tipo, mensaje, estado, respuesta, creado_en, respondido_en
       FROM mensajes_contacto
       ${clausulaWhere}
       ORDER BY creado_en DESC, id DESC`,
      parametros
    );

    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al listar mensajes de contacto:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudieron obtener las consultas en este momento.',
    });
  }
}

/**
 * POST /api/operador/contactos/:id/responder
 * Envía la respuesta al cliente por correo electrónico mediante Nodemailer y actualiza
 * el registro a `estado = 'respondido'`, guardando `respuesta` y `respondido_en = NOW()`.
 */
async function responderSolicitudContacto(req, res) {
  const id = Number(req.params?.id);

  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      ok: false,
      error: 'El identificador de la consulta debe ser un entero positivo válido.',
    });
  }

  const { esValido, fields, sanitizado } = validarPayloadRespuestaContacto(req.body);

  if (!esValido) {
    return res.status(400).json({
      ok: false,
      error: fields.respuesta || 'Revisá la respuesta antes de enviar.',
      fields,
    });
  }

  const { respuesta } = sanitizado;

  try {
    await initDb();

    const resultadoExistente = await db.query(
      `SELECT id, nombre, email, tipo, mensaje, estado, respuesta, creado_en, respondido_en
       FROM mensajes_contacto
       WHERE id = $1`,
      [id]
    );

    if (resultadoExistente.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró la consulta solicitada.',
      });
    }

    const contacto = resultadoExistente.rows[0];

    if (contacto.estado === 'respondido') {
      return res.status(409).json({
        ok: false,
        error: 'Esta consulta ya fue respondida anteriormente.',
        fields: {
          respuesta: 'Esta consulta ya fue respondida anteriormente.',
        },
      });
    }

    const fechaRespuesta = new Date().toISOString();

    await servicioCorreo.enviarRespuestaContacto({
      id: contacto.id,
      nombre: contacto.nombre,
      email: contacto.email,
      tipo: contacto.tipo,
      mensaje: contacto.mensaje,
      respuesta,
      respondido_en: fechaRespuesta,
    });

    const resultadoActualizacion = await db.query(
      `UPDATE mensajes_contacto
       SET estado = 'respondido',
           respuesta = $2,
           respondido_en = NOW()
       WHERE id = $1 AND estado = 'pendiente'
       RETURNING id, nombre, email, tipo, mensaje, estado, respuesta, creado_en, respondido_en`,
      [id, respuesta]
    );

    if (resultadoActualizacion.rowCount === 0) {
      return res.status(409).json({
        ok: false,
        error: 'Esta consulta ya fue respondida anteriormente.',
        fields: {
          respuesta: 'Esta consulta ya fue respondida anteriormente.',
        },
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Respuesta enviada por correo.',
      contacto: resultadoActualizacion.rows[0],
    });
  } catch (error) {
    console.error('❌ Error al responder solicitud de contacto:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No pudimos enviar la respuesta por correo. Tu texto se conserva para volver a intentar.',
    });
  }
}

module.exports = {
  crearSolicitudContacto,
  listarSolicitudesContacto,
  responderSolicitudContacto,
  validarPayloadContacto,
  validarPayloadRespuestaContacto,
};
