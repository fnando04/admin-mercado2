import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './GestionPagos.css';
import { API_URL } from "../config";


const NOMBRES_MES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Genera los últimos `cantidad` meses (incluyendo el actual) para los selects
function generarOpcionesMeses(cantidad = 12) {
  const opciones = [];
  const hoy = new Date();
  for (let i = 0; i < cantidad; i++) {
    const f = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const mes = f.getMonth() + 1;
    const anio = f.getFullYear();
    opciones.push({ mes, anio, label: `${NOMBRES_MES[mes]} ${anio}`, todos: false });
  }
  return opciones;
}

const OPCION_TODOS = { todos: true, mes: null, anio: null, label: "Todos los meses" };
const OPCIONES_MES = [OPCION_TODOS, ...generarOpcionesMeses(12)];
const MESES_PARA_PAGAR = OPCIONES_MES.filter(o => !o.todos); // el modal de "registrar pago" nunca usa "todos"


export default function GestionPagos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filtros, setFiltros] = useState({ pagado: false, pendiente: false, moroso: false });
  const [pagosData, setPagosData] = useState([]);
  const [detallePago, setDetallePago] = useState(null);

  const [modalNotificar, setModalNotificar] = useState(false);
  const [filaNotificar, setFilaNotificar] = useState(null);
  const [enviandoNotificacion, setEnviandoNotificacion] = useState(false);

  // Mes que se está viendo/generando en la tabla (respeta ?todos=1 si viene del Dashboard)
  const [mesSeleccionado, setMesSeleccionado] = useState(
    searchParams.get('todos') === '1' ? OPCION_TODOS : OPCIONES_MES[0]
  );

  // Modal de "Registrar pago"
  const [modalPago, setModalPago] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [mesModalPago, setMesModalPago] = useState(MESES_PARA_PAGAR[0]);
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10));

  const toggleFiltro = (key) => setFiltros(f => ({ ...f, [key]: !f[key] }));

  const algunFiltroActivo = filtros.pagado || filtros.pendiente || filtros.moroso;
  const pagosFiltrados = algunFiltroActivo
    ? pagosData.filter(p => {
      if (filtros.pagado && p.estado_pago === "pagado") return true;
      if (filtros.pendiente && p.estado_pago === "pendiente") return true;
      if (filtros.moroso && p.estado_pago === "vencido") return true;
      return false;
    })
    : pagosData;

  const totalLocatarios = new Set(pagosData.map(p => p.id_puesto)).size;
  const conteo = {
    pagado: pagosData.filter(p => p.estado_pago === 'pagado').length,
    pendiente: pagosData.filter(p => p.estado_pago === 'pendiente').length,
    moroso: pagosData.filter(p => p.estado_pago === 'vencido').length,
  };

  useEffect(() => {
    fetch(API_URL + "/api/pagos/actualizar-vencidos", { method: "POST" })
      .catch(err => console.error(err));

    if (searchParams.get('todos')) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    cargarPagos(mesSeleccionado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSeleccionado]);

  function cargarPagos(periodo = mesSeleccionado) {
    const url = periodo.todos
      ? API_URL + "/api/pagos/puestos?todos=1"
      : `${API_URL}/api/pagos/puestos?mes=${periodo.mes}&anio=${periodo.anio}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setPagosData(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  async function generarMes() {
    if (mesSeleccionado.todos) {
      alert("Selecciona un mes específico (no 'Todos los meses') para poder generarlo");
      return;
    }
    try {
      const res = await fetch(API_URL + "/api/pagos/generar-mes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes: mesSeleccionado.mes, anio: mesSeleccionado.anio })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo generar el mes");
        return;
      }
      alert(data.mensaje || `Pagos generados para ${mesSeleccionado.label}`);
      cargarPagos(mesSeleccionado);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al generar el mes");
    }
  }

  function verDetalle(p) {
    setDetallePago(p);
  }

  function abrirNotificar(p) {
    setFilaNotificar(p);
    setModalNotificar(true);
  }

  async function confirmarNotificar() {
    if (!filaNotificar) return;
    setEnviandoNotificacion(true);
    try {
      const res = await fetch(`${API_URL}/api/pagos/enviar-recordatorio/${filaNotificar.id_pago}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo enviar el recordatorio");
        return;
      }
      alert(data.mensaje);
      setModalNotificar(false);
      setFilaNotificar(null);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al enviar el recordatorio");
    } finally {
      setEnviandoNotificacion(false);
    }
  }

  function abrirRegistrarPago(p) {
    setFilaSeleccionada(p);
    const mesPorDefault = mesSeleccionado.todos
      ? MESES_PARA_PAGAR.find(o => o.mes === p.mes_pagado && o.anio === p.anio_pagado) || MESES_PARA_PAGAR[0]
      : mesSeleccionado;
    setMesModalPago(mesPorDefault);
    setFechaPago(new Date().toISOString().slice(0, 10));
    setModalPago(true);
  }

  async function confirmarPago() {
    if (!filaSeleccionada) return;

    try {
      const res = await fetch(API_URL + "/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_puesto: filaSeleccionada.id_puesto,
          mes: mesModalPago.mes,
          anio: mesModalPago.anio,
          fecha_pago: fechaPago
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo registrar el pago");
        return;
      }

      alert(data.mensaje || "Pago registrado");
      setModalPago(false);
      setFilaSeleccionada(null);
      cargarPagos(mesSeleccionado);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar el pago");
    }
  }

  const generarIniciales = (nombre) =>
    nombre ? nombre.split(" ").map(n => n[0]).join("") : "";

  const etiquetaEstado = (estado) => {
    if (!estado) return "Sin estado";
    if (estado === "sin_generar") return "Sin generar";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  function generarComprobantePDF() {
    const filas = pagosFiltrados;
    const fechaGeneracion = new Date().toLocaleDateString("es-MX");

    const filasHtml = filas.map(p => `
      <tr>
        <td>${p.id_puesto}</td>
        <td>${p.nombre || "—"}</td>
        <td>${p.giro_comercial || "—"}</td>
        ${mesSeleccionado.todos ? `<td>${NOMBRES_MES[p.mes_pagado]} ${p.anio_pagado}</td>` : ""}
        <td>${p.vence || "—"}</td>
        <td>${etiquetaEstado(p.estado_pago)}</td>
        <td>${p.ultimo_pago || "—"}</td>
      </tr>
    `).join("");

    const html = `
      <html>
      <head>
        <title>Comprobante de pagos - ${mesSeleccionado.label}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitulo { color: #666; margin-top: 0; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f2f2f2; }
          .resumen { margin-top: 18px; font-size: 12px; }
          .resumen span { margin-right: 20px; }
        </style>
      </head>
      <body>
        <h1>Comprobante de pagos - Mercado</h1>
        <p class="subtitulo">Periodo: ${mesSeleccionado.label} · Generado: ${fechaGeneracion}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Locatario</th>
              <th>Giro comercial</th>
              ${mesSeleccionado.todos ? "<th>Mes</th>" : ""}
              <th>Vence</th>
              <th>Estado</th>
              <th>Último pago</th>
            </tr>
          </thead>
          <tbody>${filasHtml}</tbody>
        </table>
        <div class="resumen">
          <span><b>Total:</b> ${filas.length}</span>
          <span><b>Pagados:</b> ${filas.filter(p => p.estado_pago === 'pagado').length}</span>
          <span><b>Pendientes:</b> ${filas.filter(p => p.estado_pago === 'pendiente').length}</span>
          <span><b>Vencidos:</b> ${filas.filter(p => p.estado_pago === 'vencido').length}</span>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    if (!ventana) {
      alert("Habilita las ventanas emergentes en tu navegador para generar el PDF");
      return;
    }
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  return (
    <div className="content">
      <div className="page-head">
        <h1 className="page-titulo">Gestión de pagos</h1>
        <p className="page-subtitulo">Control de renta mensual y morosidad · {mesSeleccionado.label}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total locatarios</span>
            <div className="stat-icon azul"><i className="fa-solid fa-users"></i></div>
          </div>
          <div className="stat-valor">{totalLocatarios}</div>
          <div className="stat-meta">Activos en el mercado</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pagado</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{conteo.pagado}</div>
          <div className="stat-meta"><b>{pagosData.length > 0 ? Math.round(conteo.pagado / pagosData.length * 100) : 0}%</b> del total</div>
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

      <div className="actions-row">
          <button className="btn btnOutline" onClick={() => setFiltros({ pagado: false, pendiente: false, moroso: false })}>
            <i className="fa-solid fa-list"></i> Todos los pagos
          </button>
        <button className="btn btnOutline" onClick={() => setFiltros({ pagado: false, pendiente: true, moroso: false })}>
          <i className="fa-solid fa-clock"></i> Pagos pendientes
        </button>
        <button className="btn btnDanger" onClick={() => setFiltros({ pagado: false, pendiente: false, moroso: true })}>
          <i className="fa-solid fa-user-xmark"></i> Ver morosos
        </button>
        <div className="actions-spacer"></div>
        <button className="btn btnOutline" onClick={generarMes}>
          <i className="fa-solid fa-plus"></i> Generar pagos de {mesSeleccionado.label}
        </button>
      </div>

      <div className="filtros-bar">
        <div className="filtro-grupo">
          <span className="filtro-label">Mes</span>
          <select
            className="sltMes"
            value={mesSeleccionado.label}
            onChange={e => {
              const opt = OPCIONES_MES.find(o => o.label === e.target.value);
              if (opt) {
                setMesSeleccionado(opt);
                setFiltros({ pagado: false, pendiente: false, moroso: false });
              }
            }}
          >
            {OPCIONES_MES.map(o => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="filtros-spacer"></div>
        <div className="total-chip">Mostrando <b>{pagosFiltrados.length}</b> {mesSeleccionado.todos ? "registros" : "locatarios"}</div>
      </div>

      <div className="tabla-wrap">
        <div className="tabla-header">
          <span className="tabla-titulo">Tabla de pagos</span>
          <span className="tabla-mes-pill">{mesSeleccionado.label}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Locatario</th>
              {mesSeleccionado.todos && <th>Mes</th>}
              <th>Fecha de vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((p) => (
              <tr key={mesSeleccionado.todos ? p.id_pago : p.id_puesto}>
                <td className="td-num">{p.id_puesto}</td>
                <td>
                  <div className="td-nombre-wrap">
                    <div className="nombre-avatar">{generarIniciales(p.nombre)}</div>
                    <span className="td-nombre">{p.nombre}</span>
                  </div>
                </td>
                {mesSeleccionado.todos && (
                  <td>{NOMBRES_MES[p.mes_pagado]} {p.anio_pagado}</td>
                )}
                <td className="td-fecha">{p.vence || "—"}</td>
                <td>
                  <span className={`badge badge-${p.estado_pago}`}>
                    <span className="bdot"></span>
                    {etiquetaEstado(p.estado_pago)}
                  </span>
                </td>
                <td>
                  <div className="td-acciones">
                    {p.estado_pago !== "pagado" && (
                      <button className="btnRegistrarPago" onClick={() => abrirRegistrarPago(p)}>
                        <i className="fa-solid fa-money-bill"></i> Registrar pago
                      </button>
                    )}
                    {(p.estado_pago === "pendiente" || p.estado_pago === "vencido") && (
                      <button
                        className={`btnIconoFila ${
                          p.estado_pago === "vencido" ? "btnVencido" : "btnPendiente"
                        }`}
                        title={
                          p.estado_pago === "vencido"
                            ? "Enviar recordatorio de pago vencido"
                            : "Enviar recordatorio de pago próximo"
                        }
                        onClick={() => abrirNotificar(p)}
                      >
                        <i
                          className={
                            p.estado_pago === "vencido"
                              ? "fas fa-triangle-exclamation"
                              : "fas fa-bell"
                          }
                        ></i>
                      </button>
                    )}
                    <button className="btnIconoFila" onClick={() => verDetalle(p)}>
                      <i className="fa-regular fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {detallePago && (
          <div className="modal-detalle">
            <div className="modal-contenido">
              <h2>Detalle de pago</h2>
              <p><b>Locatario:</b> {detallePago.nombre}</p>
              <p><b>Puesto:</b> {detallePago.numero_puesto}</p>
              <p><b>Giro:</b> {detallePago.giro_comercial}</p>
              <p><b>Estado:</b> {etiquetaEstado(detallePago.estado_pago)}</p>
              <p><b>Último pago:</b> {detallePago.ultimo_pago || "Sin registro"}</p>
              <button onClick={() => setDetallePago(null)}>Cerrar</button>
            </div>
          </div>
        )}

        {modalPago && filaSeleccionada && (
          <div className="modal-detalle">
            <div className="modal-contenido">
              <h2>Registrar pago</h2>
              <p><b>Locatario:</b> {filaSeleccionada.nombre}</p>
              <p><b>Puesto:</b> {filaSeleccionada.numero_puesto}</p>
              <p><b>Mes a pagar:</b> {mesModalPago.label}</p>
              <label>Fecha de pago</label>
              <input
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
              />
              <div style={{ marginTop: "10px" }}>
                <button onClick={confirmarPago}>Confirmar pago</button>
                <button onClick={() => { setModalPago(false); setFilaSeleccionada(null); }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {modalNotificar && filaNotificar && (
          <div className="modal-detalle">
            <div className="modal-contenido">
              <h2>Enviar recordatorio</h2>
              <p>¿Quieres enviarle un recordatorio a <b>{filaNotificar.nombre}</b> sobre su pago {filaNotificar.estado_pago === "vencido" ? "vencido" : "pendiente"}?</p>
              <div style={{ marginTop: "10px" }}>
                <button onClick={confirmarNotificar} disabled={enviandoNotificacion}>
                  {enviandoNotificacion ? "Enviando..." : "Sí, enviar"}
                </button>
                <button onClick={() => { setModalNotificar(false); setFilaNotificar(null); }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="tabla-footer">
          <span className="footer-info">Total: <b>{pagosFiltrados.length}</b> · {mesSeleccionado.label}</span>
          <button className="btnDescargaComprobanteTotalPDF" onClick={generarComprobantePDF}>
            <i className="fa-solid fa-file-arrow-down"></i> Descargar comprobante total PDF
          </button>
        </div>
      </div>
    </div>
  );
}
