import { useState, useEffect } from 'react';
import PageLayout from './PageLayout';
import './GestionAdmin.css';

export default function Administradores() {
  const [administradores, setAdministradores] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({ nombre: '', correo: '', password: '', telefono: '' });

  useEffect(() => {
    cargarAdministradores();
  }, []);

  function cargarAdministradores() {
    fetch("http://localhost:3000/api/administradores")
      .then(res => res.json())
      .then(data => setAdministradores(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const totalAdmins = administradores.length;
  const activos = administradores.filter(a => a.activo === 1).length;
  const inactivos = administradores.filter(a => a.activo === 0).length;

  const generarIniciales = (nombre) =>
    nombre ? nombre.split(" ").map(n => n[0]).join("") : "";

  async function crearAdministrador() {
    const { nombre, correo, password, telefono } = nuevoAdmin;
    if (!nombre.trim() || !correo.trim() || !password.trim()) {
      alert("Completa nombre, correo y contraseña");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/administradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, telefono })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar el administrador");
        return;
      }
      alert(data.mensaje || "Administrador registrado");
      setModalNuevo(false);
      setNuevoAdmin({ nombre: '', correo: '', password: '', telefono: '' });
      cargarAdministradores();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar el administrador");
    }
  }

  async function cambiarEstado(admin) {
    const nuevoEstado = admin.activo === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? "activar" : "desactivar";

    if (!window.confirm(`¿Seguro que quieres ${accion} a ${admin.nombre}?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/administradores/${admin.id_usuario}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: nuevoEstado })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `No se pudo ${accion} al administrador`);
        return;
      }
      cargarAdministradores();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al cambiar el estado");
    }
  }

  return (
    <PageLayout maxWidth="1200px">

      <div className="page-head">
        <h1 className="page-titulo">Gestión de Administradores</h1>
        <p className="page-subtitulo">Usuarios con acceso al panel administrativo</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total administradores</span>
            <div className="stat-icon azul"><i className="fa-solid fa-user-shield"></i></div>
          </div>
          <div className="stat-valor">{totalAdmins}</div>
          <div className="stat-meta">Registrados en el sistema</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Activos</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{activos}</div>
          <div className="stat-meta">Con acceso al panel</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Inactivos</span>
            <div className="stat-icon rojo"><i className="fa-solid fa-user-slash"></i></div>
          </div>
          <div className="stat-valor">{inactivos}</div>
          <div className="stat-meta">Sin acceso al panel</div>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions-row">
        <div className="actions-spacer"></div>
        <button className="btn btnPrimary" onClick={() => setModalNuevo(true)}>
          <i className="fa-solid fa-plus"></i> Agregar administrador
        </button>
      </div>

      {/* Tabla */}
      <div className="tabla-wrap">
        <div className="tabla-header">
          <span className="tabla-titulo">Administradores del sistema</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Registrado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {administradores.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                  No hay administradores registrados
                </td>
              </tr>
            ) : (
              administradores.map((a) => (
                <tr key={a.id_usuario}>
                  <td>
                    <div className="td-nombre-wrap">
                      <div className="nombre-avatar">{generarIniciales(a.nombre)}</div>
                      <span className="td-nombre">{a.nombre}</span>
                    </div>
                  </td>
                  <td className="td-fecha">{a.correo}</td>
                  <td className="td-fecha">{a.telefono || "—"}</td>
                  <td className="td-fecha">{a.fecha_creacion}</td>
                  <td>
                    <span className={`badge ${a.activo === 1 ? 'badge-pagado' : 'badge-sin_generar'}`}>
                      <span className="bdot"></span>
                      {a.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={a.activo === 1 ? "btnDanger" : "btnOutline"}
                      onClick={() => cambiarEstado(a)}
                    >
                      {a.activo === 1 ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: NUEVO ADMINISTRADOR */}
      {modalNuevo && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Agregar administrador</h2>

            <label>Nombre</label>
            <input
              type="text"
              value={nuevoAdmin.nombre}
              onChange={(e) => setNuevoAdmin(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre completo"
            />

            <label>Correo</label>
            <input
              type="email"
              value={nuevoAdmin.correo}
              onChange={(e) => setNuevoAdmin(f => ({ ...f, correo: e.target.value }))}
              placeholder="correo@mercado.com"
            />

            <label>Contraseña</label>
            <input
              type="password"
              value={nuevoAdmin.password}
              onChange={(e) => setNuevoAdmin(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />

            <label>Teléfono</label>
            <input
              type="text"
              value={nuevoAdmin.telefono}
              onChange={(e) => setNuevoAdmin(f => ({ ...f, telefono: e.target.value }))}
              placeholder="Opcional"
            />

            <div style={{ marginTop: "10px" }}>
              <button onClick={crearAdministrador}>Registrar</button>
              <button onClick={() => setModalNuevo(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}