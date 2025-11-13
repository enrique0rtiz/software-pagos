// Middleware para proteger rutas que requieren autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Debe iniciar sesión.' });
}

module.exports = { requireAuth };

