// Ajusta esta ruta al archivo donde tengas tu pool de conexión mysql2/promise
// (el mismo que usan tus otros controllers, ej. incidenciasController.js)
const db = require('../config/db');

// GET /api/dashboard/kpis
exports.getKpis = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_dashboard_kpis()');
    res.json(rows[0][0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los indicadores del dashboard' });
  }
};

// GET /api/dashboard/ocupacion-giro
exports.getOcupacionGiro = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_dashboard_ocupacion_giro()');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la ocupación por giro comercial' });
  }
};

// GET /api/dashboard/incidencias-activas?limite=3
exports.getIncidenciasActivas = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 3;
    const [rows] = await db.query('CALL sp_dashboard_incidencias_activas(?)', [limite]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las incidencias activas' });
  }
};

// GET /api/dashboard/pagos-recientes?limite=4
exports.getPagosRecientes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 4;
    const [rows] = await db.query('CALL sp_dashboard_pagos_recientes(?)', [limite]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los pagos recientes' });
  }
};

// GET /api/dashboard/avisos-vigentes?limite=3
exports.getAvisosVigentes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 3;
    const [rows] = await db.query('CALL sp_dashboard_avisos_vigentes(?)', [limite]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los avisos vigentes' });
  }
};