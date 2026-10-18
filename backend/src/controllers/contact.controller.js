const db = require('../config/db');
const initDb = require('../config/initDb');
const {
  sendContactNotification,
  sanitizeHeaderValue,
  TYPE_LABELS,
} = require('../services/mailer.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = Object.keys(TYPE_LABELS);

/**
 * Valida y sanitiza los campos del formulario de contacto.
 * Acepta tanto nombres de campos en español (`nombre`, `email`, `tipo`, `mensaje`)
 * como sus alias en inglés (`name`, `email`, `type`, `message`) para total compatibilidad.
 */
function validateContactPayload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const defaultErrors = {
      nombre: 'Ingresá al menos 2 caracteres.',
      name: 'Ingresá al menos 2 caracteres.',
      email: 'Ingresá un correo válido.',
      tipo: 'Elegí una categoría.',
      type: 'Elegí una categoría.',
      mensaje: 'Escribí al menos 10 caracteres.',
      message: 'Escribí al menos 10 caracteres.',
    };
    return {
      isValid: false,
      fields: defaultErrors,
      sanitized: {
        nombre: '',
        email: '',
        tipo: '',
        mensaje: '',
        name: '',
        type: '',
        message: '',
      },
    };
  }

  const rawNombre = typeof body.nombre === 'string' ? body.nombre : body.name;
  const rawEmail = body.email;
  const rawTipo = typeof body.tipo === 'string' ? body.tipo : body.type;
  const rawMensaje = typeof body.mensaje === 'string' ? body.mensaje : body.message;

  const nombre = typeof rawNombre === 'string' ? sanitizeHeaderValue(rawNombre) : '';
  const email = typeof rawEmail === 'string' ? sanitizeHeaderValue(rawEmail) : '';
  const tipo = typeof rawTipo === 'string' ? rawTipo.trim() : '';
  const mensaje = typeof rawMensaje === 'string'
    ? rawMensaje.replace(/\0/g, '').trim()
    : '';

  const fields = {};

  if (nombre.length < 3) {
    const msg = 'Ingresá al menos 3 caracteres.';
    fields.nombre = msg;
    fields.name = msg;
  } else if (nombre.length > 100) {
    const msg = 'El nombre no puede superar los 100 caracteres.';
    fields.nombre = msg;
    fields.name = msg;
  }

  if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
    fields.email = 'Ingresá un correo válido.';
  }

  if (!VALID_TYPES.includes(tipo)) {
    const msg = 'Elegí una categoría válida (cotización, asesoría o consulta general).';
    fields.tipo = msg;
    fields.type = msg;
  }

  if (mensaje.length < 15) {
    const msg = 'Escribí al menos 15 caracteres.';
    fields.mensaje = msg;
    fields.message = msg;
  } else if (mensaje.length > 5000) {
    const msg = 'El mensaje no puede superar los 5000 caracteres.';
    fields.mensaje = msg;
    fields.message = msg;
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    sanitized: {
      nombre,
      email,
      tipo,
      mensaje,
      // Alias en inglés para mantener compatibilidad con tests/clientes previos
      name: nombre,
      type: tipo,
      message: mensaje,
    },
  };
}

/**
 * POST /api/contacto (y alias /api/contact)
 * Recibe una solicitud de cotización, asesoría técnica o consulta general,
 * la almacena en la tabla `mensajes_contacto` en español mediante consultas parametrizadas
 * con estado 'pendiente' y dispara la notificación por correo al equipo.
 */
async function createContactRequest(req, res) {
  const { isValid, fields, sanitized } = validateContactPayload(req.body);

  if (!isValid) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  const { nombre, email, tipo, mensaje } = sanitized;

  try {
    await initDb();

    const insertResult = await db.query(
      `INSERT INTO mensajes_contacto (nombre, email, tipo, mensaje, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING id, nombre, email, tipo, mensaje, estado, creado_en`,
      [nombre, email, tipo, mensaje]
    );

    const record = insertResult.rows[0];

    try {
      await sendContactNotification({
        id: record.id,
        name: record.nombre,
        email: record.email,
        type: record.tipo,
        message: record.mensaje,
        createdAt: record.creado_en,
      });
    } catch (mailError) {
      console.error('⚠️ Solicitud guardada en mensajes_contacto, pero falló el envío de correo:', mailError.message);
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

module.exports = {
  createContactRequest,
  validateContactPayload,
};
