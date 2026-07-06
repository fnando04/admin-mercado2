import { useState, useEffect } from 'react';
import LocatarioLayout from './LocatarioLayout';
import './LocatarioPanel.css';

const NOMBRES_MES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function LocatarioInicio() {
  const [info, setInfo] = useState(null);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const usuario = guardado ? JSON.parse(guardado) : null;
    if (!usuario) return;

    fetch(`http://localhost:3000/api/locatario/mi-info?id_locatario=${usuario.id}`)
      .then(res => res.json())
      .then(data => setInfo(data))
      .catch(err => console.error(err));

    fetch("http://localhost:3000/api/avisos")
      .then(res => res.json())
      .then(data => setAvisos(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(err => console.error(err));
  }, []);

  const etiquetaEstado = (estado) => {
    if (!estado) return "Sin registro";
    if (estado === "sin_generar") return "Sin generar";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const hoy = new Date();
  const mesActualLabel = `${NOMBRES_MES[hoy.getMonth() + 1]} ${hoy.getFullYear()}`;

  return (
    <LocatarioLayout>
      <div className="page-head">
        <h1 className="page-titulo">Hola, {info ? info.nombre.split(" ")[0] : "..."}</h1>
        <p className="page-subtitulo">Resumen de tu puesto en el Mercado Municipal</p>
      </div>

      {info && (
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