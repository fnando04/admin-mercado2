const express = require("express");
const router = express.Router();
const incidenciasController = require("../controllers/incidenciasController");

router.get("/", incidenciasController.listarIncidencias);
router.get("/abiertas", incidenciasController.incidenciasAbiertas);
router.get("/locatarios-disponibles", incidenciasController.locatariosParaIncidencia);
router.post("/", incidenciasController.abrirIncidencia);
router.post("/responder", incidenciasController.responderIncidencia);
router.post("/cerrar", incidenciasController.cerrarIncidencia);

module.exports = router;