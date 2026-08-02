const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

//SOCKET
const http = require("http");
const { initSocket } = require("./socket");

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

const registroRoutes = require("./routes/registro");
app.use("/api/registro", registroRoutes);

const pagosRoutes = require("./routes/pagos");
app.use("/api/pagos", pagosRoutes);

const usuariosRoutes = require("./routes/usuarios");
app.use("/api/usuarios", usuariosRoutes);

const puestosRoutes = require("./routes/puestos");
app.use("/api/puestos", puestosRoutes);


const incidenciasRoutes = require("./routes/incidencias");
app.use("/api/incidencias", incidenciasRoutes);

const avisosRoutes = require("./routes/avisos");
app.use("/api/avisos", avisosRoutes);

const administradoresRoutes = require("./routes/admin");
app.use("/api/administradores", administradoresRoutes);

const locatarioRoutes = require("./routes/locatario");
app.use("/api/locatario", locatarioRoutes);
//--------------------

const server = http.createServer(app);
initSocket(server);
 
server.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
