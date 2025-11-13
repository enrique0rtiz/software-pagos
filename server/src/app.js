const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./db');
const authRoutes = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');
const clientsRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter general para todas las peticiones API
// Permite 100 peticiones por IP cada 15 minutos
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones
  message: {
    error: 'Demasiadas peticiones desde esta IP. Por favor, intente de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiter a todas las rutas /api/*
app.use('/api/', apiLimiter);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // En producción, el frontend se sirve desde el mismo servidor
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de sesiones
if (!process.env.SESSION_SECRET) {
  console.error('❌ ERROR: SESSION_SECRET no está configurado. Es requerido para la seguridad.');
  process.exit(1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/clients', clientsRoutes);

// Ruta de prueba
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ 
      status: 'ok', 
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error de conexión a la base de datos',
      error: error.message 
    });
  }
});

// Servir archivos estáticos del frontend (después de build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Todas las rutas que no sean /api/* sirven el index.html de React
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
}

// Iniciar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`📦 Frontend servido desde: ${path.join(__dirname, '../public')}`);
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

