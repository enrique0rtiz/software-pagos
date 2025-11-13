# Proyecto Railway - Gestión de Pagos y Clientes

Aplicación web full-stack para la gestión interna de pagos y base de datos de clientes asociados a temporadas. Desarrollada con Node.js + Express (backend) y React + Vite (frontend), lista para desplegar en Railway.

## 🚀 Características

- **Backend**: Node.js + Express con conexión directa a PostgreSQL
- **Frontend**: React con Vite, interfaz moderna y responsive
- **Autenticación**: Sistema de sesiones con express-session
- **Gestión de Pagos**: Crear, listar y eliminar pagos con filtros
- **Gestión de Clientes**: CRUD completo con formulario estilo Access, organizado por temporadas
- **Base de Datos**: PostgreSQL (ya debe existir en Railway)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL (ya creado en Railway)
- Cuenta en Railway para despliegue

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos PostgreSQL (Railway proporciona esta URL)
DATABASE_URL=postgres://usuario:password@host:puerto/database

# Credenciales del administrador
ADMIN_USERNAME=tu_usuario_admin
ADMIN_PASSWORD=tu_contraseña_segura

# Secret para las sesiones (generar una cadena aleatoria segura)
SESSION_SECRET=tu_secret_aleatorio_muy_seguro

# Puerto (Railway lo establece automáticamente, pero puedes definir uno para desarrollo)
PORT=3000

# Entorno
NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- No usar valores placeholder como "admin" o "password"
- Generar un `SESSION_SECRET` seguro (puedes usar: `openssl rand -base64 32`)
- El archivo `.env` está en `.gitignore` y no se subirá a GitHub

## 🛠️ Instalación y Desarrollo Local

### 1. Clonar e instalar dependencias

```bash
# Instalar dependencias de root, server y client
npm run install:all
```

O manualmente:

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configurar variables de entorno

Crear el archivo `.env` en la raíz del proyecto con las variables mencionadas arriba.

### 3. Crear las tablas en PostgreSQL

Si las tablas no existen, ejecutar el script SQL de referencia:

```bash
# Conectarse a tu base de datos PostgreSQL y ejecutar:
psql $DATABASE_URL -f sql/create_tables.sql
```

O copiar y pegar el contenido de `sql/create_tables.sql` en tu cliente PostgreSQL.

### 4. Ejecutar en modo desarrollo

```bash
# Ejecutar backend y frontend simultáneamente
npm run dev
```

O por separado:

```bash
# Terminal 1: Backend (puerto 3000)
npm run dev:server

# Terminal 2: Frontend (puerto 5173)
npm run dev:client
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:3000`.

## 📦 Build y Despliegue en Railway

### 1. Preparar el proyecto

```bash
# Compilar el frontend (se genera en server/public)
npm run build
```

### 2. Configurar Railway

1. **Conectar el repositorio** a Railway desde GitHub
2. **Añadir servicio PostgreSQL** (si no lo tienes ya)
3. **Configurar variables de entorno** en Railway:
   - `DATABASE_URL`: Railway la proporciona automáticamente si usas su PostgreSQL
   - `ADMIN_USERNAME`: Tu usuario administrador
   - `ADMIN_PASSWORD`: Tu contraseña segura
   - `SESSION_SECRET`: Una cadena aleatoria segura
   - `NODE_ENV`: `production`
   - `PORT`: Railway lo establece automáticamente

### 3. Configurar el build en Railway

Railway detectará automáticamente el `package.json` y ejecutará los scripts. Asegúrate de que:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`

Railway ejecutará:
1. `npm install` (instala dependencias de root)
2. `npm run build` (compila el frontend React a `server/public`)
3. `npm start` (inicia el servidor Express)

### 4. Verificar despliegue

Una vez desplegado, Railway proporcionará una URL. Accede a ella y deberías ver la pantalla de login.

## 🔐 Autenticación y Rutas Protegidas

### Login

- **Ruta**: `POST /api/auth/login`
- **Body**: `{ "username": "...", "password": "..." }`
- Las credenciales se validan contra `ADMIN_USERNAME` y `ADMIN_PASSWORD`

### Rutas Protegidas

Todas las rutas excepto `/api/auth/login` y `/api/auth/check` requieren autenticación. El middleware `requireAuth` verifica la sesión activa.

### Sesiones

- Se usan cookies HttpOnly para mayor seguridad
- Las sesiones expiran después de 24 horas
- En producción, las cookies son `secure` (requieren HTTPS)

## 📡 API REST

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/check` - Verificar si el usuario está autenticado

### Pagos

- `GET /api/payments` - Listar pagos (filtros opcionales: `?nombre=...&fecha=...&metodo=...`)
- `POST /api/payments` - Crear un nuevo pago
- `DELETE /api/payments/:id` - Eliminar un pago

### Clientes

- `GET /api/clients` - Listar clientes (filtro opcional: `?anio=2025/26`)
- `GET /api/clients/:id` - Obtener un cliente por ID
- `POST /api/clients` - Crear un nuevo cliente
- `PUT /api/clients/:id` - Actualizar un cliente
- `DELETE /api/clients/:id` - Eliminar un cliente

### Health Check

- `GET /api/health` - Verificar estado del servidor y conexión a la base de datos

## 🗄️ Estructura de la Base de Datos

### Tabla `pagos`

- `id` (SERIAL PRIMARY KEY)
- `nombre` (VARCHAR)
- `apellidos` (VARCHAR)
- `motivo` (VARCHAR)
- `cantidad` (DECIMAL)
- `metodo_pago` (VARCHAR: 'efectivo', 'tarjeta', 'transferencia')
- `fecha_pago` (TIMESTAMP)

### Tabla `clientes`

Incluye todos los campos especificados en los requisitos:
- Datos básicos: `anio`, `nombre`, `apellidos`, `fecha_nacimiento`
- Información académica: `clase`, `profesor`, `horario`, `senal`
- Pagos: `pago_mensual`, `pago_trimestral`, `baja`, `pago_metodo`, ingresos mensuales
- Facturación: `recibo`, `numero_factura`, `referencia`, `contrato_inscripcion`
- Contacto: `direccion`, `ciudad`, `codigo_postal`, `provincia`, `telf1`, `telf2`, `nif`, `email`, `en_mailing`
- `observaciones` (TEXT)

Ver `sql/create_tables.sql` para la estructura completa.

## 📁 Estructura del Proyecto

```
proyecto-railway/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/         # Rutas API
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── db.js          # Conexión PostgreSQL
│   │   └── app.js         # Aplicación Express
│   ├── public/            # Frontend compilado (generado)
│   └── package.json
├── sql/                    # Scripts SQL de referencia
│   └── create_tables.sql
├── .env                    # Variables de entorno (no se sube a Git)
├── .gitignore
├── package.json           # Scripts root
└── README.md
```

## 🎯 Scripts Disponibles

- `npm run install:all` - Instalar todas las dependencias
- `npm run build` - Compilar frontend para producción
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Desarrollo con hot-reload (backend + frontend)
- `npm run dev:server` - Solo backend en desarrollo
- `npm run dev:client` - Solo frontend en desarrollo

## 🔍 Solución de Problemas

### Error de conexión a PostgreSQL

- Verificar que `DATABASE_URL` esté correctamente configurada
- Asegurarse de que la base de datos existe y es accesible
- En Railway, verificar que el servicio PostgreSQL esté activo

### Error 401 (No autorizado)

- Verificar que las credenciales en `.env` sean correctas
- Asegurarse de que la sesión no haya expirado
- Limpiar cookies y volver a iniciar sesión

### Frontend no se carga en producción

- Verificar que `npm run build` se ejecutó correctamente
- Comprobar que `server/public` contiene los archivos compilados
- Verificar que Express está sirviendo archivos estáticos desde `/public`

### Puerto ya en uso

- Cambiar el puerto en `.env` o detener el proceso que lo está usando
- En Railway, el puerto se establece automáticamente

## 📝 Notas Importantes

- **No se usa Supabase, Prisma Data Proxy ni servicios externos**: Todo es conexión directa a PostgreSQL
- **Las tablas deben existir**: El proyecto no crea la base de datos, solo se conecta a ella
- **Variables de entorno obligatorias**: Sin ellas, la aplicación no funcionará
- **Sesiones seguras**: En producción, las cookies son HttpOnly y Secure
- **Formato de fechas**: Las fechas de nacimiento se manejan como DD/MM/YYYY en el frontend y se convierten a DATE en PostgreSQL

## 📄 Licencia

ISC

---

**Desarrollado para Railway** 🚂

