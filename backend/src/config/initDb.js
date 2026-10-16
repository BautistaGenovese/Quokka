const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');

const INIT_SQL_PATH = path.resolve(__dirname, '../../../database/init.sql');

let initialized = false;

/**
 * Ejecuta el esquema unificado `database/init.sql` de forma idempotente (`IF NOT EXISTS`).
 * Garantiza que todas las tablas del diagrama ER en español (`usuarios`, `proyectos`,
 * `servicios`, `mensajes_contacto`, `visitas`) existan incluso si el volumen de Docker
 * fue creado antes de montar `init.sql`.
 */
async function initDb() {
  if (initialized) return;
  try {
    const sqlScript = fs.readFileSync(INIT_SQL_PATH, 'utf8');
    await db.query(sqlScript);
    initialized = true;
    console.log('✅ Esquema unificado de PostgreSQL verificado/creado (usuarios, proyectos, servicios, mensajes_contacto, visitas).');
  } catch (error) {
    console.error('❌ Error al inicializar el esquema de la base de datos:', error.message);
    throw error;
  }
}

module.exports = initDb;
