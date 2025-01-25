import type { BaseSector } from '../api/types';

const STORAGE_KEY = 'svelte-tagger-data';

interface StorageData {
  sectors: BaseSector[];
  lastId: number;
}

const defaultData: StorageData = {
  sectors: [],
  lastId: 0,
};

function loadData(): StorageData {
  if (typeof window === 'undefined') return defaultData;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  
  return JSON.parse(stored);
}

function saveData(data: StorageData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAllSectors(): BaseSector[] {
  return loadData().sectors;
}

export function addSector(sector: Omit<BaseSector, 'id'>): BaseSector {
  const data = loadData();
  const newId = data.lastId + 1;
  
  const newSector: BaseSector = {
    ...sector,
    id: newId,
  };
  
  data.sectors.push(newSector);
  data.lastId = newId;
  
  saveData(data);
  return newSector;
}

export function updateSector(sector: BaseSector): BaseSector {
  const data = loadData();
  const index = data.sectors.findIndex(s => s.id === sector.id);
  
  if (index === -1) {
    throw new Error(`Sector with id ${sector.id} not found`);
  }
  
  data.sectors[index] = sector;
  saveData(data);
  
  return sector;
}

export function deleteSector(id: number): void {
  const data = loadData();
  data.sectors = data.sectors.filter(s => s.id !== id);
  saveData(data);
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
