const express = require('express');
const {
  registro,
  login,
  perfil,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Endpoints de registro (en español y alias en inglés)
router.post('/registro', registro);
router.post('/register', registro);

// Endpoint de inicio de sesión
router.post('/login', login);

// Endpoint para verificar sesión y obtener perfil del usuario activo
router.get('/me', requireAuth, perfil);

module.exports = router;
