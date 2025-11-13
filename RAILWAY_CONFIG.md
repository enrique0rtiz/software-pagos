# 🚂 Guía de Configuración en Railway

## Variables de Entorno Requeridas

Asegúrate de tener TODAS estas variables configuradas en Railway:

### 1️⃣ DATABASE_URL (Conexión a PostgreSQL)

**Opción A: Vincular servicios (RECOMENDADO)**
1. Ve a tu servicio de aplicación en Railway
2. Click en "Variables" o "Settings"
3. Busca "Add Variable Reference"
4. Selecciona tu servicio de PostgreSQL
5. Selecciona la variable `DATABASE_URL`
6. Railway la configurará automáticamente

**Opción B: Configurar manualmente**

Formato con enlace `.internal` (más rápido y seguro):
```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres.railway.internal:5432/railway
```

Formato con enlace público:
```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@containers-us-west-XX.railway.app:5432/railway
```

Para obtener los valores desde tu servicio PostgreSQL:
- `PGUSER` → usuario (usualmente "postgres")
- `PGPASSWORD` → contraseña
- `PGHOST` → host (termina en `.railway.internal` o `.railway.app`)
- `PGPORT` → puerto (usualmente 5432)
- `PGDATABASE` → nombre de la base de datos (usualmente "railway")

### 2️⃣ NODE_ENV

```
NODE_ENV=production
```

**IMPORTANTE:** Esta variable activa:
- ✅ SSL en la conexión a PostgreSQL
- ✅ Cookies seguras
- ✅ Servicio del frontend desde el backend
- ✅ Optimizaciones de producción

### 3️⃣ SESSION_SECRET

```
SESSION_SECRET=tu_secreto_aleatorio_muy_largo_y_seguro_64_caracteres
```

Genera uno seguro con:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4️⃣ ADMIN_USERNAME

```
ADMIN_USERNAME=tu_usuario_admin
```

### 5️⃣ ADMIN_PASSWORD

```
ADMIN_PASSWORD=tu_contraseña_muy_segura_123!
```

Usa una contraseña fuerte:
- Mínimo 12 caracteres
- Mayúsculas, minúsculas, números y símbolos
- Ejemplo: `MyP@ssw0rd!2024_Secure#789`

---

## 🔧 Verificación de Variables

Después de configurar las variables, verifica los logs del deploy. Deberías ver:

```
✅ Logs correctos:
🔧 Configurando conexión a PostgreSQL...
📊 Entorno: production
🔒 SSL: ACTIVADO
🔄 Intentando conectar a PostgreSQL...
✅ Conexión a PostgreSQL exitosa: 2025-11-13T...
🚀 Servidor corriendo en puerto 8080
```

```
❌ Si ves errores:

Error: DATABASE_URL no está configurada
→ Solución: Configura la variable DATABASE_URL

Error: ENOTFOUND o ECONNREFUSED
→ Solución: Verifica que el host en DATABASE_URL sea correcto
→ Asegúrate de que los servicios estén en el mismo proyecto
→ Usa el enlace .internal si es posible

Error: SSL requerido
→ Solución: Asegúrate de tener NODE_ENV=production

Error: SESSION_SECRET no está configurado
→ Solución: Configura la variable SESSION_SECRET
```

---

## 🔗 Vincular PostgreSQL con tu Aplicación

Si tienes PostgreSQL en un servicio separado:

1. **Ve a tu servicio de aplicación** en Railway
2. **Settings → Service**
3. Busca la sección **"Service Variables"** o **"Connected Services"**
4. Click en **"Connect"** o **"Link"**
5. Selecciona tu servicio de **PostgreSQL**
6. Railway automáticamente inyectará `DATABASE_URL`

---

## 🐛 Troubleshooting

### Problema: "trust proxy" error

**✅ SOLUCIONADO:** Ya agregué `app.set('trust proxy', 1)` en el código.

### Problema: No se conecta a la base de datos

**Verifica:**
1. ✅ Variable `DATABASE_URL` está configurada
2. ✅ El formato de `DATABASE_URL` es correcto (postgresql://...)
3. ✅ El servicio PostgreSQL está corriendo en Railway
4. ✅ `NODE_ENV=production` está configurado (activa SSL)
5. ✅ Los servicios están en el mismo proyecto de Railway

### Problema: "CANNOT GET /"

**Solución:** Asegúrate de tener `NODE_ENV=production`

### Problema: Error en login

**Verifica:**
1. ✅ `ADMIN_USERNAME` está configurado
2. ✅ `ADMIN_PASSWORD` está configurado
3. ✅ `SESSION_SECRET` está configurado
4. ✅ Estás usando las credenciales correctas

---

## 📋 Checklist de Deploy

- [ ] `DATABASE_URL` configurada (vinculada o manual)
- [ ] `NODE_ENV=production`
- [ ] `SESSION_SECRET` generado y configurado
- [ ] `ADMIN_USERNAME` configurado
- [ ] `ADMIN_PASSWORD` configurado (fuerte)
- [ ] Servicios PostgreSQL y App en el mismo proyecto
- [ ] Push al repositorio completado
- [ ] Deploy exitoso sin errores en logs
- [ ] Login funciona correctamente
- [ ] Datos se guardan en la base de datos

---

## 🎯 Comando para verificar variables (local)

Si quieres probar localmente antes de deployar:

1. Crea un archivo `.env` en la carpeta `server/`:
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
NODE_ENV=production
```

2. Ejecuta:
```bash
cd server
npm install
npm start
```

3. Verifica los logs de conexión

**⚠️ NUNCA hagas commit del archivo `.env`** (ya está en .gitignore)

