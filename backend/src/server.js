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

// Middlewares
app.use(cors()); // Permite conectar el frontend con el backend
app.use(express.json()); // Permite recibir datos en formato JSON

// Ruta de prueba para verificar que la API funciona y se conecta a la BD
app.get('/api/status', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS hora_actual');
    res.json({
      estado: 'API funcionando correctamente 🚀',
      base_de_datos: 'Conectada ✅',
      hora_servidor: result.rows[0].hora_actual
    });
  } catch (error) {
    console.error('Error al conectar la BD en status:', error);
    res.status(500).json({
      estado: 'API funcionando, pero error en Base de Datos ❌',
      error: error.message
    });
  }
});

// Rutas del módulo de contacto y cotizaciones (en español y alias compatible)
app.use('/api/contacto', contactRoutes);
app.use('/api/contact', contactRoutes);

// Inicializar esquema de BD y levantar el servidor
if (require.main === module) {
  initDb().finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`👉 Para probar el estado: http://localhost:${PORT}/api/status`);
      console.log(`📩 Endpoint de contacto activo en: http://localhost:${PORT}/api/contacto`);
    });
  });
}

module.exports = app;
