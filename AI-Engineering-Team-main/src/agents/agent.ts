import type { Artifact, Job, JobResult } from '../shared/models.js';
import type { AgentName } from '../shared/enums.js';

export interface Agent {
  readonly name: AgentName;
  execute(job: Job): Promise<JobResult>;
  makeArtifact(
    job: Job,
    type: string,
    name: string,
    content: unknown,
    version?: number,
  ): Artifact;
}
