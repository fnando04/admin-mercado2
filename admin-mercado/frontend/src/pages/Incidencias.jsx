import PageLayout from './PageLayout';
import './Incidencias.css';

const INCIDENCIAS = [
  { titulo: 'Cortocircuito', sub: 'Pasillo C, Fuga Agua', puesto: 'Puesto #10', badge: 'Abierta', badgeClase: 'badge-dark', fecha: ['25 mayo', '10:00 am'] },
  { titulo: 'Cortocircuito', sub: 'Pasillo A, Fuga Agua', puesto: 'Puesto #9', badge: 'En Proceso', badgeClase: 'badge-proceso', fecha: ['25 mayo', '11:00 am'] },
  { titulo: 'Cortocircuito', sub: 'Pasillo B, Fuga Agua', puesto: 'Puesto #9', badge: '#152', badgeClase: 'badge-dark', fecha: ['26 mayo', '3:00 pm'] },
];

const INCIDENCIAS_2 = [
  { titulo: 'Cortocircuito', sub: 'Pasillo E, Fuga Agua', puesto: 'Puesto #9', badge: '#230', badgeClase: 'badge-dark', fecha: ['27 mayo', '9:00 am'] },
  { titulo: 'Cortocircuito', sub: 'Pasillo D, Fuga Agua', puesto: 'Puesto #9', badge: 'En Proceso', badgeClase: 'badge-proceso', fecha: ['27 mayo', '10:00 am'] },
];

const AVISOS = [
  { titulo: 'Suspensión de agua', texto: 'Suspensión de agua en colonias de Tizayuca desde el 20 de Mayo.' },
  { titulo: 'Fumigación', texto: 'Registro para iniciar la fumigación en las colonias solicitadas.' },
  { titulo: 'Reactivación de agua', texto: 'Se reactiva el sistema de agua a las colonias donde fueron suspendidas a partir del 30 de Mayo.' },
  { titulo: 'Fallo de Electricidad', texto: 'Revisión en algunas colonias sobre la electricidad.' },
];

const NOTIFICACIONES_RT = ['Suspensión de agua', 'Fumigación', 'Conflicto entre locatarios', 'Falla eléctrica'];

function FilaIncidencia({ inc }) {
  return (
    <tr>
      <td className="td-titulo">{inc.titulo}<span>{inc.sub}</span></td>
      <td className="td-puesto">{inc.puesto}</td>
      <td><span className={`badge ${inc.badgeClase}`}>{inc.badge}</span></td>
      <td><div className="estado-text"><span className="bdot" style={{ background: '#C83030' }}></span> Abierta</div></td>
      <td className="td-fecha">{inc.fecha[0]}<br />{inc.fecha[1]}</td>
    </tr>
  );
}

export default function Incidencias() {
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
                <th>Estado (Badges)</th>
                <th>Severidad</th>
                <th>Última Acción</th>
              </tr>
            </thead>
            <tbody>
              {INCIDENCIAS.map((inc, i) => <FilaIncidencia inc={inc} key={`a-${i}`} />)}

              {/* Fila de Evidencia Integrada */}
              <tr>
                <td colSpan={5} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  <div className="evidencia-box">
                    <p>Evidencia: <strong>agua</strong></p>
                    <p>Título: <strong>(Fuga de Agua)</strong></p>
                    <div className="evidencia-img"><i className="fa-regular fa-image"></i></div>
                  </div>
                </td>
              </tr>

              {INCIDENCIAS_2.map((inc, i) => <FilaIncidencia inc={inc} key={`b-${i}`} />)}
            </tbody>
          </table>
          <div className="btn-container">
            <button className="btnOutline"><i className="fa-solid fa-list"></i> Ver historial completo</button>
          </div>
        </div>

        {/* COLUMNA DERECHA: AVISOS */}
        <div className="panel-wrap">
          <div className="panel-header">
            <span className="panel-titulo">Avisos y Notificaciones</span>
          </div>
          <div className="avisos-content">

            {AVISOS.map((a, i) => (
              <div className="aviso-item" key={i}>
                <div className="aviso-icon"><i className="fa-solid fa-bullhorn"></i></div>
                <div className="aviso-text">
                  <h4>{a.titulo}</h4>
                  <p>{a.texto}</p>
                </div>
              </div>
            ))}

            {/* Caja de Tiempo Real */}
            <div className="rt-panel">
              <div className="rt-title">Notificaciones en tiempo real</div>
              {NOTIFICACIONES_RT.map((n, i) => (
                <div className="rt-item" key={i}>{n}</div>
              ))}
            </div>

          </div>
          <div className="btn-container">
            <button className="btnPrimary"><i className="fa-solid fa-gear"></i> Administrar Avisos</button>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
