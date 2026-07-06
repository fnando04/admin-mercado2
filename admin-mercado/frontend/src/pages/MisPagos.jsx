import { useState, useEffect } from 'react';
import LocatarioLayout from './LocatarioLayout';
import './LocatarioPanel.css';

const NOMBRES_MES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const TIPOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
];

export default function MisPagos() {
  const [pagos, setPagos] = useState([]);
  const [idLocatario, setIdLocatario] = useState(null);

  const [modalPago, setModalPago] = useState(false);
  const [filaSeleccionada, setFilaSeleccionada] = useState(null);
  const [tipoPago, setTipoPago] = useState('efectivo');

  useEffect(() => {
    const guardado = localStorage.getItem('usuario');
    const usuario = guardado ? JSON.parse(guardado) : null;
    if (!usuario) return;
    setIdLocatario(usuario.id);
    cargarPagos(usuario.id);
  }, []);

  function cargarPagos(id) {
    fetch(`http://localhost:3000/api/locatario/mis-pagos?id_locatario=${id}`)
      .then(res => res.json())
      .then(data => setPagos(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }

  const etiquetaEstado = (estado) => {
    if (!estado) return "Sin estado";
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const etiquetaTipoPago = (tipo) => {
    if (!tipo) return "—";
    const encontrado = TIPOS_PAGO.find(t => t.value === tipo);
    return encontrado ? encontrado.label : tipo;
  };

  const totalPagos = pagos.length;
  const pagados = pagos.filter(p => p.estado_pago === 'pagado').length;
  const pendientesOVencidos = pagos.filter(p => p.estado_pago === 'pendiente' || p.estado_pago === 'vencido').length;

  function abrirPago(p) {
    setFilaSeleccionada(p);
    setTipoPago('efectivo');
    setModalPago(true);
  }

  async function confirmarPago() {
    if (!filaSeleccionada || !idLocatario) return;
    try {
      const res = await fetch("http://localhost:3000/api/locatario/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_locatario: idLocatario,
          mes: filaSeleccionada.mes_pagado,
          anio: filaSeleccionada.anio_pagado,
          tipo_pago: tipoPago
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
      cargarPagos(idLocatario);
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar el pago");
    }
  }

  return (
    <LocatarioLayout>
      <div className="page-head">
        <h1 className="page-titulo">Mis pagos</h1>
        <p className="page-subtitulo">Historial y pago de tu renta mensual</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total registros</span>
            <div className="stat-icon azul"><i className="fa-solid fa-list"></i></div>
          </div>
          <div className="stat-valor">{totalPagos}</div>
          <div className="stat-meta">Meses con historial</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Pagados</span>
            <div className="stat-icon verde"><i className="fa-solid fa-circle-check"></i></div>
          </div>
          <div className="stat-valor">{pagados}</div>
          <div className="stat-meta">Al corriente</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Por pagar</span>
            <div className="stat-icon rojo"><i className="fa-solid fa-triangle-exclamation"></i></div>
          </div>
          <div className="stat-valor">{pendientesOVencidos}</div>
          <div className="stat-meta">Pendientes o vencidos</div>
        </div>
      </div>

      <div className="tabla-wrap">
        <div className="tabla-header">
          <span className="tabla-titulo">Historial de pagos</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Tipo de pago</th>
              <th>Fecha de pago</th>
              <th>Vence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                  Aún no tienes pagos generados
                </td>
              </tr>
            ) : (
              pagos.map(p => (
                <tr key={p.id_pago}>
                  <td>{NOMBRES_MES[p.mes_pagado]} {p.anio_pagado}</td>
                  <td>${Number(p.monto).toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${p.estado_pago}`}>
                      <span className="bdot"></span>
                      {etiquetaEstado(p.estado_pago)}
                    </span>
                  </td>
                  <td>{etiquetaTipoPago(p.tipo_pago)}</td>
                  <td>{p.fecha_pago || "—"}</td>
                  <td>{p.fecha_limite || "—"}</td>
                  <td>
                    {p.estado_pago !== 'pagado' && (
                      <button className="btn btnPrimary" onClick={() => abrirPago(p)}>
                        <i className="fa-solid fa-money-bill"></i> Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: PAGAR */}
      {modalPago && filaSeleccionada && (
        <div className="modal-detalle">
          <div className="modal-contenido">
            <h2>Registrar pago</h2>

            <p><b>Mes:</b> {NOMBRES_MES[filaSeleccionada.mes_pagado]} {filaSeleccionada.anio_pagado}</p>
            <p><b>Monto:</b> ${Number(filaSeleccionada.monto).toFixed(2)}</p>

            <label>Tipo de pago</label>
            <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
              {TIPOS_PAGO.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <div style={{ marginTop: '10px' }}>
              <button onClick={confirmarPago}>Confirmar pago</button>
              <button onClick={() => { setModalPago(false); setFilaSeleccionada(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LocatarioLayout>
  );
}