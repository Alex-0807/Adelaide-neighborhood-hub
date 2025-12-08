import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

export function setupWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket: WebSocket) => {
    console.log(`${socket} New WebSocket connection established`);
    socket.send("Hello from backend WebSocket 👋");

    socket.on("message", (message: string) => {
      console.log(`Received message: ${message.toString()}`);
    });
    socket.on(`close`, () => {
      console.log("[websocket] Client disconnected");
    });
    socket.on("error", (err) => {
      console.error("[websocket] Client error:", err);
    });
  });

  console.log("[websocket] WebSocket server attached at /ws/demo");
}
