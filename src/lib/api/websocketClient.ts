import type { ApiMessage, BaseSector, WebSocketResponse, ProjectVersion } from '../types';
import { LocalStore } from '../storage/localStore';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private store: LocalStore;
  private responseHandlers: Record<string, (response: WebSocketResponse) => void> = {};
  private subscribers: Set<(items: BaseSector[]) => void> = new Set();
  private url: string = '';
  private reconnectTimeout: number = 1000;
  private maxReconnectTimeout: number = 30000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting: boolean = false;
  private messageQueue: { message: ApiMessage; resolve: (value: WebSocketResponse) => void; reject: (reason: any) => void; }[] = [];

  constructor() {
    this.store = new LocalStore();
  }

  connect(url: string) {
    this.url = url;
    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectTimeout = 1000; // Reset timeout on successful connection
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Process queued messages
      while (this.messageQueue.length > 0) {
        const { message, resolve, reject } = this.messageQueue.shift()!;
        this.sendMessageImmediate(message).then(resolve).catch(reject);
      }
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketResponse;
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.isConnecting = false;
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect in ${this.reconnectTimeout}ms...`);
      this.connectWebSocket();
      
      // Exponential backoff with max timeout
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, this.maxReconnectTimeout);
      this.reconnectTimer = null;
    }, this.reconnectTimeout);
  }

  private generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private sendMessage(message: ApiMessage): Promise<WebSocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        // Queue message if not connected
        this.messageQueue.push({ message, resolve, reject });
        return;
      }

      this.sendMessageImmediate(message).then(resolve).catch(reject);
    });
  }

  private sendMessageImmediate(message: ApiMessage): Promise<WebSocketResponse> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      message.messageId = messageId;

      this.responseHandlers[messageId] = resolve;
      this.ws!.send(JSON.stringify(message));
    });
  }

  private handleMessage(message: WebSocketResponse) {
    if (message.messageId && this.responseHandlers[message.messageId]) {
      this.responseHandlers[message.messageId](message);
      delete this.responseHandlers[message.messageId];
      return;
    }

    if (!message.type) {
      console.warn('Received message without type:', message);
      return;
    }

    switch (message.type) {
      case 'init': {
        if (message.items) {
          this.store.sync(message.items);
          this.notifySubscribers(message.items);
        }
        break;
      }

      case 'sync': {
        if (message.items) {
          this.store.sync(message.items);
          this.notifySubscribers(message.items);
        }
        break;
      }

      case 'update': {
        if (message.item) {
          this.store.updateItem(message.item.id, message.item);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      }

      case 'create': {
        if (message.item) {
          this.store.addItem(message.item);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      }

      case 'delete': {
        if (message.item) {
          this.store.deleteItem(message.item.id);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      }

      case 'save_project': {
        if (message.projectId && message.changes) {
          this.store.saveProject(message.projectId, message.changes);
          this.notifySubscribers(this.store.getItems());
        }
        break;
      }

      case 'get_last_version': {
        if (message.sectorId) {
          const version = this.store.getLastSectorVersion(message.sectorId);
          // this.notifySubscribers(version);
        }
        break;
      }
      case 'get_sector_version': {
        if (message.sectorId && message.projectVersionId) {
          const version = this.store.getLastSectorVersion(message.sectorId);
          // this.notifySubscribers(version);
        }
        break;
      }
      // case 'get_project_versions': {
      //   if (message.sectorId) {
      //     const versions = this.store.getVersions(message.sectorId);
      //     this.notifySubscribers(versions);
      //   }
      //   break;
      // }
      case 'create_project_version': {
        if (message.sectorId) {
          const version = this.store.createProjectVersion(message.sectorId, message.note ?? '');
          // this.notifySubscribers(version);
        }
        break;
      }
      case 'get_sector': {
        if (message.sectorId) {
          const sector = this.store.getSector(message.sectorId);
          // this.notifySubscribers(sector);
        }
        break;
      }

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  subscribe(callback: (items: BaseSector[]) => void) {
    this.subscribers.add(callback);
    callback(this.store.getItems());
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(items: BaseSector[]) {
    this.subscribers.forEach(callback => callback(items));
  }

  async getLastSectorVersion(sectorId: number): Promise<BaseSector | null> {
    const response = await this.sendMessage({
      type: 'get_last_version',
      sectorId,
    });

    return response.data?.version ?? null;
  }

  async getProjectVersions(projectId: number): Promise<ProjectVersion[]> {
    const response = await this.sendMessage({
      type: 'get_project_versions',
      projectId,
    });

    return response.data?.versions ?? [];
  }

  async createProjectVersion(projectId: number, note: string): Promise<ProjectVersion> {
    const response = await this.sendMessage({
      type: 'create_project_version',
      projectId,
      note,
    });

    return response.data?.version;
  }

  async getSectorVersionByProjectVersion(sectorId: number, projectVersionId: number): Promise<BaseSector | null> {
    const response = await this.sendMessage({
      type: 'get_sector_version',
      sectorId,
      projectVersionId,
    });

    return response.data?.version ?? null;
  }

  async sendUpdate(item: BaseSector): Promise<void> {
    await this.sendMessage({
      type: 'update',
      item,
    });
  }

  async createSector(item: Omit<BaseSector, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.sendMessage({
      type: 'create',
      item: { ...item, id: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });
  }

  async deleteSector(id: number): Promise<void> {
    await this.sendMessage({
      type: 'delete',
      sectorId: id,
    });
  }

  async updateSector(item: BaseSector): Promise<void> {
    await this.sendMessage({
      type: 'update',
      item,
    });
  }

  async getSector(id: number): Promise<BaseSector | null> {
    const response = await this.sendMessage({
      type: 'get_sector',
      sectorId: id,
    });

    return response.data?.sector ?? null;
  }
}
