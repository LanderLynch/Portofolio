import type { Artifact, Job, JobResult } from '../shared/models.js';
import type { AgentName } from '../shared/enums.js';
import { createId, nowIso } from '../shared/utils.js';
import type { Agent } from './agent.js';

export abstract class BaseAgent implements Agent {
  abstract readonly name: AgentName;

  abstract execute(job: Job): Promise<JobResult>;

  makeArtifact(
    job: Job,
    type: string,
    name: string,
    content: unknown,
    version = 1,
  ): Artifact {
    return {
      artifactId: createId('artifact'),
      projectId: job.projectId,
      type,
      name,
      version,
      createdAt: nowIso(),
      createdBy: this.name,
      content,
    };
  }

  protected success(job: Job, artifacts: Artifact[], summary: string): JobResult {
    return {
      jobId: job.jobId,
      projectId: job.projectId,
      agentName: this.name,
      status: 'COMPLETED',
      outputArtifacts: artifacts,
      summary,
      timestamp: nowIso(),
    };
  }

  protected fail(job: Job, error: string): JobResult {
    return {
      jobId: job.jobId,
      projectId: job.projectId,
      agentName: this.name,
      status: 'FAILED',
      outputArtifacts: [],
      summary: error,
      error,
      timestamp: nowIso(),
    };
  }
}
