// Ajusta esta ruta al archivo donde tengas tu pool de conexión mysql2/promise
const db = require('../config/db');

// GET /api/locatarios
exports.listarLocatarios = async (req, res) => {
  try {
    const [rows] = await db.query('CALL sp_listar_locatarios_estado()');
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los locatarios' });
  }
};

// POST /api/locatarios
exports.registrarLocatario = async (req, res) => {
  const { nombre, correo, password, telefono, giro_comercial } = req.body;
  if (!nombre || !correo || !password || !giro_comercial) {
    return res.status(400).json({ error: 'Completa nombre, correo, contraseña y giro comercial' });
  }
  try {
    await db.query('CALL sp_registrar_locatario(?, ?, ?, ?, ?)', [
      nombre, correo, password, telefono || null, giro_comercial
    ]);
    res.json({ mensaje: 'Locatario registrado correctamente' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo' });
    }
    res.status(500).json({ error: 'Error al registrar el locatario' });
  }
};

// PUT /api/locatarios/:id
exports.editarLocatario = async (req, res) => {
  const { id } = req.params;
  const { telefono, correo, giro_comercial } = req.body;
  if (!correo || !giro_comercial) {
    return res.status(400).json({ error: 'Completa correo y giro comercial' });
  }
  try {
    await db.query('CALL sp_editar_mi_perfil_locatario(?, ?, ?, ?)', [
      id, telefono || null, correo, giro_comercial
    ]);
    res.json({ mensaje: 'Locatario actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el locatario' });
  }
};

// PATCH /api/locatarios/:id/suspender
exports.suspenderLocatario = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('CALL sp_dar_baja_locatario(?)', [id]);
    res.json({ mensaje: 'Locatario suspendido correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al suspender al locatario' });
  }
};