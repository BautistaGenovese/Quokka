const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initDb = require('./config/initDb');
const contactRoutes = require('./routes/contact.routes');
const { 
  serviciosRouter, 
  adminServiciosRouter,
  tecnologiasRouter,
  adminTecnologiasRouter
} = require('./routes/servicios');
const authRoutes = require('./routes/auth.routes');
const adminUsuariosRoutes = require('./routes/usuarios.routes');

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

// --- Rutitas ---

// Rutas del módulo de contacto y cotizaciones (en español y alias compatible)
app.use('/api/contacto', contactRoutes);
app.use('/api/contact', contactRoutes);

// Rutas del módulo de servicios (en español y alias compatible <- Al re pedo que esté en ingles papito).
app.use('/api/servicios', serviciosRouter);
app.use('/api/services', serviciosRouter);

app.use('/api/admin/servicios', adminServiciosRouter);
app.use('/api/admin/services', adminServiciosRouter);

// Rutas al módulo de tecnologias
app.use('/api/tecnologias', tecnologiasRouter);
app.use('/api/technologies', tecnologiasRouter);

app.use('/api/admin/tecnologias', adminTecnologiasRouter);
app.use('/api/admin/technologies', adminTecnologiasRouter);

// Rutas del módulo de autenticación (Sprint 2 - Juan Girón)
app.use('/api/auth', authRoutes);

// Rutas del panel exclusivo de Administrador para gestión de usuarios (Sprint 3 - Juan Girón)
app.use('/api/admin/usuarios', adminUsuariosRoutes);
app.use('/api/admin/users', adminUsuariosRoutes);

// Inicializar esquema de BD y levantar el servidor
if (require.main === module) {
  initDb().finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`👉 Para probar el estado: http://localhost:${PORT}/api/status`);
      console.log(`📩 Endpoint de contacto activo en: http://localhost:${PORT}/api/contacto`);
      console.log(`🍆 Endpoint de servicios activo en: http://localhost:${PORT}/api/servicios`);
      console.log(`🔐 Autenticación activa en: http://localhost:${PORT}/api/auth`);
      console.log(`👑 Panel admin de usuarios activo en: http://localhost:${PORT}/api/admin/usuarios`);
    });
  });
}

module.exports = app;
