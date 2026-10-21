process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-prueba';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const controlador = require('../src/controllers/proyectos.controller');
const app = require('../src/server');

const { validarProyecto } = controlador;
const IMAGEN = 'https://res.cloudinary.com/demo/image/upload/x.jpg';
const valido = { titulo: ' Mi proyecto ', imagen_url: IMAGEN, imagen_public_id: 'quokka/x' };

function preparar(t, respuesta = { rowCount: 1, rows: [{ id: 5, titulo: 'Mi proyecto' }] }) {
  const original = db.query;
  const originalError = console.error;
  t.after(() => { db.query = original; console.error = originalError; });
  console.error = () => {};
  const consultas = [];
  db.query = async (sql, params) => {
    consultas.push({ sql, params });
    if (respuesta instanceof Error) throw respuesta;
    return respuesta;
  };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return { consultas, res };
}

test('validarProyecto: recorta, convierte vacíos en null y acepta Cloudinary', () => {
  const r = validarProyecto({ ...valido, descripcion: '   ', url_demo: '' });
  assert.equal(r.isValid, true);
  assert.equal(r.sanitized.titulo, 'Mi proyecto');
  assert.equal(r.sanitized.descripcion, null);
  assert.equal(r.sanitized.url_demo, null);
});

test('validarProyecto: título requerido y con límites en puntos de código', () => {
  for (const titulo of [undefined, 'ab', '   ', 'a😀', 'a'.repeat(151)]) {
    assert.ok(validarProyecto({ titulo }).fields.titulo, `rechaza ${titulo}`);
  }
  assert.equal(validarProyecto({ titulo: 'ab😀' }).isValid, true);
});

test('validarProyecto: límites de campos opcionales', () => {
  const f = validarProyecto({
    titulo: 'abc',
    descripcion: 'a'.repeat(5001),
    tecnologias: 'a'.repeat(256),
    url_demo: `https://x.com/${'a'.repeat(250)}`,
    imagen_url: IMAGEN,
    imagen_public_id: 'a'.repeat(256),
  }).fields;
  assert.deepEqual(Object.keys(f).sort(), ['descripcion', 'imagen_public_id', 'tecnologias', 'url_demo']);
});

test('validarProyecto: url_demo solo http/https sin credenciales', () => {
  for (const url of ['javascript:alert(1)', 'ftp://x', 'https://user@host.com', 'nada']) {
    assert.ok(validarProyecto({ titulo: 'abc', url_demo: url }).fields.url_demo, url);
  }
  assert.equal(validarProyecto({ titulo: 'abc', url_demo: 'http://demo.com/a' }).isValid, true);
});

test('validarProyecto: imagen_url solo https de res.cloudinary.com', () => {
  for (const url of [
    'http://res.cloudinary.com/a.png',
    'https://res.cloudinary.com.evil.com/a.png',
    'https://evil.com/res.cloudinary.com/',
    'https://res.cloudinary.com:8443/a.png',
    'https://u@res.cloudinary.com/a.png',
  ]) {
    assert.ok(validarProyecto({ titulo: 'abc', imagen_url: url }).fields.imagen_url, url);
  }
});

test('validarProyecto: imagen_public_id exige imagen_url; no-string y body inválido', () => {
  assert.ok(validarProyecto({ titulo: 'abc', imagen_public_id: 'x' }).fields.imagen_public_id);
  assert.equal(validarProyecto({ titulo: 'abc', descripcion: 5 }).fields.descripcion, 'Ingresá un texto válido.');
  for (const body of [null, 'texto', [], 42]) {
    assert.deepEqual(Object.keys(validarProyecto(body).fields), ['titulo']);
  }
});

test('listarProyectos: columnas públicas y orden por fecha', async t => {
  const f = preparar(t, { rows: [{ id: 1 }] });
  await controlador.listarProyectos({}, f.res);
  assert.deepEqual(f.res.body, [{ id: 1 }]);
  assert.match(f.consultas[0].sql, /ORDER BY fecha_publicacion DESC/);
  assert.doesNotMatch(f.consultas[0].sql, /url_demo|imagen_public_id|id_autor/);
});

test('listarProyectosAdmin: incluye columnas de administración', async t => {
  const f = preparar(t, { rows: [] });
  await controlador.listarProyectosAdmin({}, f.res);
  assert.deepEqual(f.res.body, []);
  assert.match(f.consultas[0].sql, /url_demo.*imagen_public_id/s);
});

test('obtenerProyecto: 400, 404 y 200', async t => {
  const f = preparar(t, { rowCount: 0, rows: [] });
  for (const id of ['abc', '0', '-1', '1.5', '99999999999999999999']) {
    await controlador.obtenerProyecto({ params: { id } }, f.res);
    assert.equal(f.res.statusCode, 400, id);
  }
  assert.equal(f.consultas.length, 0);
  await controlador.obtenerProyecto({ params: { id: '999' } }, f.res);
  assert.equal(f.res.statusCode, 404);
  assert.doesNotMatch(f.consultas[0].sql, /imagen_public_id|id_autor/);

  const ok = preparar(t, { rowCount: 1, rows: [{ id: 5, url_demo: null }] });
  await controlador.obtenerProyecto({ params: { id: '5' } }, ok.res);
  assert.equal(ok.res.statusCode, 200);
  assert.deepEqual(ok.res.body, { ok: true, proyecto: { id: 5, url_demo: null } });
});

test('crearProyecto: usa req.user.id, ignora id_autor del body y responde 201', async t => {
  const f = preparar(t);
  await controlador.crearProyecto({ user: { id: 3 }, body: { ...valido, id_autor: 99 } }, f.res);
  assert.equal(f.res.statusCode, 201);
  assert.equal(f.consultas[0].params.at(-1), 3);
  assert.equal(f.consultas[0].params[0], 'Mi proyecto');
  assert.ok(!f.consultas[0].params.includes(99));
});

test('crearProyecto: validación 400 sin consulta; FK 23503 -> 401; fallo -> 500', async t => {
  const f = preparar(t);
  await controlador.crearProyecto({ user: { id: 3 }, body: { titulo: 'ab' } }, f.res);
  assert.equal(f.res.statusCode, 400);
  assert.ok(f.res.body.fields.titulo);
  assert.equal(f.consultas.length, 0);

  const fk = preparar(t, Object.assign(new Error('fk'), { code: '23503' }));
  await controlador.crearProyecto({ user: { id: 3 }, body: valido }, fk.res);
  assert.equal(fk.res.statusCode, 401);

  const roto = preparar(t, new Error('caído'));
  await controlador.crearProyecto({ user: { id: 3 }, body: valido }, roto.res);
  assert.equal(roto.res.statusCode, 500);
  assert.equal(roto.res.body.ok, false);
});

test('modificarProyecto: no toca id_autor ni fecha, limpia opcionales, 404 y 400', async t => {
  const f = preparar(t);
  await controlador.modificarProyecto({ params: { id: '5' }, body: { titulo: 'Nuevo' } }, f.res);
  assert.equal(f.res.statusCode, 200);
  assert.doesNotMatch(f.consultas[0].sql, /SET[^R]*(id_autor|fecha_publicacion)/);
  assert.deepEqual(f.consultas[0].params, ['Nuevo', null, null, null, null, null, 5]);

  const vacio = preparar(t, { rowCount: 0, rows: [] });
  await controlador.modificarProyecto({ params: { id: '9' }, body: valido }, vacio.res);
  assert.equal(vacio.res.statusCode, 404);

  await controlador.modificarProyecto({ params: { id: 'x' }, body: valido }, vacio.res);
  assert.equal(vacio.res.statusCode, 400);
});

test('borrarProyecto: 200, 404, 400 y 500', async t => {
  const f = preparar(t);
  await controlador.borrarProyecto({ params: { id: '5' } }, f.res);
  assert.equal(f.res.statusCode, 200);
  assert.deepEqual(f.res.body.proyecto, { id: 5, titulo: 'Mi proyecto' });

  const vacio = preparar(t, { rowCount: 0, rows: [] });
  await controlador.borrarProyecto({ params: { id: '9' } }, vacio.res);
  assert.equal(vacio.res.statusCode, 404);
  await controlador.borrarProyecto({ params: { id: '0' } }, vacio.res);
  assert.equal(vacio.res.statusCode, 400);

  const roto = preparar(t, new Error('caído'));
  await controlador.borrarProyecto({ params: { id: '5' } }, roto.res);
  assert.equal(roto.res.statusCode, 500);
});

test('HTTP: guardas de autenticación y alias en español e inglés', async t => {
  const f = preparar(t, { rowCount: 1, rows: [{ id: 1 }] });
  const server = app.listen(0);
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = rol => ({
    Authorization: `Bearer ${jwt.sign({ id: 1, nombre: 'T', email: 't@t.com', rol }, process.env.JWT_SECRET)}`,
  });
  const estado = async (ruta, headers, method = 'GET') => (await fetch(base + ruta, { method, headers })).status;

  for (const prefijo of ['proyectos', 'projects']) {
    assert.equal(await estado(`/api/${prefijo}`), 200);
    assert.equal(await estado(`/api/${prefijo}/1`), 401);
    assert.equal(await estado(`/api/${prefijo}/1`, token('usuario')), 200);
    assert.equal(await estado(`/api/admin/${prefijo}`), 401);
    assert.equal(await estado(`/api/admin/${prefijo}`, token('operador')), 403);
    assert.equal(await estado(`/api/admin/${prefijo}`, token('administrador')), 200);
    assert.equal(await estado(`/api/admin/${prefijo}/1`, token('operador'), 'DELETE'), 403);
  }
  assert.ok(f.consultas.length > 0);
});
