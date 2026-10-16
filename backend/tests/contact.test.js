const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateContactPayload } = require('../src/controllers/contact.controller');

test('validateContactPayload rechaza datos vacíos o inválidos', () => {
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
});

test('validateContactPayload acepta solicitudes de cotización y asesoría técnica válidas y recorta espacios', () => {
  const cotizacion = validateContactPayload({
    name: '  Ignacio Giangrieco  ',
    email: '  ignacio@ejemplo.com ',
    type: 'cotizacion',
    message: '  Necesitamos cotizar una plataforma web con panel de administración.  ',
  });

  assert.equal(cotizacion.isValid, true);
  assert.deepEqual(cotizacion.fields, {});
  assert.equal(cotizacion.sanitized.name, 'Ignacio Giangrieco');
  assert.equal(cotizacion.sanitized.email, 'ignacio@ejemplo.com');
  assert.equal(cotizacion.sanitized.type, 'cotizacion');

  const asesoria = validateContactPayload({
    name: 'María López',
    email: 'maria@empresa.com',
    type: 'asesoria',
    message: 'Buscamos asesoría técnica para migrar nuestra arquitectura actual.',
  });

  assert.equal(asesoria.isValid, true);
});
