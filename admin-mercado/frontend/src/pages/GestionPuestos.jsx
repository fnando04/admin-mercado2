import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import './GestionPuestos.css';

export default function GestionPuestos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [puestosData, setPuestosData] = useState([]);
  const [sel, setSel] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [locatarios, setLocatarios] = useState([]);
  const [filtro, setFiltro] = useState(searchParams.get('filtro') || "todos");

  const puestosFiltrados = puestosData.filter((p) => {

    if (filtro === "todos") return true;

    if (filtro === "disponible") return p.estado === "disponible";

    if (filtro === "asignado") return p.estado === "asignado";

    return true;

  });

  useEffect(() => {
    obtenerPuestos();

    // Si venimos del Dashboard con ?filtro=disponible (o asignado), limpiamos la URL
    if (searchParams.get('filtro')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function abrirModalAsignar() {

    try {

      const respuesta = await fetch(
        "http://localhost:3000/api/puestos/locatarios-disponibles"
      );

      const datos = await respuesta.json();

      setLocatarios(datos);

      setMostrarModal(true);

    } catch (error) {

      console.log(error);

    }

  }

  async function asignarPuesto(idLocatario) {

    try {

      const respuesta = await fetch(
        "http://localhost:3000/api/puestos/asignar",
        {

          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            id_locatario: idLocatario,

            id_puesto: sel.id_puesto

          })

        }
      );

      const datos = await respuesta.json();

      alert(datos.mensaje);

      setMostrarModal(false);

      obtenerPuestos();

    } catch (error) {

      console.log(error);

    }

  }

  return (
    <div className="content">
      <div className="page-head">
        <h1 className="page-titulo">Gestión de puestos</h1>
        <p className="page-subtitulo">Mercado Municipal</p>
      </div>

      <div className="main-layout">

        {/* ── Panel izquierdo: mapa ── */}
        <div className="mapa-panel">
          <div className="leyenda">
            <span
              className={`leyenda-pill lp-todos ${filtro === "todos" ? "activo" : ""}`}
              onClick={() => setFiltro("todos")}
            >
              <span className="ldot" />Todos
            </span>
            <span
              className={`leyenda-pill lp-disponible ${filtro === "disponible" ? "activo" : ""}`}
              onClick={() => setFiltro("disponible")}
            >
              <span className="ldot" />Disponibles
            </span>
            <span
              className={`leyenda-pill lp-asignado ${filtro === "asignado" ? "activo" : ""}`}
              onClick={() => setFiltro("asignado")}
            >
              <span className="ldot" />Ocupados
            </span>

          </div>

          <div className="puestos-grid">
            {puestosFiltrados.map((p) => (
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

            {sel?.estado === "disponible" ? (

              <button
                className="btn-accion"
                onClick={abrirModalAsignar}
              >

                <span className="left">

                  <i className="fa-solid fa-user-plus" />

                  Asignar locatario

                </span>

              </button>

            ) : (

              <button
                className="btn-accion"
                onClick={liberarPuesto}
              >

                <span className="left">

                  <i className="fa-solid fa-lock-open" />

                  Liberar puesto

                </span>

              </button>

            )}

          </div>
        </div>
      </div>
      {
        mostrarModal && (

          <div className="modal-fondo">

            <div className="modal-asignar">

              <h2>Seleccionar locatario</h2>

              {

                locatarios.length === 0 ?

                  (

                    <p>No hay locatarios disponibles.</p>

                  )

                  :

                  (

                    locatarios.map((l) => (

                      <div
                        key={l.id_usuario}
                        className="loc-item"
                      >

                        <div>

                          <strong>{l.nombre}</strong>

                          <br />

                          {l.giro_comercial}

                        </div>

                        <button
                          onClick={() => asignarPuesto(l.id_usuario)}
                        >

                          Asignar

                        </button>

                      </div>

                    ))

                  )

              }

              <button
                className="cerrar-modal"
                onClick={() => setMostrarModal(false)}
              >

                Cerrar

              </button>

            </div>

          </div>

        )
      }
    </div>
  );
}