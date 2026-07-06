import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './LocatarioNavbar.css';

export default function LocatarioNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mostrarUser, setMostrarUser] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: 'Locatario' });
  const userRef = useRef(null);

  const links = [
    { to: '/locatario/inicio',      icon: 'fa-house',              label: 'Inicio' },
    { to: '/locatario/pagos',       icon: 'fa-credit-card',        label: 'Mis pagos' },
    { to: '/locatario/incidencias', icon: 'fa-triangle-exclamation', label: 'Mis incidencias' },
  ];

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      try {
        setUsuario(JSON.parse(guardado));
      } catch {
        setUsuario({ nombre: 'Locatario' });
      }
    }
  }, []);

  useEffect(() => {
    function manejarClickFuera(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setMostrarUser(false);
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  function cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="nav-top">
        <Link className="nav-logo" to="/locatario/inicio">
          <div className="nav-logo-icon"><i className="fa-solid fa-store"></i></div>
          <div className="nav-logo-text">
            <strong>Mercado Municipal</strong>
            <span>Panel del locatario</span>
          </div>
        </Link>
        <div className="nav-sep"></div>
        <div className="nav-top-spacer"></div>

        <div className="nav-user-wrap" ref={userRef}>
          <div className="nav-user" onClick={() => setMostrarUser(v => !v)}>
            <div className="nav-avatar"><i className="fa-solid fa-user"></i></div>
            <span className="nav-user-name">{usuario.nombre}</span>
            <i className="fa-solid fa-chevron-down nav-user-caret"></i>
          </div>

          {mostrarUser && (
            <div className="user-dropdown">
              <div className="user-dropdown-nombre">{usuario.nombre}</div>
              {usuario.correo && <div className="user-dropdown-correo">{usuario.correo}</div>}
              <button className="user-dropdown-cerrar" onClick={cerrarSesion}>
                <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="nav-bottom">
        {links.map(link => (
          <Link
            key={link.to}
            className={`nav-link ${location.pathname === link.to ? 'activo' : ''}`}
            to={link.to}
          >
            <i className={`fa-solid ${link.icon}`}></i>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}