const db = require("../config/db");

// REGISTRO PÚBLICO: cualquiera puede registrarse como locatario (sin puesto asignado aún)
exports.registrarLocatario = async (req, res) => {
  try {
    const { nombre, correo, password, telefono, giro_comercial } = req.body;

    if (!nombre || !correo || !password || !giro_comercial) {
      return res.status(400).json({
        error: "Faltan datos: nombre, correo, password y giro_comercial son obligatorios"
      });
    }

    await db.query(
      "CALL sp_registrar_locatario(?, ?, ?, ?, ?)",
      [nombre, correo, password, telefono || null, giro_comercial]
    );

    res.json({ mensaje: "Cuenta creada correctamente. Un administrador te asignará un puesto." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe una cuenta registrada con ese correo" });
    }
    res.status(500).json({ error: error.message });
  }
};