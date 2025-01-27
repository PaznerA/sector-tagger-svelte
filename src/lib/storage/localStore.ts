import type { BaseSector, ProjectVersion } from '../types';
import { mockItems } from '../api/mockData';

const STORAGE_KEY = 'sector-tagger-state';

interface StorageData {
  items: BaseSector[];
  versions: Record<number, BaseSector[]>;
  projectVersions: ProjectVersion[];
}

export class LocalStore {
  private data: StorageData;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const storedData: StorageData = JSON.parse(stored);
          this.data = storedData;
        } catch (e) {
          console.warn('Failed to parse stored data:', e);
          this.data = {
            items: mockItems,
            versions: {},
            projectVersions: [],
          };
        }
      } else {
        // Initialize with mock data if no stored data
        this.data = {
          items: mockItems,
          versions: {},
          projectVersions: [],
        };
        this.save();
      }
    } else {
      this.data = {
        items: mockItems,
        versions: {},
        projectVersions: [],
      };
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  addItem(item: BaseSector) {
    this.data.items.push(item);
    this.save();
  }

  updateItem(id: number, updates: Partial<BaseSector>): BaseSector | null {
    const item = this.data.items.find(i => i.id === id);
    if (item) {
      Object.assign(item, updates);
      
      // Save version
      if (!this.data.versions[id]) {
        this.data.versions[id] = [];
      }
      this.data.versions[id].push({ ...item });
      
      this.save();
      return item;
    }
    return null;
  }

  rollbackToVersion(id: number, version: BaseSector) {
    const item = this.data.items.find(i => i.id === id);
    if (item) {
      Object.assign(item, version);
      this.save();
    }
  }

  deleteItem(id: number) {
    this.data.items = this.data.items.filter(i => i.id !== id);
    this.save();
  }

  getItems(): BaseSector[] {
    return this.data.items;
  }

  sync(items: BaseSector[]) {
    this.data.items = items;
    this.save();
  }

  getSector(sectorId: number): BaseSector | null {
    const found = this.data.items.find(i => i.id === sectorId);
    return found || null;
  }

  getLastSectorVersion(sectorId: number): BaseSector | null {
    const versions = this.data.versions[sectorId] || [];
    return versions[versions.length - 1] || null;
  }

  getSectorVersionByProjectVersion(sectorId: number, projectVersionId: number): BaseSector | null {
    const versions = this.data.versions[sectorId] || [];
    return versions.find(v => v.id === projectVersionId) || null;
  }

  getProjectVersions(projectId: number): ProjectVersion[] {
    return this.data.projectVersions.filter(v => v.projectId === projectId);
  }

  createProjectVersion(projectId: number, note: string): ProjectVersion {
    const versions = this.getProjectVersions(projectId);
    const nextVersion = versions.length > 0 ? versions[versions.length - 1].version + 1 : 1;

    const version: ProjectVersion = {
      id: Date.now(),
      projectId,
      version: nextVersion,
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.projectVersions.push(version);
    this.save();

    return version;
  }

  saveProject(projectId: number, changes: BaseSector[]) {
    // Save current state to versions
    for (const change of changes) {
      if (!this.data.versions[change.id]) {
        this.data.versions[change.id] = [];
      }
      this.data.versions[change.id].push({ ...change });
    }

    // Update current state
    for (const change of changes) {
      const item = this.data.items.find(i => i.id === change.id);
      if (item) {
        Object.assign(item, change);
      }
    }

    this.save();
  }
}
