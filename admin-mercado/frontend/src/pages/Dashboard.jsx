import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from './PageLayout';
import './Dashboard.css';

const BADGE_PAGO = {
  pagado: { clase: 'badge-pagado-sm', label: 'Pagado' },
  pendiente: { clase: 'badge-pendiente-sm', label: 'Pendiente' },
  moroso: { clase: 'badge-moroso-sm', label: 'Moroso' },
};

// Elige un icono para el aviso según palabras clave en el título/contenido
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
    fetch("http://localhost:3000/api/dashboard/kpis")
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(err => console.error(err));
  }

  function cargarOcupacionGiro() {
    fetch("http://localhost:3000/api/dashboard/ocupacion-giro")
      .then(res => res.json())
      .then(data => setGiros(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarIncidenciasActivas() {
    fetch("http://localhost:3000/api/dashboard/incidencias-activas?limite=3")
      .then(res => res.json())
      .then(data => setIncidencias(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarPagosRecientes() {
    fetch("http://localhost:3000/api/dashboard/pagos-recientes?limite=4")
      .then(res => res.json())
      .then(data => setPagos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  function cargarAvisosVigentes() {
    fetch("http://localhost:3000/api/dashboard/avisos-vigentes?limite=3")
      .then(res => res.json())
      .then(data => setAvisos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const pctOcupacion = kpis && kpis.puestos_totales
    ? Math.round((kpis.puestos_ocupados / kpis.puestos_totales) * 100)
    : 0;

  const ingresosFmt = kpis
    ? `$${Number(kpis.ingresos_mes).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
    : '$0';

  const maxGiro = giros.length ? Math.max(...giros.map(g => g.num)) : 1;

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

      {/* Fila principal */}
      <div className="lower-grid">

        {/* Ocupación por giro */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Ocupación por giro comercial</span>
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/locatarios')}><i className="fa-solid fa-arrow-right"></i> Ver detalle</button>
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
                      <div
                        className="giro-bar-fill"
                        style={{ width: `${Math.round((g.num / maxGiro) * 100)}%` }}
                      ></div>
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
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/incidencias')}>Ver todas <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="panel-body">
            <div className="incidencias-lista">
              {incidencias.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>Sin incidencias activas</p>
              ) : (
                incidencias.map((inc) => (
                  <div
                    className={`incidencia-item ${inc.severidad}`}
                    key={inc.id_incidencia}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/incidencias?verIncidencia=${inc.id_incidencia}`)}
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
            <button className="accion-btn" onClick={() => navigate('/locatarios?nuevo=1')}><i className="fa-solid fa-user-plus"></i> Nuevo locatario</button>
            <button className="accion-btn" onClick={() => navigate('/incidencias?nuevoAviso=1')}><i className="fa-solid fa-bullhorn"></i> Publicar aviso</button>
            <button className="accion-btn" onClick={() => navigate('/puestos?filtro=disponible')}><i className="fa-solid fa-shop"></i> Puestos libres</button>
            <button className="accion-btn" onClick={() => navigate('/pagos?todos=1')}><i className="fa-solid fa-file-chart-column"></i> Generar reporte</button>
            <button className="accion-btn" onClick={() => navigate('/locatarios?estado=Moroso')}><i className="fa-solid fa-user-xmark"></i> Ver morosos</button>
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="mid-grid">

        {/* Pagos recientes */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Pagos recientes</span>
            <button className="panel-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/pagos?todos=1')}>Ver todos <i className="fa-solid fa-arrow-right"></i></button>
          </div>
          <div className="panel-body">
            <div className="pagos-lista">
              {pagos.length === 0 ? (
                <p style={{ fontSize: 13, color: '#999', padding: '8px 0' }}>Sin pagos registrados</p>
              ) : (
                pagos.map((p) => {
                  const badge = BADGE_PAGO[p.estado] || BADGE_PAGO.pendiente;
                  return (
                    <div className="pago-item" key={p.id_usuario + '-' + p.puesto}>
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