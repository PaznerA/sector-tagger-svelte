import type { ApiMessage, BaseSector } from '../types';
import { LocalStore } from '../storage/localStore';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private store: LocalStore;
  private subscribers: Set<(items: BaseSector[]) => void> = new Set();
  private connected: boolean = false;

  constructor() {
    this.store = new LocalStore();
    this.connect();
  }

  private connect() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsPort = import.meta.env.VITE_WS_PORT || '4321';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${wsPort}`;

    console.log('Connecting to WebSocket server:', wsUrl);

    this.ws = new WebSocket(wsUrl);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      this.connected = true;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: ApiMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      this.connected = false;
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectTimeout * this.reconnectAttempts);
  }

  private handleMessage(message: ApiMessage) {
    switch (message.type) {
      case 'init':
        if (message.items) {
          this.store.sync(message.items);
          this.notifySubscribers(message.items);
        }
        break;
      case 'update':
        if (message.item) {
          this.store.updateItem(message.item);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      case 'create':
        if (message.item) {
          this.store.addItem(message.item);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      case 'delete':
        if (message.item?.id) {
          this.store.deleteItem(message.item.id);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      case 'error':
        console.error('Server error:', message.error);
        break;
    }
  }

  public subscribe(callback: (items: BaseSector[]) => void) {
    this.subscribers.add(callback);
    callback(this.store.getItems());
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(items: BaseSector[]) {
    this.subscribers.forEach(callback => callback(items));
  }

  public sendUpdate(item: BaseSector) {
    if (!this.connected) {
      console.warn('Not connected, storing update locally');
      this.store.updateItem(item);
      this.notifySubscribers(this.store.getItems());
      return;
    }
    this.send({ type: 'update', item });
  }

  public sendCreate(item: BaseSector) {
    if (!this.connected) {
      console.warn('Not connected, storing create locally');
      this.store.addItem(item);
      this.notifySubscribers(this.store.getItems());
      return;
    }
    this.send({ type: 'create', item });
  }

  public sendDelete(item: BaseSector) {
    if (!this.connected) {
      console.warn('Not connected, storing delete locally');
      this.store.deleteItem(item.id);
      this.notifySubscribers(this.store.getItems());
      return;
    }
    this.send({ type: 'delete', item });
  }

  private send(message: ApiMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}
