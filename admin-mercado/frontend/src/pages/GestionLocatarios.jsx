import { useMemo, useState } from 'react';
import PageLayout from './PageLayout';
import './GestionLocatarios.css';

const LOCATARIOS = [
  { num: 'A-12', iniciales: 'IS', nombre: 'Isaí Santos R.', giro: 'Comida', estado: 'Activo', correo: 'santosrob@gmail.com' },
  { num: 'B-04', iniciales: 'RL', nombre: 'Raúl Lora', giro: 'Tecnología', estado: 'Moroso', correo: 'raulira04@gmail.com' },
  { num: 'C-09', iniciales: 'PB', nombre: 'Pedro Bautista', giro: 'Celulares', estado: 'Suspendido', correo: 'pedroty@gmail.com' },
  { num: 'D-04', iniciales: 'JM', nombre: 'José Mendoza', giro: 'Verdulería', estado: 'Moroso', correo: 'josse39men@gmail.com' },
  { num: 'E-07', iniciales: 'RZ', nombre: 'Rodrigo Zuñiga', giro: 'Abarrotes', estado: 'Activo', correo: 'rodzu1@gmail.com' },
  { num: 'F-02', iniciales: 'JG', nombre: 'Javier Gonzales', giro: 'Tortillería', estado: 'Suspendido', correo: 'javig560@gmail.com' },
  { num: 'G-05', iniciales: 'JV', nombre: 'Julián Vargas M.', giro: 'Carnicería', estado: 'Activo', correo: 'vargasjul04@gmail.com' },
];

const GIROS = ['Comida', 'Tecnología', 'Celulares', 'Verdulería', 'Abarrotes', 'Tortillería', 'Carnicería'];

const BADGE_CLASE = {
  Activo: 'badge-activo',
  Moroso: 'badge-moroso',
  Suspendido: 'badge-suspendido',
};

export default function GestionLocatarios() {
  const [busqueda, setBusqueda] = useState('');
  const [giro, setGiro] = useState('');
  const [estado, setEstado] = useState('');

  const filtrados = useMemo(() => {
    return LOCATARIOS.filter((l) => {
      const coincideBusqueda = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideGiro = !giro || l.giro === giro;
      const coincideEstado = !estado || l.estado === estado;
      return coincideBusqueda && coincideGiro && coincideEstado;
    });
  }, [busqueda, giro, estado]);

  const totales = useMemo(() => ({
    total: LOCATARIOS.length,
    activos: LOCATARIOS.filter((l) => l.estado === 'Activo').length,
    morosos: LOCATARIOS.filter((l) => l.estado === 'Moroso').length,
    suspendidos: LOCATARIOS.filter((l) => l.estado === 'Suspendido').length,
  }), []);

  const pctActivos = Math.round((totales.activos / totales.total) * 100);

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
        <button className="btn btnOutline">
          <i className="fa-solid fa-user-xmark"></i> Ver morosos
        </button>
        <button className="btn btnDanger">
          <i className="fa-solid fa-ban"></i> Ver suspendidos
        </button>
        <div className="actions-spacer"></div>
        <button className="btnRegistrar">
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
            placeholder="Buscar nombre o CURP…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtro-grupo">
          <span className="filtro-label">Giro</span>
          <select className="filtro-select" value={giro} onChange={(e) => setGiro(e.target.value)}>
            <option value="">Giro de comercio</option>
            {GIROS.map((g) => <option key={g} value={g}>{g}</option>)}
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
        <div className="filtro-grupo" style={{ justifyContent: 'flex-end' }}>
          <span className="filtro-label">&nbsp;</span>
          <button className="btn-buscar"><i className="fa-solid fa-magnifying-glass"></i> Buscar</button>
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
              <tr key={l.num}>
                <td className="td-num">{l.num}</td>
                <td>
                  <div className="td-nombre-wrap">
                    <div className="nombre-avatar">{l.iniciales}</div>
                    <span className="td-nombre">{l.nombre}</span>
                  </div>
                </td>
                <td className="td-giro">{l.giro}</td>
                <td>
                  <span className={`badge ${BADGE_CLASE[l.estado]}`}>
                    <span className="bdot"></span>{l.estado}
                  </span>
                </td>
                <td className="td-correo">{l.correo}</td>
                <td>
                  <div className="td-acciones">
                    <button className="btnIconoFila" title="Ver detalle"><i className="fa-regular fa-eye"></i></button>
                    <button className="btnIconoFila" title="Editar"><i className="fa-regular fa-pen-to-square"></i></button>
                    <button className="btnIconoFila danger" title="Suspender"><i className="fa-solid fa-ban"></i></button>
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
          <button className="btnRegistrar">
            <i className="fa-solid fa-plus"></i> Registrar locatario
          </button>
        </div>
      </div>

    </PageLayout>
  );
}
