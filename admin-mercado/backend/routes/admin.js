const express = require("express");
const router = express.Router();
const administradoresController = require("../controllers/adminController");

router.get("/", administradoresController.listarAdministradores);
router.post("/", administradoresController.registrarAdministrador);
router.put("/:id_usuario/estado", administradoresController.cambiarEstadoAdministrador);

module.exports = router;