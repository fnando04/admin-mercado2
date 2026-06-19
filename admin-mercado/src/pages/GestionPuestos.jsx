import { useState } from 'react';
import './GestionPuestos.css';

const puestosData = [
  { num: 'A-01', nombre: null,             giro: null,         pago: null,           estado: 'disponible' },
  { num: 'A-02', nombre: 'Isaí Robles',    giro: 'Comida',     pago: '10 Mayo 2026', estado: 'ocupado'    },
  { num: 'B-04', nombre: 'Raúl Lora',      giro: 'Tecnología', pago: '03 Abr 2026',  estado: 'moroso'     },
  { num: 'C-09', nombre: 'Pedro Bautista', giro: 'Celulares',  pago: '01 Mar 2026',  estado: 'ocupado'    },
  { num: 'D-04', nombre: 'José Mendoza',   giro: 'Verdulería', pago: '14 Feb 2026',  estado: 'moroso'     },
  { num: 'E-01', nombre: null,             giro: null,         pago: null,           estado: 'disponible' },
];

export default function GestionPuestos() {
  const [sel, setSel] = useState(puestosData[1]);

  return (
    <div className="content">
      <div className="page-head">
        <h1 className="page-titulo">Gestión de puestos</h1>
        <p className="page-subtitulo">Mapa visual de ocupación · Mercado Municipal</p>
      </div>

      <div className="main-layout">

        {/* ── Panel izquierdo: mapa ── */}
        <div className="mapa-panel">
          <div className="leyenda">
            <span className="leyenda-pill lp-disponible">
              <span className="ldot" />Disponibles
            </span>
            <span className="leyenda-pill lp-ocupado">
              <span className="ldot" />Ocupados
            </span>
            <span className="leyenda-pill lp-moroso">
              <span className="ldot" />Morosos
            </span>
          </div>

          <div className="puestos-grid">
            {puestosData.map((p) => (
              <div
                key={p.num}
                className={`puesto-card ${p.estado}${sel?.num === p.num ? ' seleccionado' : ''}`}
                onClick={() => setSel(p)}
              >
                <span className="puesto-id">{p.num}</span>
                <span className="puesto-nombre">{p.nombre ?? 'Disponible'}</span>
                {p.giro && <span className="puesto-giro">{p.giro}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho: detalle ── */}
        <div className="detalle-panel">
          <div className="detalle-header">
            <div className="detalle-header-label">Puesto</div>
            <div className="detalle-header-id">{sel?.num ?? '—'}</div>
          </div>

          <div className="detalle-body">
            <div className="detalle-row">
              <div className="detalle-icon">
                <i className="fa-regular fa-user" />
              </div>
              <div className="detalle-info">
                <span className="detalle-key">Locatario</span>
                <span className="detalle-val">{sel?.nombre ?? '—'}</span>
              </div>
            </div>

            <div className="detalle-row">
              <div className="detalle-icon">
                <i className="fa-solid fa-bag-shopping" />
              </div>
              <div className="detalle-info">
                <span className="detalle-key">Giro comercial</span>
                <span className="detalle-val">{sel?.giro ?? '—'}</span>
              </div>
            </div>

            <div className="detalle-row">
              <div className="detalle-icon">
                <i className="fa-regular fa-calendar" />
              </div>
              <div className="detalle-info">
                <span className="detalle-key">Último pago</span>
                <span className="detalle-val">{sel?.pago ?? '—'}</span>
              </div>
            </div>

            <div className="detalle-row">
              <div className="detalle-icon">
                <i className="fa-regular fa-circle-check" />
              </div>
              <div className="detalle-info">
                <span className="detalle-key">Estado</span>
                {sel ? (
                  <span className={`badge badge-${sel.estado}`}>
                    <span className="bdot" />
                    {sel.estado.charAt(0).toUpperCase() + sel.estado.slice(1)}
                  </span>
                ) : (
                  <span className="detalle-val">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="detalle-acciones">
            <button className="btn-accion">
              <span className="left">
                <i className="fa-solid fa-pen-to-square" />
                Cambiar estado
              </span>
              <i className="fa-solid fa-chevron-right chevron" />
            </button>
            <button className="btn-accion">
              <span className="left">
                <i className="fa-solid fa-lock-open" />
                Liberar puesto
              </span>
              <i className="fa-solid fa-chevron-right chevron" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
