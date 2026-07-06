const db = require("../config/db");

// INFO BÁSICA DEL LOCATARIO LOGUEADO
exports.miInfo = async (req, res) => {
  try {
    const { id_locatario } = req.query;
    if (!id_locatario) return res.status(400).json({ error: "Falta id_locatario" });

    const [rows] = await db.query("CALL sp_mi_info_locatario(?)", [id_locatario]);
    res.json(rows[0][0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HISTORIAL DE PAGOS DEL LOCATARIO LOGUEADO
exports.misPagos = async (req, res) => {
  try {
    const { id_locatario } = req.query;
    if (!id_locatario) return res.status(400).json({ error: "Falta id_locatario" });

    const [rows] = await db.query("CALL sp_listar_mis_pagos(?)", [id_locatario]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EL LOCATARIO REGISTRA SU PROPIO PAGO (elige mes y tipo de pago)
exports.pagar = async (req, res) => {
  try {
    const { id_locatario, mes, anio, tipo_pago } = req.body;

    if (!id_locatario || !mes || !anio || !tipo_pago) {
      return res.status(400).json({ error: "Faltan datos: id_locatario, mes, anio y tipo_pago son obligatorios" });
    }

    await db.query("CALL sp_pagar_como_locatario(?, ?, ?, ?)", [id_locatario, mes, anio, tipo_pago]);
    res.json({ mensaje: "Pago registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// INCIDENCIAS DEL LOCATARIO LOGUEADO
exports.misIncidencias = async (req, res) => {
  try {
    const { id_locatario } = req.query;
    if (!id_locatario) return res.status(400).json({ error: "Falta id_locatario" });

    const [rows] = await db.query("CALL sp_listar_mis_incidencias(?)", [id_locatario]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EL LOCATARIO REPORTA UNA NUEVA INCIDENCIA
exports.crearIncidencia = async (req, res) => {
  try {
    const { id_locatario, titulo, descripcion } = req.body;

    if (!id_locatario || !titulo || !descripcion) {
      return res.status(400).json({ error: "Faltan datos: titulo y descripcion son obligatorios" });
    }

    await db.query("CALL sp_abrir_incidencia(?, ?, ?)", [id_locatario, titulo, descripcion]);
    res.json({ mensaje: "Incidencia registrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};