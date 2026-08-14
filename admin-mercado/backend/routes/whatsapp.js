const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");


router.get("/pagos-por-vencer", whatsappController.listarPagosPorVencer);
router.post("/enviar-recordatorio/:id_pago", whatsappController.enviarRecordatorioIndividual);

module.exports = router;