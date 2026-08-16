const express = require("express");
const router = express.Router();
const smsController = require("../controllers/smsController");


router.get("/pagos-por-vencer", smsController.listarPagosPorVencer);
router.post("/enviar-recordatorio/:id_pago", smsController.enviarRecordatorioIndividual);

module.exports = router;