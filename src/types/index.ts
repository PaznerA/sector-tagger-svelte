export interface BaseSector {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  name: string;
  parentId?: number;
  level: 'page' | 'view' | 'sector';
}

export interface PageData extends BaseSector {
  level: 'page';
}

export interface ViewData extends BaseSector {
  level: 'view';
}

export interface SectorData extends BaseSector {
  level: 'sector';
}

export type AnyData = PageData | ViewData | SectorData;
