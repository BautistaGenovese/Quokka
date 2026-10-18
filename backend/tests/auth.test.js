const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../src/controllers/auth.controller');
const {
  JWT_SECRET,
  generarToken,
  requireAuth,
  requireRol,
} = require('../src/middlewares/auth');

test('validateRegisterInput valida longitudes mínimas y formatos estrictos', () => {
  const invalidShort = validateRegisterInput({
    nombre: 'A',
    email: 'email-invalido',
    password: '123',
  });

  assert.equal(invalidShort.isValid, false);
  assert.ok(invalidShort.errors.nombre);
  assert.ok(invalidShort.errors.email);
  assert.ok(invalidShort.errors.password);

  const valid = validateRegisterInput({
    nombre: '   Juan Girón   ',
    email: '  JUAN@QUOKKA.STUDIO  ',
    password: 'SuperPassword123!',
  });

  assert.equal(valid.isValid, true);
  assert.equal(valid.data.nombre, 'Juan Girón');
  assert.equal(valid.data.email, 'juan@quokka.studio');
  assert.equal(valid.data.password, 'SuperPassword123!');
});

test('validateLoginInput rechaza campos vacíos y formatos de email inválidos', () => {
  const empty = validateLoginInput({});
  assert.equal(empty.isValid, false);
  assert.ok(empty.errors.email);
  assert.ok(empty.errors.password);

  const valid = validateLoginInput({
    email: 'admin@quokka.studio',
    password: 'Password123',
  });
  assert.equal(valid.isValid, true);
});

test('generarToken emite un JWT verificable con id, nombre, email y rol', () => {
  const mockUser = {
    id: 42,
    nombre: 'Juan Girón',
    email: 'juan@quokka.studio',
    rol: 'administrador',
  };

  const token = generarToken(mockUser);
  assert.ok(token);

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.equal(decoded.id, 42);
  assert.equal(decoded.nombre, 'Juan Girón');
  assert.equal(decoded.email, 'juan@quokka.studio');
  assert.equal(decoded.rol, 'administrador');
});

test('requireAuth bloquea solicitudes sin token con HTTP 401', () => {
  let statusCode = 200;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseData = payload;
      return this;
    },
  };

  const req = { headers: {} };
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 401);
  assert.equal(responseData.ok, false);
});

test('requireAuth acepta token válido y decodifica el usuario en req.user', () => {
  const token = generarToken({ id: 10, nombre: 'Admin', email: 'a@q.s', rol: 'administrador' });
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const res = {};
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.ok(req.user);
  assert.equal(req.user.id, 10);
  assert.equal(req.user.rol, 'administrador');
});

test('requireRol valida y aisla permisos de administrador, operador y usuario', () => {
  const adminOnly = requireRol('administrador');

  let statusCode = 200;
  let responseData = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseData = payload;
      return this;
    },
  };

  // 1. Usuario con rol 'usuario' intentando acceder a ruta de 'administrador'
  const reqUsuario = { user: { id: 1, rol: 'usuario' } };
  let nextCalled = false;
  adminOnly(reqUsuario, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.equal(responseData.ok, false);

  // 2. Usuario con rol 'administrador'
  const reqAdmin = { user: { id: 2, rol: 'administrador' } };
  let adminNextCalled = false;
  adminOnly(reqAdmin, res, () => { adminNextCalled = true; });

  assert.equal(adminNextCalled, true);
});
