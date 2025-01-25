import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { projects, sectors } from './schema';
import { mockItems } from '../api/mockData';

// Initialize DB
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

// Create tables
migrate(db, { migrationsFolder: './drizzle' });

// Insert mock data
async function insertMockData() {
  // Create default project
  const [project] = await db.insert(projects).values({
    id: 1,
    name: 'Example Project',
  }).returning();

  // Insert all sectors with project reference
  for (const item of mockItems) {
    await db.insert(sectors).values({
      ...item,
      projectId: project.id,
    });
  }
}

insertMockData().catch(console.error);
