process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-prueba';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const db = require('../src/config/db');
const app = require('../src/server');

/**
 * Reemplaza db.query por un simulador que registra las consultas y levanta el servidor
 * en un puerto libre. Devuelve la URL base y la lista de consultas realizadas.
 */
async function prepararServidor(t, respuesta = { rowCount: 1, rows: [] }) {
  const consultaOriginal = db.query;
  const errorOriginal = console.error;
  console.error = () => {};
  const consultas = [];
  db.query = async (sql, params) => {
    consultas.push({ sql, params });
    if (respuesta instanceof Error) throw respuesta;
    return respuesta;
  };
  const servidor = app.listen(0);
  await new Promise((resolver) => servidor.once('listening', resolver));
  t.after(() => {
    db.query = consultaOriginal;
    console.error = errorOriginal;
    servidor.close();
  });
  return { base: `http://127.0.0.1:${servidor.address().port}`, consultas };
}

/** Envía un POST /api/visitas con el cuerpo (y token opcional) indicados. */
function registrarVisita(base, cuerpo, token) {
  return fetch(`${base}/api/visitas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(cuerpo),
  });
}

test('POST /api/visitas: visita anónima de una sección guarda usuario_id NULL', async (t) => {
  const { base, consultas } = await prepararServidor(t);
  const respuesta = await registrarVisita(base, { ruta: '/', seccion: 'equipo' });
  assert.equal(respuesta.status, 201);
  assert.deepEqual(consultas[0].params, ['/', null, 'equipo']);
});

test('POST /api/visitas: con token válido guarda el id del usuario', async (t) => {
  const { base, consultas } = await prepararServidor(t);
  const token = jwt.sign({ id: 7, rol: 'usuario' }, process.env.JWT_SECRET);
  const respuesta = await registrarVisita(base, { ruta: '/proyectos/3' }, token);
  assert.equal(respuesta.status, 201);
  assert.deepEqual(consultas[0].params, ['/proyectos/3', 7, null]);
});

test('POST /api/visitas: rechaza sección desconocida y ruta inválida', async (t) => {
  const { base, consultas } = await prepararServidor(t);
  assert.equal((await registrarVisita(base, { ruta: '/', seccion: 'otra' })).status, 400);
  assert.equal((await registrarVisita(base, { ruta: 'sin-barra' })).status, 400);
  assert.equal((await registrarVisita(base, { ruta: '/' + 'a'.repeat(300) })).status, 400);
  assert.equal((await registrarVisita(base, {})).status, 400);
  assert.equal(consultas.length, 0);
});

test('POST /api/visitas: /panel e /iniciar-sesion no se registran', async (t) => {
  const { base, consultas } = await prepararServidor(t);
  assert.equal((await registrarVisita(base, { ruta: '/panel' })).status, 204);
  assert.equal((await registrarVisita(base, { ruta: '/iniciar-sesion?next=/' })).status, 204);
  assert.equal(consultas.length, 0);
});

test('GET /api/metricas/secciones: exige administrador y completa secciones con 0', async (t) => {
  const { base, consultas } = await prepararServidor(t, {
    rows: [{ seccion: 'equipo', total: 4, registradas: 1, anonimas: 3 }],
  });
  const sinToken = await fetch(`${base}/api/metricas/secciones`);
  assert.equal(sinToken.status, 401);

  const tokenUsuario = jwt.sign({ id: 2, rol: 'usuario' }, process.env.JWT_SECRET);
  const prohibido = await fetch(`${base}/api/metricas/secciones`, { headers: { Authorization: `Bearer ${tokenUsuario}` } });
  assert.equal(prohibido.status, 403);

  const tokenAdmin = jwt.sign({ id: 1, rol: 'administrador' }, process.env.JWT_SECRET);
  const respuesta = await fetch(`${base}/api/metricas/secciones?desde=2026-01-01&hasta=2026-01-31`, {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
  });
  assert.equal(respuesta.status, 200);
  const cuerpo = await respuesta.json();
  assert.equal(cuerpo.datos.length, 7);
  assert.equal(cuerpo.datos[0].seccion, 'inicio');
  assert.equal(cuerpo.datos[0].total, 0);
  assert.equal(cuerpo.datos.find((fila) => fila.seccion === 'equipo').total, 4);
  assert.deepEqual(consultas.at(-1).params, ['2026-01-01', '2026-01-31', 'todas']);
});

test('GET /api/metricas/visitas: rechaza fechas inválidas o invertidas', async (t) => {
  const { base } = await prepararServidor(t);
  const token = jwt.sign({ id: 1, rol: 'administrador' }, process.env.JWT_SECRET);
  const cabeceras = { headers: { Authorization: `Bearer ${token}` } };
  assert.equal((await fetch(`${base}/api/metricas/visitas?desde=2026-02-31`, cabeceras)).status, 400);
  assert.equal((await fetch(`${base}/api/metricas/visitas?desde=2026-05-02&hasta=2026-05-01`, cabeceras)).status, 400);
});
