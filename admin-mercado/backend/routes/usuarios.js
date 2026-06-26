const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuariosController");

router.post("/", controller.crearUsuario);
router.get("/", controller.listarUsuarios);
router.put("/:id", controller.editarUsuario);
router.delete("/:id", controller.eliminarUsuario);

module.exports = router;