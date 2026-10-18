const db = require('../config/db');


function validarPayloadServicios(body = {}) {
  // Caso base: No hay ñaca
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const defaultErrors = {
      nombre_servicio: 'Ingresá al menos 3 caracteres.',
      descripcion: 'Escribí al menos 10 caracteres.',
      tecnologia_ids: 'Enviá un arreglo de tecnologías.',
    };
    return {
      isValid: false,
      fields: defaultErrors,
      sanitized: {
        nombre_servicio: '',
        descripcion: '',
        tecnologia_ids: [],
      },
    }
  };

  // Sanitizamos los campos ingresados
  const nombre_servicio = typeof body.nombre_servicio === 'string' ? body.nombre_servicio.trim() : '';
  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
  const tecnologia_ids = body.tecnologia_ids;
  const fields = {};

  // Si los valores no cumplen con el largo esperado, entonces muestra los errores;
  if (nombre_servicio.length < 3) {
    fields.nombre_servicio = 'Ingresá al menos 3 caracteres.';
  } else if (nombre_servicio.length > 100) {
    fields.nombre_servicio = 'El nombre no puede superar los 100 caracteres.';
  }

  if (descripcion.length < 10) {
    fields.descripcion = 'Escribí al menos 10 caracteres.';
  } else if (descripcion.length > 5000) {
    fields.descripcion = 'El mensaje no puede superar los 5000 caracteres.';
  }

  if (!Array.isArray(tecnologia_ids)) {
    fields.tecnologia_ids = 'Enviá un arreglo de tecnologías.';
  } else if (
    tecnologia_ids.some(id =>
      !Number.isInteger(id) || id <= 0 || id > 2147483647
    )
  ) {
    fields.tecnologia_ids = 'Los identificadores deber de ser enteros positivos validos.'
  } else if (new Set(tecnologia_ids).size !== tecnologia_ids.length) {
    fields.tecnologia_ids = 'No debes de repetir tecnologías.'
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    sanitized: {
      nombre_servicio,
      descripcion,
      tecnologia_ids
    },
  };
}

// La consulta y las escrituras usan el mismo cliente de la transacción.
async function obtenerTecnologias(cliente, ids) {
  if (ids.length === 0) return [];

  const resultado = await cliente.query(
    `SELECT id, nombre_tecnologia AS nombre FROM tecnologias
     WHERE id = ANY($1::int[]) ORDER BY nombre_tecnologia FOR SHARE`,
    [ids]
  );

  if (resultado.rows.length !== ids.length) {
    const error = new Error('Una o más tecnologías no existen.');
    error.status = 400;
    throw error;
  }

  return resultado.rows;
}

// Si también falla el rollback, descartar la conexión y conservar el error original.
async function deshacerTransaccion(cliente) {
  if (!cliente) return;
  try {
    await cliente.query('ROLLBACK');
  } catch (error) {
    cliente.release(error);
    console.error('Error al deshacer la transacción:', error.message);
    return true;
  }
  return false;
}

async function listarServicios(req, res) {
  try {
    const result = await db.query(
      `SELECT
        s.id,
        s.nombre_servicio,
        s.descripcion,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'nombre', t.nombre_tecnologia
            )
            ORDER BY t.nombre_tecnologia
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) AS tecnologias
      FROM servicios AS s
      LEFT JOIN servicios_tecnologias AS st
        ON st.servicio_id = s.id
      LEFT JOIN tecnologias AS t
        ON t.id = st.tecnologia_id
      GROUP BY s.id
      ORDER BY s.id ASC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    return res.status(500).json({ error: 'No se pudieron obtener los servicios.' });
  }
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

  const { nombre_servicio, descripcion, tecnologia_ids } = sanitized;
  let cliente;

  try {

    cliente = await db.getClient();

    await cliente.query('BEGIN');

    const tecnologias = await obtenerTecnologias(cliente, tecnologia_ids);

    const respuesta = await cliente.query(
      `INSERT INTO servicios (nombre_servicio, descripcion)
      VALUES ($1, $2)
      RETURNING id, nombre_servicio, descripcion`,
      [nombre_servicio, descripcion]
    );

    for ( const tecnologia_id of tecnologia_ids ) {
      await cliente.query(
        `INSERT INTO servicios_tecnologias (servicio_id, tecnologia_id)
        VALUES ($1, $2)`,
        [respuesta.rows[0].id, tecnologia_id]
      );
    }

    await cliente.query('COMMIT');

    return res.status(201).json({
      ok: true,
      servicio: { ...respuesta.rows[0], tecnologias }
    })

  } catch (error) {
    console.error('Error al cargar los datos del nuevo servicio:', error.message);

    if (await deshacerTransaccion(cliente)) cliente = undefined;

    if (error.status === 400 || error.code === '23503') {
      return res.status(400).json({
        ok: false,
        error: 'Una o más tecnologías no existen.'
      });
    }

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos del nuevo servicio. Intentá otra vez capo.'
    });
  } finally {
    if (cliente) {
      cliente.release();
    }
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

  const { nombre_servicio, descripcion, tecnologia_ids } = sanitized;
  let cliente;

  try {
    cliente = await db.getClient();

    await cliente.query('BEGIN');

    const respuesta = await cliente.query(
      `UPDATE servicios
      SET nombre_servicio = $1, descripcion = $2
      WHERE id = $3
      RETURNING id, nombre_servicio, descripcion`,
      [nombre_servicio, descripcion, id]
    );

    if (respuesta.rowCount === 0) {
      await cliente.query('ROLLBACK');

      return res.status(404).json({
        error: 'No se encontró el sevicio flaco.'
      });
    }

    const tecnologias = await obtenerTecnologias(cliente, tecnologia_ids);

    await cliente.query(
      'DELETE FROM servicios_tecnologias WHERE servicio_id = $1',
      [id]
    );

    for ( const tecnologia_id of tecnologia_ids ) {
      await cliente.query(
        `INSERT INTO servicios_tecnologias (servicio_id, tecnologia_id)
        VALUES ($1, $2)`,
        [id, tecnologia_id]
      );
    }

    await cliente.query('COMMIT');

    return res.status(200).json({
      ok: true,
      servicio: { ...respuesta.rows[0], tecnologias },
    });

  } catch (error) {
    console.error('Error al cargar los datos del servicio: ', error.message);

    if (await deshacerTransaccion(cliente)) cliente = undefined;

    if (error.status === 400 || error.code === '23503') {
      return res.status(400).json({
        ok: false,
        error: 'Una o más tecnologías no existen.'
      });
    }

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos del servicio. Intentá otra vez capo.'
    });
  } finally {
    if (cliente) {
      cliente.release();
    }
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

async function listarTecnologias(req, res) {
  try {
    const result = await db.query(
      'SELECT id, nombre_tecnologia AS nombre FROM tecnologias ORDER BY nombre_tecnologia ASC'
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al listar las tecnologías:', error.message);
    return res.status(500).json({ error: 'No se pudieron obtener las tecnologías.' });
  }
}

async function crearSolicitudTecnologia(req, res) {
  let error = null;
  const nombre_tecnologia = typeof req.body?.nombre_tecnologia === 'string' ? req.body.nombre_tecnologia.trim() : '';

  // Si los valores no cumplen con lo esperado, entonces muestra los errores;
  if (nombre_tecnologia.length < 1) {
    error = 'Ingresá al menos 1 caracter.';
  } else if (nombre_tecnologia.length > 100) {
    error = 'El nombre no puede superar los 100 caracteres.';
  }

  if (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }

  try {
    const respuesta = await db.query(
      `INSERT INTO tecnologias (nombre_tecnologia)
      VALUES ($1)
      RETURNING id, nombre_tecnologia`,
      [nombre_tecnologia]
    );

    return res.status(201).json({
      ok: true,
      tecnologia: respuesta.rows[0],
    })

  } catch (error) {
    console.error('Error al cargar los datos de la nueva tecnologia:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Ya existe una tecnología con ese nombre.' });
    }

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos de la nueva tecnologia. Intentá otra vez capo.'
    });
  }
}

async function modificarTecnologia(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'El id debe de ser un entero positivo'
    });
  }

  let error = null;
  const nombre_tecnologia = typeof req.body?.nombre_tecnologia === 'string' ? req.body.nombre_tecnologia.trim() : '';

  // Si los valores no cumplen con lo esperado, entonces muestra los errores;
  if (nombre_tecnologia.length < 1) {
    error = 'Ingresá al menos 1 caracter.';
  } else if (nombre_tecnologia.length > 100) {
    error = 'El nombre no puede superar los 100 caracteres.';
  }

  if (error) {
    return res.status(400).json({
      ok: false,
      error,
    });
  }

  try {
    const respuesta = await db.query(
      `UPDATE tecnologias
      SET nombre_tecnologia = $1
      WHERE id = $2
      RETURNING id, nombre_tecnologia`,
      [nombre_tecnologia, id]
    );

    if (respuesta.rowCount === 0) {
      return res.status(404).json({
        error: 'No se encontró la tecnología flaco.'
      });
    }

    return res.status(200).json({
      ok: true,
      tecnologia: respuesta.rows[0],
    });

  } catch (error) {
    console.error('Error al cargar los datos de la tecnologia:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Ya existe una tecnología con ese nombre.' });
    }

    return res.status(500).json({
      ok: false,
      error: 'No se cargaron los datos de la tecnologia. Intentá otra vez capo.'
    });
  }
}

async function borrarTecnologia(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'El id debe de ser un entero positivo'
    });
  }

  try {
    const respuesta = await db.query(`
      DELETE FROM tecnologias
      WHERE id = $1
      RETURNING id, nombre_tecnologia`,
      [id]
    );

    if (respuesta.rowCount === 0) {
      return res.status(404).json({
        error: 'No se encontró la tecnología flaco.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Los datos fueron eliminados correctamente.',
      tecnologia: respuesta.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar la tecnología: ', error.message);

    return res.status(500).json({
      ok: false,
      error: 'No se eliminó la tecnología. Intentá otra vez capo.'
    });
  }
}

module.exports = {
  listarServicios,
  crearSolicitudServicio,
  modificarServicio,
  borrarServicio,
  listarTecnologias,
  crearSolicitudTecnologia,
  modificarTecnologia,
  borrarTecnologia
};

