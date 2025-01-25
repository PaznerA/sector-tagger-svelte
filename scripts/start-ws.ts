import { WebSocketManager } from '../src/lib/api/WebSocketManager';

console.log('Starting WebSocket server...');
new WebSocketManager();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  process.exit(0);
});
