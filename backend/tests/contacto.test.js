const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/config/db');
const {
  validarPayloadContacto,
  validarPayloadRespuestaContacto,
  listarSolicitudesContacto,
  responderSolicitudContacto,
} = require('../src/controllers/contacto.controller');
const servicioCorreo = require('../src/services/correo.service');
const { sanitizarValorCabecera, escaparHtml } = servicioCorreo;
const { crearLimitadorSolicitudes } = require('../src/middleware/limitadorSolicitudes');
const contactoRouter = require('../src/routes/contacto.routes');

function crearRespuestaSimulada() {
  return {
    statusCode: 200,
    body: null,
    status(codigo) { this.statusCode = codigo; return this; },
    json(datos) { this.body = datos; return this; },
  };
}

test('validarPayloadContacto rechaza datos vacíos, malformados o inválidos', () => {
  const resultado = validarPayloadContacto({
    nombre: 'Ig',
    email: 'correo-invalido',
    tipo: 'inexistente',
    mensaje: 'Muy corto',
  });

  assert.equal(resultado.esValido, false);
  assert.ok(resultado.fields.nombre);
  assert.ok(resultado.fields.email);
  assert.ok(resultado.fields.tipo);
  assert.ok(resultado.fields.mensaje);

  const cuerpoNulo = validarPayloadContacto(null);
  assert.equal(cuerpoNulo.esValido, false);
});

test('validarPayloadContacto acepta solicitudes válidas, recorta espacios y limpia saltos de línea en cabeceras', () => {
  const cotizacion = validarPayloadContacto({
    nombre: '  Ignacio Giangrieco\r\nBcc: atacante@malicioso.com  ',
    email: '  ignacio@ejemplo.com ',
    tipo: 'cotizacion',
    mensaje: '  Necesitamos cotizar una plataforma web con panel de administración.  ',
  });

  assert.equal(cotizacion.esValido, true);
  assert.deepEqual(cotizacion.fields, {});
  assert.equal(cotizacion.sanitizado.nombre, 'Ignacio Giangrieco Bcc: atacante@malicioso.com');
  assert.doesNotMatch(cotizacion.sanitizado.nombre, /[\r\n]/);
  assert.equal(cotizacion.sanitizado.email, 'ignacio@ejemplo.com');
  assert.equal(cotizacion.sanitizado.tipo, 'cotizacion');
});

test('sanitizarValorCabecera y escaparHtml previenen inyección de cabeceras CRLF y XSS en el correo', () => {
  const cabeceraInyectada = 'Nombre\r\nBcc: spam@dominio.com\0';
  assert.equal(sanitizarValorCabecera(cabeceraInyectada), 'Nombre Bcc: spam@dominio.com');

  const payloadXss = '<script>alert("xss")</script>';
  assert.equal(escaparHtml(payloadXss), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

test('crearLimitadorSolicitudes bloquea solicitudes excesivas desde una misma IP con HTTP 429', () => {
  const limitador = crearLimitadorSolicitudes({ ventanaMs: 60_000, maximoSolicitudes: 2 });
  const req = { ip: '127.0.0.1' };
  const cabeceras = {};
  let codigoEstado = 200;
  let cuerpo = null;
  const res = {
    setHeader(clave, valor) { cabeceras[clave] = valor; },
    status(codigo) { codigoEstado = codigo; return this; },
    json(datos) { cuerpo = datos; return this; },
  };

  let llamadasNext = 0;
  limitador(req, res, () => { llamadasNext += 1; });
  limitador(req, res, () => { llamadasNext += 1; });
  assert.equal(llamadasNext, 2);

  // El tercer intento dentro de la ventana debe ser rechazado con 429
  limitador(req, res, () => { llamadasNext += 1; });
  assert.equal(llamadasNext, 2);
  assert.equal(codigoEstado, 429);
  assert.equal(cuerpo.ok, false);
  assert.ok(cabeceras['Retry-After']);
});

test('contactoRouter solo expone POST público y separa el router del operador', () => {
  const metodosRegistrados = contactoRouter.stack
    .filter(capa => capa.route)
    .flatMap(capa => Object.keys(capa.route.methods));

  assert.deepEqual(metodosRegistrados, ['post']);

  const rutasOperador = contactoRouter.operadorContactosRouter.stack
    .filter(capa => capa.route)
    .map(capa => `${Object.keys(capa.route.methods).join(',').toUpperCase()} ${capa.route.path}`);

  assert.deepEqual(rutasOperador, ['GET /', 'POST /:id/responder']);
});

test('validarPayloadRespuestaContacto exige entre 10 y 5000 caracteres y recorta espacios', () => {
  assert.equal(validarPayloadRespuestaContacto(null).esValido, false);
  assert.equal(validarPayloadRespuestaContacto({ respuesta: '   Corto   ' }).esValido, false);
  assert.equal(validarPayloadRespuestaContacto({ respuesta: 'a'.repeat(5001) }).esValido, false);

  const valida = validarPayloadRespuestaContacto({ respuesta: '  Hola Ignacio, te enviamos la cotización detallada.  ' });
  assert.equal(valida.esValido, true);
  assert.equal(valida.sanitizado.respuesta, 'Hola Ignacio, te enviamos la cotización detallada.');
});

test('listarSolicitudesContacto devuelve los mensajes ordenados y aplica filtros parametrizados', async t => {
  const consultaOriginal = db.query;
  t.after(() => { db.query = consultaOriginal; });

  const consultasEjecutadas = [];
  const filasEjemplo = [
    {
      id: 4,
      nombre: 'Cliente Prueba',
      email: 'cliente@ejemplo.com',
      tipo: 'cotizacion',
      mensaje: 'Necesito cotizar un desarrollo web.',
      estado: 'pendiente',
      respuesta: null,
      creado_en: '2026-10-18T00:00:00.000Z',
      respondido_en: null,
    },
  ];

  db.query = async (sql, parametros) => {
    if (sql.includes('FROM mensajes_contacto')) {
      consultasEjecutadas.push({ sql, parametros });
      return { rows: filasEjemplo, rowCount: filasEjemplo.length };
    }
    return { rows: [], rowCount: 0 };
  };

  const resTodos = crearRespuestaSimulada();
  await listarSolicitudesContacto({ query: {} }, resTodos);
  assert.equal(resTodos.statusCode, 200);
  assert.deepEqual(resTodos.body, filasEjemplo);
  assert.deepEqual(consultasEjecutadas[0].parametros, []);

  const resFiltrado = crearRespuestaSimulada();
  await listarSolicitudesContacto({ query: { estado: 'pendiente', tipo: 'cotizacion' } }, resFiltrado);
  assert.equal(resFiltrado.statusCode, 200);
  assert.deepEqual(consultasEjecutadas[1].parametros, ['pendiente', 'cotizacion']);
  assert.match(consultasEjecutadas[1].sql, /estado = \$1 AND tipo = \$2/);

  const resInvalido = crearRespuestaSimulada();
  await listarSolicitudesContacto({ query: { estado: 'invalido' } }, resInvalido);
  assert.equal(resInvalido.statusCode, 400);
});

test('responderSolicitudContacto valida id y respuesta, envía el correo y actualiza estado a respondido', async t => {
  const consultaOriginal = db.query;
  const enviarRespuestaOriginal = servicioCorreo.enviarRespuestaContacto;
  t.after(() => {
    db.query = consultaOriginal;
    servicioCorreo.enviarRespuestaContacto = enviarRespuestaOriginal;
  });

  const correosEnviados = [];
  servicioCorreo.enviarRespuestaContacto = async datosCorreo => {
    correosEnviados.push(datosCorreo);
    return { idMensaje: '<respuesta-prueba@quokka.studio>' };
  };

  let estadoActual = 'pendiente';
  db.query = async (sql, parametros) => {
    if (sql.includes('SELECT id, nombre, email')) {
      if (parametros[0] === 999) return { rows: [], rowCount: 0 };
      return {
        rowCount: 1,
        rows: [{
          id: parametros[0],
          nombre: 'Laura Gómez',
          email: 'laura@ejemplo.com',
          tipo: 'asesoria',
          mensaje: 'Quisiera coordinar una asesoría técnica.',
          estado: estadoActual,
          respuesta: estadoActual === 'respondido' ? 'Respuesta previa' : null,
          creado_en: '2026-10-18T00:00:00.000Z',
          respondido_en: null,
        }],
      };
    }
    if (sql.includes('UPDATE mensajes_contacto')) {
      estadoActual = 'respondido';
      return {
        rowCount: 1,
        rows: [{
          id: parametros[0],
          nombre: 'Laura Gómez',
          email: 'laura@ejemplo.com',
          tipo: 'asesoria',
          mensaje: 'Quisiera coordinar una asesoría técnica.',
          estado: 'respondido',
          respuesta: parametros[1],
          creado_en: '2026-10-18T00:00:00.000Z',
          respondido_en: '2026-10-18T01:00:00.000Z',
        }],
      };
    }
    return { rows: [], rowCount: 0 };
  };

  // ID inválido
  const resIdInvalido = crearRespuestaSimulada();
  await responderSolicitudContacto({ params: { id: 'abc' }, body: { respuesta: 'Respuesta válida de prueba' } }, resIdInvalido);
  assert.equal(resIdInvalido.statusCode, 400);

  // Respuesta demasiado corta
  const resCorta = crearRespuestaSimulada();
  await responderSolicitudContacto({ params: { id: '8' }, body: { respuesta: 'Corto' } }, resCorta);
  assert.equal(resCorta.statusCode, 400);
  assert.ok(resCorta.body.fields.respuesta);

  // Registro inexistente (404)
  const resNoEncontrado = crearRespuestaSimulada();
  await responderSolicitudContacto({ params: { id: '999' }, body: { respuesta: 'Hola, te escribimos por tu consulta.' } }, resNoEncontrado);
  assert.equal(resNoEncontrado.statusCode, 404);

  // Envío exitoso (200)
  const resExito = crearRespuestaSimulada();
  await responderSolicitudContacto({ params: { id: '8' }, body: { respuesta: '  Hola Laura, podemos agendar una llamada mañana a las 15 hs.  ' } }, resExito);
  assert.equal(resExito.statusCode, 200);
  assert.equal(resExito.body.ok, true);
  assert.equal(resExito.body.contacto.estado, 'respondido');
  assert.equal(resExito.body.contacto.respuesta, 'Hola Laura, podemos agendar una llamada mañana a las 15 hs.');
  assert.equal(correosEnviados.length, 1);
  assert.equal(correosEnviados[0].email, 'laura@ejemplo.com');
  assert.equal(correosEnviados[0].respuesta, 'Hola Laura, podemos agendar una llamada mañana a las 15 hs.');

  // Intento de responder nuevamente una consulta ya respondida (409)
  const resConflicto = crearRespuestaSimulada();
  await responderSolicitudContacto({ params: { id: '8' }, body: { respuesta: 'Otra respuesta sobre consulta cerrada.' } }, resConflicto);
  assert.equal(resConflicto.statusCode, 409);
  assert.equal(correosEnviados.length, 1);
});
