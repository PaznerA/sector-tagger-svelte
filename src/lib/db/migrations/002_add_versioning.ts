import { Database } from 'bun:sqlite';

export async function up(db: Database) {
  // Create project_versions table
  db.run(`
    CREATE TABLE IF NOT EXISTS project_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create sector_versions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sector_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector_id INTEGER NOT NULL,
      project_version_id INTEGER NOT NULL,
      x REAL NOT NULL,
      y REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      rotation REAL NOT NULL,
      scale REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
      FOREIGN KEY (project_version_id) REFERENCES project_versions(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sector_versions_sector_id ON sector_versions(sector_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sector_versions_project_version_id ON sector_versions(project_version_id)');
}

export async function down(db: Database) {
  db.run('DROP TABLE IF EXISTS sector_versions');
  db.run('DROP TABLE IF EXISTS project_versions');
}
