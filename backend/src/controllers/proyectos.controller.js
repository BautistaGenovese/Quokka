const db = require('../config/db');

// Listas de columnas fijas: nunca se arman con datos del request.
const PUBLICO = 'id, titulo, descripcion, tecnologias, imagen_url, fecha_publicacion';
const DETALLE = `${PUBLICO}, url_demo`;
const ADMIN = `${DETALLE}, imagen_public_id, id_autor`;
const ORDEN = 'ORDER BY fecha_publicacion DESC, id DESC';

const CAMPOS_OPCIONALES = ['descripcion', 'tecnologias', 'url_demo', 'imagen_url', 'imagen_public_id'];

// proyectos.id es SERIAL (INTEGER de 32 bits): fuera de rango, PostgreSQL respondería con error.
const ID_MAXIMO = 2147483647;

// Solo dígitos decimales canónicos: Number() aceptaría '1e3', '0x10' o ' 7 '.
function parsearId(valor) {
  if (typeof valor !== 'string' || !/^[1-9]\d{0,9}$/.test(valor)) return null;
  const id = Number(valor);
  return id <= ID_MAXIMO ? id : null;
}

// Largo en puntos de código, no en unidades UTF-16.
const largo = texto => [...texto].length;

function urlValida(texto) {
  try {
    return new URL(texto);
  } catch {
    return null;
  }
}

function validarProyecto(body) {
  const origen = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const fields = {};
  const sanitized = {};

  // Normalizamos: trim y cadena vacía -> null. Los no-string se reportan.
  for (const campo of ['titulo', ...CAMPOS_OPCIONALES]) {
    const valor = origen[campo];
    if (valor === undefined || valor === null) {
      sanitized[campo] = null;
    } else if (typeof valor !== 'string') {
      sanitized[campo] = null;
      if (campo !== 'titulo') fields[campo] = 'Ingresá un texto válido.';
    } else {
      sanitized[campo] = valor.trim() === '' ? null : valor.trim();
    }
  }

  const { titulo, descripcion, tecnologias, url_demo, imagen_url, imagen_public_id } = sanitized;

  if (titulo === null || largo(titulo) < 3) {
    fields.titulo = 'Ingresá al menos 3 caracteres.';
  } else if (largo(titulo) > 150) {
    fields.titulo = 'El título no puede superar los 150 caracteres.';
  }

  if (descripcion !== null && !fields.descripcion && largo(descripcion) > 5000) {
    fields.descripcion = 'La descripción no puede superar los 5000 caracteres.';
  }

  if (tecnologias !== null && !fields.tecnologias && largo(tecnologias) > 255) {
    fields.tecnologias = 'Las tecnologías no pueden superar los 255 caracteres.';
  }

  if (url_demo !== null && !fields.url_demo) {
    const url = urlValida(url_demo);
    if (
      largo(url_demo) > 255 || !url || !['http:', 'https:'].includes(url.protocol) ||
      !url.hostname || url.username || url.password
    ) {
      fields.url_demo = 'Ingresá una URL válida que empiece con http:// o https://.';
    }
  }

  if (imagen_url !== null && !fields.imagen_url) {
    const url = urlValida(imagen_url);
    if (
      largo(imagen_url) > 2048 || !url || url.protocol !== 'https:' ||
      url.hostname !== 'res.cloudinary.com' || url.port || url.username || url.password
    ) {
      fields.imagen_url = 'La imagen debe ser una URL de Cloudinary (https://res.cloudinary.com/...).';
    }
  }

  if (imagen_public_id !== null && !fields.imagen_public_id) {
    if (imagen_url === null) {
      fields.imagen_public_id = 'Cargá la URL de la imagen antes del identificador.';
    } else if (largo(imagen_public_id) > 255) {
      fields.imagen_public_id = 'El identificador no puede superar los 255 caracteres.';
    }
  }

  return { isValid: Object.keys(fields).length === 0, fields, sanitized };
}

function idInvalido(res) {
  return res.status(400).json({ ok: false, error: 'El id debe ser un entero positivo.' });
}

function noEncontrado(res) {
  return res.status(404).json({ ok: false, error: 'No se encontró el proyecto.' });
}

function falla(res, accion, error) {
  console.error(`Error al ${accion} el proyecto:`, error.message);
  return res.status(500).json({
    ok: false,
    error: `No pudimos ${accion} el proyecto. Intentá nuevamente.`,
  });
}

function validar(req, res) {
  const resultado = validarProyecto(req.body);
  if (!resultado.isValid) {
    res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields: resultado.fields,
    });
    return null;
  }
  return resultado.sanitized;
}

const valoresEditables = p => [
  p.titulo, p.descripcion, p.tecnologias, p.url_demo, p.imagen_url, p.imagen_public_id,
];

async function listarProyectos(req, res) {
  try {
    const result = await db.query(`SELECT ${PUBLICO} FROM proyectos ${ORDEN}`);
    return res.json(result.rows);
  } catch (error) {
    return falla(res, 'listar', error);
  }
}

async function obtenerProyecto(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return idInvalido(res);

  try {
    const result = await db.query(`SELECT ${DETALLE} FROM proyectos WHERE id = $1`, [id]);
    if (result.rowCount === 0) return noEncontrado(res);
    return res.json({ ok: true, proyecto: result.rows[0] });
  } catch (error) {
    return falla(res, 'obtener', error);
  }
}

async function listarProyectosAdmin(req, res) {
  try {
    const result = await db.query(`SELECT ${ADMIN} FROM proyectos ${ORDEN}`);
    return res.json(result.rows);
  } catch (error) {
    return falla(res, 'listar', error);
  }
}

async function crearProyecto(req, res) {
  const datos = validar(req, res);
  if (!datos) return undefined;

  try {
    // El autor siempre sale del token; cualquier id_autor del body se ignora.
    const result = await db.query(
      `INSERT INTO proyectos
        (titulo, descripcion, tecnologias, url_demo, imagen_url, imagen_public_id, id_autor)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${ADMIN}`,
      [...valoresEditables(datos), req.user.id]
    );
    return res.status(201).json({ ok: true, proyecto: result.rows[0] });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(401).json({
        ok: false,
        error: 'Tu cuenta ya no está disponible. Iniciá sesión nuevamente.',
      });
    }
    return falla(res, 'crear', error);
  }
}

async function modificarProyecto(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return idInvalido(res);

  const datos = validar(req, res);
  if (!datos) return undefined;

  try {
    // Reemplazo completo de los seis campos; id_autor y fecha_publicacion no se tocan.
    const result = await db.query(
      `UPDATE proyectos
       SET titulo = $1, descripcion = $2, tecnologias = $3,
           url_demo = $4, imagen_url = $5, imagen_public_id = $6
       WHERE id = $7
       RETURNING ${ADMIN}`,
      [...valoresEditables(datos), id]
    );
    if (result.rowCount === 0) return noEncontrado(res);
    return res.json({ ok: true, proyecto: result.rows[0] });
  } catch (error) {
    return falla(res, 'modificar', error);
  }
}

async function borrarProyecto(req, res) {
  const id = parsearId(req.params.id);
  if (!id) return idInvalido(res);

  try {
    const result = await db.query(
      'DELETE FROM proyectos WHERE id = $1 RETURNING id, titulo',
      [id]
    );
    if (result.rowCount === 0) return noEncontrado(res);
    return res.json({
      ok: true,
      message: 'El proyecto fue eliminado correctamente.',
      proyecto: result.rows[0],
    });
  } catch (error) {
    return falla(res, 'eliminar', error);
  }
}

module.exports = {
  validarProyecto,
  listarProyectos,
  obtenerProyecto,
  listarProyectosAdmin,
  crearProyecto,
  modificarProyecto,
  borrarProyecto,
};
