const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/server');

test('CORS acepta el mismo origen del proxy y no habilita uno ajeno', async () => {
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const address = `http://127.0.0.1:${server.address().port}`;
    const own = await fetch(`${address}/api/status`, { method: 'OPTIONS', headers: { Origin: address } });
    assert.equal(own.headers.get('access-control-allow-origin'), address);

    const foreign = await fetch(`${address}/api/status`, { method: 'OPTIONS', headers: { Origin: 'https://otro.ejemplo' } });
    assert.equal(foreign.headers.get('access-control-allow-origin'), null);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
