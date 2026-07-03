const db = require("../config/db");

exports.crearUsuario = async (req, res) => {
    const { nombre, correo, password, rol, telefono } = req.body;

    try {
        await db.query(
            "CALL sp_registrar_locatario(?,?,?,?,?)",
            [
                nombre,
                correo,
                password,
                telefono,
                giro_comercial
            ]
        );

        res.json({ message: "Usuario creado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(
            "CALL sp_listar_locatarios()"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, telefono, activo } = req.body;

    try {
        await db.query(
            "UPDATE usuarios SET nombre=?, correo=?, telefono=?, activo=? WHERE id_usuario=?",
            [nombre, correo, telefono, activo, id]
        );

        res.json({ message: "Usuario actualizado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(
            "UPDATE usuarios SET activo=0 WHERE id_usuario=?",
            [id]
        );

        res.json({ message: "Usuario desactivado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};