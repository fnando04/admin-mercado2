const express = require("express");
const router = express.Router();
const pagosController = require("../controllers/pagosController");
 
// LISTAR TABLA PRINCIPAL (acepta ?mes=&anio=)
router.get("/puestos", pagosController.listarPuestosPagos);
 
// REGISTRAR / MARCAR PAGO
router.post("/", pagosController.registrarPago);
 
// GENERAR PAGOS DEL MES (mes/anio en el body)
router.post("/generar-mes", pagosController.generarMes);
 
// ACTUALIZAR VENCIDOS
router.post("/actualizar-vencidos", pagosController.actualizarVencidos);
 
module.exports = router;