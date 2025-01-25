import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import type { BaseSector } from '../types';
import { projects, sectors } from './schema';
import { eq } from 'drizzle-orm';

const sqlite = new Database('data/db.sqlite');
export const db = drizzle(sqlite);

export async function getProject(id: number) {
  const result = await db.select().from(projects).where(eq(projects.id, id));
  return result[0];
}

export async function getProjects() {
  return db.select().from(projects);
}

export async function getSectorsByProjectId(projectId: number) {
  return db.select().from(sectors).where(eq(sectors.projectId, projectId));
}

export async function updateSector(id: number, data: Partial<BaseSector>) {
  const { id: _, ...updateData } = data;
  return db.update(sectors)
    .set(updateData)
    .where(eq(sectors.id, id))
    .returning();
}

export async function createSector(data: Omit<BaseSector, 'id'> & { projectId: number }) {
  return db.insert(sectors)
    .values(data)
    .returning();
}

export async function deleteSector(id: number) {
  return db.delete(sectors)
    .where(eq(sectors.id, id))
    .returning();
}
