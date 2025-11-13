import { useState, useEffect } from 'react'
import axios from 'axios'
import '../App.css'
import './Payments.css'

function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    motivo: '',
    cantidad: '',
    metodo_pago: 'efectivo'
  })
  const [filters, setFilters] = useState({
    nombre: '',
    fecha: '',
    metodo: ''
  })

  useEffect(() => {
    loadPayments()
  }, [filters])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.nombre) params.append('nombre', filters.nombre)
      if (filters.fecha) params.append('fecha', filters.fecha)
      if (filters.metodo) params.append('metodo', filters.metodo)

      const response = await axios.get(`/api/payments?${params.toString()}`)
      setPayments(response.data)
    } catch (error) {
      console.error('Error al cargar pagos:', error)
      alert('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/payments', formData)
      setShowForm(false)
      setFormData({
        nombre: '',
        apellidos: '',
        motivo: '',
        cantidad: '',
        metodo_pago: 'efectivo'
      })
      loadPayments()
      alert('Pago creado exitosamente')
    } catch (error) {
      console.error('Error al crear pago:', error)
      alert(error.response?.data?.error || 'Error al crear el pago')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este pago?')) {
      return
    }

    try {
      await axios.delete(`/api/payments/${id}`)
      loadPayments()
      alert('Pago eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      alert('Error al eliminar el pago')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Gestión de Pagos</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Pago'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Emitir Nuevo Pago</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellidos *</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Motivo *</label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Método de Pago *</label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Guardar Pago
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Filtros</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={filters.nombre}
              onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
              placeholder="Buscar por nombre..."
            />
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Método</label>
            <select
              value={filters.metodo}
              onChange={(e) => setFilters({ ...filters, metodo: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Lista de Pagos</h3>
        {loading ? (
          <div>Cargando...</div>
        ) : payments.length === 0 ? (
          <div>No hay pagos registrados</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Motivo</th>
                  <th>Cantidad</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.fecha_pago)}</td>
                    <td>{payment.nombre}</td>
                    <td>{payment.apellidos}</td>
                    <td>{payment.motivo}</td>
                    <td>{parseFloat(payment.cantidad).toFixed(2)} €</td>
                    <td>{payment.metodo_pago}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(payment.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payments

