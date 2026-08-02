import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import socket from '../socket'; 
import './LocatarioNavbar.css';

export default function LocatarioNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mostrarUser, setMostrarUser] = useState(false);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: 'Locatario' });
  const [notificaciones, setNotificaciones] = useState([]);
  const [misIncidenciaIds, setMisIncidenciaIds] = useState(new Set());

  const userRef = useRef(null);
  const notifRef = useRef(null);

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

  // Trae los ids de SUS incidencias, para poder filtrar qué notificaciones son suyas
  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const u = guardado ? JSON.parse(guardado) : null;
    if (!u) return;

    fetch(`http://localhost:3000/api/locatario/mis-incidencias?id_locatario=${u.id}`)
      .then(res => res.json())
      .then(data => {
        const ids = new Set((Array.isArray(data) ? data : []).map(i => i.id_incidencia));
        setMisIncidenciaIds(ids);
      })
      .catch(err => console.error(err));
  }, []);

  // Tiempo real: avisos nuevos (para todos) y respuestas a SUS incidencias
  useEffect(() => {
    function onNuevoAviso(data) {
      setNotificaciones(prev => [
        { tipo: 'aviso', mensaje: `Nuevo aviso: ${data.titulo}`, fecha: 'Ahora' },
        ...prev,
      ]);
    }

    function onIncidenciaRespondida(data) {
      if (!misIncidenciaIds.has(data.id_incidencia)) return; // no es suya, la ignora
      setNotificaciones(prev => [
        { tipo: 'incidencia', mensaje: 'Tu incidencia fue respondida', fecha: 'Ahora' },
        ...prev,
      ]);
    }

    function onIncidenciaCerrada(data) {
      if (!misIncidenciaIds.has(data.id_incidencia)) return;
      setNotificaciones(prev => [
        { tipo: 'incidencia', mensaje: 'Tu incidencia fue marcada como resuelta', fecha: 'Ahora' },
        ...prev,
      ]);
    }

    socket.on("nuevo_aviso", onNuevoAviso);
    socket.on("incidencia_respondida", onIncidenciaRespondida);
    socket.on("incidencia_cerrada", onIncidenciaCerrada);

    return () => {
      socket.off("nuevo_aviso", onNuevoAviso);
      socket.off("incidencia_respondida", onIncidenciaRespondida);
      socket.off("incidencia_cerrada", onIncidenciaCerrada);
    };
  }, [misIncidenciaIds]);

  useEffect(() => {
    function manejarClickFuera(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setMostrarUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setMostrarNotif(false);
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

        <div className="nav-notif-wrap" ref={notifRef}>
          <div className="nav-notif" title="Notificaciones" onClick={() => setMostrarNotif(v => !v)}>
            <i className="fa-regular fa-bell"></i>
            {notificaciones.length > 0 && <span className="notif-dot"></span>}
          </div>

          {mostrarNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                Notificaciones {notificaciones.length > 0 && `(${notificaciones.length})`}
              </div>
              {notificaciones.length === 0 ? (
                <div className="notif-item-vacio">No tienes notificaciones</div>
              ) : (
                notificaciones.map((n, i) => (
                  <div
                    className="notif-item"
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setMostrarNotif(false);
                      navigate(n.tipo === 'aviso' ? '/locatario/inicio' : '/locatario/incidencias');
                    }}
                  >
                    <p>{n.mensaje}</p>
                    <span>{n.fecha}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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