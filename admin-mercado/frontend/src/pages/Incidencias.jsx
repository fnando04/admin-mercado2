import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from './PageLayout';
import socket from '../socket';
import './Incidencias.css';

const COLOR_ESTADO = {
  'Abierta': '#C83030',
  'En proceso': '#C8A000',
  'Resuelta': '#48A020',
};

const BADGE_CLASE = {
  'Abierta': 'badge-dark',
  'En proceso': 'badge-proceso',
  'Resuelta': 'badge-resuelta',
};

function FilaIncidencia({ inc, onVerDetalle }) {
  return (
    <tr>
      <td className="td-titulo">
        {inc.titulo}
        <span>{inc.giro_comercial || ''}</span>
      </td>
      <td className="td-puesto">
        {inc.numero_puesto ? `Puesto ${inc.numero_puesto}` : '—'}
        <br />
        <small>{inc.nombre}</small>
      </td>
      <td><span className={`badge ${BADGE_CLASE[inc.estado] || 'badge-dark'}`}>{inc.estado}</span></td>
      <td>
        <div className="estado-text">
          <span className="bdot" style={{ background: COLOR_ESTADO[inc.estado] || '#999' }}></span>
          {inc.estado}
        </div>
      </td>
      <td className="td-fecha">
        {inc.fecha_creacion}<br />{inc.hora_creacion}
      </td>
      <td>
        <button className="btnIconoFila" onClick={() => onVerDetalle(inc)}>
          <i className="fa-regular fa-eye"></i>
        </button>
      </td>
    </tr>
  );
}

export default function Incidencias() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [incidencias, setIncidencias] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [locatarios, setLocatarios] = useState([]);

  const [detalle, setDetalle] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');

  const [modalNueva, setModalNueva] = useState(false);
  const [nuevaIncidencia, setNuevaIncidencia] = useState({ id_locatario: '', titulo: '', descripcion: '' });

  const [modalAviso, setModalAviso] = useState(false);
  const [nuevoAviso, setNuevoAviso] = useState({ titulo: '', contenido: '', fecha_vigencia: '' });

  // Modo "Administrar avisos": edición inline en el mismo panel
  const [modoAdministrar, setModoAdministrar] = useState(false);
  const [avisoEditando, setAvisoEditando] = useState(null); // id_aviso en edición
  const [formEdicion, setFormEdicion] = useState({ titulo: '', contenido: '', fecha_vigencia: '' });

  // Tiempo real: refresca la tabla sola cuando llega una incidencia nueva o un aviso nuevo
  useEffect(() => {
    function onNuevaIncidencia() {
      cargarIncidencias();
    }
    function onNuevoAviso() {
      cargarAvisos();
    }
    function onIncidenciaRespondida() {
      cargarIncidencias();
    }

    socket.on("nueva_incidencia", onNuevaIncidencia);
    socket.on("nuevo_aviso", onNuevoAviso);
    socket.on("incidencia_respondida", onIncidenciaRespondida);

    return () => {
      socket.off("nueva_incidencia", onNuevaIncidencia);
      socket.off("nuevo_aviso", onNuevoAviso);
      socket.off("incidencia_respondida", onIncidenciaRespondida);
    };
  }, []);

  useEffect(() => {
    // Archiva automáticamente los avisos ya vencidos, una sola vez al cargar la pantalla
    fetch("http://localhost:3000/api/avisos/archivar-vencidos", { method: "POST" })
      .catch(err => console.error(err))
      .finally(() => cargarAvisos());

    cargarIncidencias();
    cargarLocatarios();

    if (searchParams.get('nuevoAviso') === '1') {
      setModalAviso(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cargarIncidencias() {
    fetch("http://localhost:3000/api/incidencias")
      .then(res => res.json())
      .then(data => setIncidencias(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarAvisos() {
    fetch("http://localhost:3000/api/avisos")
      .then(res => res.json())
      .then(data => setAvisos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarLocatarios() {
    fetch("http://localhost:3000/api/incidencias/locatarios-disponibles")
      .then(res => res.json())
      .then(data => setLocatarios(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const incidenciasAbiertas = incidencias.filter(i => i.estado === 'Abierta');

  function abrirDetalle(inc) {
    setDetalle(inc);
    setRespuestaTexto(inc.respuesta_admin || '');
  }

  async function guardarRespuesta() {
    if (!detalle) return;
    if (!respuestaTexto.trim()) {
      alert("Escribe una respuesta antes de guardar");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/incidencias/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_incidencia: detalle.id_incidencia, respuesta: respuestaTexto })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo guardar la respuesta");
        return;
      }
      alert(data.mensaje || "Respuesta guardada");
      setDetalle(null);
      cargarIncidencias();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar la respuesta");
    }
  }

  async function cerrarIncidencia() {
    if (!detalle) return;
    try {
      const res = await fetch("http://localhost:3000/api/incidencias/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_incidencia: detalle.id_incidencia })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo cerrar la incidencia");
        return;
      }
      alert(data.mensaje || "Incidencia cerrada");
      setDetalle(null);
      cargarIncidencias();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al cerrar la incidencia");
    }
  }

  async function crearIncidencia() {
    const { id_locatario, titulo, descripcion } = nuevaIncidencia;
    if (!id_locatario || !titulo.trim() || !descripcion.trim()) {
      alert("Completa locatario, título y descripción");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_locatario, titulo, descripcion })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar la incidencia");
        return;
      }
      alert(data.mensaje || "Incidencia registrada");
      setModalNueva(false);
      setNuevaIncidencia({ id_locatario: '', titulo: '', descripcion: '' });
      cargarIncidencias();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar la incidencia");
    }
  }

  // Convierte "dd/mm/yyyy" (como lo manda el backend) a "yyyy-mm-dd" (lo que necesita <input type="date">)
  function aFormatoInput(fechaDDMMYYYY) {
    if (!fechaDDMMYYYY) return '';
    const [d, m, y] = fechaDDMMYYYY.split('/');
    return `${y}-${m}-${d}`;
  }

  function iniciarEdicion(aviso) {
    setAvisoEditando(aviso.id_aviso);
    setFormEdicion({
      titulo: aviso.titulo,
      contenido: aviso.contenido,
      fecha_vigencia: aFormatoInput(aviso.fecha_vigencia)
    });
  }

  function cancelarEdicion() {
    setAvisoEditando(null);
    setFormEdicion({ titulo: '', contenido: '', fecha_vigencia: '' });
  }

  async function guardarEdicion(id_aviso) {
    const { titulo, contenido, fecha_vigencia } = formEdicion;
    if (!titulo.trim() || !contenido.trim() || !fecha_vigencia) {
      alert("Completa título, contenido y fecha de vigencia");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/avisos/${id_aviso}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, contenido, fecha_vigencia })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el aviso");
        return;
      }
      cancelarEdicion();
      cargarAvisos();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al actualizar el aviso");
    }
  }

  async function eliminarAviso(id_aviso) {
    if (!window.confirm("¿Eliminar este aviso?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/avisos/${id_aviso}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar el aviso");
        return;
      }
      cargarAvisos();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar el aviso");
    }
  }

  async function crearAviso() {
    const { titulo, contenido, fecha_vigencia } = nuevoAviso;
    if (!titulo.trim() || !contenido.trim() || !fecha_vigencia) {
      alert("Completa título, contenido y fecha de vigencia");
      return;
    }

    // Id del administrador logueado (guardado en el login)
    const guardado = localStorage.getItem('usuario');
    const admin = guardado ? JSON.parse(guardado) : null;
    if (!admin || !admin.id) {
      alert("No se encontró la sesión del administrador, vuelve a iniciar sesión");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_administrador: admin.id, titulo, contenido, fecha_vigencia })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo publicar el aviso");
        return;
      }
      alert(data.mensaje || "Aviso publicado");
      setModalAviso(false);
      setNuevoAviso({ titulo: '', contenido: '', fecha_vigencia: '' });
      cargarAvisos();
    } catch (err) {
      console.error(err);
      alert("Error de conexión al publicar el aviso");
    }
  }

  return (
    <PageLayout maxWidth="1400px">

      <div className="page-head">
        <h1 className="page-titulo">Gestión de Incidencias y Avisos</h1>
        <p className="page-subtitulo">Control y seguimiento de reportes en tiempo real</p>
      </div>

      <div className="incidencias-grid">

        {/* COLUMNA IZQUIERDA: TABLA INCIDENCIAS */}
        <div className="panel-wrap">
          <div className="panel-header">
            <span className="panel-titulo">Control de Incidencias</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Puesto / Locatario</th>
                <th>Estado</th>
                <th>Severidad</th>
                <th>Última Acción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {incidencias.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                    No hay incidencias registradas
                  </td>
                </tr>
              ) : (
                incidencias.map(inc => (
                  <FilaIncidencia inc={inc} key={inc.id_incidencia} onVerDetalle={abrirDetalle} />
                ))
              )}
            </tbody>
          </table>
          <div className="btn-container">
            <button className="btnOutline" onClick={() => setModalNueva(true)}>
              <i className="fa-solid fa-plus"></i> Registrar incidencia
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: AVISOS */}
        <div className="panel-wrap">
          <div className="panel-header">
            <span className="panel-titulo">Avisos y Notificaciones</span>
          </div>
          <div className="avisos-content">

            {avisos.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#999', padding: '8px 0' }}>No hay avisos vigentes</p>
            ) : (
              avisos.map((a) => {
                const enEdicion = avisoEditando === a.id_aviso;

                if (enEdicion) {
                  return (
                    <div className="aviso-item aviso-item-edicion" key={a.id_aviso}>
                      <div className="aviso-icon"><i className="fa-solid fa-bullhorn"></i></div>
                      <div className="aviso-text aviso-edit-form">
                        <input
                          type="text"
                          value={formEdicion.titulo}
                          onChange={(e) => setFormEdicion(f => ({ ...f, titulo: e.target.value }))}
                          placeholder="Título"
                        />
                        <textarea
                          rows={3}
                          value={formEdicion.contenido}
                          onChange={(e) => setFormEdicion(f => ({ ...f, contenido: e.target.value }))}
                          placeholder="Contenido"
                        />
                        <input
                          type="date"
                          value={formEdicion.fecha_vigencia}
                          onChange={(e) => setFormEdicion(f => ({ ...f, fecha_vigencia: e.target.value }))}
                        />
                        <div className="aviso-edit-acciones">
                          <button className="btnIconoFila" title="Guardar" onClick={() => guardarEdicion(a.id_aviso)}>
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button className="btnIconoFila" title="Cancelar" onClick={cancelarEdicion}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="aviso-item" key={a.id_aviso}>
                    <div className="aviso-icon"><i className="fa-solid fa-bullhorn"></i></div>
                    <div className="aviso-text">
                      <h4>{a.titulo}</h4>
                      <p>{a.contenido}</p>
                      <span className="aviso-vigencia">Vigente hasta {a.fecha_vigencia}</span>
                    </div>
                    {modoAdministrar && (
                      <div className="aviso-acciones">
                        <button className="btnIconoFila" title="Editar" onClick={() => iniciarEdicion(a)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btnIconoFila" title="Eliminar" onClick={() => eliminarAviso(a.id_aviso)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Caja de Tiempo Real: reutiliza las incidencias abiertas */}
            <div className="rt-panel">
              <div className="rt-title">Incidencias abiertas</div>
              {incidenciasAbiertas.length === 0 ? (
                <div className="rt-item">Sin incidencias abiertas</div>
              ) : (
                incidenciasAbiertas.map((n) => (
                  <div className="rt-item" key={n.id_incidencia}>{n.titulo} · {n.nombre}</div>
                ))
              )}
            </div>

          </div>
          <div className="btn-container">
            <button
              className="btnOutline"
              onClick={() => { setModoAdministrar(v => !v); cancelarEdicion(); }}
            >
              <i className="fa-solid fa-gear"></i> {modoAdministrar ? "Terminar edición" : "Administrar Avisos"}
            </button>
            <button className="btnPrimary" onClick={() => setModalAviso(true)}>
              <i className="fa-solid fa-plus"></i> Agregar aviso
            </button>
          </div>
        </div>

      </div>

      {/* MODAL: DETALLE / RESPONDER / CERRAR INCIDENCIA */}
      {detalle && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>{detalle.titulo}</h2>

            <p><b>Locatario:</b> {detalle.nombre}</p>
            <p><b>Puesto:</b> {detalle.numero_puesto || '—'}</p>
            <p><b>Estado:</b> {detalle.estado}</p>
            <p><b>Descripción:</b> {detalle.descripcion}</p>
            {detalle.fecha_respuesta && <p><b>Respondida:</b> {detalle.fecha_respuesta}</p>}

            <label>Respuesta del administrador</label>
            <textarea
              rows={4}
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              placeholder="Escribe la respuesta o seguimiento dado a esta incidencia..."
              disabled={detalle.estado === 'Resuelta'}
            />

            <div style={{ marginTop: '10px' }}>
              {detalle.estado !== 'Resuelta' && (
                <>
                  <button onClick={guardarRespuesta}>Guardar respuesta</button>
                  <button onClick={cerrarIncidencia}>Marcar como resuelta</button>
                </>
              )}
              <button onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA INCIDENCIA */}
      {modalNueva && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Registrar incidencia</h2>

            <label>Locatario</label>
            <select
              value={nuevaIncidencia.id_locatario}
              onChange={(e) => setNuevaIncidencia(f => ({ ...f, id_locatario: e.target.value }))}
            >
              <option value="">Selecciona un locatario</option>
              {locatarios.map(l => (
                <option key={l.id_locatario} value={l.id_locatario}>
                  {l.nombre}{l.numero_puesto ? ` - Puesto ${l.numero_puesto}` : ''}
                </option>
              ))}
            </select>

            <label>Título</label>
            <input
              type="text"
              value={nuevaIncidencia.titulo}
              onChange={(e) => setNuevaIncidencia(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej. Fuga de agua"
            />

            <label>Descripción</label>
            <textarea
              rows={4}
              value={nuevaIncidencia.descripcion}
              onChange={(e) => setNuevaIncidencia(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describe la incidencia..."
            />

            <div style={{ marginTop: '10px' }}>
              <button onClick={crearIncidencia}>Registrar</button>
              <button onClick={() => setModalNueva(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO AVISO */}
      {modalAviso && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Publicar aviso</h2>

            <label>Título</label>
            <input
              type="text"
              value={nuevoAviso.titulo}
              onChange={(e) => setNuevoAviso(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej. Mantenimiento eléctrico"
            />

            <label>Contenido</label>
            <textarea
              rows={4}
              value={nuevoAviso.contenido}
              onChange={(e) => setNuevoAviso(f => ({ ...f, contenido: e.target.value }))}
              placeholder="Describe el aviso..."
            />

            <label>Vigente hasta</label>
            <input
              type="date"
              value={nuevoAviso.fecha_vigencia}
              onChange={(e) => setNuevoAviso(f => ({ ...f, fecha_vigencia: e.target.value }))}
            />

            <div style={{ marginTop: '10px' }}>
              <button onClick={crearAviso}>Publicar</button>
              <button onClick={() => setModalAviso(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}
