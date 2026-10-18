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
    await seedInitialUsers();
  } catch (error) {
    console.error('❌ Error al inicializar el esquema de la base de datos:', error.message);
    throw error;
  }
}

/**
 * Semillero de usuarios iniciales si la tabla `usuarios` está vacía,
 * garantizando acceso inmediato al Panel de Administración de Juan Girón.
 */
async function seedInitialUsers() {
  try {
    const bcrypt = require('bcryptjs');
    const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM usuarios');
    if (rows[0].count === 0) {
      console.log('🌱 Creando usuarios iniciales para el panel de administración...');
      const adminHash = await bcrypt.hash('Admin123!', 10);
      const opHash = await bcrypt.hash('Operador123!', 10);
      const userHash = await bcrypt.hash('Usuario123!', 10);

      await db.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
         ('Juan Girón (Administrador)', 'admin@quokka.studio', $1, 'administrador'),
         ('Operador Soporte Quokka', 'operador@quokka.studio', $2, 'operador'),
         ('Usuario Registrado Demo', 'usuario@quokka.studio', $3, 'usuario')`,
        [adminHash, opHash, userHash]
      );
      console.log('✅ Usuarios base listos: admin@quokka.studio / Admin123!');
    }
  } catch (error) {
    console.warn('ℹ️ Nota de inicialización de usuarios:', error.message);
  }
}

module.exports = initDb;
