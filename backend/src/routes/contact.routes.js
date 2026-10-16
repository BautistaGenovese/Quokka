const express = require('express');
const { createContactRequest } = require('../controllers/contact.controller');
const { createRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,           // Máximo 5 solicitudes por IP cada 15 minutos
});

// POST /api/contact - Recibir solicitud pública de cotización, asesoría técnica o consulta general
// Nota de seguridad: No se expone un GET público para proteger los datos personales (PII) almacenados.
router.post('/', contactRateLimiter, createContactRequest);

module.exports = router;
