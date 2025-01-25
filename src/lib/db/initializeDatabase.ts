import { db } from '.';
import { sectors, projects } from './schema';
import type { BaseSector } from '../types';

export async function initializeDatabase() {
  // Create example project
  const [project] = await db.insert(projects)
    .values({
      name: 'Example Project',
    })
    .returning();

  // Create example sectors
  const exampleSectors: Omit<BaseSector, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Main Page',
      level: 'page',
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      rotation: 0,
      scale: 1,
      projectId: project.id,
    },
    {
      name: 'Header View',
      level: 'view',
      x: 0,
      y: 0,
      width: 800,
      height: 100,
      rotation: 0,
      scale: 1,
      projectId: project.id,
    },
    {
      name: 'Content View',
      level: 'view',
      x: 0,
      y: 100,
      width: 800,
      height: 500,
      rotation: 0,
      scale: 1,
      projectId: project.id,
    },
  ];

  await db.insert(sectors).values(exampleSectors);
}
