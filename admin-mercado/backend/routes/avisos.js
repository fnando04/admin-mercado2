const express = require("express");
const router = express.Router();
const avisosController = require("../controllers/avisosController");

router.get("/", avisosController.listarAvisos);
router.post("/", avisosController.publicarAviso);
router.post("/archivar-vencidos", avisosController.archivarVencidos);
router.put("/:id_aviso", avisosController.editarAviso);
router.delete("/:id_aviso", avisosController.eliminarAviso);

module.exports = router;