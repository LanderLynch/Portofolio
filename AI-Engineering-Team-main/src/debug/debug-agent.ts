import type { AgentName } from '../shared/enums.js';
import type {
  BackendImplementationArtifact,
  DebugArtifact,
  FrontendImplementationArtifact,
  Job,
  JobResult,
  QaArtifact,
  SecurityAuditArtifact,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class DebugAgent extends BaseAgent {
  readonly name: AgentName = 'Debug';

  async execute(job: Job): Promise<JobResult> {
    const qa = job.inputArtifacts.find((artifact) => artifact.type === 'qa')?.content as QaArtifact | undefined;
    const security = job.inputArtifacts.find((artifact) => artifact.type === 'security')?.content as SecurityAuditArtifact | undefined;
    const backend = job.inputArtifacts.find((artifact) => artifact.type === 'backend')?.content as BackendImplementationArtifact | undefined;
    const frontend = job.inputArtifacts.find((artifact) => artifact.type === 'frontend')?.content as FrontendImplementationArtifact | undefined;

    if (!qa && !security) {
      return this.fail(job, 'Debug requires a QA report or security audit report');
    }

    const rootCauseAnalyses: DebugArtifact['rootCauseAnalyses'] = [];
    const changedFiles: DebugArtifact['changedFiles'] = [];
    const updatedSourceFiles: DebugArtifact['updatedSourceFiles'] = [];

    for (const bug of qa?.bugs ?? []) {
      rootCauseAnalyses.push({
        bugId: bug.bugId,
        rootCause: 'Missing or incomplete implementation for the associated requirement.',
        affectedModules: [bug.title],
        impact: bug.priority,
        solution: 'Add the missing implementation and re-run the affected test case.',
      });
    }

    for (const finding of security?.findings ?? []) {
      if (finding.riskLevel === 'CRITICAL' || finding.riskLevel === 'HIGH') {
        rootCauseAnalyses.push({
          bugId: finding.findingId,
          rootCause: finding.description,
          affectedModules: [finding.affectedModule],
          impact: finding.riskLevel,
          solution: finding.recommendation,
        });
      }
    }

    if (backend) {
      const fixedBackendFiles = backend.sourceFiles.map((file) => ({
        path: file.path,
        content: file.content.includes('validate(')
          ? file.content
          : `${file.content}
\n// Debug fix: added input validation guard.
export function validateInput(input: unknown): string[] {
  return input === undefined || input === null ? ['Input is required'] : [];
}
`,
      }));
      for (const file of fixedBackendFiles) {
        if (!updatedSourceFiles.some((existing) => existing.path === file.path)) {
          updatedSourceFiles.push(file);
        }
      }
    }

    if (frontend) {
      const fixedFrontendFiles = frontend.sourceFiles.map((file) => ({
        path: file.path,
        content: file.content.includes('try/catch') || file.content.includes('validateInput')
          ? file.content
          : `${file.content}
\n// Debug fix: added client validation and error handling guard.
export function validateClientInput(input: unknown): string[] {
  return input === undefined || input === null ? ['Input is required'] : [];
}
`,
      }));
      for (const file of fixedFrontendFiles) {
        if (!updatedSourceFiles.some((existing) => existing.path === file.path)) {
          updatedSourceFiles.push(file);
        }
      }
    }

    for (const file of updatedSourceFiles) {
      changedFiles.push({
        path: file.path,
        reason: 'Resolve reported bug or security finding.',
        summary: 'Added minimal validation/error handling without changing architecture.',
        impact: 'Localized to the affected file.',
      });
    }

    const artifact: DebugArtifact = {
      rootCauseAnalyses,
      changedFiles,
      updatedSourceFiles,
      validationNotes: ['Re-run QA after applying these changes.'],
      report: `Debug analyzed ${rootCauseAnalyses.length} issues and updated ${updatedSourceFiles.length} source files.`,
    };

    const debugArtifact = this.makeArtifact(job, 'debug', 'Bug Fix Report', artifact);
    return this.success(job, [debugArtifact], artifact.report);
  }
}
