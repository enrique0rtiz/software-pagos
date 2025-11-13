# 🔒 Configuración de Seguridad

## Protecciones Implementadas

### 1. Rate Limiting contra Fuerza Bruta

**Login Protection:**
- Máximo **5 intentos de login** por IP cada 15 minutos
- Después de 5 intentos fallidos, el usuario debe esperar 15 minutos
- Protege contra ataques de fuerza bruta automatizados

**API General Protection:**
- Máximo **100 peticiones** por IP cada 15 minutos
- Protege contra ataques DDoS y abuso de la API

### 2. Autenticación por Sesión

- Todas las rutas `/api/payments/*` y `/api/clients/*` requieren autenticación
- Sesiones con cookies seguras (httpOnly, secure en producción)
- Duración de sesión: 24 horas

### 3. Variables de Entorno Requeridas

Configura estas variables en Railway:

```
DATABASE_URL=postgresql://...           # URL de conexión a PostgreSQL
SESSION_SECRET=...                      # Secreto para sesiones (64+ caracteres)
ADMIN_USERNAME=...                      # Usuario administrador
ADMIN_PASSWORD=...                      # Contraseña administrador (segura)
NODE_ENV=production                     # Activa SSL y optimizaciones
```

## Recomendaciones de Seguridad

### Para la Contraseña Admin:
- Usa al menos 12 caracteres
- Incluye mayúsculas, minúsculas, números y símbolos
- Ejemplo: `MyP@ssw0rd!2024_Secure#789`
- Cámbiala periódicamente

### Para SESSION_SECRET:
- Usa un string aleatorio de 64+ caracteres
- Generar con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### Acceso a la Aplicación:
- No compartas la URL públicamente
- Usa HTTPS (Railway lo proporciona automáticamente)
- Monitorea los logs de acceso regularmente

## Testing de Rate Limit

Puedes probar la protección intentando hacer más de 5 logins en 15 minutos. Recibirás:

```json
{
  "error": "Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en 15 minutos."
}
```

## Logs de Seguridad

El servidor registra en consola:
- Intentos de login (exitosos y fallidos)
- Errores de autenticación
- Conexiones a la base de datos

