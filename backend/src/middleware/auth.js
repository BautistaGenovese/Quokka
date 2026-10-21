const jwt = require('jsonwebtoken');

/**
 * Extrae el token JWT del header Authorization ("Bearer <token>")
 * o del header alternativo x-auth-token.
 */
function extraerTokenDeHeaders(headers = {}) {
  const authHeader = headers.authorization || headers.Authorization;

  if (typeof authHeader === 'string' && authHeader.trim() !== '') {
    const partes = authHeader.trim().split(/\s+/);
    if (partes.length === 2 && /^Bearer$/i.test(partes[0])) {
      return partes[1];
    }
  }

  const tokenAlternativo = headers['x-auth-token'];
  if (typeof tokenAlternativo === 'string' && tokenAlternativo.trim() !== '') {
    return tokenAlternativo.trim();
  }

  return null;
}

/**
 * Middleware: Verifica que la petición incluya un token JWT válido.
 * Adjunta el payload decodificado ({ id, nombre, email, rol }) en `req.user`.
 */
function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('❌ Error de configuración: JWT_SECRET no está definido en las variables de entorno.');
    return res.status(500).json({
      ok: false,
      error: 'Error interno de configuración de autenticación.',
    });
  }

  const token = extraerTokenDeHeaders(req.headers);

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Debés iniciar sesión para acceder a este recurso.',
    });
  }

  try {
    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.id,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol,
    };

    return next();
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError'
        ? 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.'
        : 'Token de autenticación inválido.';

    return res.status(401).json({
      ok: false,
      error: mensaje,
    });
  }
}

/**
 * Middleware: Verifica que el usuario autenticado posea uno de los roles permitidos.
 * Debe utilizarse después de `requireAuth`.
 * Ejemplo: requireRol('operador', 'administrador')
 */
function requireRol(...rolesPermitidos) {
  const roles = rolesPermitidos.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({
        ok: false,
        error: 'Debés iniciar sesión para acceder a este recurso.',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        ok: false,
        error: 'No tenés permisos suficientes para realizar esta acción.',
      });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRol,
};
