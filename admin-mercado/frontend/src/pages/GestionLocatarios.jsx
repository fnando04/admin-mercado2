import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from './PageLayout';
import './GestionLocatarios.css';

const BADGE_CLASE = {
  Activo: 'badge-activo',
  Moroso: 'badge-moroso',
  Suspendido: 'badge-suspendido',
};

const generarIniciales = (nombre) =>
  nombre ? nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "";

export default function GestionLocatarios() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [locatarios, setLocatarios] = useState([]);
  const [busqueda, setBusqueda] = useState(searchParams.get('buscar') || '');
  const [giro, setGiro] = useState('');
  const [estado, setEstado] = useState('');

  const [detalle, setDetalle] = useState(null);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoLocatario, setNuevoLocatario] = useState({
    nombre: '', correo: '', password: '', telefono: '', giro_comercial: ''
  });

  const [editando, setEditando] = useState(null); // objeto locatario en edición
  const [formEdicion, setFormEdicion] = useState({ telefono: '', correo: '', giro_comercial: '' });

  useEffect(() => {
    cargarLocatarios();
  }, []);

  // Si venimos del buscador o de las "acciones rápidas" del Dashboard, aplicamos lo que pida la URL.
  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setModalNuevo(true);
    }

    const estadoParam = searchParams.get('estado');
    if (estadoParam) {
      setEstado(estadoParam);
    }

    if (searchParams.get('nuevo') || estadoParam) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const termino = searchParams.get('buscar');
    if (!termino || locatarios.length === 0) return;

    setBusqueda(termino);

    const coincidencias = locatarios.filter(l =>
      l.nombre.toLowerCase().includes(termino.toLowerCase())
    );

    if (coincidencias.length === 1) {
      setDetalle(coincidencias[0]);
    }

    // Limpiamos el parámetro de la URL para que no se re-dispare al navegar dentro de la página
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locatarios]);

  function cargarLocatarios() {
    fetch("http://localhost:3000/api/locatarios")
      .then(res => res.json())
      .then(data => setLocatarios(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const giros = useMemo(() => {
    return [...new Set(locatarios.map(l => l.giro_comercial).filter(Boolean))];
  }, [locatarios]);

  const filtrados = useMemo(() => {
    return locatarios.filter((l) => {
      const coincideBusqueda = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideGiro = !giro || l.giro_comercial === giro;
      const coincideEstado = !estado || l.estado === estado;
      return coincideBusqueda && coincideGiro && coincideEstado;
    });
  }, [locatarios, busqueda, giro, estado]);

  const totales = useMemo(() => ({
    total: locatarios.length,
    activos: locatarios.filter((l) => l.estado === 'Activo').length,
    morosos: locatarios.filter((l) => l.estado === 'Moroso').length,
    suspendidos: locatarios.filter((l) => l.estado === 'Suspendido').length,
  }), [locatarios]);

  const pctActivos = totales.total ? Math.round((totales.activos / totales.total) * 100) : 0;

  function alternarFiltroEstado(valor) {
    setEstado(prev => (prev === valor ? '' : valor));
  }

  async function crearLocatario() {
    const { nombre, correo, password, telefono, giro_comercial } = nuevoLocatario;
    if (!nombre.trim() || !correo.trim() || !password.trim() || !giro_comercial.trim()) {
      alert("Completa nombre, correo, contraseña y giro comercial");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/locatarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, telefono, giro_comercial })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar el locatario");
        return;
      }
      alert(data.mensaje || "Locatario registrado");
      setModalNuevo(false);
      setNuevoLocatario({ nombre: '', correo: '', password: '', telefono: '', giro_comercial: '' });
      cargarLocatarios();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar el locatario");
    }
  }

  function iniciarEdicion(l) {
    setEditando(l);
    setFormEdicion({ telefono: l.telefono || '', correo: l.correo || '', giro_comercial: l.giro_comercial || '' });
  }

  async function guardarEdicion() {
    const { telefono, correo, giro_comercial } = formEdicion;
    if (!correo.trim() || !giro_comercial.trim()) {
      alert("Completa correo y giro comercial");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/locatarios/${editando.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, correo, giro_comercial })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el locatario");
        return;
      }
      setEditando(null);
      cargarLocatarios();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al actualizar el locatario");
    }
  }

  async function suspender(l) {
    if (!window.confirm(`¿Suspender a ${l.nombre}? Perderá acceso y se liberará su puesto.`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/locatarios/${l.id_usuario}/suspender`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo suspender al locatario");
        return;
      }
      cargarLocatarios();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al suspender al locatario");
    }
  }

  async function reactivar(l) {
    if (!window.confirm(`¿Reactivar a ${l.nombre}? Podrá volver a iniciar sesión.`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/locatarios/${l.id_usuario}/reactivar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo reactivar al locatario");
        return;
      }
      cargarLocatarios();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al reactivar al locatario");
    }
  }

  return (
    <PageLayout>

      <div className="page-head">
        <h1 className="page-titulo">Gestión de locatarios</h1>
        <p className="page-subtitulo">Directorio y estado de los locatarios registrados en el mercado</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total locatarios</span>
            <div className="stat-icon azul"><i className="fa-solid fa-users"></i></div>
          </div>
          <div className="stat-valor">{totales.total}</div>
          <div className="stat-meta">Registrados en el mercado</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Activos</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{totales.activos}</div>
          <div className="stat-meta"><b>{pctActivos}%</b> del total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Morosos</span>
            <div className="stat-icon ambar"><i className="fa-solid fa-clock"></i></div>
          </div>
          <div className="stat-valor">{totales.morosos}</div>
          <div className="stat-meta">Requieren seguimiento</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Suspendidos</span>
            <div className="stat-icon rojo"><i className="fa-solid fa-ban"></i></div>
          </div>
          <div className="stat-valor">{totales.suspendidos}</div>
          <div className="stat-meta">Con acceso restringido</div>
        </div>
      </div>

      {/* Acciones superiores */}
      <div className="actions-row">
        <button
          className={`btn btnOutline ${estado === 'Moroso' ? 'filtro-activo' : ''}`}
          onClick={() => alternarFiltroEstado('Moroso')}
        >
          <i className="fa-solid fa-user-xmark"></i> Ver morosos
        </button>
        <button
          className={`btn btnDanger ${estado === 'Suspendido' ? 'filtro-activo' : ''}`}
          onClick={() => alternarFiltroEstado('Suspendido')}
        >
          <i className="fa-solid fa-ban"></i> Ver suspendidos
        </button>
        <div className="actions-spacer"></div>
        <button className="btnRegistrar" onClick={() => setModalNuevo(true)}>
          <i className="fa-solid fa-plus"></i> Registrar locatario
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <div className="filtro-grupo">
          <span className="filtro-label">Buscar</span>
          <input
            className="filtro-input"
            type="text"
            placeholder="Buscar nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtro-grupo">
          <span className="filtro-label">Giro</span>
          <select className="filtro-select" value={giro} onChange={(e) => setGiro(e.target.value)}>
            <option value="">Giro de comercio</option>
            {giros.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="filtro-grupo">
          <span className="filtro-label">Estado</span>
          <select className="filtro-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Estado actual</option>
            <option>Activo</option>
            <option>Moroso</option>
            <option>Suspendido</option>
          </select>
        </div>
        <div className="filtros-spacer"></div>
        <div className="total-chip">Mostrando <b>{filtrados.length}</b> locatarios</div>
      </div>

      {/* Tabla */}
      <div className="tabla-wrap">
        <div className="tabla-header">
          <span className="tabla-titulo">Directorio de locatarios</span>
          <span className="tabla-count-pill">{filtrados.length} registros</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Giro</th>
              <th>Estado</th>
              <th>Correo</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((l) => (
              <tr key={l.id_usuario}>
                <td className="td-num">{l.numero_puesto || '—'}</td>
                <td>
                  <div className="td-nombre-wrap">
                    <div className="nombre-avatar">{generarIniciales(l.nombre)}</div>
                    <span className="td-nombre">{l.nombre}</span>
                  </div>
                </td>
                <td className="td-giro">{l.giro_comercial}</td>
                <td>
                  <span className={`badge ${BADGE_CLASE[l.estado] || 'badge-activo'}`}>
                    <span className="bdot"></span>{l.estado}
                  </span>
                </td>
                <td className="td-correo">{l.correo}</td>
                <td>
                  <div className="td-acciones">
                    <button className="btnIconoFila" title="Ver detalle" onClick={() => setDetalle(l)}>
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="btnIconoFila" title="Editar" onClick={() => iniciarEdicion(l)}>
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btnIconoFila danger"
                      title={l.estado === 'Suspendido' ? "Reactivar" : "Suspender"}
                      onClick={() => (l.estado === 'Suspendido' ? reactivar(l) : suspender(l))}
                    >
                      <i className={`fa-solid ${l.estado === 'Suspendido' ? 'fa-rotate-left' : 'fa-ban'}`}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gris-400)', padding: '24px' }}>
                  No se encontraron locatarios con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="tabla-footer">
          <span className="footer-info">
            Total: <b>{totales.total} locatarios</b> · Activos: <b>{totales.activos}</b> · Morosos: <b>{totales.morosos}</b> · Suspendidos: <b>{totales.suspendidos}</b>
          </span>
          <button className="btnRegistrar" onClick={() => setModalNuevo(true)}>
            <i className="fa-solid fa-plus"></i> Registrar locatario
          </button>
        </div>
      </div>

      {/* MODAL: VER DETALLE */}
      {detalle && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>{detalle.nombre}</h2>
            <p><b>Puesto:</b> {detalle.numero_puesto || '—'}</p>
            <p><b>Giro comercial:</b> {detalle.giro_comercial}</p>
            <p><b>Estado:</b> {detalle.estado}</p>
            <p><b>Correo:</b> {detalle.correo}</p>
            <p><b>Teléfono:</b> {detalle.telefono || '—'}</p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR LOCATARIO */}
      {modalNuevo && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Registrar locatario</h2>

            <label>Nombre completo</label>
            <input
              type="text"
              value={nuevoLocatario.nombre}
              onChange={(e) => setNuevoLocatario(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej. Isaí Santos R."
            />

            <label>Correo</label>
            <input
              type="email"
              value={nuevoLocatario.correo}
              onChange={(e) => setNuevoLocatario(f => ({ ...f, correo: e.target.value }))}
              placeholder="correo@ejemplo.com"
            />

            <label>Contraseña</label>
            <input
              type="password"
              value={nuevoLocatario.password}
              onChange={(e) => setNuevoLocatario(f => ({ ...f, password: e.target.value }))}
            />

            <label>Teléfono</label>
            <input
              type="text"
              value={nuevoLocatario.telefono}
              onChange={(e) => setNuevoLocatario(f => ({ ...f, telefono: e.target.value }))}
            />

            <label>Giro comercial</label>
            <input
              type="text"
              value={nuevoLocatario.giro_comercial}
              onChange={(e) => setNuevoLocatario(f => ({ ...f, giro_comercial: e.target.value }))}
              placeholder="Ej. Verdulería"
            />

            <div style={{ marginTop: '10px' }}>
              <button onClick={crearLocatario}>Registrar</button>
              <button onClick={() => setModalNuevo(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LOCATARIO */}
      {editando && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Editar locatario</h2>
            <p style={{ marginTop: 0 }}><b>{editando.nombre}</b></p>

            <label>Correo</label>
            <input
              type="email"
              value={formEdicion.correo}
              onChange={(e) => setFormEdicion(f => ({ ...f, correo: e.target.value }))}
            />

            <label>Teléfono</label>
            <input
              type="text"
              value={formEdicion.telefono}
              onChange={(e) => setFormEdicion(f => ({ ...f, telefono: e.target.value }))}
            />

            <label>Giro comercial</label>
            <input
              type="text"
              value={formEdicion.giro_comercial}
              onChange={(e) => setFormEdicion(f => ({ ...f, giro_comercial: e.target.value }))}
            />

            <div style={{ marginTop: '10px' }}>
              <button onClick={guardarEdicion}>Guardar cambios</button>
              <button onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}