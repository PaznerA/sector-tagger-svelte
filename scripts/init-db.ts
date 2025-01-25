import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import { mockItems } from '../src/lib/api/mockData';

// Initialize DB
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

async function main() {
  console.log('Dropping existing tables...');
  await db.run(sql`DROP TABLE IF EXISTS sectors`);
  await db.run(sql`DROP TABLE IF EXISTS projects`);

  console.log('Creating tables...');
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(sql`
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
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Inserting mock data...');
  await db.run(sql`
    INSERT INTO projects (id, name) VALUES (1, 'Example Project')
  `);

  for (const item of mockItems) {
    await db.run(sql`
      INSERT INTO sectors (
        id, name, level, x, y, width, height, rotation, scale, parent_id, project_id
      ) VALUES (
        ${item.id},
        ${item.name},
        ${item.level},
        ${item.x},
        ${item.y},
        ${item.width},
        ${item.height},
        ${item.rotation},
        ${item.scale},
        ${item.parentId ?? null},
        1
      )
    `);
  }

  console.log('Done!');
}

main().catch(console.error);
