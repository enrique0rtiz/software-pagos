const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('ADMIN_USERNAME o ADMIN_PASSWORD no están configurados');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Comparar credenciales
    if (username === adminUsername && password === adminPassword) {
      req.session.authenticated = true;
      req.session.username = username;
      
      return res.json({ 
        success: true, 
        message: 'Login exitoso',
        username: username 
      });
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
});

// GET /api/auth/check - Verificar si el usuario está autenticado
router.get('/check', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ authenticated: true, username: req.session.username });
  }
  return res.json({ authenticated: false });
});

module.exports = router;

