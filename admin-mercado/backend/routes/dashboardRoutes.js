const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/kpis', dashboardController.getKpis);
router.get('/ocupacion-giro', dashboardController.getOcupacionGiro);
router.get('/incidencias-activas', dashboardController.getIncidenciasActivas);
router.get('/pagos-recientes', dashboardController.getPagosRecientes);
router.get('/avisos-vigentes', dashboardController.getAvisosVigentes);

module.exports = router;

// En tu app.js / index.js del backend, monta las rutas así:
// const dashboardRoutes = require('./routes/dashboardRoutes');
// app.use('/api/dashboard', dashboardRoutes);