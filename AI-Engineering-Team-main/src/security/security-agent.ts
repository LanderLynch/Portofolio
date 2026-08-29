import type { AgentName } from '../shared/enums.js';
import type {
  ArchitectureArtifact,
  BackendImplementationArtifact,
  FrontendImplementationArtifact,
  Job,
  JobResult,
  SecurityAuditArtifact,
  SecurityFinding,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class SecurityAgent extends BaseAgent {
  readonly name: AgentName = 'Security';

  async execute(job: Job): Promise<JobResult> {
    const architecture = job.inputArtifacts.find((artifact) => artifact.type === 'architecture')?.content as ArchitectureArtifact | undefined;
    const backend = job.inputArtifacts.find((artifact) => artifact.type === 'backend')?.content as BackendImplementationArtifact | undefined;
    const frontend = job.inputArtifacts.find((artifact) => artifact.type === 'frontend')?.content as FrontendImplementationArtifact | undefined;

    if (!architecture || !backend || !frontend) {
      return this.fail(job, 'Security requires architecture, backend, and frontend artifacts');
    }

    const findings: SecurityFinding[] = [];
    const checkedFiles = [...backend.sourceFiles, ...frontend.sourceFiles];

    for (const file of checkedFiles) {
      if (file.content.includes('password') && !file.content.includes('hash')) {
        findings.push({
          findingId: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
          title: 'Potential plaintext password handling',
          description: `File ${file.path} references a password without an explicit hashing step.`,
          affectedModule: file.path,
          riskLevel: 'HIGH',
          potentialImpact: 'Credential exposure if logs or responses leak the value.',
          recommendation: 'Hash credentials before persistence and never log them.',
        });
      }

      if (file.content.includes('secret') || file.content.includes('apiKey')) {
        findings.push({
          findingId: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
          title: 'Potential secret exposure',
          description: `File ${file.path} references a secret or API key directly.`,
          affectedModule: file.path,
          riskLevel: 'MEDIUM',
          potentialImpact: 'Secret could be committed to version control or exposed in a response.',
          recommendation: 'Move the value to an environment variable.',
        });
      }
    }

    const hasBlockingFinding = findings.some(
      (finding) => finding.riskLevel === 'CRITICAL' || finding.riskLevel === 'HIGH',
    );

    const artifact: SecurityAuditArtifact = {
      scope: ['Authentication', 'Authorization', 'Input Validation', 'Secret Management', 'Configuration Security'],
      findings,
      riskAssessment: findings.length
        ? `${findings.length} findings identified across ${checkedFiles.length} files.`
        : `No findings identified across ${checkedFiles.length} files.`,
      recommendation: hasBlockingFinding ? 'DEBUG' : 'PROCEED',
      summary: hasBlockingFinding
        ? 'Security audit found issues that require debugging.'
        : 'Security audit completed with no blocking findings.',
    };

    const securityArtifact = this.makeArtifact(job, 'security', 'Security Audit Report', artifact);
    return this.success(job, [securityArtifact], artifact.summary);
  }
}
