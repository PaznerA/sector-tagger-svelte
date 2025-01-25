import type { BaseSector } from '../types';
import { mockItems } from '../api/mockData';

const STORAGE_KEY = 'sector-tagger-data';
const LAST_SYNC_KEY = 'sector-tagger-last-sync';

interface StorageData {
  projectId: number;
  items: BaseSector[];
  lastSync: number;
}

export class LocalStore {
  private data: StorageData;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.data = JSON.parse(stored);
        } catch (e) {
          console.warn('Failed to parse stored data:', e);
          this.data = {
            projectId: 1,
            items: mockItems,
            lastSync: 0,
          };
        }
      } else {
        // Initialize with mock data if no stored data
        this.data = {
          projectId: 1,
          items: mockItems,
          lastSync: 0,
        };
        this.save();
      }
    } else {
      this.data = {
        projectId: 1,
        items: mockItems,
        lastSync: 0,
      };
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  getItems(): BaseSector[] {
    return this.data.items;
  }

  updateItem(item: BaseSector) {
    const index = this.data.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.data.items[index] = item;
    } else {
      this.data.items.push(item);
    }
    this.save();
    return this.data.items;
  }

  createItem(item: Omit<BaseSector, 'id'>) {
    const newItem: BaseSector = {
      ...item,
      id: Math.max(0, ...this.data.items.map(i => i.id)) + 1,
    };
    this.data.items.push(newItem);
    this.save();
    return this.data.items;
  }

  deleteItem(itemId: number) {
    this.data.items = this.data.items.filter(i => i.id !== itemId);
    this.save();
    return this.data.items;
  }

  sync(items: BaseSector[]) {
    this.data.items = items;
    this.data.lastSync = Date.now();
    this.save();
  }

  getLastSync(): number {
    return this.data.lastSync;
  }
}
