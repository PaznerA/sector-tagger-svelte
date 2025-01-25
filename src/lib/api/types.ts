export interface BaseSector {
  id: number,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  scale: number,
  name: string,
  parentId?: number,
  level: 'page' | 'view' | 'sector',
}

export interface Project {
  id: number,
  name: string,
  items: BaseSector[],
}

export type ApiMessage = 
  | { type: 'init'; projectId: number }
  | { type: 'update'; item: BaseSector }
  | { type: 'delete'; itemId: number }
  | { type: 'create'; item: Omit<BaseSector, 'id'> }
  | { type: 'sync'; items: BaseSector[] };
