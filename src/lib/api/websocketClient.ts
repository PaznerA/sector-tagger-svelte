import type { ApiMessage, BaseSector } from '../types';
import { LocalStore } from '../storage/localStore';
import config from '../config';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private store: LocalStore;
  private reconnectTimeout: number = 1000;
  private maxReconnectTimeout: number = 30000;
  private subscribers: Set<(items: BaseSector[]) => void> = new Set();
  private connected: boolean = false;

  constructor() {
    this.store = new LocalStore();
    this.connect();
  }

  private connect() {
    try {
      // Use proxy URL from current host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}${config.ws.path}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectTimeout = 1000;
        this.sendMessage({ type: 'init', projectId: 1 });
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, will retry in', this.reconnectTimeout, 'ms');
        this.connected = false;
        // Exponential backoff for reconnect
        setTimeout(() => this.connect(), this.reconnectTimeout);
        this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as ApiMessage;
        if (message.type === 'sync') {
          this.store.sync(message.items);
          this.notifySubscribers(message.items);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      this.connected = false;
      setTimeout(() => this.connect(), this.reconnectTimeout);
    }
  }

  subscribe(callback: (items: BaseSector[]) => void) {
    this.subscribers.add(callback);
    if (this.store.items.length > 0) {
      callback(this.store.items);
    }
  }

  unsubscribe(callback: (items: BaseSector[]) => void) {
    this.subscribers.delete(callback);
  }

  private notifySubscribers(items: BaseSector[]) {
    this.subscribers.forEach(callback => callback(items));
  }

  private sendMessage(message: ApiMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  updateItem(item: BaseSector) {
    this.sendMessage({ type: 'update', item });
  }

  createItem(item: BaseSector) {
    this.sendMessage({ type: 'create', item });
  }

  deleteItem(itemId: number) {
    this.sendMessage({ type: 'delete', itemId });
  }
}
