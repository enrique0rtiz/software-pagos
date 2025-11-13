const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// GET /api/payments - Listar pagos con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const { nombre, fecha, metodo } = req.query;
    let query = 'SELECT * FROM pagos WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (nombre) {
      query += ` AND (nombre ILIKE $${paramCount} OR apellidos ILIKE $${paramCount})`;
      params.push(`%${nombre}%`);
      paramCount++;
    }

    if (fecha) {
      query += ` AND DATE(fecha_pago) = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    if (metodo) {
      query += ` AND metodo_pago = $${paramCount}`;
      params.push(metodo);
      paramCount++;
    }

    query += ' ORDER BY fecha_pago DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
});

// POST /api/payments - Crear un nuevo pago
router.post('/', async (req, res) => {
  try {
    const { nombre, apellidos, motivo, cantidad, metodo_pago } = req.body;

    if (!nombre || !apellidos || !motivo || !cantidad || !metodo_pago) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: nombre, apellidos, motivo, cantidad, metodo_pago' 
      });
    }

    const validMethods = ['efectivo', 'tarjeta', 'transferencia'];
    if (!validMethods.includes(metodo_pago)) {
      return res.status(400).json({ 
        error: 'Método de pago inválido. Debe ser: efectivo, tarjeta o transferencia' 
      });
    }

    const result = await pool.query(
      `INSERT INTO pagos (nombre, apellidos, motivo, cantidad, metodo_pago, fecha_pago)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [nombre, apellidos, motivo, parseFloat(cantidad), metodo_pago]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error al crear el pago' });
  }
});

// DELETE /api/payments/:id - Eliminar un pago
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM pagos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json({ success: true, message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
});

module.exports = router;

