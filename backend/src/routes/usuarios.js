const express = require('express');
const db = require('../config/db');
const initDb = require('../config/inicializarBd');
const { requireAuth, requireRol } = require('../middleware/autenticacion');

const usuariosRouter = express.Router();

const ROLES_VALIDOS = ['usuario', 'operador', 'administrador'];

/**
 * GET /api/admin/usuarios
 * Lista todos los usuarios registrados sin exponer nunca `password_hash`.
 * Permitido para 'operador' (solo lectura) y 'administrador'.
 */
async function listarUsuarios(req, res) {
  const rolFiltro = typeof req.query?.rol === 'string' ? req.query.rol.trim().toLowerCase() : '';

  if (rolFiltro && rolFiltro !== 'todos' && !ROLES_VALIDOS.includes(rolFiltro)) {
    return res.status(400).json({
      ok: false,
      error: 'El filtro de rol debe ser usuario, operador o administrador.',
    });
  }

  try {
    await initDb();

    const parametros = [];
    let clausulaWhere = '';

    if (rolFiltro && rolFiltro !== 'todos') {
      parametros.push(rolFiltro);
      clausulaWhere = `WHERE rol = $1`;
    }

    const resultado = await db.query(
      `SELECT id, nombre, email, google_id, rol, fecha_creacion
       FROM usuarios
       ${clausulaWhere}
       ORDER BY fecha_creacion DESC, id DESC`,
      parametros
    );

    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudieron obtener los usuarios registrados en este momento.',
    });
  }
}

/**
 * PATCH /api/admin/usuarios/:id/rol
 * Permite exclusivamente al Administrador cambiar el rol de un usuario ('usuario', 'operador', 'administrador').
 */
async function actualizarRolUsuario(req, res) {
  const id = Number(req.params?.id);

  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      ok: false,
      error: 'El identificador del usuario debe ser un entero positivo válido.',
    });
  }

  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const nuevoRol = typeof body.rol === 'string' ? body.rol.trim().toLowerCase() : '';

  if (!ROLES_VALIDOS.includes(nuevoRol)) {
    return res.status(400).json({
      ok: false,
      error: 'El rol debe ser usuario, operador o administrador.',
      fields: {
        rol: 'Seleccioná un rol válido (usuario, operador o administrador).',
      },
    });
  }

  try {
    await initDb();

    const resultado = await db.query(
      `UPDATE usuarios
       SET rol = $1
       WHERE id = $2
       RETURNING id, nombre, email, google_id, rol, fecha_creacion`,
      [nuevoRol, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró el usuario solicitado.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Rol actualizado correctamente.',
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error('❌ Error al actualizar rol de usuario:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo actualizar el rol del usuario en este momento.',
    });
  }
}

/**
 * DELETE /api/admin/usuarios/:id
 * Permite exclusivamente al Administrador eliminar un usuario registrado.
 */
async function eliminarUsuario(req, res) {
  const id = Number(req.params?.id);

  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      ok: false,
      error: 'El identificador del usuario debe ser un entero positivo válido.',
    });
  }

  if (req.user && Number(req.user.id) === id) {
    return res.status(400).json({
      ok: false,
      error: 'No podés eliminar tu propia cuenta con la que tenés sesión iniciada.',
    });
  }

  try {
    await initDb();

    const resultado = await db.query(
      `DELETE FROM usuarios
       WHERE id = $1
       RETURNING id, nombre, email, rol`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'No se encontró el usuario solicitado.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Usuario eliminado correctamente.',
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo eliminar el usuario en este momento.',
    });
  }
}

// Operador y Administrador pueden ver la lista; solo Administrador puede modificar o borrar.
usuariosRouter.get(
  '/',
  requireAuth,
  requireRol('operador', 'administrador'),
  listarUsuarios
);

usuariosRouter.patch(
  '/:id/rol',
  requireAuth,
  requireRol('administrador'),
  actualizarRolUsuario
);

usuariosRouter.delete(
  '/:id',
  requireAuth,
  requireRol('administrador'),
  eliminarUsuario
);

usuariosRouter.listarUsuarios = listarUsuarios;
usuariosRouter.actualizarRolUsuario = actualizarRolUsuario;
usuariosRouter.eliminarUsuario = eliminarUsuario;

module.exports = usuariosRouter;
