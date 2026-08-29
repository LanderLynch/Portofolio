import fs from 'node:fs';
import path from 'node:path';
import type { Artifact } from '../shared/models.js';
import { asJson, nowIso } from '../shared/utils.js';

export class ArtifactStorage {
  constructor(private readonly artifactsDir: string) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  projectDir(projectId: string): string {
    const dir = path.join(this.artifactsDir, projectId);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private fileName(artifact: Artifact): string {
    const safeType = artifact.type.replace(/[^a-zA-Z0-9_-]/g, '-');
    const safeName = artifact.name.replace(/[^a-zA-Z0-9_-]/g, '-');
    return `${safeType}-${safeName}-v${artifact.version}.json`;
  }

  save(artifact: Artifact): Artifact {
    const dir = this.projectDir(artifact.projectId);
    const filePath = path.join(dir, this.fileName(artifact));
    fs.writeFileSync(filePath, asJson(artifact), 'utf8');
    return artifact;
  }

  list(projectId: string): Artifact[] {
    const dir = path.join(this.artifactsDir, projectId);
    if (!fs.existsSync(dir)) {
      return [];
    }
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        return JSON.parse(raw) as Artifact;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getLatestByType(projectId: string, type: string): Artifact | undefined {
    return this.list(projectId)
      .filter((artifact) => artifact.type === type)
      .sort((a, b) => b.version - a.version)[0];
  }

  nextVersion(projectId: string, type: string, name: string): number {
    const existing = this.list(projectId).filter(
      (artifact) => artifact.type === type && artifact.name === name,
    );
    return existing.reduce((max, artifact) => Math.max(max, artifact.version), 0) + 1;
  }
}
