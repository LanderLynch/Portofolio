import type { AgentName, WorkflowStage } from '../shared/enums.js';
import type { Artifact, Job, JobResult, ProjectRequest } from '../shared/models.js';
import type { Logger } from '../shared/logger.js';
import type { AppConfig } from '../config/config-manager.js';
import { ArtifactStorage } from '../storage/artifact-storage.js';
import { ProjectMemory } from '../storage/project-memory.js';
import { createId, nowIso } from '../shared/utils.js';
import type { Agent } from '../agents/agent.js';
import type { PlanningArtifact } from '../shared/models.js';
import type { ArchitectureArtifact } from '../shared/models.js';
import type { QaArtifact } from '../shared/models.js';
import type { SecurityAuditArtifact } from '../shared/models.js';

interface OrchestratorDeps {
  config: AppConfig;
  logger: Logger;
  agents: Map<AgentName, Agent>;
}

const AGENT_ORDER: AgentName[] = [
  'Planner',
  'Architect',
  'Backend',
  'Frontend',
  'QA',
  'Security',
  'DevOps',
  'Reporter',
];

export class Orchestrator {
  private readonly config: AppConfig;
  private readonly logger: Logger;
  private readonly agents: Map<AgentName, Agent>;
  private readonly artifacts: ArtifactStorage;
  private memory: ProjectMemory;

  constructor({ config, logger, agents }: OrchestratorDeps, projectId: string) {
    this.config = config;
    this.logger = logger.child({ component: 'orchestrator', projectId });
    this.agents = agents;
    this.artifacts = new ArtifactStorage(config.artifactsDir);
    this.memory = new ProjectMemory(config.projectsDir + '/' + projectId, projectId);
  }

  initializeProject(request: ProjectRequest): string {
    const projectId = this.memory.get().projectId;
    this.memory.updateMetadata({
      projectId,
      name: request.name,
      description: request.description,
      goals: request.goals,
      scope: [],
      status: 'CREATED',
    });

    const requestArtifact: Artifact = {
      artifactId: createId('artifact'),
      projectId,
      type: 'request',
      name: request.name,
      version: 1,
      createdAt: nowIso(),
      createdBy: 'Orchestrator',
      content: request,
    };
    this.artifacts.save(requestArtifact);
    this.memory.addArtifact(requestArtifact.artifactId);

    this.memory.addAudit('PROJECT_CREATED', { request });
    this.logger.info('Project created', { projectId });
    return projectId;
  }

  async run(request: ProjectRequest): Promise<string> {
    const projectId = this.initializeProject(request);
    this.memory.updateWorkflowState({ status: 'RUNNING', nextStage: 'PLANNING' });
    this.memory.addAudit('WORKFLOW_STARTED', { projectId });

    try {
      await this.runSequential(request);
      this.memory.updateWorkflowState({ status: 'COMPLETED', currentStage: 'COMPLETED', nextStage: null });
      this.memory.addAudit('WORKFLOW_COMPLETED', { projectId });
      return projectId;
    } catch (error) {
      this.memory.updateWorkflowState({ status: 'FAILED', currentStage: 'FAILED', nextStage: null });
      this.memory.addError({
        errorId: createId('error'),
        agent: 'Orchestrator',
        stage: this.memory.get().workflowState.currentStage,
        message: error instanceof Error ? error.message : String(error),
        retryCount: this.memory.get().workflowState.retryCount,
        timestamp: nowIso(),
        resolutionStatus: 'FAILED',
      });
      this.memory.addAudit('WORKFLOW_FAILED', { projectId, error: String(error) });
      throw error;
    }
  }

  private async runSequential(request: ProjectRequest): Promise<void> {
    await this.executeAgent('Planner', 'PLANNING', 'Analyze user requirements and produce a planning artifact.', this.pickLatest(['request']));
    await this.executeAgent('Architect', 'ARCHITECTURE', 'Design the system architecture from planning output.', this.pickLatest(['planning']));

    await this.executeAgent('Backend', 'BACKEND_DEVELOPMENT', 'Implement backend from architecture blueprint.', this.pickLatest(['architecture']));
    await this.executeAgent('Frontend', 'FRONTEND_DEVELOPMENT', 'Implement frontend from architecture and backend artifacts.', this.pickLatest(['architecture', 'backend']));

    await this.runQaLoop();
    await this.runSecurityLoop();

    await this.executeAgent('DevOps', 'DEPLOYMENT', 'Build and deploy the validated system.', this.pickAll());
    await this.executeAgent('Reporter', 'REPORTING', 'Produce the final project report from all artifacts.', this.pickAll());
  }

  private async runQaLoop(): Promise<void> {
    for (let round = 1; round <= this.config.maxQaRounds; round += 1) {
      this.logger.info('QA round', { round });
      await this.executeAgent('QA', 'QUALITY_ASSURANCE', 'Validate implementation against requirements and blueprint.', this.pickAll());
      const qa = this.latestArtifact<QaArtifact>('qa');
      if (!qa || qa.recommendation !== 'DEBUG') {
        return;
      }
      await this.executeAgent('Debug', 'DEBUGGING', 'Fix only the bugs reported by QA.', this.pickAll());
    }
    const qa = this.latestArtifact<QaArtifact>('qa');
    if (qa?.recommendation === 'DEBUG') {
      throw new Error('QA failed after maximum rounds');
    }
  }

  private async runSecurityLoop(): Promise<void> {
    for (let round = 1; round <= this.config.maxSecurityRounds; round += 1) {
      this.logger.info('Security round', { round });
      await this.executeAgent('Security', 'SECURITY_AUDIT', 'Audit the application for security issues.', this.pickAll());
      const security = this.latestArtifact<SecurityAuditArtifact>('security');
      if (!security || security.recommendation !== 'DEBUG') {
        return;
      }
      await this.executeAgent('Debug', 'DEBUGGING', 'Fix only the security findings reported by the security audit.', this.pickAll());
      await this.executeAgent('QA', 'QUALITY_ASSURANCE', 'Re-verify after security fixes.', this.pickAll());
      const qa = this.latestArtifact<QaArtifact>('qa');
      if (qa?.recommendation === 'DEBUG') {
        throw new Error('QA failed after security fixes');
      }
    }
    const security = this.latestArtifact<SecurityAuditArtifact>('security');
    if (security?.recommendation === 'DEBUG') {
      throw new Error('Security audit failed after maximum rounds');
    }
  }

  private async executeAgent(
    agentName: AgentName,
    stage: WorkflowStage,
    instructions: string,
    inputArtifacts: Artifact[],
  ): Promise<JobResult> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not registered: ${agentName}`);
    }

    this.memory.setStage(stage, agentName);
    this.memory.updateWorkflowState({ nextStage: stage });
    this.memory.addAudit('AGENT_STARTED', { agentName, stage });

    const job: Job = {
      jobId: createId('job'),
      projectId: this.memory.get().projectId,
      stage,
      targetAgent: agentName,
      inputArtifacts,
      instructions,
      timestamp: nowIso(),
    };

    const startedAt = nowIso();
    let result: JobResult | null = null;
    let lastError = '';

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        result = await agent.execute(job);
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        this.logger.warn('Agent attempt failed', { agentName, attempt, error: lastError });
        this.memory.addError({
          errorId: createId('error'),
          agent: agentName,
          stage,
          message: lastError,
          retryCount: attempt,
          timestamp: nowIso(),
          resolutionStatus: attempt < this.config.maxRetries ? 'RETRYING' : 'FAILED',
        });
      }
    }

    if (!result) {
      this.memory.addExecution({
        executionId: createId('exec'),
        agent: agentName,
        stage,
        startedAt,
        finishedAt: nowIso(),
        status: 'FAILED',
        summary: lastError,
      });
      this.memory.addAudit('AGENT_FAILED', { agentName, stage, error: lastError });
      throw new Error(`Agent ${agentName} failed: ${lastError}`);
    }

    if (result.status !== 'COMPLETED') {
      const error = result.error ?? 'Agent returned failed status';
      this.memory.addExecution({
        executionId: createId('exec'),
        agent: agentName,
        stage,
        startedAt,
        finishedAt: nowIso(),
        status: 'FAILED',
        summary: result.summary,
      });
      this.memory.addError({
        errorId: createId('error'),
        agent: agentName,
        stage,
        message: error,
        retryCount: this.memory.get().workflowState.retryCount,
        timestamp: nowIso(),
        resolutionStatus: 'FAILED',
      });
      this.memory.addAudit('AGENT_FAILED', { agentName, stage, error });
      throw new Error(`Agent ${agentName} failed: ${error}`);
    }

    for (const artifact of result.outputArtifacts) {
      this.artifacts.save(artifact);
      this.memory.addArtifact(artifact.artifactId);
    }

    this.memory.addExecution({
      executionId: createId('exec'),
      agent: agentName,
      stage,
      startedAt,
      finishedAt: nowIso(),
      status: 'COMPLETED',
      summary: result.summary,
    });
    this.memory.addAudit('AGENT_COMPLETED', { agentName, stage, artifacts: result.outputArtifacts.length });

    this.logger.info('Agent completed', { agentName, stage, artifacts: result.outputArtifacts.length });
    return result;
  }

  private pickLatest(types: string[]): Artifact[] {
    const result: Artifact[] = [];
    for (const type of types) {
      const artifact = this.artifacts.getLatestByType(this.memory.get().projectId, type);
      if (artifact) result.push(artifact);
    }
    return result;
  }

  private pickAll(): Artifact[] {
    return this.artifacts.list(this.memory.get().projectId);
  }

  private latestArtifact<T>(type: string): T | undefined {
    const artifact = this.artifacts.getLatestByType(this.memory.get().projectId, type);
    return artifact?.content as T | undefined;
  }

  getProjectId(): string {
    return this.memory.get().projectId;
  }

  getFinalReport(): Artifact | undefined {
    return this.artifacts.getLatestByType(this.memory.get().projectId, 'final-report');
  }
}
