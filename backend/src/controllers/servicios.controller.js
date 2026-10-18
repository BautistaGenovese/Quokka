const db = require('../config/db');
const initDb = require('../config/initDb');

async function listarServicios(req, res) {
  try {
    const result = await db.query(
      'SELECT id, nombre_servicio, descripcion FROM servicios ORDER BY id ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los servicios.' });
  }
}

function validarPayloadServicios(body = {}) {
  // Caso base: No hay ñaca
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const defaultErrors = {
      nombre_servicio: 'Ingresá al menos 3 caracteres.',
      descripcion: 'Escribí al menos 10 caracteres.',
    };
    return {
      isValid: false,
      fields: defaultErrors,
      sanitized: {
        nombre_servicio: '',
        descripcion: '',
      },
    }
  };

  // Sanitizamos los campos ingresados
  const nombre_servicio = typeof body.nombre_servicio === 'string' ? body.nombre_servicio.trim() : '';
  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
  const fields = {};

  // Si los valores no cumplen con el largo esperado, entonces muestra los errores;
  if (nombre_servicio.length < 3) {
    const msj = 'Ingresá al menos 3 caracteres.';
    fields.nombre_servicio = msj;
  } else if (nombre_servicio.length > 100) {
    const msj = 'El nombre no puede superar los 100 caracteres.';
    fields.nombre_servicio = msj;
  }

  if (descripcion.length < 10) {
    const msj = 'Escribí al menos 10 caracteres.';
    fields.descripcion = msj;
  } else if (descripcion.length > 5000) {
    const msj = 'El mensaje no puede superar los 5000 caracteres.';
    fields.descripcion = msj;
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    sanitized: {
      nombre_servicio,
      descripcion,
    },
  };
}

async function crearSolicitudServicio(req, res) {
  const { isValid, fields, sanitized } = validarPayloadServicios(req.body);

  if (!isValid) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  const { nombre_servicio, descripcion } = sanitized;

  try {
    await initDb();

    const respuesta = await db.query(
      `INSERT INTO servicios (nombre_servicio, descripcion)
      VALUES ($1, $2)
      RETURNING id, nombre_servicio, descripcion`,
      [nombre_servicio, descripcion]
    );

    return res.status(201).json({
      ok: true,
      servicio: respuesta.rows[0]
    })

  } catch (error) {
    console.error('Error al cargar los datos del nuevo servicio:', error.message);

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos del nuevo servicio. Intentá otra vez capo.'
    });
  }
}

async function modificarServicio(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'El id debe de ser un entero positivo'
    });
  }

  const { isValid, fields, sanitized } = validarPayloadServicios(req.body);

  if (!isValid) {
    return res.status(400).json({
      ok: false,
      error: 'Revisá los campos marcados.',
      fields,
    });
  }

  const { nombre_servicio, descripcion } = sanitized;

  try {
    const respuesta = await db.query(
      `UPDATE servicios
      SET nombre_servicio = $1, descripcion = $2
      WHERE id = $3
      RETURNING id, nombre_servicio, descripcion`,
      [nombre_servicio, descripcion, id]
    );

    if (respuesta.rowCount === 0) {
      return res.status(404).json({
        error: 'No se encontró el sevicio flaco.'
      });
    }

    return res.status(200).json({
      ok: true,
      servicio: respuesta.rows[0],
    });

  } catch (error) {
    console.error('Error al cargar los datos del servicio: ', error.message);

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos del servicio. Intentá otra vez capo.'
    });
  }
}

async function borrarServicio(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'El id debe de ser un entero positivo'
    });
  }

  try {
    const respuesta = await db.query(`
      DELETE FROM servicios
      WHERE id = $1
      RETURNING id, nombre_servicio`,
      [id]
    );

    if (respuesta.rowCount === 0) {
      return res.status(404).json({
        error: 'No se encontró el sevicio flaco.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Los datos fueron eliminados correctamente.',
      servicio: respuesta.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar el servicio: ', error.message);

    return res.status(500).json({
      ok: false,
      error: 'No se eliminó el servicio. Intentá otra vez capo.'
    });
  }
}


module.exports = {
  listarServicios,
  crearSolicitudServicio,
  modificarServicio,
  borrarServicio,
};

