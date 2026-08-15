const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuariosController");

router.post("/", controller.crearUsuario);
router.get("/", controller.listarUsuarios);
router.put("/:id", controller.editarUsuario);
router.delete("/:id", controller.eliminarUsuario);
router.patch("/:id/reactivar", controller.reactivarUsuario);
router.patch("/:id/suspender", controller.eliminarUsuario);

module.exports = router;