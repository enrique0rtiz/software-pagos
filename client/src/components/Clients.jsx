import { useState, useEffect } from 'react'
import axios from 'axios'
import '../App.css'
import './Clients.css'

function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('')
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState(getInitialFormData())
  const [years, setYears] = useState([])

  function getInitialFormData() {
    return {
      anio: '',
      nombre: '',
      apellidos: '',
      fecha_nacimiento: '',
      clase: '',
      profesor: '',
      horario: '',
      senal: '',
      pago_mensual: false,
      pago_trimestral: false,
      baja: false,
      pago_metodo: '',
      ingresos_sep: '',
      ingresos_oct: '',
      ingresos_nov: '',
      ingresos_ene: '',
      ingresos_feb: '',
      ingresos_mar: '',
      ingresos_abr: '',
      ingresos_may: '',
      ingresos_jun: '',
      recibo: '',
      numero_factura: '',
      referencia: '',
      contrato_inscripcion: false,
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      provincia: '',
      telf1: '',
      telf2: '',
      nif: '',
      en_mailing: false,
      email: '',
      observaciones: ''
    }
  }

  useEffect(() => {
    loadClients()
    loadYears()
  }, [selectedYear])

  const loadYears = async () => {
    try {
      const response = await axios.get('/api/clients')
      const uniqueYears = [...new Set(response.data.map(c => c.anio))].sort().reverse()
      setYears(uniqueYears)
      if (uniqueYears.length > 0 && !selectedYear) {
        setSelectedYear(uniqueYears[0])
      }
    } catch (error) {
      console.error('Error al cargar años:', error)
    }
  }

  const loadClients = async () => {
    try {
      setLoading(true)
      const params = selectedYear ? `?anio=${selectedYear}` : ''
      const response = await axios.get(`/api/clients${params}`)
      setClients(response.data)
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      alert('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleNewClient = () => {
    setEditingClient(null)
    setFormData({
      ...getInitialFormData(),
      anio: selectedYear || ''
    })
  }

  const handleEditClient = (client) => {
    setEditingClient(client.id)
    setFormData({
      ...client,
      pago_mensual: client.pago_mensual || false,
      pago_trimestral: client.pago_trimestral || false,
      baja: client.baja || false,
      contrato_inscripcion: client.contrato_inscripcion || false,
      en_mailing: client.en_mailing || false
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        pago_mensual: formData.pago_mensual ? 'si' : 'no',
        pago_trimestral: formData.pago_trimestral ? 'si' : 'no',
        baja: formData.baja ? 'si' : 'no',
        contrato_inscripcion: formData.contrato_inscripcion ? 'si' : 'no',
        en_mailing: formData.en_mailing ? 'si' : 'no'
      }

      if (editingClient) {
        await axios.put(`/api/clients/${editingClient}`, dataToSend)
        alert('Cliente actualizado exitosamente')
      } else {
        await axios.post('/api/clients', dataToSend)
        alert('Cliente creado exitosamente')
      }

      setEditingClient(null)
      setFormData(getInitialFormData())
      loadClients()
      loadYears()
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      alert(error.response?.data?.error || 'Error al guardar el cliente')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) {
      return
    }

    try {
      await axios.delete(`/api/clients/${id}`)
      loadClients()
      alert('Cliente eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      alert('Error al eliminar el cliente')
    }
  }

  const handleChange = (field, value) => {
    if (field === 'pago_mensual' || field === 'pago_trimestral' || 
        field === 'baja' || field === 'contrato_inscripcion' || 
        field === 'en_mailing') {
      setFormData({ ...formData, [field]: value === 'si' })
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Gestión de Clientes</h2>
        <div className="header-actions">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-selector"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleNewClient}>
            Nuevo Cliente
          </button>
        </div>
      </div>

      {(editingClient || formData.nombre) && (
        <div className="card client-form-card">
          <h3>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <form onSubmit={handleSubmit} className="client-form">
            <div className="form-section">
              <h4>Datos Básicos</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Temporada (Año) *</label>
                  <input
                    type="text"
                    value={formData.anio}
                    onChange={(e) => handleChange('anio', e.target.value)}
                    placeholder="2025/26"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="text"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Información Académica</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Clase</label>
                  <input
                    type="text"
                    value={formData.clase}
                    onChange={(e) => handleChange('clase', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Profesor</label>
                  <input
                    type="text"
                    value={formData.profesor}
                    onChange={(e) => handleChange('profesor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Horario</label>
                  <input
                    type="text"
                    value={formData.horario}
                    onChange={(e) => handleChange('horario', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Señal</label>
                  <input
                    type="text"
                    value={formData.senal}
                    onChange={(e) => handleChange('senal', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Información de Pagos</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Pago Mensual</label>
                  <select
                    value={formData.pago_mensual ? 'si' : 'no'}
                    onChange={(e) => handleChange('pago_mensual', e.target.value)}
                  >
                    <option value="no">NO</option>
                    <option value="si">SI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pago Trimestral</label>
                  <select
                    value={formData.pago_trimestral ? 'si' : 'no'}
                    onChange={(e) => handleChange('pago_trimestral', e.target.value)}
                  >
                    <option value="no">NO</option>
                    <option value="si">SI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Baja</label>
                  <select
                    value={formData.baja ? 'si' : 'no'}
                    onChange={(e) => handleChange('baja', e.target.value)}
                  >
                    <option value="no">NO</option>
                    <option value="si">SI</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    value={formData.pago_metodo}
                    onChange={(e) => handleChange('pago_metodo', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Ingresos Mensuales</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Septiembre</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_sep}
                    onChange={(e) => handleChange('ingresos_sep', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Octubre</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_oct}
                    onChange={(e) => handleChange('ingresos_oct', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Noviembre</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_nov}
                    onChange={(e) => handleChange('ingresos_nov', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Enero</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_ene}
                    onChange={(e) => handleChange('ingresos_ene', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Febrero</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_feb}
                    onChange={(e) => handleChange('ingresos_feb', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Marzo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_mar}
                    onChange={(e) => handleChange('ingresos_mar', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Abril</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_abr}
                    onChange={(e) => handleChange('ingresos_abr', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Mayo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_may}
                    onChange={(e) => handleChange('ingresos_may', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Junio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.ingresos_jun}
                    onChange={(e) => handleChange('ingresos_jun', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Información de Facturación</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Recibo</label>
                  <input
                    type="text"
                    value={formData.recibo}
                    onChange={(e) => handleChange('recibo', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Número de Factura</label>
                  <input
                    type="text"
                    value={formData.numero_factura}
                    onChange={(e) => handleChange('numero_factura', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Referencia</label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => handleChange('referencia', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contrato/Inscripción</label>
                  <select
                    value={formData.contrato_inscripcion ? 'si' : 'no'}
                    onChange={(e) => handleChange('contrato_inscripcion', e.target.value)}
                  >
                    <option value="no">NO</option>
                    <option value="si">SI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Datos de Contacto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => handleChange('codigo_postal', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Provincia</label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => handleChange('provincia', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono 1</label>
                  <input
                    type="text"
                    value={formData.telf1}
                    onChange={(e) => handleChange('telf1', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono 2</label>
                  <input
                    type="text"
                    value={formData.telf2}
                    onChange={(e) => handleChange('telf2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>NIF</label>
                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => handleChange('nif', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>En Mailing</label>
                  <select
                    value={formData.en_mailing ? 'si' : 'no'}
                    onChange={(e) => handleChange('en_mailing', e.target.value)}
                  >
                    <option value="no">NO</option>
                    <option value="si">SI</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Observaciones</h4>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  rows="4"
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setEditingClient(null)
                  setFormData(getInitialFormData())
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Lista de Clientes - Temporada {selectedYear}</h3>
        {loading ? (
          <div>Cargando...</div>
        ) : clients.length === 0 ? (
          <div>No hay clientes registrados para esta temporada</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Clase</th>
                  <th>Profesor</th>
                  <th>Horario</th>
                  <th>Pago Mensual</th>
                  <th>Baja</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.nombre}</td>
                    <td>{client.apellidos}</td>
                    <td>{client.clase || '-'}</td>
                    <td>{client.profesor || '-'}</td>
                    <td>{client.horario || '-'}</td>
                    <td>{client.pago_mensual ? 'SI' : 'NO'}</td>
                    <td>{client.baja ? 'SI' : 'NO'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditClient(client)}
                        style={{ marginRight: '8px' }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(client.id)}
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

export default Clients

