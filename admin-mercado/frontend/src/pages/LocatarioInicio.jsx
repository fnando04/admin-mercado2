import { useState, useEffect } from 'react';
import LocatarioLayout from './LocatarioLayout';
import socket from '../socket'; 
import './LocatarioPanel.css';
import MapaMercado from './MapaMercado';

const NOMBRES_MES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function LocatarioInicio() {
  const [info, setInfo] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [idLocatario, setIdLocatario] = useState(null);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ giro_comercial: '', telefono: '', correo: '' });
  const [mostrarMapa, setMostrarMapa] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const usuario = guardado ? JSON.parse(guardado) : null;
    if (!usuario) return;
    setIdLocatario(usuario.id);

    cargarInfo(usuario.id);
    cargarAvisos();
  }, []);

  // Tiempo real: cuando el admin publica un aviso nuevo, aparece aquí solo, sin recargar
  useEffect(() => {
    function onNuevoAviso() {
      cargarAvisos();
    }
    socket.on("nuevo_aviso", onNuevoAviso);
    return () => socket.off("nuevo_aviso", onNuevoAviso);
  }, []);

  function cargarAvisos() {
    fetch("http://localhost:3000/api/avisos")
      .then(res => res.json())
      .then(data => setAvisos(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(err => console.error(err));
  }

  function cargarInfo(id) {
    fetch(`http://localhost:3000/api/locatario/mi-info?id_locatario=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setInfo(data);
        else console.error(data?.error);
      })
      .catch(err => console.error(err));
  }

  const etiquetaEstado = (estado) => {
    if (!estado) return "Sin registro";
    if (estado === "sin_generar") return "Sin generar";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const hoy = new Date();
  const mesActualLabel = `${NOMBRES_MES[hoy.getMonth() + 1]} ${hoy.getFullYear()}`;

  function iniciarEdicion() {
    setForm({
      giro_comercial: info.giro_comercial || '',
      telefono: info.telefono || '',
      correo: info.correo || ''
    });
    setEditando(true);
  }

  async function guardarEdicion() {
    if (!form.correo.trim() || !form.giro_comercial.trim()) {
      alert("El correo y el giro comercial no pueden quedar vacíos");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/locatario/mi-perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_locatario: idLocatario,
          telefono: form.telefono,
          correo: form.correo,
          giro_comercial: form.giro_comercial
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar tu información");
        return;
      }

      // Si cambió el correo, lo actualizamos también en localStorage para que quede consistente
      const guardado = localStorage.getItem('usuario');
      if (guardado) {
        const usuario = JSON.parse(guardado);
        usuario.correo = form.correo;
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }

      setEditando(false);
      cargarInfo(idLocatario);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al actualizar tu información");
    }
  }

  return (
    <LocatarioLayout>
      <div className="page-head">
        <h1 className="page-titulo">Hola, {info ? info.nombre.split(" ")[0] : "..."}</h1>
        <p className="page-subtitulo">Resumen de tu puesto en el Mercado Municipal</p>
      </div>

      {info && !editando && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Tu puesto</span>
              <div className="stat-icon azul"><i className="fa-solid fa-shop"></i></div>
            </div>
            <div className="stat-valor">{info.numero_puesto || "Sin asignar"}</div>
            <div className="stat-meta">{info.giro_comercial}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Estado de pago</span>
              <div className="stat-icon verde"><i className="fa-solid fa-credit-card"></i></div>
            </div>
            <div className="stat-valor">{etiquetaEstado(info.ultimo_estado_pago)}</div>
            <div className="stat-meta">{mesActualLabel}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Contacto</span>
              <div className="stat-icon ambar"><i className="fa-solid fa-phone"></i></div>
            </div>
            <div className="stat-valor" style={{ fontSize: '15px' }}>{info.telefono || "—"}</div>
            <div className="stat-meta">{info.correo}</div>
          </div>
        </div>
      )}

      {info && !editando && (
        <div className="actions-row">
          <div className="actions-spacer"></div>
          <button className="btn btnOutline" onClick={iniciarEdicion}>
            <i className="fa-solid fa-pen"></i> Editar mi puesto y contacto
          </button>
        </div>
      )}

      <button
  className="panel"
  onClick={() => setMostrarMapa(true)}
  style={{
    marginBottom: '20px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 20px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
    background: 'var(--blanco, #fff)',
    borderRadius: '12px',
  }}
>
  <div
    style={{
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      flexShrink: 0,
      background: '#E8F0E4',
      color: '#1E5B2E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    }}
  >
    <i className="fa-solid fa-map-location-dot"></i>
  </div>

  <div>
    <div
      style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#222'
      }}
    >
      Ubicación del mercado
    </div>

    <div
      style={{
        fontSize: '12px',
        color: '#888'
      }}
    >
      Toca para ver el mapa
    </div>
  </div>

  <i
    className="fa-solid fa-chevron-right"
    style={{
      marginLeft: 'auto',
      color: '#bbb'
    }}
  ></i>
</button>

{mostrarMapa && (
  <div
    className="modal-detalle"
    onClick={() => setMostrarMapa(false)}
  >
    <div
      className="modal-contenido"
      style={{
        width: '600px',
        maxWidth: '92%'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Ubicación del mercado</h2>

      <MapaMercado height="320px" />

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setMostrarMapa(false)}>
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

      {info && editando && (
        <div className="tabla-wrap" style={{ padding: '20px 24px', marginBottom: '24px' }}>
          <div className="tabla-header" style={{ padding: 0, border: 'none', marginBottom: '12px' }}>
            <span className="tabla-titulo">Editar mi puesto y contacto</span>
          </div>

          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>
            Giro comercial
          </label>
          <input
            type="text"
            value={form.giro_comercial}
            onChange={(e) => setForm(f => ({ ...f, giro_comercial: e.target.value }))}
            placeholder="Ej. Verduras y Frutas"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--gris-200)', marginBottom: '14px' }}
          />

          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>
            Teléfono
          </label>
          <input
            type="text"
            value={form.telefono}
            onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))}
            placeholder="Tu número de contacto"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--gris-200)', marginBottom: '14px' }}
          />

          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>
            Correo
          </label>
          <input
            type="email"
            value={form.correo}
            onChange={(e) => setForm(f => ({ ...f, correo: e.target.value }))}
            placeholder="correo@ejemplo.com"
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid var(--gris-200)', marginBottom: '14px' }}
          />

          <div>
            <button className="btn btnPrimary" onClick={guardarEdicion} style={{ marginRight: '8px' }}>
              Guardar cambios
            </button>
            <button className="btn btnOutline" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="tabla-wrap" style={{ padding: '20px 24px' }}>
        <div className="tabla-header" style={{ padding: 0, border: 'none', marginBottom: '12px' }}>
          <span className="tabla-titulo">Avisos recientes</span>
        </div>
        {avisos.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#999' }}>No hay avisos vigentes</p>
        ) : (
          avisos.map(a => (
            <div className="aviso-item" key={a.id_aviso}>
              <div className="aviso-icon"><i className="fa-solid fa-bullhorn"></i></div>
              <div className="aviso-text">
                <h4>{a.titulo}</h4>
                <p>{a.contenido}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </LocatarioLayout>
  );
}

