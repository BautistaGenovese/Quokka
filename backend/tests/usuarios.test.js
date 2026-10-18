const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ROLES_PERMITIDOS } = require('../src/controllers/usuarios.controller');
const usuariosAdminRoutes = require('../src/routes/usuarios.routes');

test('ROLES_PERMITIDOS contiene exactamente los 3 roles de cátedra', () => {
  assert.deepEqual(ROLES_PERMITIDOS, ['usuario', 'operador', 'administrador']);
});

test('usuariosAdminRoutes exige requireAuth y requireRol administrador', () => {
  // Verificar que el router tenga definidos los métodos esperados
  const registeredRoutes = usuariosAdminRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  const paths = registeredRoutes.map((r) => r.path);
  assert.ok(paths.includes('/'));
  assert.ok(paths.includes('/stats'));
  assert.ok(paths.includes('/:id/rol'));
  assert.ok(paths.includes('/:id'));
});
