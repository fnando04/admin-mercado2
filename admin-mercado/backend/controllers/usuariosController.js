const db = require("../config/db");

exports.crearUsuario = async (req, res) => {
  const { nombre, correo, password, telefono, giro_comercial } = req.body;

  if (!nombre || !correo || !password || !giro_comercial) {
    return res.status(400).json({ error: "Completa nombre, correo, contraseña y giro comercial" });
  }

  try {
    await db.query(
      "CALL sp_registrar_locatario(?, ?, ?, ?, ?)",
      [nombre, correo, password, telefono || null, giro_comercial]
    );
    res.json({ message: "Usuario creado" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_listar_locatarios_estado()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { telefono, correo, giro_comercial } = req.body;

  if (!correo || !giro_comercial) {
    return res.status(400).json({ error: "Completa correo y giro comercial" });
  }

  try {
    await db.query(
      "CALL sp_editar_mi_perfil_locatario(?, ?, ?, ?)",
      [id, telefono || null, correo, giro_comercial]
    );
    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Suspende y ADEMÁS libera el puesto (antes se quedaba atorado como "asignado")
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("CALL sp_dar_baja_locatario(?)", [id]);
    res.json({ message: "Usuario desactivado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nuevo: para poder revertir una suspensión
exports.reactivarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("CALL sp_reactivar_locatario(?)", [id]);
    res.json({ message: "Usuario reactivado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};