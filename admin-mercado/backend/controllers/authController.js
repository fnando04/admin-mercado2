const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET = "mercado_secret_key";

exports.login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [rows] = await db.query(
            "SELECT * FROM usuarios WHERE correo = ? AND password = ?",
            [correo, password]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const user = rows[0];

        if (user.activo === 0) {
            return res.status(403).json({ message: "Usuario bloqueado" });
        }

        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol },
            SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            token,
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};