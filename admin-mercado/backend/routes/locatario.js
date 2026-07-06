const express = require("express");
const router = express.Router();
const locatarioController = require("../controllers/locatarioController");

router.get("/mi-info", locatarioController.miInfo);
router.put("/mi-perfil", locatarioController.editarMiPerfil);
router.get("/mis-pagos", locatarioController.misPagos);
router.post("/pagar", locatarioController.pagar);
router.get("/mis-incidencias", locatarioController.misIncidencias);
router.post("/incidencias", locatarioController.crearIncidencia);

module.exports = router;