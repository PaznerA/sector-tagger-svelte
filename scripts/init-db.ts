import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { projects, sectors } from '../src/lib/db/schema';
import { mockItems } from '../src/lib/api/mockData';

const DB_PATH = process.env.VITE_DB_PATH || 'data/db.sqlite';

async function main() {
  const sqlite = new Database(DB_PATH);
  const db = drizzle(sqlite);

  console.log('Initializing database...');

  // Drop existing tables
  sqlite.run('DROP TABLE IF EXISTS sectors');
  sqlite.run('DROP TABLE IF EXISTS projects');

  // Create tables
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS sectors (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL CHECK (level IN ('page', 'view', 'sector')),
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      rotation REAL NOT NULL,
      scale REAL NOT NULL,
      parent_id INTEGER REFERENCES sectors(id),
      project_id INTEGER NOT NULL REFERENCES projects(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert example data
  await db.insert(projects).values({
    id: 1,
    name: 'Example Project',
  });

  for (const item of mockItems) {
    await db.insert(sectors).values({
      id: item.id,
      name: item.name,
      level: item.level,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      rotation: item.rotation,
      scale: item.scale,
      parentId: item.parentId,
      projectId: 1,
    });
  }

  console.log('Database initialized successfully!');
}

main().catch(console.error);
