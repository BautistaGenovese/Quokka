const express = require('express');
const {
  crearSolicitudContacto,
  listarSolicitudesContacto,
  responderSolicitudContacto,
} = require('../controllers/contacto.controller');
const { crearLimitadorSolicitudes } = require('../middlewares/limitadorSolicitudes');

const contactoRouter = express.Router();
const operadorContactosRouter = express.Router();

const limitadorContacto = crearLimitadorSolicitudes({
  ventanaMs: 15 * 60 * 1000, // 15 minutos
  maximoSolicitudes: 5,      // Máximo 5 solicitudes por IP cada 15 minutos
});

// POST /api/contacto (y /api/contact) - Recibir solicitud de cotización, asesoría técnica o consulta general.
// Decisión de equipo: Solo los usuarios registrados/autenticados pueden enviar mensajes de contacto.
// TODO (Juan Girón): Cuando implementes `requireAuth` en `../middleware/auth.js`, importalo arriba y agregalo
// en esta ruta antes de `crearSolicitudContacto` -> contactoRouter.post('/', requireAuth, limitadorContacto, crearSolicitudContacto);
// Nota de seguridad: No se expone un GET público para proteger los datos personales (PII) almacenados.
contactoRouter.post('/', /* TODO (Juan Girón): requireAuth, */ limitadorContacto, crearSolicitudContacto);

// Rutas del Panel del Operador (Sprint 3):
// TODO (Juan Girón): Proteger ambas rutas con `requireAuth` y `requireRol('operador', 'administrador')`.
operadorContactosRouter.get(
  '/',
  // requireAuth,
  // requireRol('operador', 'administrador'),
  listarSolicitudesContacto
);

operadorContactosRouter.post(
  '/:id/responder',
  // requireAuth,
  // requireRol('operador', 'administrador'),
  responderSolicitudContacto
);

contactoRouter.operadorContactosRouter = operadorContactosRouter;

module.exports = contactoRouter;
