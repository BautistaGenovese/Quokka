const express = require('express');
const {
    listarServicios,
    crearSolicitudServicio,
    modificarServicio,
    borrarServicio,
    listarTecnologias,
    crearSolicitudTecnologia,
    modificarTecnologia,
    borrarTecnologia
} = require('../controllers/servicios.controller');
const { requireAuth, requireRol } = require('../middleware/autenticacion');

// Dos routers porque se necesitan permisos de admin
const serviciosRouter = express.Router();
const adminServiciosRouter = express.Router();

// Para listar el total de tecnologías
const tecnologiasRouter = express.Router();
const adminTecnologiasRouter = express.Router();

// El catálogo de servicios es público.
serviciosRouter.get('/', listarServicios);

// El catálogo de tecnologias es público.
tecnologiasRouter.get('/', listarTecnologias);

// Creacion de nuevos servicios
adminServiciosRouter.post(
    '/',
    requireAuth,
    requireRol('administrador'),
    crearSolicitudServicio
);

// Modificacion de los datos del servicio
adminServiciosRouter.put(
    '/:id',
    requireAuth,
    requireRol('administrador'),
    modificarServicio
);

// Eliminar servicios
adminServiciosRouter.delete(
    '/:id',
    requireAuth,
    requireRol('administrador'),
    borrarServicio
);

// Creacion de nuevas tecnologías
adminTecnologiasRouter.post(
    '/',
    requireAuth,
    requireRol('administrador'),
    crearSolicitudTecnologia
);

// Modificacion de los datos de las tecnologías
adminTecnologiasRouter.put(
    '/:id',
    requireAuth,
    requireRol('administrador'),
    modificarTecnologia
);

// Eliminar tecnologías
adminTecnologiasRouter.delete(
    '/:id',
    requireAuth,
    requireRol('administrador'),
    borrarTecnologia
);


module.exports = {
    serviciosRouter,
    adminServiciosRouter,
    tecnologiasRouter,
    adminTecnologiasRouter
};
