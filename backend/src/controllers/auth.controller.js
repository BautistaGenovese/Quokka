const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generarToken } = require('../middlewares/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos recibidos para el registro de un nuevo usuario.
 */
function validateRegisterInput({ nombre, email, password } = {}) {
  const errors = {};

  const cleanNombre = typeof nombre === 'string' ? nombre.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanNombre || cleanNombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
  } else if (cleanNombre.length > 100) {
    errors.nombre = 'El nombre no puede superar los 100 caracteres.';
  }

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    errors.email = 'Ingresá un correo electrónico válido.';
  }

  if (!cleanPassword || cleanPassword.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      nombre: cleanNombre,
      email: cleanEmail,
      password: cleanPassword,
    },
  };
}

/**
 * Valida los datos recibidos para el inicio de sesión.
 */
function validateLoginInput({ email, password } = {}) {
  const errors = {};

  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    errors.email = 'Ingresá un correo electrónico válido.';
  }

  if (!cleanPassword) {
    errors.password = 'Ingresá tu contraseña.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: cleanEmail,
      password: cleanPassword,
    },
  };
}

/**
 * POST /api/auth/registro
 * Registra un nuevo usuario con contraseña hasheada y devuelve un JWT.
 */
async function registro(req, res) {
  try {
    const { isValid, errors, data } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        ok: false,
        error: 'Datos de registro inválidos.',
        detalles: errors,
      });
    }

    const { nombre, email, password } = data;

    // Verificar si el correo ya existe
    const usuarioExistente = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        error: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    // Hashear contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar en la tabla usuarios con rol por defecto 'usuario'
    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, 'usuario')
       RETURNING id, nombre, email, rol, fecha_creacion`,
      [nombre, email, passwordHash]
    );

    const usuario = result.rows[0];
    const token = generarToken(usuario);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente.',
      usuario,
      token,
    });
  } catch (error) {
    console.error('Error en registro de usuario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al procesar el registro.',
    });
  }
}

/**
 * POST /api/auth/login
 * Autentica al usuario mediante email y password, retornando datos y JWT.
 */
async function login(req, res) {
  try {
    const { isValid, errors, data } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        ok: false,
        error: 'Campos de inicio de sesión requeridos o con formato inválido.',
        detalles: errors,
      });
    }

    const { email, password } = data;

    // Buscar usuario por email
    const result = await db.query(
      `SELECT id, nombre, email, password_hash, google_id, rol, fecha_creacion
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas. Correo o contraseña incorrectos.',
      });
    }

    const usuarioEncontrado = result.rows[0];

    // Caso: cuenta creada exclusivamente vía Google
    if (!usuarioEncontrado.password_hash) {
      return res.status(400).json({
        ok: false,
        error: 'Esta cuenta fue creada mediante Google. Por favor, ingresá usando Google.',
      });
    }

    // Comparar contraseña con el hash
    const esPasswordValida = await bcrypt.compare(
      password,
      usuarioEncontrado.password_hash
    );

    if (!esPasswordValida) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas. Correo o contraseña incorrectos.',
      });
    }

    // Datos limpios sin exponer el hash
    const usuario = {
      id: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      email: usuarioEncontrado.email,
      rol: usuarioEncontrado.rol,
      fecha_creacion: usuarioEncontrado.fecha_creacion,
    };

    const token = generarToken(usuario);

    return res.json({
      ok: true,
      mensaje: 'Sesión iniciada correctamente.',
      usuario,
      token,
    });
  } catch (error) {
    console.error('Error en login de usuario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor al iniciar sesión.',
    });
  }
}

/**
 * GET /api/auth/me
 * Retorna los datos del usuario autenticado actual.
 */
async function perfil(req, res) {
  try {
    const result = await db.query(
      'SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado.',
      });
    }

    return res.json({
      ok: true,
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al obtener perfil del usuario:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error al consultar perfil de usuario.',
    });
  }
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  registro,
  login,
  perfil,
};
