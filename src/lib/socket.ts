import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

/** Devuelve una única conexión Socket.IO compartida por toda la app. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, { autoConnect: false });
  }
  return socket;
}
