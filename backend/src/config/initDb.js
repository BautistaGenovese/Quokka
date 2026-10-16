const db = require('./db');

const CREATE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (char_length(btrim(name)) >= 3),
    email VARCHAR(255) NOT NULL CHECK (char_length(btrim(email)) >= 5),
    type VARCHAR(30) NOT NULL CHECK (type IN ('cotizacion', 'asesoria', 'general')),
    message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 15 AND 5000),
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

let initialized = false;

async function initDb() {
  if (initialized) return;
  try {
    await db.query(CREATE_TABLE_QUERY);
    initialized = true;
    console.log('✅ Tabla contact_requests verificada/creada en PostgreSQL.');
  } catch (error) {
    console.error('❌ Error al inicializar la tabla contact_requests:', error.message);
    throw error;
  }
}

module.exports = initDb;
