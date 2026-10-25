process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-prueba';
delete process.env.GITHUB_USUARIOS;

const { test } = require('node:test');
const assert = require('node:assert/strict');
const githubRouter = require('../src/routes/github');
const app = require('../src/server');

/**
 * Levanta el servidor y reemplaza `fetch` solo para las llamadas a api.github.com
 * (las llamadas al propio servidor de prueba siguen usando el fetch real).
 * `respuestaGithub(usuario)` devuelve { status, cuerpo } o lanza un error.
 */
async function prepararServidor(t, respuestaGithub) {
  githubRouter.limpiarCache();
  const fetchOriginal = global.fetch;
  const errorOriginal = console.error;
  console.error = () => {};
  const llamadasGithub = [];
  global.fetch = async (url, opciones) => {
    if (String(url).startsWith('https://api.github.com/')) {
      const usuario = decodeURIComponent(String(url).split('/users/')[1]);
      llamadasGithub.push({ usuario, cabeceras: opciones.headers });
      const { status = 200, cuerpo } = await respuestaGithub(usuario);
      return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
    }
    return fetchOriginal(url, opciones);
  };
  const servidor = app.listen(0);
  await new Promise((resolver) => servidor.once('listening', resolver));
  t.after(() => {
    global.fetch = fetchOriginal;
    console.error = errorOriginal;
    githubRouter.limpiarCache();
    servidor.close();
  });
  return { base: `http://127.0.0.1:${servidor.address().port}`, llamadasGithub };
}

const perfilDe = (usuario) => ({
  login: usuario,
  name: `Nombre de ${usuario}`,
  bio: 'Bio de prueba',
  avatar_url: `https://avatars.githubusercontent.com/u/1?v=4`,
  html_url: `https://github.com/${usuario}`,
});

test('GET /api/github/miembros: devuelve avatar, bio y enlace de los 5 integrantes', async (t) => {
  const { base, llamadasGithub } = await prepararServidor(t, async (usuario) => ({ cuerpo: perfilDe(usuario) }));
  const respuesta = await fetch(`${base}/api/github/miembros`);
  assert.equal(respuesta.status, 200);
  const miembros = await respuesta.json();
  assert.equal(miembros.length, 5);
  assert.equal(miembros[1].nombre, 'Juan Girón');
  assert.equal(miembros[1].usuario, 'juangiron06');
  assert.equal(miembros[1].perfil_url, 'https://github.com/juangiron06');
  assert.ok(miembros[1].avatar_url.includes('s=600'));
  assert.equal(miembros[1].disponible, true);
  assert.equal(llamadasGithub.length, 5);
  assert.ok(llamadasGithub[0].cabeceras['User-Agent']);
});

test('GET /api/github/miembros: usa la caché y no vuelve a consultar a GitHub', async (t) => {
  const { base, llamadasGithub } = await prepararServidor(t, async (usuario) => ({ cuerpo: perfilDe(usuario) }));
  await fetch(`${base}/api/github/miembros`);
  await fetch(`${base}/api/github/equipo`);
  assert.equal(llamadasGithub.length, 5);
});

test('GET /api/github/miembros: si GitHub falla devuelve el enlace sin avatar', async (t) => {
  const { base } = await prepararServidor(t, async (usuario) => (
    usuario === 'codebylauti' ? { status: 403, cuerpo: {} } : { cuerpo: perfilDe(usuario) }
  ));
  const miembros = await (await fetch(`${base}/api/github/miembros`)).json();
  const lautaro = miembros.find((miembro) => miembro.usuario === 'codebylauti');
  assert.equal(lautaro.disponible, false);
  assert.equal(lautaro.avatar_url, null);
  assert.equal(lautaro.perfil_url, 'https://github.com/codebylauti');
  assert.equal(miembros.filter((miembro) => miembro.disponible).length, 4);
});
