const db = require("../config/db");
const { getIO } = require("../socket");

// LISTAR AVISOS VIGENTES (no archivados)
exports.listarAvisos = async (req, res) => {
  try {
    const [rows] = await db.query("CALL sp_listar_avisos()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUBLICAR UN NUEVO AVISO
exports.publicarAviso = async (req, res) => {
  try {
    const { id_administrador, titulo, contenido, fecha_vigencia } = req.body;
 
    if (!id_administrador || !titulo || !contenido || !fecha_vigencia) {
      return res.status(400).json({
        error: "Faltan datos: id_administrador, titulo, contenido y fecha_vigencia son obligatorios"
      });
    }
 
    await db.query(
      "CALL sp_publicar_aviso(?, ?, ?, ?)",
      [id_administrador, titulo, contenido, fecha_vigencia]
    );
 
    // >>>  avisa a todos los clientes conectados (admin y locatarios) que hay un aviso nuevo
    getIO().emit("nuevo_aviso", {
      titulo,
      contenido,
      fecha_vigencia,
      fecha_publicacion: new Date().toISOString(),
    });
 
    res.json({ mensaje: "Aviso publicado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ARCHIVAR AVISOS QUE YA VENCIERON (mantenimiento, puedes llamarlo al cargar la página)
exports.archivarVencidos = async (req, res) => {
  try {
    await db.query("CALL sp_archivar_avisos_vencidos()");
    res.json({ mensaje: "Avisos vencidos archivados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EDITAR UN AVISO EXISTENTE
exports.editarAviso = async (req, res) => {
  try {
    const { id_aviso } = req.params;
    const { titulo, contenido, fecha_vigencia } = req.body;

    if (!titulo || !contenido || !fecha_vigencia) {
      return res.status(400).json({ error: "Faltan datos: titulo, contenido y fecha_vigencia son obligatorios" });
    }

    await db.query("CALL sp_editar_aviso(?, ?, ?, ?)", [id_aviso, titulo, contenido, fecha_vigencia]);
    res.json({ mensaje: "Aviso actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ELIMINAR (ARCHIVAR) UN AVISO
exports.eliminarAviso = async (req, res) => {
  try {
    const { id_aviso } = req.params;
    await db.query("CALL sp_eliminar_aviso(?)", [id_aviso]);
    res.json({ mensaje: "Aviso eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};