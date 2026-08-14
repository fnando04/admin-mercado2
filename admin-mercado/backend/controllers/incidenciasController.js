const db = require("../config/db");
const { getIO } = require("../socket");

// LISTAR TODAS LAS INCIDENCIAS (con datos de locatario/puesto)
exports.listarIncidencias = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_listar_incidencias()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SOLO LAS ABIERTAS (para notificaciones / campanita del navbar)
exports.incidenciasAbiertas = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_incidencias_abiertas()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LISTA DE LOCATARIOS PARA EL SELECTOR AL ABRIR UNA INCIDENCIA NUEVA
exports.locatariosParaIncidencia = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_locatarios_para_incidencia()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ABRIR UNA NUEVA INCIDENCIA
exports.abrirIncidencia = async (req, res) => {
  try {
    const { id_locatario, titulo, descripcion } = req.body;
 
    if (!id_locatario || !titulo || !descripcion) {
      return res.status(400).json({ error: "Faltan datos: id_locatario, titulo y descripcion son obligatorios" });
    }
 
    await db.query(
      "CALL sp_abrir_incidencia(?, ?, ?, ?)",
      [id_locatario, titulo, descripcion, null]
    );
 
    // Si ya tienes el emit de socket.io de antes, consérvalo aquí también:
    // getIO().emit("nueva_incidencia", { id_locatario, titulo, descripcion, estado: "Abierta" });
 
    res.json({ mensaje: "Incidencia registrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RESPONDER UNA INCIDENCIA (pasa a "En proceso")
exports.responderIncidencia = async (req, res) => {
  try {
    const { id_incidencia, respuesta } = req.body;

    if (!id_incidencia || !respuesta) {
      return res.status(400).json({ error: "Faltan datos: id_incidencia y respuesta son obligatorios" });
    }

    await db.query("CALL sp_responder_incidencia(?, ?)", [id_incidencia, respuesta]);
    getIO().emit("incidencia_respondida", { id_incidencia });
    res.json({ mensaje: "Respuesta guardada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CERRAR UNA INCIDENCIA (pasa a "Resuelta")
exports.cerrarIncidencia = async (req, res) => {
  try {
    const { id_incidencia } = req.body;
    if (!id_incidencia) {
      return res.status(400).json({ error: "Falta id_incidencia" });
    }
    await db.query("CALL sp_cerrar_incidencia(?)", [id_incidencia]);
 
    // >>> NUEVO: avisa que esa incidencia se cerró
    getIO().emit("incidencia_cerrada", { id_incidencia });
 
    res.json({ mensaje: "Incidencia cerrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};