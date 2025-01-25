import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { InferSelectModel } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export type Project = InferSelectModel<typeof projects>;

export type SectorLevel = 'page' | 'view' | 'sector';

// Forward declaration to break circular dependency
const sectorsTable = sqliteTable('sectors', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
});

export const sectors = sqliteTable('sectors', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  level: text('level', { enum: ['page', 'view', 'sector'] as const }).notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  rotation: real('rotation').notNull(),
  scale: real('scale').notNull(),
  parentId: integer('parent_id', { mode: 'number' }).references(() => sectorsTable.id),
  projectId: integer('project_id', { mode: 'number' }).references(() => projects.id).notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
});

export type Sector = InferSelectModel<typeof sectors>;
