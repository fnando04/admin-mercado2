import { io } from "socket.io-client";
 
// Una sola conexión compartida por toda la app (evita abrir un socket nuevo por cada pantalla)
const socket = io("http://localhost:3000", {
  autoConnect: true,
});
 
export default socket;
 