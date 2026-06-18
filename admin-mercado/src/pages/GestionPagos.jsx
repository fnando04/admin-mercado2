import { useState } from 'react';
import './GestionPagos.css';

const pagosData = [
  { num: 'A-12', nombre: 'Isaí Santos R.',    iniciales: 'IS', vence: '15 Nov 2023', estado: 'pagado' },
  { num: 'B-04', nombre: 'Raúl Lora',         iniciales: 'RL', vence: '13 Nov 2024', estado: 'moroso' },
  { num: 'C-09', nombre: 'Pedro Bautista',    iniciales: 'PB', vence: '21 Nov 2023', estado: 'pagado' },
  { num: 'D-04', nombre: 'José Mendoza',      iniciales: 'JM', vence: '10 Nov 2023', estado: 'moroso' },
  { num: 'E-07', nombre: 'Rodrigo Zuñiga',    iniciales: 'RZ', vence: '18 Nov 2023', estado: 'pagado' },
  { num: 'F-02', nombre: 'Javier González',   iniciales: 'JG', vence: '30 Nov 2025', estado: 'pendiente' },
  { num: 'G-05', nombre: 'Julián Vargas M.',  iniciales: 'JV', vence: '05 Nov 2026', estado: 'pendiente' },
];

export default function GestionPagos() {
  const [filtros, setFiltros] = useState({ pagado: false, pendiente: false, moroso: false });
  const [mes, setMes] = useState('Noviembre 2025');

  const toggleFiltro = (key) => setFiltros(f => ({ ...f, [key]: !f[key] }));

  const algunFiltroActivo = filtros.pagado || filtros.pendiente || filtros.moroso;
  const pagosFiltrados = algunFiltroActivo
    ? pagosData.filter(p => filtros[p.estado])
    : pagosData;

  const conteo = {
    pagado:    pagosData.filter(p => p.estado === 'pagado').length,
    pendiente: pagosData.filter(p => p.estado === 'pendiente').length,
    moroso:    pagosData.filter(p => p.estado === 'moroso').length,
  };

  return (
    <div className="content">
      <div className="page-head">
        <h1 className="page-titulo">Gestión de pagos</h1>
        <p className="page-subtitulo">Control de renta mensual y morosidad · {mes}</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total locatarios</span>
            <div className="stat-icon azul"><i className="fa-solid fa-users"></i></div>
          </div>
          <div className="stat-valor">{pagosData.length}</div>
          <div className="stat-meta">Activos en el mercado</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pagado</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{conteo.pagado}</div>
          <div className="stat-meta"><b>{Math.round(conteo.pagado / pagosData.length * 100)}%</b> del total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pendiente</span>
            <div className="stat-icon ambar"><i className="fa-solid fa-clock"></i></div>
          </div>
          <div className="stat-valor">{conteo.pendiente}</div>
          <div className="stat-meta">Por vencer este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Morosos</span>
            <div className="stat-icon rojo"><i className="fa-solid fa-triangle-exclamation"></i></div>
          </div>
          <div className="stat-valor">{conteo.moroso}</div>
          <div className="stat-meta">Requieren seguimiento</div>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions-row">
        <button className="btn btnOutline" onClick={() => setFiltros({ pagado: false, pendiente: true, moroso: false })}>
          <i className="fa-solid fa-clock"></i> Pagos pendientes
        </button>
        <button className="btn btnDanger" onClick={() => setFiltros({ pagado: false, pendiente: false, moroso: true })}>
          <i className="fa-solid fa-user-xmark"></i> Ver morosos
        </button>
        <div className="actions-spacer"></div>
        <button className="btn btnOutline">
          <i className="fa-solid fa-plus"></i> Registrar pago
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <div className="filtro-grupo">
          <span className="filtro-label">Mes</span>
          <select className="sltMes" value={mes} onChange={e => setMes(e.target.value)}>
            <option>Noviembre 2025</option>
            <option>Octubre 2025</option>
            <option>Septiembre 2025</option>
            <option>Agosto 2025</option>
          </select>
        </div>
        <div className="filtro-grupo">
          <span className="filtro-label">Estado</span>
          <div className="pills-group">
            {[
              { key: 'pagado',    color: '#48A020', label: 'Pagado' },
              { key: 'pendiente', color: '#C8A000', label: 'Pendiente' },
              { key: 'moroso',    color: '#C83030', label: 'Moroso' },
            ].map(({ key, color, label }) => (
              <button
                key={key}
                className={`pill-label ${filtros[key] ? `pill-${key}` : ''}`}
                onClick={() => toggleFiltro(key)}
              >
                <span className="pill-dot" style={{ background: color }}></span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="filtros-spacer"></div>
        <div className="total-chip">Mostrando <b>{pagosFiltrados.length}</b> locatarios</div>
      </div>

      {/* Tabla */}
      <div className="tabla-wrap">
        <div className="tabla-header">
          <span className="tabla-titulo">Tabla de pagos</span>
          <span className="tabla-mes-pill">{mes}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Locatario</th>
              <th>Fecha de vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((p) => (
              <tr key={p.num}>
                <td className="td-num">{p.num}</td>
                <td>
                  <div className="td-nombre-wrap">
                    <div className="nombre-avatar">{p.iniciales}</div>
                    <span className="td-nombre">{p.nombre}</span>
                  </div>
                </td>
                <td className="td-fecha">{p.vence}</td>
                <td>
                  <span className={`badge badge-${p.estado}`}>
                    <span className="bdot"></span>
                    {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="td-acciones">
                    <button className="btnDescargaPDF">
                      <i className="fa-solid fa-file-pdf"></i> PDF
                    </button>
                    <button className="btnIconoFila" title="Ver detalle">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="tabla-footer">
          <span className="footer-info">Total: <b>{pagosFiltrados.length} locatarios</b> · Mes: {mes}</span>
          <button className="btnDescargaComprobanteTotalPDF">
            <i className="fa-solid fa-file-arrow-down"></i> Descargar comprobante total PDF
          </button>
        </div>
      </div>
    </div>
  );
}
