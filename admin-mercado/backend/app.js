const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

// -------------------
//  PRUEBA MYSQL
app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ---------------------


// rutas
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const pagosRoutes = require("./routes/pagos");
app.use("/api/pagos", pagosRoutes);

const usuariosRoutes = require("./routes/usuarios");
app.use("/api/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
    res.send("Backend funcionando ");
});



//--------------------
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});