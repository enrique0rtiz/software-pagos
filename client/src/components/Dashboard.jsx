import { Outlet, Link, useLocation } from 'react-router-dom'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const location = useLocation()

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Gestión de Pagos y Clientes</h1>
        </div>
        <div className="navbar-menu">
          <Link 
            to="/payments" 
            className={location.pathname === '/payments' ? 'active' : ''}
          >
            Gestión de Pagos
          </Link>
          <Link 
            to="/clients" 
            className={location.pathname === '/clients' ? 'active' : ''}
          >
            Gestión de Clientes
          </Link>
          <button onClick={onLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard

