import type { ApiMessage, Project } from './types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private projectId: number | null = null;
  private messageHandlers: ((message: ApiMessage) => void)[] = [];

  constructor(private baseUrl: string) {}

  connect(projectId: number) {
    this.projectId = projectId;
    
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.baseUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.sendMessage({ type: 'init', projectId });
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.ws = null;
        // Try to reconnect after 5 seconds
        this.reconnectTimeout = setTimeout(() => {
          this.connect(projectId);
        }, 5000) as unknown as number;
      };

      this.ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ApiMessage;
          this.messageHandlers.forEach(handler => handler(message));
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };
    } catch (e) {
      console.error('Failed to connect:', e);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(handler: (message: ApiMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  private sendMessage(message: ApiMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Public methods for sending updates
  updateItem(item: Project['items'][0]) {
    this.sendMessage({ type: 'update', item });
  }

  createItem(item: Omit<Project['items'][0], 'id'>) {
    this.sendMessage({ type: 'create', item });
  }

  deleteItem(itemId: number) {
    this.sendMessage({ type: 'delete', itemId });
  }
}
