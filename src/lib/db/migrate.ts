import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { initializeDatabase } from './initializeDatabase';

// Initialize DB
const sqlite = new Database('local.db');
const db = drizzle(sqlite);

// Create tables
migrate(db, { migrationsFolder: './drizzle' });

// Initialize database
initializeDatabase().catch(console.error);
