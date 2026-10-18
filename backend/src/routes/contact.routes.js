const express = require('express');
const { createContactRequest } = require('../controllers/contact.controller');
const { createRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,           // Máximo 5 solicitudes por IP cada 15 minutos
});

// POST /api/contacto (y /api/contact) - Recibir solicitud de cotización, asesoría técnica o consulta general.
// Decisión de equipo: Solo los usuarios registrados/autenticados pueden enviar mensajes de contacto.
// TODO (Juan Girón): Cuando implementes `requireAuth` en `../middleware/auth.js`, importalo arriba y agregalo
// en esta ruta antes de `createContactRequest` -> router.post('/', requireAuth, contactRateLimiter, createContactRequest);
// Nota de seguridad: No se expone un GET público para proteger los datos personales (PII) almacenados.
router.post('/', /* TODO (Juan Girón): requireAuth, */ contactRateLimiter, createContactRequest);

module.exports = router;
