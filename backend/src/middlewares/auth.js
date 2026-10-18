const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'quokka_secret_jwt_2026_super_seguro';

/**
 * Genera un token JWT firmado con los datos esenciales del usuario.
 * @param {Object} usuario - Objeto usuario con id, nombre, email, rol
 * @param {string} [expiresIn='24h'] - Tiempo de validez del token
 * @returns {string} Token JWT
 */
function generarToken(usuario, expiresIn = '24h') {
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    JWT_SECRET,
    { expiresIn }
  );
}

/**
 * Middleware para exigir que la solicitud incluya un token JWT válido.
 * Extrae el token del encabezado 'Authorization: Bearer <token>'.
 * Decodifica y coloca los datos del usuario en `req.user`.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      ok: false,
      error: 'Acceso no autorizado: Token no proporcionado. Iniciá sesión para continuar.',
    });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({
      ok: false,
      error: 'Formato de autenticación inválido. Utilizá: Bearer <token>',
    });
  }

  const token = partes[1];

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.user = decodificado;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'Tu sesión ha expirado. Por favor, volvé a iniciar sesión.',
      });
    }
    return res.status(401).json({
      ok: false,
      error: 'Token de autenticación inválido.',
    });
  }
}

/**
 * Generador de middleware para restringir acceso según el rol del usuario.
 * Requiere que previamente se haya ejecutado `requireAuth`.
 * @param {...string} rolesPermitidos - Lista de roles permitidos ('usuario', 'operador', 'administrador')
 */
function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({
        ok: false,
        error: 'Acceso no autorizado: Identidad no verificada.',
      });
    }

    const rolUsuario = String(req.user.rol).toLowerCase();
    const rolesValidos = rolesPermitidos.map((r) => String(r).toLowerCase());

    if (!rolesValidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        error: `Acceso denegado: Esta acción requiere permisos de ${rolesPermitidos.join(' o ')}. Tu rol actual es '${req.user.rol}'.`,
      });
    }

    return next();
  };
}

module.exports = {
  JWT_SECRET,
  generarToken,
  requireAuth,
  requireRol,
};
