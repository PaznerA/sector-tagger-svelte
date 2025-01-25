import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, sql } from 'drizzle-orm';
import type { BaseSector } from '../types';

const sqlite = new Database('local.db');
export const db = drizzle(sqlite);

export async function getProject(id: number) {
  return db.run<{ id: number; name: string }>(sql`
    SELECT * FROM projects WHERE id = ${id}
  `);
}

export async function getSectors(projectId: number) {
  return db.run<BaseSector>(sql`
    SELECT 
      id, name, level, x, y, width, height, rotation, scale, parent_id as parentId
    FROM sectors 
    WHERE project_id = ${projectId}
  `);
}

export async function updateSector(id: number, data: Partial<BaseSector>) {
  return db.run(sql`
    UPDATE sectors 
    SET 
      name = ${data.name ?? sql`name`},
      x = ${data.x ?? sql`x`},
      y = ${data.y ?? sql`y`},
      width = ${data.width ?? sql`width`},
      height = ${data.height ?? sql`height`},
      rotation = ${data.rotation ?? sql`rotation`},
      scale = ${data.scale ?? sql`scale`},
      parent_id = ${data.parentId ?? sql`parent_id`},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `);
}

export async function createSector(data: Omit<BaseSector, 'id'> & { projectId: number }) {
  return db.run(sql`
    INSERT INTO sectors (
      name, level, x, y, width, height, rotation, scale, parent_id, project_id
    ) VALUES (
      ${data.name},
      ${data.level},
      ${data.x},
      ${data.y},
      ${data.width},
      ${data.height},
      ${data.rotation},
      ${data.scale},
      ${data.parentId ?? null},
      ${data.projectId}
    )
    RETURNING *
  `);
}

export async function deleteSector(id: number) {
  return db.run(sql`
    DELETE FROM sectors WHERE id = ${id} RETURNING *
  `);
}
