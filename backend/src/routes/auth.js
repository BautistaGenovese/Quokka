const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');
const initDb = require('../config/initDb');
const { requireAuth } = require('../middleware/auth');

const authRouter = express.Router();

const SALT_ROUNDS = 10;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Genera un token JWT firmado con los datos públicos del usuario.
 */
function generarTokenJWT(usuario) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el entorno.');
  }

  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Formatea el objeto usuario que se devuelve al cliente (sin exponer password_hash).
 */
function formatearUsuarioPublico(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    email: fila.email,
    rol: fila.rol,
    fecha_creacion: fila.fecha_creacion,
  };
}

/**
 * POST /api/auth/registro
 * Registra un usuario local con nombre, email y password hasheado con bcrypt.
 * google_id queda en NULL y rol toma el DEFAULT 'usuario'.
 */
authRouter.post('/registro', async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const fields = {};

  if (nombre.length < 2) {
    fields.nombre = 'El nombre debe tener al menos 2 caracteres.';
  } else if (nombre.length > 100) {
    fields.nombre = 'El nombre no puede superar los 100 caracteres.';
  }

  if (email.length < 5 || email.length > 255 || !REGEX_EMAIL.test(email)) {
    fields.email = 'Ingresá un correo electrónico válido.';
  }

  if (password.length < 6) {
    fields.password = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (Buffer.byteLength(password, 'utf8') > 72) {
    fields.password = 'La contraseña no puede superar los 72 caracteres.';
  }

  if (Object.keys(fields).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  try {
    await initDb();

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const resultado = await db.query(
      `INSERT INTO usuarios (nombre, email, password_hash, google_id)
       VALUES ($1, $2, $3, NULL)
       RETURNING id, nombre, email, rol, fecha_creacion`,
      [nombre, email, passwordHash]
    );

    const usuario = formatearUsuarioPublico(resultado.rows[0]);
    const token = generarTokenJWT(usuario);

    return res.status(201).json({
      ok: true,
      token,
      usuario,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        error: 'Ya existe una cuenta registrada con ese correo electrónico.',
        fields: {
          email: 'Este correo ya está registrado.',
        },
      });
    }

    console.error('❌ Error en POST /api/auth/registro:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo completar el registro en este momento.',
    });
  }
});

/**
 * POST /api/auth/login
 * Verifica email y password contra la tabla `usuarios` usando bcrypt y emite un JWT.
 */
authRouter.post('/login', async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const fields = {};

  if (!email || !REGEX_EMAIL.test(email)) {
    fields.email = 'Ingresá un correo electrónico válido.';
  }
  if (!password) {
    fields.password = 'Ingresá tu contraseña.';
  }

  if (Object.keys(fields).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  try {
    await initDb();

    const resultado = await db.query(
      `SELECT id, nombre, email, password_hash, google_id, rol, fecha_creacion
       FROM usuarios
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas.',
      });
    }

    const usuarioDb = resultado.rows[0];

    // Si el usuario se registró únicamente con Google, password_hash es NULL
    if (!usuarioDb.password_hash) {
      return res.status(401).json({
        ok: false,
        error: 'Esta cuenta fue vinculada con Google. Iniciá sesión con Google.',
      });
    }

    const passwordValida = await bcrypt.compare(password, usuarioDb.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas.',
      });
    }

    const usuario = formatearUsuarioPublico(usuarioDb);
    const token = generarTokenJWT(usuario);

    return res.status(200).json({
      ok: true,
      token,
      usuario,
    });
  } catch (error) {
    console.error('❌ Error en POST /api/auth/login:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo iniciar sesión en este momento.',
    });
  }
});

/**
 * POST /api/auth/google
 * Verifica el ID Token de Google con google-auth-library, inserta o actualiza `google_id`
 * mediante ON CONFLICT (email) DO UPDATE y devuelve un JWT propio.
 */
authRouter.post('/google', async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

  // Acepta `token`, `credential` o `idToken` según cómo lo envíe el frontend con Google Identity Services
  const googleToken =
    (typeof body.token === 'string' && body.token.trim()) ||
    (typeof body.credential === 'string' && body.credential.trim()) ||
    (typeof body.idToken === 'string' && body.idToken.trim()) ||
    '';

  if (!googleToken) {
    return res.status(400).json({
      ok: false,
      error: 'El token de Google es obligatorio.',
    });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('❌ Error de configuración: GOOGLE_CLIENT_ID no está definido.');
    return res.status(500).json({
      ok: false,
      error: 'Error interno de configuración de Google OAuth.',
    });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || payload.email_verified === false) {
      return res.status(401).json({
        ok: false,
        error: 'La cuenta de Google no pudo ser verificada.',
      });
    }

    const googleId = String(payload.sub).trim();
    const email = String(payload.email).trim().toLowerCase();

    // Asegura cumplir el CHECK (char_length(btrim(nombre)) >= 2) de la tabla `usuarios`
    const nombreBase = typeof payload.name === 'string' && payload.name.trim().length >= 2
      ? payload.name.trim()
      : email.split('@')[0];
    const nombre = (nombreBase.length >= 2 ? nombreBase : 'Usuario Google').slice(0, 100);

    await initDb();

    const resultado = await db.query(
      `INSERT INTO usuarios (nombre, email, google_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
         SET google_id = EXCLUDED.google_id
       RETURNING id, nombre, email, rol, fecha_creacion`,
      [nombre, email, googleId]
    );

    const usuario = formatearUsuarioPublico(resultado.rows[0]);
    const token = generarTokenJWT(usuario);

    return res.status(200).json({
      ok: true,
      token,
      usuario,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        ok: false,
        error: 'Esta cuenta de Google ya está asociada a otro usuario.',
      });
    }

    console.error('❌ Error en POST /api/auth/google:', error.message);
    return res.status(401).json({
      ok: false,
      error: 'Token de Google inválido o expirado.',
    });
  }
});

/**
 * GET /api/auth/me
 * Verifica el token JWT actual contra la base de datos y devuelve los datos y el rol actualizado del usuario.
 */
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    await initDb();

    const resultado = await db.query(
      `SELECT id, nombre, email, rol, fecha_creacion
       FROM usuarios
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        error: 'El usuario ya no existe.',
      });
    }

    const usuario = formatearUsuarioPublico(resultado.rows[0]);
    const token = generarTokenJWT(usuario);

    return res.status(200).json({
      ok: true,
      token,
      usuario,
    });
  } catch (error) {
    console.error('❌ Error en GET /api/auth/me:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'No se pudo verificar la sesión actual.',
    });
  }
});

module.exports = authRouter;

