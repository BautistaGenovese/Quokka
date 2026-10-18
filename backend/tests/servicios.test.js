const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/db');
const controladores = require('../src/controllers/servicios.controller');

const body = {
  nombre_servicio: ' Desarrollo web ',
  descripcion: ' Creamos aplicaciones web a medida. ',
  tecnologia_ids: [2],
};

function preparar(t, opciones = {}) {
  const originales = { query: db.query, getClient: db.getClient };
  t.after(() => Object.assign(db, originales));
  const consultas = [];
  const liberaciones = [];
  const cliente = {
    release(error) { liberaciones.push(error); },
    async query(sql, params) {
      consultas.push({ sql, params });
      if (sql === 'ROLLBACK' && opciones.rollbackFalla) throw new Error('Rollback fallido');
      if (sql.includes('FROM tecnologias')) {
        return { rows: opciones.tecnologiaInexistente ? [] : [{ id: 2, nombre: 'React' }] };
      }
      if (sql.includes('INSERT INTO servicios_tecnologias')) {
        assert.equal(params[0], 7, 'La asociación debe usar el id del servicio devuelto');
        if (opciones.insertFalla) throw new Error('Inserción fallida');
      }
      return {
        rowCount: opciones.servicioInexistente ? 0 : 1,
        rows: opciones.servicioInexistente ? [] : [{
          id: 7, nombre_servicio: 'Desarrollo web', descripcion: 'Creamos aplicaciones web a medida.',
        }],
      };
    },
  };
  db.getClient = async () => {
    if (opciones.conexionFalla) throw new Error('Conexión fallida');
    return cliente;
  };
  db.query = async (sql, params) => {
    consultas.push({ sql, params });
    if (opciones.duplicado) throw Object.assign(new Error('Duplicado'), { code: '23505' });
    return { rowCount: 1, rows: [{ id: 2, nombre_tecnologia: params?.[0] }] };
  };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return { consultas, liberaciones, res };
}

for (const [nombre, status] of [['crearSolicitudServicio', 201], ['modificarServicio', 200]]) {
  test(`${nombre}: guarda asociaciones y devuelve tecnologías`, async t => {
    const f = preparar(t);
    await controladores[nombre]({ params: { id: '7' }, body }, f.res);
    assert.equal(f.res.statusCode, status);
    assert.deepEqual(f.res.body.servicio.tecnologias, [{ id: 2, nombre: 'React' }]);
    assert.equal(f.consultas[0].sql, 'BEGIN');
    assert.equal(f.consultas.at(-1).sql, 'COMMIT');
    assert.equal(f.liberaciones.length, 1);
    const escritura = f.consultas.find(q => /INSERT INTO servicios \(|UPDATE servicios/.test(q.sql));
    assert.equal(escritura.params[0], 'Desarrollo web');
  });

  test(`${nombre}: permite una selección vacía`, async t => {
    const f = preparar(t);
    await controladores[nombre]({ params: { id: '7' }, body: { ...body, tecnologia_ids: [] } }, f.res);
    assert.equal(f.res.statusCode, status);
    assert.deepEqual(f.res.body.servicio.tecnologias, []);
    assert.equal(f.consultas.some(q => q.sql.includes('INSERT INTO servicios_tecnologias')), false);
    if (nombre === 'modificarServicio') {
      assert.ok(f.consultas.some(q => q.sql.includes('DELETE FROM servicios_tecnologias')));
    }
  });

  test(`${nombre}: rechaza tecnologías inexistentes y revierte`, async t => {
    const f = preparar(t, { tecnologiaInexistente: true });
    await controladores[nombre]({ params: { id: '7' }, body }, f.res);
    assert.equal(f.res.statusCode, 400);
    assert.equal(f.consultas.at(-1).sql, 'ROLLBACK');
    assert.equal(f.consultas.some(q => q.sql === 'COMMIT'), false);
    assert.equal(f.liberaciones.length, 1);
  });

  test(`${nombre}: una inserción fallida revierte toda la transacción`, async t => {
    const f = preparar(t, { insertFalla: true });
    await controladores[nombre]({ params: { id: '7' }, body }, f.res);
    assert.equal(f.res.statusCode, 500);
    assert.equal(f.consultas.at(-1).sql, 'ROLLBACK');
    assert.equal(f.liberaciones.length, 1);
  });

  test(`${nombre}: maneja fallos al obtener o devolver la conexión`, async t => {
    const f = preparar(t, { conexionFalla: true });
    await controladores[nombre]({ params: { id: '7' }, body }, f.res);
    assert.equal(f.res.statusCode, 500);
    assert.equal(f.consultas.length, 0);
    const g = preparar(t, { insertFalla: true, rollbackFalla: true });
    await controladores[nombre]({ params: { id: '7' }, body }, g.res);
    assert.equal(g.res.statusCode, 500);
    assert.equal(g.liberaciones.length, 1);
    assert.ok(g.liberaciones[0] instanceof Error);
  });

  test(`${nombre}: rechaza arreglos ausentes, inválidos y duplicados antes de adquirir cliente`, async t => {
    const f = preparar(t);
    for (const ids of [undefined, 'React', [2, 2], [-1], ['2'], [2147483648]]) {
      await controladores[nombre]({ params: { id: '7' }, body: { ...body, tecnologia_ids: ids } }, f.res);
      assert.equal(f.res.statusCode, 400);
    }
    assert.equal(f.consultas.length, 0);
    assert.equal(f.liberaciones.length, 0);
  });
}

test('modificarServicio: devuelve 404 antes de reemplazar asociaciones', async t => {
  const f = preparar(t, { servicioInexistente: true });
  await controladores.modificarServicio({ params: { id: '7' }, body }, f.res);
  assert.equal(f.res.statusCode, 404);
  assert.equal(f.consultas.some(q => q.sql.includes('DELETE FROM servicios_tecnologias')), false);
  assert.equal(f.consultas.at(-1).sql, 'ROLLBACK');
  assert.equal(f.liberaciones.length, 1);
});

for (const [nombre, status] of [['crearSolicitudTecnologia', 201], ['modificarTecnologia', 200]]) {
  test(`${nombre}: lee y recorta el nombre, rechaza vacíos y duplicados`, async t => {
    const f = preparar(t);
    await controladores[nombre]({ params: { id: '2' }, body: { nombre_tecnologia: ' React ' } }, f.res);
    assert.equal(f.res.statusCode, status);
    assert.equal(f.res.body.tecnologia.nombre_tecnologia, 'React');
    for (const invalido of [undefined, null, {}, { nombre_tecnologia: 3 }, { nombre_tecnologia: '  ' }]) {
      await controladores[nombre]({ params: { id: '2' }, body: invalido }, f.res);
      assert.equal(f.res.statusCode, 400);
    }
    const g = preparar(t, { duplicado: true });
    await controladores[nombre]({ params: { id: '2' }, body: { nombre_tecnologia: 'React' } }, g.res);
    assert.equal(g.res.statusCode, 409);
  });
}
