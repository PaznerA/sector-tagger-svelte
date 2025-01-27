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
  projectId: number;
  level: 'page' | 'view' | 'sector';
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectVersion {
  id: number;
  projectId: number;
  version: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiMessageType = 
  | 'sync'
  | 'error'
  | 'init'
  | 'update'
  | 'create'
  | 'delete'
  | 'save_project'
  | 'get_sector'
  | 'get_last_version'
  | 'get_project_versions'
  | 'create_project_version'
  | 'get_sector_version';

export interface ApiMessage {
  type: ApiMessageType;
  messageId?: string;
  projectId?: number;
  sectorId?: number;
  item?: BaseSector;
  items?: BaseSector[];
  version?: BaseSector;
  versions?: ProjectVersion[];
  note?: string;
  projectVersionId?: number;
  error?: string;
  changes?: BaseSector[];
}

export interface WebSocketResponse {
  messageId?: string;
  type?: ApiMessageType;
  projectId?: number;
  sectorId?: number;
  item?: BaseSector;
  items?: BaseSector[];
  version?: BaseSector;
  versions?: ProjectVersion[];
  note?: string;
  projectVersionId?: number;
  error?: string;
  changes?: BaseSector[];
  data?: any;
}
