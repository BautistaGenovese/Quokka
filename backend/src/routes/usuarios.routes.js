const express = require('express');
const {
  listarUsuarios,
  cambiarRolUsuario,
  eliminarUsuario,
  obtenerEstadisticas,
} = require('../controllers/usuarios.controller');
const { requireAuth, requireRol } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas de administración de usuarios exigen sesión y rol 'administrador'
router.use(requireAuth, requireRol('administrador'));

// GET /api/admin/usuarios - Listar todos los usuarios con filtros opcionales
router.get('/', listarUsuarios);

// GET /api/admin/usuarios/stats - Estadísticas de usuarios
router.get('/stats', obtenerEstadisticas);

// PATCH /api/admin/usuarios/:id/rol - Modificar rol de usuario
router.patch('/:id/rol', cambiarRolUsuario);

// DELETE /api/admin/usuarios/:id - Eliminar usuario
router.delete('/:id', eliminarUsuario);

module.exports = router;
