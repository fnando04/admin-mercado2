let io = null;

// Se llama una sola vez desde app.js, pasándole el servidor HTTP
function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*", // en producción, restringe esto a tu dominio del frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });

  return io;
}

// Se usa desde cualquier controlador para emitir eventos
function getIO() {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado. Llama a initSocket(server) primero en app.js");
  }
  return io;
}

module.exports = { initSocket, getIO };