const { Pool } = require('pg');
require('dotenv').config();

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR CRÍTICO: DATABASE_URL no está configurada en las variables de entorno');
  process.exit(1);
}

console.log('🔧 Configurando conexión a PostgreSQL...');
console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔒 SSL: ${process.env.NODE_ENV === 'production' ? 'ACTIVADO' : 'DESACTIVADO'}`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente PostgreSQL:', err);
  process.exit(-1);
});

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a PostgreSQL...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 Sugerencia: Verifica que DATABASE_URL tenga el host correcto');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Sugerencia: Verifica que el servicio PostgreSQL esté corriendo');
    }
    throw error;
  }
}

module.exports = { pool, testConnection };

