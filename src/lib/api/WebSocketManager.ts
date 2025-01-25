import type { ServerWebSocket } from "bun";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sectors } from "../db/schema";
import type { ApiMessage, BaseSector } from "../types";

export class WebSocketManager {
  private clients: Set<ServerWebSocket> = new Set();

  constructor() {}

  addClient(ws: ServerWebSocket) {
    this.clients.add(ws);
    this.sendInitialData(ws);
  }

  removeClient(ws: ServerWebSocket) {
    this.clients.delete(ws);
  }

  private async sendInitialData(ws: ServerWebSocket) {
    const items = await db.select().from(sectors);
    ws.send(JSON.stringify({ type: 'init', items }));
  }

  private async handleUpdate(item: BaseSector) {
    const { id, createdAt, updatedAt, ...data } = item;
    const result = await db.update(sectors)
      .set(data)
      .where(eq(sectors.id, id))
      .returning()
      .execute();
    
    if (result && result.length > 0) {
      this.broadcast({ type: 'update', item: result[0] as BaseSector });
    }
  }

  private async handleCreate(item: Omit<BaseSector, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await db.insert(sectors)
      .values(item)
      .returning()
      .execute();
    
    if (result && result.length > 0) {
      this.broadcast({ type: 'create', item: result[0] as BaseSector });
    }
  }

  private async handleDelete(id: number) {
    const result = await db.delete(sectors)
      .where(eq(sectors.id, id))
      .returning()
      .execute();
    
    if (result && result.length > 0) {
      this.broadcast({ type: 'delete', item: result[0] as BaseSector });
    }
  }

  private async handleMessage(message: ApiMessage) {
    try {
      switch (message.type) {
        case 'update':
          if (message.item) await this.handleUpdate(message.item);
          break;
        case 'create':
          if (message.item) {
            const { id, createdAt, updatedAt, ...data } = message.item;
            await this.handleCreate(data);
          }
          break;
        case 'delete':
          if (message.item) await this.handleDelete(message.item.id);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.broadcast({ type: 'error', error: 'Failed to process message' });
    }
  }

  async handleData(data: string, ws: ServerWebSocket) {
    try {
      const message = JSON.parse(data) as ApiMessage;
      await this.handleMessage(message);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
    }
  }

  private broadcast(message: ApiMessage) {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      client.send(data);
    }
  }
}
