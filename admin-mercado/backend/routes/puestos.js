const express = require("express");
const router = express.Router();
const controller = require("../controllers/puestosController");

router.get("/", controller.listarPuestos);
router.put("/liberar/:id", controller.liberarPuesto);

module.exports = router;



