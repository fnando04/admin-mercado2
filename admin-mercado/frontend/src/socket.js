import { io } from "socket.io-client";
import { API_URL } from "./config";

// Una sola conexión compartida por toda la app (evita abrir un socket nuevo por cada pantalla)
const socket = io(API_URL, {
  autoConnect: true,
});

export default socket;
