const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// Función auxiliar para convertir fecha DD/MM/YYYY a DATE
function parseDate(dateString) {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  // Formato: DD/MM/YYYY -> YYYY-MM-DD
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Función auxiliar para convertir DATE a DD/MM/YYYY
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Función auxiliar para convertir string a boolean
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'si' || lower === 'true' || lower === '1' || lower === 'yes';
  }
  return false;
}

// Función para mapear resultado de BD a formato API
function mapDbToApi(row) {
  // Determinar pago_metodo desde las 3 columnas booleanas
  let pago_metodo = null;
  if (row['Pago con tarjeta']) {
    pago_metodo = 'tarjeta';
  } else if (row['Pago transferencia']) {
    pago_metodo = 'transferencia';
  } else if (row['Pago efectivo']) {
    pago_metodo = 'efectivo';
  }

  return {
    id: row['Id'],
    anio: row['Año'],
    nombre: row['Nombre1'],
    apellidos: row['Apellidos'],
    fecha_nacimiento: formatDate(row['Fecha de nacimiento']),
    clase: row['Clase1'],
    profesor: row['Profesora'],
    horario: row['Horario'],
    senal: row['Señal'],
    pago_mensual: row['Pago Mensual'],
    pago_trimestral: row['Pago Trimestral'],
    baja: row['Baja'],
    pago_metodo: pago_metodo,
    ingresos_sep: row['SEPTIEMBRE'],
    ingresos_oct: row['OCTUBRE'],
    ingresos_nov: row['NOVIEMBRE'],
    ingresos_ene: row['ENERO'],
    ingresos_feb: row['FEBRERO'],
    ingresos_mar: row['MARZO'],
    ingresos_abr: row['ABRIL'],
    ingresos_may: row['MAYO'],
    ingresos_jun: row['JUNIO'],
    recibo: row['RECIBO'],
    numero_factura: row['NUM FAC'],
    referencia: row['Referencia'],
    contrato_inscripcion: row['Contrato de Inscripción - fecha y firma'],
    direccion: row['Dirección'],
    ciudad: row['Ciudad'],
    codigo_postal: row['CódigoPostal'],
    provincia: row['Provincia'],
    telf1: row['Telf 1'],
    telf2: row['Telf 2'],
    nif: row['NIF'],
    en_mailing: row['En mailing'],
    email: row['e_mail'],
    observaciones: row['Observaciones']
  };
}

// GET /api/clients - Listar clientes con filtro opcional por año
router.get('/', async (req, res) => {
  try {
    const { anio } = req.query;
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (anio) {
      query += ' WHERE "Año" = $1';
      params.push(anio);
    }

    query += ' ORDER BY "Año" DESC, "Apellidos" ASC, "Nombre1" ASC';

    const result = await pool.query(query, params);
    
    // Mapear resultados al formato API
    const formatted = result.rows.map(mapDbToApi);

    res.json(formatted);
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// GET /api/clients/:id - Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE "Id" = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = mapDbToApi(result.rows[0]);

    res.json(client);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener el cliente' });
  }
});

// POST /api/clients - Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const {
      anio, nombre, apellidos, fecha_nacimiento, clase, profesor, horario,
      senal, pago_mensual, pago_trimestral, baja, pago_metodo,
      ingresos_sep, ingresos_oct, ingresos_nov, ingresos_ene, ingresos_feb,
      ingresos_mar, ingresos_abr, ingresos_may, ingresos_jun,
      recibo, numero_factura, referencia, contrato_inscripcion,
      direccion, ciudad, codigo_postal, provincia, telf1, telf2, nif,
      en_mailing, email, observaciones
    } = req.body;

    const fechaNacimientoParsed = parseDate(fecha_nacimiento);

    // Convertir pago_metodo a las 3 columnas booleanas
    const pagoTarjeta = pago_metodo === 'tarjeta';
    const pagoTransferencia = pago_metodo === 'transferencia';
    const pagoEfectivo = pago_metodo === 'efectivo';

    const result = await pool.query(
      `INSERT INTO clientes (
        "Año", "Nombre1", "Apellidos", "Fecha de nacimiento", "Clase1", "Profesora", "Horario",
        "Señal", "Pago Mensual", "Pago Trimestral", "Baja", 
        "Pago con tarjeta", "Pago transferencia", "Pago efectivo",
        "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "ENERO", "FEBRERO",
        "MARZO", "ABRIL", "MAYO", "JUNIO",
        "RECIBO", "NUM FAC", "Referencia", "Contrato de Inscripción - fecha y firma",
        "Dirección", "Ciudad", "CódigoPostal", "Provincia", "Telf 1", "Telf 2", "NIF",
        "En mailing", "e_mail", "Observaciones"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37
      ) RETURNING *`,
      [
        anio, nombre, apellidos, fechaNacimientoParsed, clase || null, profesor || null,
        horario || null, senal || null, parseBoolean(pago_mensual), parseBoolean(pago_trimestral),
        parseBoolean(baja), pagoTarjeta, pagoTransferencia, pagoEfectivo,
        ingresos_sep || null, ingresos_oct || null, ingresos_nov || null,
        ingresos_ene || null, ingresos_feb || null, ingresos_mar || null,
        ingresos_abr || null, ingresos_may || null, ingresos_jun || null,
        recibo || null, numero_factura || null, referencia || null,
        parseBoolean(contrato_inscripcion), direccion || null, ciudad || null,
        codigo_postal || null, provincia || null, telf1 || null, telf2 || null,
        nif || null, parseBoolean(en_mailing), email || null, observaciones || null
      ]
    );

    const client = mapDbToApi(result.rows[0]);

    res.status(201).json(client);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear el cliente', details: error.message });
  }
});

// PUT /api/clients/:id - Actualizar un cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      anio, nombre, apellidos, fecha_nacimiento, clase, profesor, horario,
      senal, pago_mensual, pago_trimestral, baja, pago_metodo,
      ingresos_sep, ingresos_oct, ingresos_nov, ingresos_ene, ingresos_feb,
      ingresos_mar, ingresos_abr, ingresos_may, ingresos_jun,
      recibo, numero_factura, referencia, contrato_inscripcion,
      direccion, ciudad, codigo_postal, provincia, telf1, telf2, nif,
      en_mailing, email, observaciones
    } = req.body;

    const fechaNacimientoParsed = parseDate(fecha_nacimiento);

    // Convertir pago_metodo a las 3 columnas booleanas
    const pagoTarjeta = pago_metodo === 'tarjeta';
    const pagoTransferencia = pago_metodo === 'transferencia';
    const pagoEfectivo = pago_metodo === 'efectivo';

    const result = await pool.query(
      `UPDATE clientes SET
        "Año" = $1, "Nombre1" = $2, "Apellidos" = $3, "Fecha de nacimiento" = $4,
        "Clase1" = $5, "Profesora" = $6, "Horario" = $7, "Señal" = $8,
        "Pago Mensual" = $9, "Pago Trimestral" = $10, "Baja" = $11,
        "Pago con tarjeta" = $12, "Pago transferencia" = $13, "Pago efectivo" = $14,
        "SEPTIEMBRE" = $15, "OCTUBRE" = $16, "NOVIEMBRE" = $17,
        "ENERO" = $18, "FEBRERO" = $19, "MARZO" = $20,
        "ABRIL" = $21, "MAYO" = $22, "JUNIO" = $23,
        "RECIBO" = $24, "NUM FAC" = $25, "Referencia" = $26,
        "Contrato de Inscripción - fecha y firma" = $27, "Dirección" = $28, "Ciudad" = $29,
        "CódigoPostal" = $30, "Provincia" = $31, "Telf 1" = $32, "Telf 2" = $33,
        "NIF" = $34, "En mailing" = $35, "e_mail" = $36, "Observaciones" = $37
      WHERE "Id" = $38
      RETURNING *`,
      [
        anio, nombre, apellidos, fechaNacimientoParsed, clase || null, profesor || null,
        horario || null, senal || null, parseBoolean(pago_mensual), parseBoolean(pago_trimestral),
        parseBoolean(baja), pagoTarjeta, pagoTransferencia, pagoEfectivo,
        ingresos_sep || null, ingresos_oct || null, ingresos_nov || null,
        ingresos_ene || null, ingresos_feb || null, ingresos_mar || null,
        ingresos_abr || null, ingresos_may || null, ingresos_jun || null,
        recibo || null, numero_factura || null, referencia || null,
        parseBoolean(contrato_inscripcion), direccion || null, ciudad || null,
        codigo_postal || null, provincia || null, telf1 || null, telf2 || null,
        nif || null, parseBoolean(en_mailing), email || null, observaciones || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = mapDbToApi(result.rows[0]);

    res.json(client);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar el cliente', details: error.message });
  }
});

// DELETE /api/clients/:id - Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE "Id" = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
});

module.exports = router;
