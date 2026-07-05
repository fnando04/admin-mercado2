const db = require("../config/db");

// Si no llegan mes/anio por query o body, se usa el mes actual
function mesActual() {
  const hoy = new Date();
  return { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
}

// LISTA PARA LA TABLA PRINCIPAL
// - ?mes=&anio=      -> estado de pago de ese mes específico
// - ?todos=1         -> historial completo de pagos generados (todos los meses)
exports.listarPuestosPagos = async (req, res) => {
  try {
    const { mes, anio, todos } = req.query;

    if (todos === "1" || todos === "true") {
      const [rows] = await db.query("CALL sp_listar_pagos_todos()");
      return res.json(rows[0]);
    }

    let mesFinal = mes;
    let anioFinal = anio;
    if (!mesFinal || !anioFinal) {
      const actual = mesActual();
      mesFinal = mesFinal || actual.mes;
      anioFinal = anioFinal || actual.anio;
    }

    const [rows] = await db.query("CALL sp_listar_puestos_mes(?, ?)", [mesFinal, anioFinal]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REGISTRAR / MARCAR UN PAGO COMO PAGADO (id_puesto, mes, anio, fecha_pago)
exports.registrarPago = async (req, res) => {
  try {
    const { id_puesto, mes, anio, fecha_pago } = req.body;

    if (!id_puesto || !mes || !anio) {
      return res.status(400).json({ error: "Faltan datos: id_puesto, mes y anio son obligatorios" });
    }

    await db.query(
      "CALL sp_registrar_pago_puesto(?, ?, ?, ?)",
      [id_puesto, mes, anio, fecha_pago || null]
    );

    res.json({ mensaje: "Pago registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GENERAR PAGOS DEL MES (todos los locatarios asignados) para el mes que elija el admin
exports.generarMes = async (req, res) => {
  try {
    const { mes, anio } = req.body;
    if (!mes || !anio) {
      return res.status(400).json({ error: "Selecciona un mes específico (no 'Todos los meses') para generar pagos" });
    }

    await db.query("CALL sp_generar_pagos_mes(?, ?)", [mes, anio]);
    res.json({ mensaje: "Mes generado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACTUALIZAR VENCIDOS
exports.actualizarVencidos = async (req, res) => {
  try {
    await db.query("CALL sp_actualizar_vencidos()");
    res.json({ mensaje: "Vencidos actualizados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};