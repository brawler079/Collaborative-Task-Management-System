import { io } from "socket.io-client";

const socket = io("http://localhost:5004", {
  transports: ["websocket"],
  withCredentials: true, // Ensures authentication cookies are included
});

export default socket;
