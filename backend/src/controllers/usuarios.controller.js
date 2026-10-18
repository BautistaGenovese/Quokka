const db = require('../config/db');

const ROLES_PERMITIDOS = ['usuario', 'operador', 'administrador'];

/**
 * GET /api/admin/usuarios
 * Lista usuarios registrados con soporte de búsqueda y filtrado por rol.
 * Nunca expone password_hash ni datos sensibles.
 */
async function listarUsuarios(req, res) {
  try {
    const { busqueda, rol } = req.query;

    const conditions = [];
    const values = [];

    if (busqueda && typeof busqueda === 'string' && busqueda.trim().length > 0) {
      values.push(`%${busqueda.trim()}%`);
      conditions.push(`(nombre ILIKE $${values.length} OR email ILIKE $${values.length})`);
    }

    if (rol && typeof rol === 'string' && ROLES_PERMITIDOS.includes(rol.toLowerCase())) {
      values.push(rol.toLowerCase());
      conditions.push(`rol = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryText = `
      SELECT 
        id, 
        nombre, 
        email, 
        rol, 
        (google_id IS NOT NULL) AS es_google,
        fecha_creacion
      FROM usuarios
      ${whereClause}
      ORDER BY fecha_creacion DESC
    `;

    const { rows: usuarios } = await db.query(queryText, values);

    // Calcular estadísticas globales de usuarios
    const statsQuery = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE rol = 'administrador')::int AS administradores,
        COUNT(*) FILTER (WHERE rol = 'operador')::int AS operadores,
        COUNT(*) FILTER (WHERE rol = 'usuario')::int AS usuarios,
        COUNT(*) FILTER (WHERE fecha_creacion >= NOW() - INTERVAL '7 days')::int AS nuevos_esta_semana
      FROM usuarios
    `;
    const { rows: statsRows } = await db.query(statsQuery);

    return res.json({
      ok: true,
      total: usuarios.length,
      estadisticas: statsRows[0] || {
        total: usuarios.length,
        administradores: 0,
        operadores: 0,
        usuarios: 0,
        nuevos_esta_semana: 0,
      },
      usuarios,
    });
  } catch (error) {
    console.error('Error al listar usuarios en panel admin:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al consultar la lista de usuarios.',
    });
  }
}

/**
 * PATCH /api/admin/usuarios/:id/rol
 * Modifica el rol de un usuario ('usuario', 'operador', 'administrador').
 */
async function cambiarRolUsuario(req, res) {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const userId = Number.parseInt(id, 10);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'El ID de usuario especificado no es válido.',
      });
    }

    if (!rol || typeof rol !== 'string' || !ROLES_PERMITIDOS.includes(rol.toLowerCase())) {
      return res.status(400).json({
        ok: false,
        error: `El rol '${rol}' no es válido. Opciones permitidas: ${ROLES_PERMITIDOS.join(', ')}.`,
      });
    }

    const nuevoRol = rol.toLowerCase();

    // Verificar si el usuario a modificar existe
    const usuarioActual = await db.query(
      'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = $1',
      [userId]
    );

    if (usuarioActual.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'El usuario especificado no existe.',
      });
    }

    const usuarioTarget = usuarioActual.rows[0];

    // Regla de seguridad: Si se degrada a un administrador, asegurar que quede al menos uno activo
    if (usuarioTarget.rol === 'administrador' && nuevoRol !== 'administrador') {
      const { rows: admins } = await db.query(
        "SELECT COUNT(*)::int AS count FROM usuarios WHERE rol = 'administrador'"
      );
      if (admins[0].count <= 1) {
        return res.status(400).json({
          ok: false,
          error: 'Operación denegada: No es posible quitar el rol al único administrador del sistema.',
        });
      }
    }

    // Actualizar el rol
    const result = await db.query(
      `UPDATE usuarios 
       SET rol = $1 
       WHERE id = $2 
       RETURNING id, nombre, email, rol, fecha_creacion`,
      [nuevoRol, userId]
    );

    return res.json({
      ok: true,
      mensaje: `El rol de ${result.rows[0].nombre} fue actualizado a '${nuevoRol}' con éxito.`,
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al actualizar el rol del usuario.',
    });
  }
}

/**
 * DELETE /api/admin/usuarios/:id
 * Elimina un usuario registrado (con las salvaguardas necesarias).
 */
async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    const userId = Number.parseInt(id, 10);

    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'El ID de usuario especificado no es válido.',
      });
    }

    // Prevenir que el admin se elimine a sí mismo
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        ok: false,
        error: 'No podés eliminar tu propia cuenta de administrador en sesión actual.',
      });
    }

    // Verificar si el usuario existe
    const usuarioActual = await db.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [userId]
    );

    if (usuarioActual.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'El usuario especificado no existe.',
      });
    }

    // Si es admin, verificar que no sea el único
    if (usuarioActual.rows[0].rol === 'administrador') {
      const { rows: admins } = await db.query(
        "SELECT COUNT(*)::int AS count FROM usuarios WHERE rol = 'administrador'"
      );
      if (admins[0].count <= 1) {
        return res.status(400).json({
          ok: false,
          error: 'No podés eliminar al único administrador de la plataforma.',
        });
      }
    }

    await db.query('DELETE FROM usuarios WHERE id = $1', [userId]);

    return res.json({
      ok: true,
      mensaje: `Usuario '${usuarioActual.rows[0].nombre}' eliminado exitosamente.`,
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al eliminar el usuario.',
    });
  }
}

/**
 * GET /api/admin/usuarios/stats
 * Devuelve métricas resumidas de usuarios registrados.
 */
async function obtenerEstadisticas(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE rol = 'administrador')::int AS administradores,
        COUNT(*) FILTER (WHERE rol = 'operador')::int AS operadores,
        COUNT(*) FILTER (WHERE rol = 'usuario')::int AS usuarios,
        COUNT(*) FILTER (WHERE fecha_creacion >= NOW() - INTERVAL '7 days')::int AS nuevos_esta_semana
      FROM usuarios
    `);

    return res.json({
      ok: true,
      estadisticas: rows[0],
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al consultar métricas de usuarios.',
    });
  }
}

module.exports = {
  ROLES_PERMITIDOS,
  listarUsuarios,
  cambiarRolUsuario,
  eliminarUsuario,
  obtenerEstadisticas,
};
