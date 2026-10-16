const db = require('./db');

const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('cotizacion', 'asesoria', 'general')),
    message TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`;

async function initDb() {
  try {
    await db.query(CREATE_TABLE_QUERY);
    console.log('✅ Tabla contact_requests verificada/creada en PostgreSQL.');
  } catch (error) {
    console.error('❌ Error al inicializar la tabla contact_requests:', error.message);
  }
}

module.exports = initDb;
