import { useEffect, useState } from "react";
import './GestionPuestos.css';

export default function GestionPuestos() {
  const [puestosData, setPuestosData] = useState([]);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    obtenerPuestos();
  }, []);

  async function obtenerPuestos() {

    try {

      const respuesta = await fetch("http://localhost:3000/api/puestos");

      const datos = await respuesta.json();

      setPuestosData(datos);

      if (datos.length > 0) {
        setSel(datos[0]);
      }

    } catch (error) {

      console.log(error);

    }

  }

  async function liberarPuesto() {

    if (!sel) return;

    const confirmar = window.confirm(
      "¿Deseas liberar este puesto?"
    );

    if (!confirmar) return;

    try {

      const respuesta = await fetch(
        `http://localhost:3000/api/puestos/liberar/${sel.id_puesto}`,
        {
          method: "PUT"
        }
      );

      const datos = await respuesta.json();

      alert(datos.mensaje);

      await obtenerPuestos();

    } catch (error) {

      console.log(error);

      alert("No se pudo liberar el puesto.");

    }

  }

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
                key={p.numero_puesto}
                className={`puesto-card ${p.estado}${sel?.numero_puesto === p.numero_puesto ? ' seleccionado' : ''}`}
                onClick={() => setSel(p)}
              >
                <span className="puesto-id">{p.numero_puesto}</span>
                <span className="puesto-nombre">{p.nombre ?? 'Disponible'}</span>
                {p.giro_comercial && (
                  <span className="puesto-giro">
                    {p.giro_comercial}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho: detalle ── */}
        <div className="detalle-panel">
          <div className="detalle-header">
            <div className="detalle-header-label">Puesto</div>
            <div className="detalle-header-id">{sel?.numero_puesto ?? '—'}</div>
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
                <span className="detalle-val">{sel?.giro_comercial ?? '—'}</span>
              </div>
            </div>

            <div className="detalle-row">
              <div className="detalle-icon">
                <i className="fa-regular fa-calendar" />
              </div>
              <div className="detalle-info">
                <span className="detalle-key">Último pago</span>
                <span className="detalle-val">{sel?.ultimo_pago ?? '—'}</span>
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
            <button
              className="btn-accion"
              onClick={liberarPuesto}
            >
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
