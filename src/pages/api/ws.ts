import type { APIRoute } from 'astro';
import { MockWebSocketServer } from '../../lib/api/mockWebSocketServer';
import type { Server, ServerWebSocket } from 'bun';

const mockServer = new MockWebSocketServer();

let wsServer: Server | null = null;

export const all: APIRoute = async ({ request }) => {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  if (!wsServer) {
    wsServer = Bun.serve({
      port: 4322, // Use different port than Astro
      hostname: '0.0.0.0', // Listen on all interfaces
      fetch(req: Request, server: Server) {
        const upgraded = server.upgrade(req);
        if (upgraded) {
          return new Response(null, { status: 101 });
        }
        return new Response('Upgrade failed', { status: 500 });
      },
      websocket: {
        open(ws: ServerWebSocket<unknown>) {
          mockServer.handleConnection(ws);
        },
        message(ws: ServerWebSocket<unknown>, message: string | Buffer) {
          try {
            const data = JSON.parse(message.toString());
            mockServer.handleMessage(ws, data);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        },
      },
    });
  }

  const upgraded = wsServer.upgrade(request);
  if (upgraded) {
    return new Response(null, { status: 101 });
  }
  return new Response('Upgrade failed', { status: 500 });
};

export function getStaticPaths() {
  return [{ params: { ws: '' } }];
}
