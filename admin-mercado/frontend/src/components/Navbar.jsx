import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/dashboard',   icon: 'fa-house',              label: 'Dashboard' },
    { to: '/locatarios',  icon: 'fa-users',              label: 'Locatarios' },
    { to: '/puestos',     icon: 'fa-shop',               label: 'Puestos' },
    { to: '/pagos',       icon: 'fa-credit-card',        label: 'Pagos' },
    { to: '/incidencias', icon: 'fa-triangle-exclamation', label: 'Incidencias', badge: 3 },
    { to: '/reportes',    icon: 'fa-chart-bar',          label: 'Reportes' },
  ];

  return (
    <nav className="navbar">
      {/* Fila 1: logo + utilidades */}
      <div className="nav-top">
        <Link className="nav-logo" to="/dashboard">
          <div className="nav-logo-icon"><i className="fa-solid fa-store"></i></div>
          <div className="nav-logo-text">
            <strong>Mercado Municipal</strong>
            <span>Panel administrativo</span>
          </div>
        </Link>
        <div className="nav-sep"></div>
        <div className="nav-top-spacer"></div>
        <div className="nav-busqueda">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Buscar locatario..." />
        </div>
        <div className="nav-notif" title="Notificaciones">
          <i className="fa-regular fa-bell"></i>
          <span className="notif-dot"></span>
        </div>
        <div className="nav-user">
          <div className="nav-avatar"><i className="fa-solid fa-user"></i></div>
          <span className="nav-user-name">Administrador</span>
        </div>
      </div>

      {/* Fila 2: links de navegación */}
      <div className="nav-bottom">
        {links.map(link => (
          <Link
            key={link.to}
            className={`nav-link ${location.pathname === link.to ? 'activo' : ''}`}
            to={link.to}
          >
            <i className={`fa-solid ${link.icon}`}></i>
            {link.label}
            {link.badge && <span className="nav-badge">{link.badge}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
