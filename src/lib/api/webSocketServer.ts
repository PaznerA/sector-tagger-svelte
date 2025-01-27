import type { Server } from 'bun';
import type { ApiMessage, WebSocketResponse } from '../types';
import { LocalStore } from '../storage/localStore';

export class WebSocketServer {
  private store: LocalStore;

  constructor() {
    this.store = new LocalStore();
  }

  init(server: Server) {
    const port = parseInt(process.env.VITE_WS_PORT || '4321', 10);

    Bun.serve({
      port,
      fetch: (req: Request) => {
        if (new URL(req.url).pathname === '/api/ws') {
          const upgraded = server.upgrade(req, {
            data: { subscribed: false },
          });
          if (upgraded) {
            return new Response(null);
          }
        }
        return new Response('Not Found', { status: 404 });
      },
      websocket: {
        open: (ws) => {
          // Subscribe to updates
          ws.subscribe('updates');
          ws.data.subscribed = true;

          // Send initial data
          const items = this.store.getItems();
          ws.send(JSON.stringify({
            type: 'init',
            items,
          }));
        },
        message: async (ws, message: string) => {
          try {
            const data = JSON.parse(message) as ApiMessage;
            const response: WebSocketResponse = {
              messageId: data.messageId,
            };

            switch (data.type) {
              case 'save_project': {
                if (!data.projectId || !data.changes) {
                  throw new Error('Missing projectId or changes');
                }

                // Save versions
                this.store.saveProject(data.projectId, data.changes);
                response.data = { success: true };
                break;
              }

              case 'get_last_version': {
                if (!data.sectorId) {
                  throw new Error('Missing sectorId');
                }

                const version = this.store.getLastSectorVersion(data.sectorId);
                response.data = { version };
                break;
              }

              case 'get_project_versions': {
                if (!data.projectId) {
                  throw new Error('Missing projectId');
                }

                const versions = this.store.getProjectVersions(data.projectId);
                response.data = { versions };
                break;
              }

              case 'create_project_version': {
                if (!data.projectId || !data.note) {
                  throw new Error('Missing projectId or note');
                }

                const version = this.store.createProjectVersion(data.projectId, data.note);
                response.data = { version };
                break;
              }

              case 'get_sector': {
                if (!data.sectorId) {
                  throw new Error('Missing sectorId');
                }

                const sector = this.store.getSector(data.sectorId);
                response.data = { sector };
                break;
              }

              case 'update': {
                if (!data.item) {
                  throw new Error('Missing item data');
                }

                const updatedItem = this.store.updateItem(data.item.id, data.item);
                if (!updatedItem) {
                  throw new Error('Failed to update item');
                }
                
                response.data = { item: updatedItem };
                
                // Broadcast update to all clients except sender
                if (ws.data.subscribed) {
                  ws.publish('updates', JSON.stringify({
                    type: 'update',
                    item: updatedItem,
                  }));
                }
                break;
              }

              case 'get_sector_version': {
                if (!data.sectorId || !data.projectVersionId) {
                  throw new Error('Missing sectorId or projectVersionId');
                }

                const version = this.store.getSectorVersionByProjectVersion(
                  data.sectorId,
                  data.projectVersionId,
                );
                response.data = { version };
                break;
              }

              default:
                throw new Error(`Unknown message type: ${data.type}`);
            }

            ws.send(JSON.stringify(response));
          } catch (error) {
            console.error('Failed to handle message:', error);
            ws.send(JSON.stringify({
              messageId: (message as any).messageId,
              error: error instanceof Error ? error.message : 'Unknown error',
            }));
          }
        },
      },
    });
  }
}
