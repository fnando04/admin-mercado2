const db = require("../config/db");

exports.listarPuestos = async (req, res) => {

    try {

        const [rows] = await db.query(
            "CALL sp_listar_puestos()"
        );

        res.json(rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.liberarPuesto = async (req, res) => {

    const { id } = req.params;

    try {

        await db.query(
            "CALL sp_liberar_puesto(?)",
            [id]
        );

        res.json({
            mensaje: "Puesto liberado correctamente"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });
    }
};

exports.obtenerLocatariosDisponibles = async (req, res) => {

    try {
        const [rows] = await db.query(
            "CALL sp_locatarios_sin_puesto()"
        );

        res.json(rows[0]);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.asignarPuesto = async (req, res) => {

    const {

        id_locatario,
        id_puesto

    } = req.body;

    try {

        await db.query(
            "CALL sp_asignar_puesto(?,?)",
            [
                id_locatario,
                id_puesto
            ]
        );

        res.json({

            mensaje:"Puesto asignado"

        });

    } catch (error) {

        res.status(500).json({

            error:error.message

        });

    }

};