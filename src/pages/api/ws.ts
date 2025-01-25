import type { APIRoute } from 'astro';

export const get: APIRoute = async ({ request }) => {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const WS_PORT = import.meta.env.VITE_WS_PORT || 4321;
  const wsUrl = `ws://${request.headers.get('host')?.split(':')[0]}:${WS_PORT}`;

  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': 'accepted',
      'Location': wsUrl,
    },
  });
};

export function getStaticPaths() {
  return [];
}
