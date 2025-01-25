import { MockWebSocketServer } from '../src/lib/api/mockWebSocketServer';

console.log('Starting WebSocket server...');
const server = new MockWebSocketServer();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  server.close();
  process.exit(0);
});
