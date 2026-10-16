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
 * Devuelve un objeto `fields` con errores específicos si existen.
 */
function validateContactPayload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      fields: {
        name: 'Ingresá al menos 3 caracteres.',
        email: 'Ingresá un correo válido.',
        type: 'Elegí una categoría.',
        message: 'Escribí al menos 15 caracteres.',
      },
      sanitized: { name: '', email: '', type: '', message: '' },
    };
  }

  const name = typeof body.name === 'string' ? sanitizeHeaderValue(body.name) : '';
  const email = typeof body.email === 'string' ? sanitizeHeaderValue(body.email) : '';
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const message = typeof body.message === 'string'
    ? body.message.replace(/\0/g, '').trim()
    : '';

  const fields = {};

  if (name.length < 3) {
    fields.name = 'Ingresá al menos 3 caracteres.';
  } else if (name.length > 120) {
    fields.name = 'El nombre no puede superar los 120 caracteres.';
  }

  if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
    fields.email = 'Ingresá un correo válido.';
  }

  if (!VALID_TYPES.includes(type)) {
    fields.type = 'Elegí una categoría válida (cotización, asesoría o general).';
  }

  if (message.length < 15) {
    fields.message = 'Escribí al menos 15 caracteres.';
  } else if (message.length > 5000) {
    fields.message = 'El mensaje no puede superar los 5000 caracteres.';
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    sanitized: { name, email, type, message },
  };
}

/**
 * POST /api/contact
 * Recibe una solicitud de cotización, asesoría técnica o consulta general,
 * la almacena en PostgreSQL mediante consultas parametrizadas y dispara el correo al equipo.
 * No expone registros ni metadatos internos en la respuesta pública.
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

  const { name, email, type, message } = sanitized;

  try {
    await initDb();

    const insertResult = await db.query(
      `INSERT INTO contact_requests (name, email, type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, type, message, created_at`,
      [name, email, type, message]
    );

    const record = insertResult.rows[0];

    try {
      await sendContactNotification({
        id: record.id,
        name: record.name,
        email: record.email,
        type: record.type,
        message: record.message,
        createdAt: record.created_at,
      });

      await db.query(
        'UPDATE contact_requests SET email_sent = TRUE WHERE id = $1',
        [record.id]
      );
    } catch (mailError) {
      console.error('⚠️ Solicitud guardada en BD, pero falló el envío de correo:', mailError.message);
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
