const db = require("../config/db");

// GET /api/dashboard/kpis
exports.getKpis = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_dashboard_kpis()");
    res.json(rows[0][0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/ocupacion-giro
exports.getOcupacionGiro = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_dashboard_ocupacion_giro()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/incidencias-activas?limite=3
exports.getIncidenciasActivas = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 3;
    const [rows] = await db.query("CALL sp_dashboard_incidencias_activas(?)", [limite]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/pagos-recientes?limite=4
exports.getPagosRecientes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 4;
    const [rows] = await db.query("CALL sp_dashboard_pagos_recientes(?)", [limite]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/dashboard/avisos-vigentes?limite=3
exports.getAvisosVigentes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 3;
    const [rows] = await db.query("CALL sp_dashboard_avisos_vigentes(?)", [limite]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};