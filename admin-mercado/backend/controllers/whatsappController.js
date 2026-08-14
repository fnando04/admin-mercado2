const twilio = require("twilio");
const db = require("../config/db");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NOMBRES_MES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// Arma el número en formato E.164 requerido por Twilio (ej. +5217712345678)
// Ajustar el "52" si el país es distinto a México
function formatearTelefono(telefono) {
  const soloDigitos = telefono.replace(/\D/g, "");
  if (soloDigitos.startsWith("521")) return `+${soloDigitos}`;
  if (soloDigitos.startsWith("52")) return `+521${soloDigitos.slice(2)}`;
  return `+521${soloDigitos}`;
}


// POST /api/pagos/enviar-recordatorio/:id_pago
// Envía WhatsApp a UN solo locatario, sin importar si ya se le mandó antes
exports.enviarRecordatorioIndividual = async (req, res) => {
  try {
    const { id_pago } = req.params;
    const [rows] = await db.query("CALL sp_pago_para_recordatorio(?)", [id_pago]);
    const pago = rows[0][0];

    if (!pago) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    if (pago.estado_pago === "pagado") {
      return res.status(400).json({ error: "Este pago ya está pagado, no aplica recordatorio" });
    }
    if (!pago.telefono) {
      return res.status(400).json({ error: "El locatario no tiene teléfono registrado" });
    }

    const esVencido = pago.estado_pago === "vencido";
    const mensaje = `Hola ${pago.nombre}, te recordamos que el pago de tu puesto ${pago.numero_puesto || ""} correspondiente a ${NOMBRES_MES[pago.mes_pagado]} ${pago.anio_pagado} ($${pago.monto}) ${esVencido ? "ya venció el" : "vence el"} ${pago.fecha_limite}. ${esVencido ? "Te pedimos regularizar tu pago lo antes posible" : "Evita recargos pagando a tiempo"}. — Mercado Municipal`;

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${formatearTelefono(pago.telefono)}`,
      body: mensaje,
    });

    await db.query("CALL sp_marcar_recordatorio_enviado(?)", [id_pago]);

    res.json({ mensaje: `Recordatorio enviado a ${pago.nombre}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/pagos/pagos-por-vencer
// Para que el admin vea la lista antes de mandar (opcional, útil para confirmar)
exports.listarPagosPorVencer = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_pagos_por_vencer()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};