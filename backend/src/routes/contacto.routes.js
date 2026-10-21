const express = require('express');
const {
  crearSolicitudContacto,
  listarSolicitudesContacto,
  responderSolicitudContacto,
} = require('../controllers/contacto.controller');
const { crearLimitadorSolicitudes } = require('../middlewares/limitadorSolicitudes');
const { requireAuth, requireRol } = require('../middleware/auth');

const contactoRouter = express.Router();
const operadorContactosRouter = express.Router();

const limitadorContacto = crearLimitadorSolicitudes({
  ventanaMs: 15 * 60 * 1000, // 15 minutos
  maximoSolicitudes: 5,      // Máximo 5 solicitudes por IP cada 15 minutos
});

// POST /api/contacto (y /api/contact) - Recibir solicitud de cotización, asesoría técnica o consulta general.
// Decisión de equipo: Solo los usuarios registrados/autenticados pueden enviar mensajes de contacto.
// Nota de seguridad: No se expone un GET público para proteger los datos personales (PII) almacenados.
contactoRouter.post('/', requireAuth, limitadorContacto, crearSolicitudContacto);

// Rutas del Panel del Operador (Sprint 3):
operadorContactosRouter.get(
  '/',
  requireAuth,
  requireRol('operador', 'administrador'),
  listarSolicitudesContacto
);

operadorContactosRouter.post(
  '/:id/responder',
  requireAuth,
  requireRol('operador', 'administrador'),
  responderSolicitudContacto
);

contactoRouter.operadorContactosRouter = operadorContactosRouter;

module.exports = contactoRouter;
