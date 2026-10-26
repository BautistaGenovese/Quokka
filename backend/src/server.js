const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initDb = require('./config/inicializarBd');
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

// Seguridad: Confiar en el reverse proxy (Render) para obtener la IP real del cliente y ocultar banner
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Cabeceras de seguridad HTTP (OWASP A05)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const configuredOrigin = process.env.FRONTEND_URL;
    if (
      (configuredOrigin && origin === configuredOrigin) ||
      origin === 'http://localhost:3000' ||
      /^https:\/\/quokka-frontend.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json({ limit: '100kb' })); // Permite recibir datos en formato JSON con límite contra DoS

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
      estado: 'API funcionando, pero error en Base de Datos ❌'
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
  initDb().catch(err => console.warn("Aviso BD:", err.message)).finally(() => {
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
