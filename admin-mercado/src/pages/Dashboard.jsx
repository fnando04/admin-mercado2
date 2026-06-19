import PageLayout from './PageLayout';
import './Dashboard.css';

const GIROS = [
  { nombre: 'Alimentos y bebidas', num: 16, pct: 80 },
  { nombre: 'Ropa y calzado', num: 10, pct: 50 },
  { nombre: 'Abarrotes', num: 8, pct: 40 },
  { nombre: 'Artesanías', num: 5, pct: 25 },
  { nombre: 'Otros', num: 2, pct: 10 },
];

const INCIDENCIAS = [
  { severidad: 'media', titulo: 'Falla eléctrica', meta: 'Puesto #10 · En proceso · 2h', status: 'En proceso' },
  { severidad: 'alta', titulo: 'Conflicto entre locatarios', meta: 'Puestos #1 y #8 · Abierta · ayer', status: 'Abierta' },
  { severidad: 'media', titulo: 'Falla eléctrica', meta: 'Puesto #10 · En proceso · 2h', status: 'En proceso' },
];

const PAGOS = [
  { iniciales: 'MA', nombre: 'Maria Alvarado', puesto: 'Puesto #10 · Ropa', estado: 'pagado' },
  { iniciales: 'RL', nombre: 'Roberto López', puesto: 'Puesto #7 · Verduras', estado: 'pendiente' },
  { iniciales: 'CE', nombre: 'Carmen Estrada', puesto: 'Puesto #2 · Abarrotes', estado: 'moroso' },
  { iniciales: 'LP', nombre: 'Lucia Pérez', puesto: 'Puesto #33 · Ropa', estado: 'pendiente' },
];

const AVISOS = [
  { icon: 'fa-droplet-slash', texto: 'Suspensión de agua', fecha: 'Martes 20 mayo' },
  { icon: 'fa-users', texto: 'Reunión mensual', fecha: '25 mayo, 10am' },
  { icon: 'fa-credit-card', texto: 'Recordatorio: pago antes del día 5', fecha: 'Aviso permanente' },
];

const BADGE_PAGO = {
  pagado: { clase: 'badge-pagado-sm', label: 'Pagado' },
  pendiente: { clase: 'badge-pendiente-sm', label: 'Pendiente' },
  moroso: { clase: 'badge-moroso-sm', label: 'Moroso' },
};

const AVATAR_ROJO = new Set(['RL', 'CE']);

export default function Dashboard() {
  return (
    <PageLayout>

      {/* Bienvenida */}
      <div className="bienvenida-row">
        <div>
          <h1 className="bienvenida-titulo">Bienvenida, Maria</h1>
          <p className="bienvenida-sub">Administrador · Mercado municipal Tizayuca</p>
        </div>
        <span className="bienvenida-fecha">Mayo 2026</span>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-users"></i> Locatarios</div>
          <div className="kpi-valor">48</div>
          <div className="kpi-sub">Activos en el mercado</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-shop"></i> Puestos ocupados</div>
          <div className="kpi-valor">41<span style={{ fontSize: 16, opacity: 0.6 }}>/50</span></div>
          <div className="kpi-sub">82% de ocupación</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><i className="fa-solid fa-circle-dollar-to-slot"></i> Ingresos</div>
          <div className="kpi-valor" style={{ fontSize: 22 }}>$34,200</div>
          <div className="kpi-sub">Mayo 2026</div>
        </div>
        <div className="kpi-card" style={{ background: 'var(--rojo-bg)', border: '1px solid var(--rojo-borde)' }}>
          <div className="kpi-label" style={{ color: 'var(--rojo-text)' }}><i className="fa-solid fa-circle-exclamation"></i> Morosos</div>
          <div className="kpi-valor" style={{ color: 'var(--rojo-text)' }}>5</div>
          <div className="kpi-sub" style={{ color: '#C08080' }}>Requieren seguimiento</div>
        </div>
        <div className="kpi-card" style={{ background: 'var(--ambar-bg)', border: '1px solid #E8C840' }}>
          <div className="kpi-label" style={{ color: 'var(--ambar-text)' }}><i className="fa-solid fa-triangle-exclamation"></i> Incidencias</div>
          <div className="kpi-valor" style={{ color: 'var(--ambar-text)' }}>3</div>
          <div className="kpi-sub" style={{ color: '#B08030' }}>Activas hoy</div>
        </div>
      </div>

      {/* Fila principal */}
      <div className="lower-grid">

        {/* Ocupación por giro */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Ocupación por giro comercial</span>
            <a className="panel-link" href="#"><i className="fa-solid fa-arrow-right"></i> Ver detalle</a>
          </div>
          <div className="panel-body">
            <div className="giro-lista">
              {GIROS.map((g) => (
                <div className="giro-item" key={g.nombre}>
                  <div className="giro-row">
                    <span className="giro-nombre">{g.nombre}</span>
                    <span className="giro-num">{g.num}</span>
                  </div>
                  <div className="giro-bar-track">
                    <div className="giro-bar-fill" style={{ width: `${g.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidencias activas */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Incidencias activas</span>
            <a className="panel-link" href="#">Ver todas <i className="fa-solid fa-arrow-right"></i></a>
          </div>
          <div className="panel-body">
            <div className="incidencias-lista">
              {INCIDENCIAS.map((inc, i) => (
                <div className={`incidencia-item ${inc.severidad}`} key={i}>
                  <div className="inc-dot"></div>
                  <div className="inc-info">
                    <div className="inc-titulo">{inc.titulo}</div>
                    <div className="inc-meta">{inc.meta}</div>
                  </div>
                  <span className="inc-status">{inc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="acciones-panel">
          <div className="acciones-head">
            <span className="acciones-titulo">Acciones rápidas</span>
          </div>
          <div className="acciones-body">
            <button className="accion-btn"><i className="fa-solid fa-user-plus"></i> Nuevo locatario</button>
            <button className="accion-btn"><i className="fa-solid fa-bullhorn"></i> Publicar aviso</button>
            <button className="accion-btn"><i className="fa-solid fa-shop"></i> Puestos libres</button>
            <button className="accion-btn"><i className="fa-solid fa-file-chart-column"></i> Generar reporte</button>
            <button className="accion-btn"><i className="fa-solid fa-user-xmark"></i> Ver morosos</button>
          </div>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="mid-grid">

        {/* Pagos recientes */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-titulo">Pagos recientes</span>
            <a className="panel-link" href="#">Ver todos <i className="fa-solid fa-arrow-right"></i></a>
          </div>
          <div className="panel-body">
            <div className="pagos-lista">
              {PAGOS.map((p, i) => {
                const badge = BADGE_PAGO[p.estado];
                return (
                  <div className="pago-item" key={i}>
                    <div
                      className="pago-avatar"
                      style={AVATAR_ROJO.has(p.iniciales) ? { background: '#FDEEEE', color: '#8A2020' } : undefined}
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
              })}
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
            {AVISOS.map((a, i) => (
              <div className="aviso-item" key={i}>
                <div className="aviso-icon"><i className={`fa-solid ${a.icon}`}></i></div>
                <div>
                  <div className="aviso-texto">{a.texto}</div>
                  <div className="aviso-fecha">{a.fecha}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </PageLayout>
  );
}
