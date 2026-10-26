const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = process.env.DATABASE_SSL === 'false'
  ? false
  : isProduction || (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Base de Datos conectada con éxito.');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
