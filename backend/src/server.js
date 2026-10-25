const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initDb = require('./config/initDb');
const contactoRouter = require('./routes/contacto.routes');
const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const { 
  serviciosRouter, 
  adminServiciosRouter,
  tecnologiasRouter,
  adminTecnologiasRouter
} = require('./routes/servicios');
const metricasRouter = require('./routes/metricas');
const githubRouter = require('./routes/github');
const { proyectosRouter, adminProyectosRouter } = require('./routes/proyectos');

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

// Rutas del módulo de autenticación (Registro, Login y Google OAuth)
app.use('/api/auth', authRouter);

// Rutas de gestión de usuarios del Panel de Administrador (Sprint 3)
app.use('/api/admin/usuarios', usuariosRouter);

// Rutas del módulo de contacto y cotizaciones (en español y alias compatible)
app.use('/api/contacto', contactoRouter);
app.use('/api/contact', contactoRouter);
app.use('/api/operador/contactos', contactoRouter.operadorContactosRouter);

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

// Rutas al módulo de métricas
app.use('/api', metricasRouter);

// Rutas del módulo de GitHub (perfiles del equipo, con caché en memoria)
app.use('/api/github', githubRouter);

// Rutas del módulo de proyectos (en español y alias compatible)
app.use('/api/proyectos', proyectosRouter);
app.use('/api/projects', proyectosRouter);

app.use('/api/admin/proyectos', adminProyectosRouter);
app.use('/api/admin/projects', adminProyectosRouter);

// Inicializar esquema de BD y levantar el servidor
if (require.main === module) {
  initDb().finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`👉 Para probar el estado: http://localhost:${PORT}/api/status`);
      console.log(`📩 Endpoint de contacto activo en: http://localhost:${PORT}/api/contacto`);
      console.log(`📥 Bandeja del operador activa en: http://localhost:${PORT}/api/operador/contactos`);
      console.log(`🍆 Endpoint de servicios activo en: http://localhost:${PORT}/api/servicios`);
    });
  });
}

module.exports = app;
