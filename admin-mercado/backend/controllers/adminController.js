const db = require("../config/db");

// LISTAR TODOS LOS ADMINISTRADORES (activos e inactivos)
exports.listarAdministradores = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_listar_administradores()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REGISTRAR UN NUEVO ADMINISTRADOR
exports.registrarAdministrador = async (req, res) => {
  try {
    const { nombre, correo, password, telefono } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos: nombre, correo y password son obligatorios" });
    }

    await db.query(
      "CALL sp_registrar_administrador(?, ?, ?, ?)",
      [nombre, correo, password, telefono || null]
    );

    res.json({ mensaje: "Administrador registrado correctamente" });
  } catch (error) {
    // Correo duplicado (UNIQUE en la tabla usuarios)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un usuario registrado con ese correo" });
    }
    res.status(500).json({ error: error.message });
  }
};

// ACTIVAR / DESACTIVAR UN ADMINISTRADOR
exports.cambiarEstadoAdministrador = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { activo } = req.body; // 0 o 1

    if (activo === undefined) {
      return res.status(400).json({ error: "Falta el campo 'activo' (0 o 1)" });
    }

    await db.query("CALL sp_cambiar_estado_administrador(?, ?)", [id_usuario, activo]);
    res.json({ mensaje: activo ? "Administrador activado" : "Administrador desactivado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};