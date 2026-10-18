const express = require('express');
const {
    listarServicios,
    crearSolicitudServicio,
    modificarServicio,
    borrarServicio
} = require('../controllers/servicios.controller');

// Dos routers porque se necesitan permisos de admin
const serviciosRouter = express.Router();
const adminServiciosRouter = express.Router();

// El catálogo de servicios es público.
serviciosRouter.get('/', listarServicios);

// TODO: Sin terminar, falta que Juan termine los middleware requireAuth y requireRol('administrador').

// Creacion de nuevos servicios
adminServiciosRouter.post(
    '/',
    // requireAuth,
    // requireRol('administrador'),
    crearSolicitudServicio
);

// Modificacion de los datos del servicio
adminServiciosRouter.put(
    '/:id',
    // requireAuth,
    // requireRol('administrador'),
    modificarServicio
);

// Eliminar servicios
adminServiciosRouter.delete(
    '/:id',
    // requireAuth,
    // requireRol('administrador'),
    borrarServicio
);


module.exports = {
    serviciosRouter,
    adminServiciosRouter
};
