import { WebSocketServer } from 'ws';
import type { ApiMessage, BaseSector } from '../types';
import { mockItems } from './mockData';
import config from '../config';
import https from 'https';
import fs from 'fs';
import path from 'path';

export class MockWebSocketServer {
  private wss: WebSocketServer;
  private items: BaseSector[] = [];
  private dataFile = path.join(process.cwd(), 'data', 'sectors.json');

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load data from file or use mock data
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        this.items = JSON.parse(data);
      } else {
        this.items = [...mockItems];
        this.saveData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.items = [...mockItems];
    }

    // Create HTTPS server
    const server = https.createServer({
      cert: fs.readFileSync('./certs/cert.pem'),
      key: fs.readFileSync('./certs/key.pem'),
    });

    // Create WebSocket server attached to HTTPS server
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/ws',
    });

    // Start HTTPS server
    server.listen(parseInt(config.api.port), () => {
      console.log(`WebSocket server listening on port ${config.api.port} (HTTPS)`);
    });

    this.wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString()) as ApiMessage;
        this.handleMessage(message, ws);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.items, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  private handleMessage(message: ApiMessage, ws: WebSocket) {
    switch (message.type) {
      case 'init': {
        this.broadcast({ type: 'sync', items: this.items });
        break;
      }
      case 'update': {
        const index = this.items.findIndex(item => item.id === message.item.id);
        if (index !== -1) {
          this.items[index] = message.item;
          this.broadcast({ type: 'sync', items: this.items });
          this.saveData();
        }
        break;
      }
      case 'create': {
        this.items.push(message.item);
        this.broadcast({ type: 'sync', items: this.items });
        this.saveData();
        break;
      }
      case 'delete': {
        this.items = this.items.filter(item => item.id !== message.itemId);
        this.broadcast({ type: 'sync', items: this.items });
        this.saveData();
        break;
      }
    }
  }

  private broadcast(message: ApiMessage) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  close() {
    this.wss.close();
  }
}
