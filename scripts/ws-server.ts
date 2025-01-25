import type { ServerWebSocket } from 'bun';
import { WebSocketManager } from '../src/lib/api/WebSocketManager';

const wsManager = new WebSocketManager();

const WS_PORT = process.env.VITE_WS_PORT ? parseInt(process.env.VITE_WS_PORT) : 4321;

Bun.serve({
  port: WS_PORT,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response('Expected websocket', { status: 400 });
  },
  websocket: {
    open(ws: ServerWebSocket) {
      console.log('Client connected');
      wsManager.addClient(ws);
    },
    message(ws: ServerWebSocket, message) {
      wsManager.handleData(message.toString(), ws);
    },
    close(ws: ServerWebSocket) {
      console.log('Client disconnected');
      wsManager.removeClient(ws);
    },
  },
});

console.log(`Starting WebSocket server on port ${WS_PORT}`);
