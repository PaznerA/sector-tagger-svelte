import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sectors = sqliteTable('sectors', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  level: text('level', { enum: ['page', 'view', 'sector'] }).notNull(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  width: real('width').notNull(),
  height: real('height').notNull(),
  rotation: real('rotation').notNull(),
  scale: real('scale').notNull(),
  parentId: integer('parent_id').references(() => sectors.id),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
