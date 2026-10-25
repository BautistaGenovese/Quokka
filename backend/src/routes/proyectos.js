const express = require('express');
const {
  listarProyectos,
  obtenerProyecto,
  listarProyectosAdmin,
  crearProyecto,
  modificarProyecto,
  borrarProyecto,
} = require('../controllers/proyectos.controller');
const { requireAuth, requireRol } = require('../middleware/autenticacion');

const proyectosRouter = express.Router();
const adminProyectosRouter = express.Router();

// El listado es público; el detalle (con url_demo) exige sesión.
proyectosRouter.get('/', listarProyectos);
proyectosRouter.get('/:id', requireAuth, obtenerProyecto);

// Todo el CRUD de administración exige rol administrador.
adminProyectosRouter.use(requireAuth, requireRol('administrador'));
adminProyectosRouter.get('/', listarProyectosAdmin);
adminProyectosRouter.post('/', crearProyecto);
adminProyectosRouter.put('/:id', modificarProyecto);
adminProyectosRouter.delete('/:id', borrarProyecto);

module.exports = { proyectosRouter, adminProyectosRouter };
