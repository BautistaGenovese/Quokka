const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateContactPayload } = require('../src/controllers/contact.controller');
const { sanitizeHeaderValue, escapeHtml } = require('../src/services/mailer.service');
const { createRateLimiter } = require('../src/middlewares/rateLimiter');
const contactRoutes = require('../src/routes/contact.routes');

test('validateContactPayload rechaza datos vacíos, malformados o inválidos', () => {
  const result = validateContactPayload({
    name: 'Ig',
    email: 'correo-invalido',
    type: 'inexistente',
    message: 'Muy corto',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.fields.name);
  assert.ok(result.fields.email);
  assert.ok(result.fields.type);
  assert.ok(result.fields.message);

  const nullBody = validateContactPayload(null);
  assert.equal(nullBody.isValid, false);
});

test('validateContactPayload acepta solicitudes válidas, recorta espacios y limpia saltos de línea en cabeceras', () => {
  const cotizacion = validateContactPayload({
    name: '  Ignacio Giangrieco\r\nBcc: attacker@evil.com  ',
    email: '  ignacio@ejemplo.com ',
    type: 'cotizacion',
    message: '  Necesitamos cotizar una plataforma web con panel de administración.  ',
  });

  assert.equal(cotizacion.isValid, true);
  assert.deepEqual(cotizacion.fields, {});
  assert.equal(cotizacion.sanitized.name, 'Ignacio Giangrieco Bcc: attacker@evil.com');
  assert.doesNotMatch(cotizacion.sanitized.name, /[\r\n]/);
  assert.equal(cotizacion.sanitized.email, 'ignacio@ejemplo.com');
  assert.equal(cotizacion.sanitized.type, 'cotizacion');
});

test('sanitizeHeaderValue y escapeHtml previenen inyección de cabeceras CRLF y XSS en el correo', () => {
  const injectedHeader = 'Nombre\r\nBcc: spam@dominio.com\0';
  assert.equal(sanitizeHeaderValue(injectedHeader), 'Nombre Bcc: spam@dominio.com');

  const xssPayload = '<script>alert("xss")</script>';
  assert.equal(escapeHtml(xssPayload), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

test('createRateLimiter bloquea solicitudes excesivas desde una misma IP con HTTP 429', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 });
  const req = { ip: '127.0.0.1' };
  const headers = {};
  let statusCode = 200;
  let body = null;
  const res = {
    setHeader(key, val) { headers[key] = val; },
    status(code) { statusCode = code; return this; },
    json(payload) { body = payload; return this; },
  };

  let nextCalled = 0;
  limiter(req, res, () => { nextCalled += 1; });
  limiter(req, res, () => { nextCalled += 1; });
  assert.equal(nextCalled, 2);

  // El tercer intento dentro de la ventana debe ser rechazado con 429
  limiter(req, res, () => { nextCalled += 1; });
  assert.equal(nextCalled, 2);
  assert.equal(statusCode, 429);
  assert.equal(body.ok, false);
  assert.ok(headers['Retry-After']);
});

test('contactRoutes solo expone POST y no expone un listado GET público sin autenticación', () => {
  const registeredMethods = contactRoutes.stack
    .filter(layer => layer.route)
    .flatMap(layer => Object.keys(layer.route.methods));

  assert.deepEqual(registeredMethods, ['post']);
});
