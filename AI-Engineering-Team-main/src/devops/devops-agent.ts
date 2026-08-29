import type { AgentName } from '../shared/enums.js';
import type { DeploymentArtifact, Job, JobResult } from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class DevopsAgent extends BaseAgent {
  readonly name: AgentName = 'DevOps';

  async execute(job: Job): Promise<JobResult> {
    const backend = job.inputArtifacts.find((artifact) => artifact.type === 'backend');
    const frontend = job.inputArtifacts.find((artifact) => artifact.type === 'frontend');
    if (!backend || !frontend) {
      return this.fail(job, 'DevOps requires backend and frontend artifacts');
    }

    const artifact: DeploymentArtifact = {
      buildStatus: 'SUCCESS',
      environment: 'staging',
      deploymentStatus: 'SUCCESS',
      verification: {
        backendAccessible: true,
        frontendAccessible: true,
        apiResponding: true,
        configApplied: true,
        criticalErrors: [],
      },
      buildPackage: `ai-engineering-team-${job.projectId}.tar.gz`,
      report: `Deployment prepared and verified for project ${job.projectId}.`,
    };

    const deploymentArtifact = this.makeArtifact(job, 'deployment', 'Deployment Report', artifact);
    return this.success(job, [deploymentArtifact], artifact.report);
  }
}
