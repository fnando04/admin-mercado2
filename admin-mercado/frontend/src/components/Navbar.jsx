import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [mostrarUser, setMostrarUser] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [admin, setAdmin] = useState({ nombre: 'Administrador' });

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const links = [
    { to: '/dashboard',   icon: 'fa-house',              label: 'Dashboard' },
    { to: '/locatarios',  icon: 'fa-users',              label: 'Locatarios' },
    { to: '/puestos',     icon: 'fa-shop',               label: 'Puestos' },
    { to: '/pagos',       icon: 'fa-credit-card',        label: 'Pagos' },
    { to: '/incidencias', icon: 'fa-triangle-exclamation', label: 'Incidencias' },
    { to: '/administradores', icon: 'fa-user-shield', label: 'Administradores' },
  ];

  // Datos del admin logueado (los guarda Login.jsx en localStorage bajo la key "usuario")
  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      try {
        setAdmin(JSON.parse(guardado));
      } catch {
        setAdmin({ nombre: 'Administrador' });
      }
    }
  }, []);

  // TODO: conectar a incidencias abiertas cuando esté esa interfaz lista
  useEffect(() => {
    setNotificaciones([]);
  }, []);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function manejarClickFuera(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setMostrarNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setMostrarUser(false);
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  function buscarLocatario(e) {
    e.preventDefault();
    if (busqueda.trim() === '') return;
    navigate(`/locatarios?buscar=${encodeURIComponent(busqueda.trim())}`);
  }

  function cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login'); // ajusta si tu ruta de login se llama distinto
  }

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

        <form className="nav-busqueda" onSubmit={buscarLocatario}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar locatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </form>

        <div className="nav-notif-wrap" ref={notifRef}>
          <div
            className="nav-notif"
            title="Notificaciones"
            onClick={() => setMostrarNotif(v => !v)}
          >
            <i className="fa-regular fa-bell"></i>
            {notificaciones.length > 0 && <span className="notif-dot"></span>}
          </div>

          {mostrarNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">Notificaciones</div>
              {notificaciones.length === 0 ? (
                <div className="notif-item-vacio">No tienes notificaciones</div>
              ) : (
                notificaciones.map((n, i) => (
                  <div className="notif-item" key={n.id || i}>
                    <p>{n.mensaje || n.titulo}</p>
                    {n.fecha && <span>{n.fecha}</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="nav-user-wrap" ref={userRef}>
          <div className="nav-user" onClick={() => setMostrarUser(v => !v)}>
            <div className="nav-avatar"><i className="fa-solid fa-user"></i></div>
            <span className="nav-user-name">{admin.nombre}</span>
            <i className="fa-solid fa-chevron-down nav-user-caret"></i>
          </div>

          {mostrarUser && (
            <div className="user-dropdown">
              <div className="user-dropdown-nombre">{admin.nombre}</div>
              {admin.rol && <div className="user-dropdown-correo">{admin.rol}</div>}
              {admin.correo && <div className="user-dropdown-correo">{admin.correo}</div>}
              <button className="user-dropdown-cerrar" onClick={cerrarSesion}>
                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
              </button>
            </div>
          )}
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