const express = require('express');
const {
  createContactRequest,
  getContactRequests,
} = require('../controllers/contact.controller');

const router = express.Router();

// POST /api/contact - Recibir solicitud de cotización, asesoría técnica o consulta general
router.post('/', createContactRequest);

// GET /api/contact - Listar solicitudes almacenadas en PostgreSQL
router.get('/', getContactRequests);

module.exports = router;
