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

// GET /api/clients - Listar clientes con filtro opcional por año
router.get('/', async (req, res) => {
  try {
    const { anio } = req.query;
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (anio) {
      query += ' WHERE anio = $1';
      params.push(anio);
    }

    query += ' ORDER BY anio DESC, apellidos ASC, nombre ASC';

    const result = await pool.query(query, params);
    
    // Formatear fechas para el frontend
    const formatted = result.rows.map(row => ({
      ...row,
      fecha_nacimiento: formatDate(row.fecha_nacimiento)
    }));

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
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = result.rows[0];
    client.fecha_nacimiento = formatDate(client.fecha_nacimiento);

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

    if (!anio || !nombre || !apellidos) {
      return res.status(400).json({ 
        error: 'Los campos anio, nombre y apellidos son requeridos' 
      });
    }

    const fechaNacimientoParsed = parseDate(fecha_nacimiento);

    const result = await pool.query(
      `INSERT INTO clientes (
        anio, nombre, apellidos, fecha_nacimiento, clase, profesor, horario,
        senal, pago_mensual, pago_trimestral, baja, pago_metodo,
        ingresos_sep, ingresos_oct, ingresos_nov, ingresos_ene, ingresos_feb,
        ingresos_mar, ingresos_abr, ingresos_may, ingresos_jun,
        recibo, numero_factura, referencia, contrato_inscripcion,
        direccion, ciudad, codigo_postal, provincia, telf1, telf2, nif,
        en_mailing, email, observaciones
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35
      ) RETURNING *`,
      [
        anio, nombre, apellidos, fechaNacimientoParsed, clase || null, profesor || null,
        horario || null, senal || null, parseBoolean(pago_mensual), parseBoolean(pago_trimestral),
        parseBoolean(baja), pago_metodo || null,
        ingresos_sep || null, ingresos_oct || null, ingresos_nov || null,
        ingresos_ene || null, ingresos_feb || null, ingresos_mar || null,
        ingresos_abr || null, ingresos_may || null, ingresos_jun || null,
        recibo || null, numero_factura || null, referencia || null,
        parseBoolean(contrato_inscripcion), direccion || null, ciudad || null,
        codigo_postal || null, provincia || null, telf1 || null, telf2 || null,
        nif || null, parseBoolean(en_mailing), email || null, observaciones || null
      ]
    );

    const client = result.rows[0];
    client.fecha_nacimiento = formatDate(client.fecha_nacimiento);

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

    if (!anio || !nombre || !apellidos) {
      return res.status(400).json({ 
        error: 'Los campos anio, nombre y apellidos son requeridos' 
      });
    }

    const fechaNacimientoParsed = parseDate(fecha_nacimiento);

    const result = await pool.query(
      `UPDATE clientes SET
        anio = $1, nombre = $2, apellidos = $3, fecha_nacimiento = $4,
        clase = $5, profesor = $6, horario = $7, senal = $8,
        pago_mensual = $9, pago_trimestral = $10, baja = $11, pago_metodo = $12,
        ingresos_sep = $13, ingresos_oct = $14, ingresos_nov = $15,
        ingresos_ene = $16, ingresos_feb = $17, ingresos_mar = $18,
        ingresos_abr = $19, ingresos_may = $20, ingresos_jun = $21,
        recibo = $22, numero_factura = $23, referencia = $24,
        contrato_inscripcion = $25, direccion = $26, ciudad = $27,
        codigo_postal = $28, provincia = $29, telf1 = $30, telf2 = $31,
        nif = $32, en_mailing = $33, email = $34, observaciones = $35
      WHERE id = $36
      RETURNING *`,
      [
        anio, nombre, apellidos, fechaNacimientoParsed, clase || null, profesor || null,
        horario || null, senal || null, parseBoolean(pago_mensual), parseBoolean(pago_trimestral),
        parseBoolean(baja), pago_metodo || null,
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

    const client = result.rows[0];
    client.fecha_nacimiento = formatDate(client.fecha_nacimiento);

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
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);

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

