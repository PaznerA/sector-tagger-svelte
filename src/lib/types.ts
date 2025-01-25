export interface BaseSector {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  name: string;
  parentId?: number | null;
  level: 'page' | 'view' | 'sector';
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export type ApiMessage = {
  type: 'init';
  items: BaseSector[];
} | {
  type: 'update' | 'create' | 'delete';
  item: BaseSector;
} | {
  type: 'error';
  error: string;
};
