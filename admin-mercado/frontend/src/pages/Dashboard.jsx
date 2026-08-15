import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from './PageLayout';
import MapaMercado from './MapaMercado';
import './Dashboard.css';
import { API_URL } from "../config";

const BADGE_PAGO = {
  pagado: { clase: 'badge-pagado-sm', label: 'Pagado' },
  pendiente: { clase: 'badge-pendiente-sm', label: 'Pendiente' },
  moroso: { clase: 'badge-moroso-sm', label: 'Moroso' },
};

// Ícono del aviso según palabras clave en el título (esto sí se calcula en el front, tu SP no lo trae)
function iconoAviso(titulo = '') {
  const t = titulo.toLowerCase();
  if (t.includes('agua')) return 'fa-droplet-slash';
  if (t.includes('reuni')) return 'fa-users';
  if (t.includes('pago') || t.includes('renta') || t.includes('cobro')) return 'fa-credit-card';
  if (t.includes('el') && t.includes('ctric')) return 'fa-bolt';
  if (t.includes('mantenimiento')) return 'fa-screwdriver-wrench';
  return 'fa-bullhorn';
}

function mesAnioActual() {
  const texto = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [giros, setGiros] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [avisos, setAvisos] = useState([]);

  const guardado = localStorage.getItem('usuario');
  const admin = guardado ? JSON.parse(guardado) : null;
  const nombreAdmin = admin?.nombre || 'Administrador';

  useEffect(() => {
    cargarKpis();
    cargarOcupacionGiro();
    cargarIncidenciasActivas();
    cargarPagosRecientes();
    cargarAvisosVigentes();
  }, []);

  function cargarKpis() {
    fetch(API_URL + "/api/dashboard/kpis")
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(err => console.error(err));
  }

  function cargarOcupacionGiro() {
    fetch(API_URL + "/api/dashboard/ocupacion-giro")
      .then(res => res.json())
      .then(data => setGiros(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarIncidenciasActivas() {
    fetch(API_URL + "/api/dashboard/incidencias-activas?limite=3")
      .then(res => res.json())
      .then(data => setIncidencias(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarPagosRecientes() {
    fetch(API_URL + "/api/dashboard/pagos-recientes?limite=4")
      .then(res => res.json())
      .then(data => setPagos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarAvisosVigentes() {
    fetch(API_URL + "/api/dashboard/avisos-vigentes?limite=3")
      .then(res => res.json())
      .then(data => setAvisos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const [mostrarMapa, setMostrarMapa] = useState(false);

  const pctOcupacion = kpis && kpis.puestos_totales
    ? Math.round((kpis.puestos_ocupados / kpis.puestos_totales) * 100)
    : 0;

  const ingresosFmt = kpis
    ? `$${Number(kpis.ingresos_mes).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
    : '$0';

  return (
    <PageLayout>

      {/* Bienvenida */}
      <div className="bienvenida-row">
        <div>
          <h1 className="bienvenida-titulo">Bienvenida, {nombreAdmin}</h1>
          <p className="bienvenida-sub">Administrador · Mercado municipal Tizayuca</p>
        </div>
        <span className="bienvenida-fecha">{mesAnioActual()}</span>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-users"></i> Locatarios</div>
          <div className="kpi-valor">{kpis ? kpis.locatarios_activos : '—'}</div>
          <div className="kpi-sub">Activos en el mercado</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-shop"></i> Puestos ocupados</div>
          <div className="kpi-valor">
            {kpis ? kpis.puestos_ocupados : '—'}
            <span style={{ fontSize: 16, opacity: 0.6 }}>/{kpis ? kpis.puestos_totales : '—'}</span>
          </div>
          <div className="kpi-sub">{pctOcupacion}% de ocupación</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-circle-dollar-to-slot"></i> Ingresos</div>
          <div className="kpi-valor" style={{ fontSize: 22 }}>{ingresosFmt}</div>
          <div className="kpi-sub">{mesAnioActual()}</div>
        </div>
        <div className="kpi-card" style={{ background: 'var(--rojo-bg)', border: '1px solid var(--rojo-borde)' }}>
          <div className="kpi-label" style={{ color: 'var(--rojo-text)' }}><i className="fa-solid fa-circle-exclamation"></i> Morosos</div>
          <div className="kpi-valor" style={{ color: 'var(--rojo-text)' }}>{kpis ? kpis.total_morosos : '—'}</div>
          <div className="kpi-sub" style={{ color: '#C08080' }}>Requieren seguimiento</div>
        </div>
        <div className="kpi-card" style={{ background: 'var(--ambar-bg)', border: '1px solid #E8C840' }}>
          <div className="kpi-label" style={{ color: 'var(--ambar-text)' }}><i className="fa-solid fa-triangle-exclamation"></i> Incidencias</div>
          <div className="kpi-valor" style={{ color: 'var(--ambar-text)' }}>{kpis ? kpis.incidencias_activas : '—'}</div>
          <div className="kpi-sub" style={{ color: '#B08030' }}>Activas hoy</div>
        </div>
      </div>

      {/* Ubicación del mercado: solo un botón, el mapa se carga hasta que se abre */}
      <button
        className="panel"
        onClick={() => setMostrarMapa(true)}
        style={{
          marginBottom: '20px', width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
          padding: '18px 20px', cursor: 'pointer', border: 'none', textAlign: 'left',
          background: 'var(--blanco, #fff)', borderRadius: '12px',
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
          background: '#E8F0E4', color: '#1E5B2E',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>
          <i className="fa-solid fa-map-location-dot"></i>
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#222' }}>Ubicación del mercado</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Toca para ver el mapa</div>
        </div>
        <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: '#bbb' }}></i>
      </button>

      {/* Modal del mapa: MapaMercado (y por lo tanto Leaflet) solo se monta cuando esto es true */}
      {mostrarMapa && (
        <div
          className="modal-detalle"
          onClick={() => setMostrarMapa(false)}
        >
          <div
            className="modal-contenido"
            style={{ width: '600px', maxWidth: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Ubicación del mercado</h2>
            <MapaMercado height="320px" />
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => setMostrarMapa(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Fila principal */}
      <div className="lower-grid">

        {/* Ocupación por giro */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Ocupación por giro comercial</span>
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/locatarios')}>
              <i className="fa-solid fa-arrow-right"></i> Ver detalle
            </button>
          </div>
          <div className="panel-body">
            <div className="giro-lista">
              {giros.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>Sin datos de ocupación</p>
              ) : (
                giros.map((g) => (
                  <div className="giro-item" key={g.nombre}>
                    <div className="giro-row">
                      <span className="giro-nombre">{g.nombre}</span>
                      <span className="giro-num">{g.num}</span>
                    </div>
                    <div className="giro-bar-track">
                      {/* pct ya viene calculado desde sp_dashboard_ocupacion_giro, no hace falta calcularlo aquí */}
                      <div className="giro-bar-fill" style={{ width: `${g.pct}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Incidencias activas */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Incidencias activas</span>
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/incidencias')}>
              Ver todas <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div className="panel-body">
            <div className="incidencias-lista">
              {incidencias.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>Sin incidencias activas</p>
              ) : (
                incidencias.map((inc) => (
                  // severidad y meta ya vienen armados desde sp_dashboard_incidencias_activas
                  <div
                    className={`incidencia-item ${inc.severidad}`}
                    key={inc.id_incidencia}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/incidencias')}
                  >
                    <div className="inc-dot"></div>
                    <div className="inc-info">
                      <div className="inc-titulo">{inc.titulo}</div>
                      <div className="inc-meta">{inc.meta}</div>
                    </div>
                    <span className="inc-status">{inc.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="acciones-panel">
          <div className="acciones-head">
            <span className="acciones-titulo">Acciones rápidas</span>
          </div>
          <div className="acciones-body">
            <button className="accion-btn" onClick={() => navigate('/locatarios?nuevo=1')}>
              <i className="fa-solid fa-user-plus"></i> Nuevo locatario
            </button>
            <button className="accion-btn" onClick={() => navigate('/incidencias?nuevoAviso=1')}>
              <i className="fa-solid fa-bullhorn"></i> Publicar aviso
            </button>
            <button className="accion-btn" onClick={() => navigate('/puestos?filtro=disponible')}>
              <i className="fa-solid fa-shop"></i> Puestos libres
            </button>
            <button className="accion-btn" onClick={() => navigate('/pagos?todos=1')}>
              <i className="fa-solid fa-file-invoice"></i> Generar reporte
            </button>
            <button className="accion-btn" onClick={() => navigate('/locatarios?estado=Moroso')}>
              <i className="fa-solid fa-user-xmark"></i> Ver morosos
            </button>
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="mid-grid">

        {/* Pagos recientes */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Pagos recientes</span>
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/pagos?todos=1')}>
              Ver todos <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <div className="panel-body">
            <div className="pagos-lista">
              {pagos.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>Sin pagos registrados</p>
              ) : (
                // iniciales y puesto ya vienen formateados desde sp_dashboard_pagos_recientes
                pagos.map((p, i) => {
                  const badge = BADGE_PAGO[p.estado] || BADGE_PAGO.pendiente;
                  return (
                    <div className="pago-item" key={`${p.id_usuario}-${i}`}>
                      <div
                        className="pago-avatar"
                        style={p.estado === 'moroso' ? { background: '#FDEEEE', color: '#8A2020' } : undefined}
                      >
                        {p.iniciales}
                      </div>
                      <div className="pago-info">
                        <div className="pago-nombre">{p.nombre}</div>
                        <div className="pago-puesto">{p.puesto}</div>
                      </div>
                      <span className={`badge-sm ${badge.clase}`}>{badge.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Avisos vigentes */}
        <div className="avisos-panel">
          <div className="avisos-head">
            <span className="avisos-titulo">Avisos vigentes</span>
            <i className="fa-solid fa-bullhorn avisos-icon"></i>
          </div>
          <div className="avisos-body">
            {avisos.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>No hay avisos vigentes</p>
            ) : (
              avisos.map((a) => (
                <div className="aviso-item" key={a.id_aviso}>
                  <div className="aviso-icon"><i className={`fa-solid ${iconoAviso(a.titulo)}`}></i></div>
                  <div>
                    <div className="aviso-texto">{a.titulo}</div>
                    <div className="aviso-fecha">{a.fecha_vigencia_fmt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </PageLayout>
  );
}
