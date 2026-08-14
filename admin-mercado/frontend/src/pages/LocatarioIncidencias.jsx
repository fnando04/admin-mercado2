import { useState, useEffect } from 'react';
import LocatarioLayout from './LocatarioLayout';
import socket from '../socket'; // ajusta la ruta según dónde guardes tu socket.js del frontend
import './LocatarioPanel.css';

const BADGE_CLASE = {
  'Abierta': 'badge-dark',
  'En proceso': 'badge-proceso',
  'Resuelta': 'badge-resuelta',
};

export default function MisIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [idLocatario, setIdLocatario] = useState(null);

  const [modalNueva, setModalNueva] = useState(false);
  const [nueva, setNueva] = useState({ titulo: '', descripcion: '' });

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const usuario = guardado ? JSON.parse(guardado) : null;
    if (!usuario) return;
    setIdLocatario(usuario.id);
    cargarIncidencias(usuario.id);
  }, []);

  // Tiempo real: cuando el admin responde o cierra una incidencia, se actualiza sola,
  // sin que el locatario tenga que salir y volver a entrar a esta pantalla.
  useEffect(() => {
    if (!idLocatario) return;

    function refrescar() {
      cargarIncidencias(idLocatario);
    }

    socket.on("incidencia_respondida", refrescar);
    socket.on("incidencia_cerrada", refrescar);

    return () => {
      socket.off("incidencia_respondida", refrescar);
      socket.off("incidencia_cerrada", refrescar);
    };
  }, [idLocatario]);

  function cargarIncidencias(id) {
    fetch(`http://localhost:3000/api/locatario/mis-incidencias?id_locatario=${id}`)
      .then(res => res.json())
      .then(data => setIncidencias(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const abiertas = incidencias.filter(i => i.estado === 'Abierta').length;
  const enProceso = incidencias.filter(i => i.estado === 'En proceso').length;
  const resueltas = incidencias.filter(i => i.estado === 'Resuelta').length;

  const [foto, setFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Sube la foto DIRECTO a Cloudinary desde el navegador (sin pasar por tu backend)
  async function subirFotoACloudinary(archivo) {
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", "incidencias_mercado"); // el que creaste en Cloudinary (unsigned)

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/qicjakz1/image/upload", // reemplaza TU_CLOUD_NAME
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Error al subir la foto");
    return data.secure_url;
  }

  async function crearIncidencia() {
    if (!nueva.titulo.trim() || !nueva.descripcion.trim()) {
      alert("Completa el título y la descripción");
      return;
    }
    try {
      let foto_url = null;

      if (foto) {
        setSubiendoFoto(true);
        foto_url = await subirFotoACloudinary(foto);
        setSubiendoFoto(false);
      }

      const res = await fetch("http://localhost:3000/api/locatario/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_locatario: idLocatario,
          titulo: nueva.titulo,
          descripcion: nueva.descripcion,
          foto_url
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar la incidencia");
        return;
      }
      alert(data.mensaje || "Incidencia registrada");
      setModalNueva(false);
      setNueva({ titulo: '', descripcion: '' });
      setFoto(null);
      cargarIncidencias(idLocatario);
    } catch (err) {
      setSubiendoFoto(false);
      console.error(err);
      alert("Error de conexión al registrar la incidencia");
    }
  }

  return (
    <LocatarioLayout>
      <div className="page-head">
        <h1 className="page-titulo">Mis incidencias</h1>
        <p className="page-subtitulo">Reporta problemas en tu puesto y da seguimiento a tus reportes</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Abiertas</span>
            <div className="stat-icon rojo"><i className="fa-solid fa-triangle-exclamation"></i></div>
          </div>
          <div className="stat-valor">{abiertas}</div>
          <div className="stat-meta">Sin atender aún</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">En proceso</span>
            <div className="stat-icon ambar"><i className="fa-solid fa-clock"></i></div>
          </div>
          <div className="stat-valor">{enProceso}</div>
          <div className="stat-meta">El administrador ya respondió</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Resueltas</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{resueltas}</div>
          <div className="stat-meta">Cerradas</div>
        </div>
      </div>

      <div className="actions-row">
        <div className="actions-spacer"></div>
        <button className="btn btnPrimary" onClick={() => setModalNueva(true)}>
          <i className="fa-solid fa-plus"></i> Reportar incidencia
        </button>
      </div>

      {incidencias.length === 0 ? (
        <div className="tabla-wrap" style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
          No has reportado ninguna incidencia
        </div>
      ) : (
        incidencias.map(inc => (
          <div className="incidencia-card" key={inc.id_incidencia}>
            <div className="incidencia-card-top">
              <h4>{inc.titulo}</h4>
              <span className={`badge ${BADGE_CLASE[inc.estado] || 'badge-dark'}`}>{inc.estado}</span>
            </div>
            <p>{inc.descripcion}</p>

            {inc.foto_url && (
              <img
                src={inc.foto_url}
                alt="Evidencia"
                style={{ maxWidth: '220px', borderRadius: '8px', marginTop: '8px', marginBottom: '8px', display: 'block' }}
              />
            )}

            <span className="fecha">Reportada: {inc.fecha_creacion}</span>

            {inc.respuesta_admin && (
              <div className="incidencia-respuesta">
                <b>Respuesta del administrador:</b> {inc.respuesta_admin}
                {inc.fecha_respuesta && <div className="fecha" style={{ marginTop: '4px' }}>{inc.fecha_respuesta}</div>}
              </div>
            )}
          </div>
        ))
      )}

      {/* MODAL: NUEVA INCIDENCIA */}
      {modalNueva && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Reportar incidencia</h2>

            <label>Título</label>
            <input
              type="text"
              value={nueva.titulo}
              onChange={(e) => setNueva(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej. Fuga de agua"
            />

            <label>Descripción</label>
            <textarea
              rows={4}
              value={nueva.descripcion}
              onChange={(e) => setNueva(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describe el problema con detalle..."
            />

            <label>Foto de evidencia (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0] || null)}
            />
            {foto && <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{foto.name}</p>}

            <div style={{ marginTop: '10px' }}>
              <button onClick={crearIncidencia} disabled={subiendoFoto}>
                {subiendoFoto ? "Subiendo foto..." : "Enviar reporte"}
              </button>
              <button onClick={() => setModalNueva(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LocatarioLayout>
  );
}