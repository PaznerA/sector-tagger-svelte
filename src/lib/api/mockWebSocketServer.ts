import type { ServerWebSocket } from 'bun';
import type { ApiMessage, BaseSector, Project } from './types';
import { mockProjects } from './mockData';

export class MockWebSocketServer {
  private projects: Map<number, Project> = new Map();
  private connections: Set<ServerWebSocket<unknown>> = new Set();
  private nextId = 1000;

  constructor() {
    // Initialize with mock data
    mockProjects.forEach(project => {
      this.projects.set(project.id, { ...project });
    });
  }

  handleConnection(ws: ServerWebSocket<unknown>) {
    this.connections.add(ws);
    ws.close = () => {
      this.connections.delete(ws);
    };
  }

  handleMessage(ws: ServerWebSocket<unknown>, message: ApiMessage) {
    switch (message.type) {
      case 'init': {
        const project = this.projects.get(message.projectId);
        if (project) {
          this.broadcast({ type: 'sync', items: project.items });
        }
        break;
      }
      
      case 'update': {
        const project = this.findProjectByItemId(message.item.id);
        if (project) {
          const index = project.items.findIndex(item => item.id === message.item.id);
          if (index !== -1) {
            project.items[index] = message.item;
            this.broadcast({ type: 'sync', items: project.items });
          }
        }
        break;
      }

      case 'create': {
        const projectId = this.findProjectIdByParentId(message.item.parentId);
        if (projectId) {
          const project = this.projects.get(projectId);
          if (project) {
            const newItem: BaseSector = {
              ...message.item,
              id: this.nextId++,
            };
            project.items.push(newItem);
            this.broadcast({ type: 'sync', items: project.items });
          }
        }
        break;
      }

      case 'delete': {
        const project = this.findProjectByItemId(message.itemId);
        if (project) {
          project.items = project.items.filter(item => item.id !== message.itemId);
          this.broadcast({ type: 'sync', items: project.items });
        }
        break;
      }
    }
  }

  private broadcast(message: ApiMessage) {
    const data = JSON.stringify(message);
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  private findProjectByItemId(itemId: number): Project | null {
    for (const project of this.projects.values()) {
      if (project.items.some(item => item.id === itemId)) {
        return project;
      }
    }
    return null;
  }

  private findProjectIdByParentId(parentId?: number): number | null {
    if (!parentId) return mockProjects[0].id; // Default to first project if no parent
    
    for (const project of this.projects.values()) {
      if (project.items.some(item => item.id === parentId)) {
        return project.id;
      }
    }
    return null;
  }
}
