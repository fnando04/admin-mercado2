const express = require("express");
const router = express.Router();
const controller = require("../controllers/puestosController");

router.get("/", controller.listarPuestos);
router.put("/liberar/:id", controller.liberarPuesto);
router.get(
    "/locatarios-disponibles",
    controller.obtenerLocatariosDisponibles
);

router.put(
    "/asignar",
    controller.asignarPuesto
);

router.post("/agregar", controller.agregarPuesto);

module.exports = router;



