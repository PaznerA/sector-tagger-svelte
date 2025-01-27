import { eq, and, desc } from 'drizzle-orm';
import { db } from './index';
import { projectVersions, sectorVersions, type SectorVersion } from './schema';
import type { BaseSector } from '../types';

export async function createProjectVersion(projectId: number) {
  // Get latest version number
  const latest = await db.select()
    .from(projectVersions)
    .where(eq(projectVersions.projectId, projectId))
    .orderBy(desc(projectVersions.version))
    .limit(1);

  const nextVersion = latest.length > 0 ? latest[0].version + 1 : 1;

  // Create new project version
  const [projectVersion] = await db.insert(projectVersions)
    .values({
      projectId,
      version: nextVersion,
    })
    .returning();

  return projectVersion;
}

export async function saveSectorVersions(projectVersionId: number, sectors: BaseSector[]) {
  // Save each sector state
  const versionPromises = sectors.map(sector => {
    const { id, name, level, parentId, projectId, ...versionData } = sector;
    return db.insert(sectorVersions)
      .values({
        sectorId: id,
        projectVersionId,
        ...versionData,
      })
      .returning();
  });

  return Promise.all(versionPromises);
}

export async function getLastSectorVersion(sectorId: number): Promise<SectorVersion | null> {
  // Get latest project version for this sector
  const versions = await db.select()
    .from(sectorVersions)
    .where(eq(sectorVersions.sectorId, sectorId))
    .orderBy(desc(sectorVersions.createdAt))
    .limit(1);

  return versions[0] || null;
}

export async function saveProjectChanges(projectId: number, changes: BaseSector[]) {
  // Create new project version
  const projectVersion = await createProjectVersion(projectId);
  
  // Save sector versions
  await saveSectorVersions(projectVersion.id, changes);

  return projectVersion;
}
