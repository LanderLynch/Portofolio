import type { AgentName } from '../shared/enums.js';
import type {
  ArchitectureArtifact,
  DebugArtifact,
  DeploymentArtifact,
  FinalReportArtifact,
  Job,
  JobResult,
  PlanningArtifact,
  QaArtifact,
  SecurityAuditArtifact,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';
import { nowIso } from '../shared/utils.js';

export class ReporterAgent extends BaseAgent {
  readonly name: AgentName = 'Reporter';

  async execute(job: Job): Promise<JobResult> {
    const planning = job.inputArtifacts.find((artifact) => artifact.type === 'planning')?.content as PlanningArtifact | undefined;
    const architecture = job.inputArtifacts.find((artifact) => artifact.type === 'architecture')?.content as ArchitectureArtifact | undefined;
    const qa = job.inputArtifacts.find((artifact) => artifact.type === 'qa')?.content as QaArtifact | undefined;
    const debug = job.inputArtifacts.find((artifact) => artifact.type === 'debug')?.content as DebugArtifact | undefined;
    const security = job.inputArtifacts.find((artifact) => artifact.type === 'security')?.content as SecurityAuditArtifact | undefined;
    const deployment = job.inputArtifacts.find((artifact) => artifact.type === 'deployment')?.content as DeploymentArtifact | undefined;

    if (!planning || !architecture || !qa || !security || !deployment) {
      return this.fail(job, 'Reporter requires planning, architecture, QA, security, and deployment artifacts');
    }

    const artifact: FinalReportArtifact = {
      projectInfo: {
        projectId: job.projectId,
        projectName: job.inputArtifacts[0]?.name ?? 'AI Engineering Team Project',
        projectStatus: 'COMPLETED',
        startTime: job.timestamp,
        finishTime: nowIso(),
      },
      requirementSummary: planning.summary,
      architectureSummary: architecture.summary,
      developmentSummary: 'Backend and frontend implementations were produced from the architecture blueprint.',
      testingSummary: qa.summary,
      debugSummary: debug?.report ?? 'No debugging was required.',
      securitySummary: security.summary,
      deploymentSummary: deployment.report,
      statistics: {
        totalFeatures: planning.featureList.length,
        totalTasks: planning.taskList.length,
        totalModules: architecture.moduleDesigns.length,
        totalBugs: qa.bugs.length,
        totalSecurityFindings: security.findings.length,
        deploymentStatus: deployment.deploymentStatus,
        overallStatus: 'COMPLETED',
      },
      conclusion: 'The AI Engineering Team workflow completed successfully with all artifacts traceable and versioned.',
    };

    const reportArtifact = this.makeArtifact(job, 'final-report', 'Final Project Report', artifact);
    return this.success(job, [reportArtifact], 'Final project report produced.');
  }
}
