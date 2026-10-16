const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initDb = require('./config/initDb');
const contactRoutes = require('./routes/contact.routes');

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Ocultar cabecera X-Powered-By por seguridad
app.disable('x-powered-by');

// Cabeceras HTTP de seguridad básicas
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Configuración de CORS y límite de tamaño de payload JSON (previene ataques DoS por payloads gigantes)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin(origin, callback) {
      // Permitir peticiones sin origin (como tests locales) o desde orígenes autorizados
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '16kb' }));

// Ruta de prueba para verificar que la API funciona y se conecta a la BD
app.get('/api/status', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS hora_actual');
    res.json({
      estado: 'API funcionando correctamente 🚀',
      base_de_datos: 'Conectada ✅',
      hora_servidor: result.rows[0].hora_actual,
    });
  } catch (error) {
    console.error('Error al conectar la BD en status:', error.message);
    res.status(500).json({
      estado: 'API funcionando, pero error en Base de Datos ❌',
    });
  }
});

// Rutas del módulo de contacto y cotizaciones
app.use('/api/contact', contactRoutes);

// Inicializar esquema de BD y levantar el servidor
if (require.main === module) {
  initDb()
    .catch(() => {})
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
        console.log(`👉 Para probar el estado: http://localhost:${PORT}/api/status`);
        console.log(`📩 Endpoint de contacto activo en: POST http://localhost:${PORT}/api/contact`);
      });
    });
}

module.exports = app;
