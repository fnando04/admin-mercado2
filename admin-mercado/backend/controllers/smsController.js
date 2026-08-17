const twilio = require("twilio");
const db = require("../config/db");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const NOMBRES_MES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// Ajustar el "52" si el país es distinto a México
function formatearTelefono(telefono) {
  const limpio = telefono.trim();
  if (limpio.startsWith("+")) {
    return limpio.replace(/[^\d+]/g, "");
  }
  const soloDigitos = limpio.replace(/\D/g, "");
  if (soloDigitos.startsWith("52")) {
    return `+${soloDigitos}`;
  }
  return `+52${soloDigitos}`;
}

// POST /api/pagos/enviar-recordatorio/:id_pago
// Envía SMS a UN solo locatario, sin importar si ya se le mandó antes
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

    let mensajeTexto;
    if (esVencido) {
      mensajeTexto =
      `-\nPAGO VENCIDO\n` +
        `Hola ${pago.nombre}\n` +
        `Puesto: ${pago.numero_puesto || ""}\n` +
        `Periodo: ${NOMBRES_MES[pago.mes_pagado]} ${pago.anio_pagado}\n` +
        `Monto: $${Number(pago.monto).toFixed(2)}\n` +
        `Vence: ${pago.fecha_limite}\n` +
        `Favor de realizar su pago.\n` +
        `--Mercado Municipal`;
    } else {
      mensajeTexto =
        `-\nRECORDATORIO DE PAGO\n` +
        `Hola ${pago.nombre}\n` +
        `Puesto: ${pago.numero_puesto || ""}\n` +
        `Periodo: ${NOMBRES_MES[pago.mes_pagado]} ${pago.anio_pagado}\n` +
        `Monto: $${Number(pago.monto).toFixed(2)}\n` +
        `Vence: ${pago.fecha_limite}\n` +
        `Favor de pagar a tiempo.\n` +
        `--Mercado Municipal`;
    }

    const mensaje = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatearTelefono(pago.telefono),
      body: mensajeTexto
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
