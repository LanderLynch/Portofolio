import fs from 'node:fs';
import path from 'node:path';
import type {
  AuditRecord,
  ErrorRecord,
  ExecutionRecord,
  ProjectMetadata,
  Task,
  WorkflowState,
} from '../shared/models.js';
import { asJson, createId, nowIso } from '../shared/utils.js';
import type { WorkflowStage } from '../shared/enums.js';
import type { AgentName } from '../shared/enums.js';

export interface ProjectMemorySnapshot {
  projectId: string;
  metadata: ProjectMetadata;
  workflowState: WorkflowState;
  tasks: Task[];
  artifacts: string[];
  executionHistory: ExecutionRecord[];
  errorHistory: ErrorRecord[];
  auditHistory: AuditRecord[];
}

export class ProjectMemory {
  private readonly memoryDir: string;
  private readonly memoryFile: string;
  private snapshot: ProjectMemorySnapshot | null = null;

  constructor(projectDir: string, projectId: string) {
    this.memoryDir = projectDir;
    this.memoryFile = path.join(projectDir, 'memory.json');
    fs.mkdirSync(this.memoryDir, { recursive: true });
    this.load(projectId);
  }

  private load(projectId: string): void {
    if (fs.existsSync(this.memoryFile)) {
      this.snapshot = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8')) as ProjectMemorySnapshot;
      return;
    }

    const now = nowIso();
    this.snapshot = {
      projectId,
      metadata: {
        projectId,
        name: '',
        description: '',
        goals: [],
        scope: [],
        createdAt: now,
        updatedAt: now,
        status: 'CREATED',
      },
      workflowState: {
        currentStage: 'CREATED',
        currentAgent: null,
        previousStage: null,
        nextStage: 'PLANNING',
        status: 'CREATED',
        retryCount: 0,
      },
      tasks: [],
      artifacts: [],
      executionHistory: [],
      errorHistory: [],
      auditHistory: [],
    };
    this.persist();
  }

  private persist(): void {
    if (!this.snapshot) {
      throw new Error('Project memory is not initialized');
    }
    fs.writeFileSync(this.memoryFile, asJson(this.snapshot), 'utf8');
  }

  get(): ProjectMemorySnapshot {
    if (!this.snapshot) {
      throw new Error('Project memory is not initialized');
    }
    return this.snapshot;
  }

  updateMetadata(patch: Partial<ProjectMetadata>): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.metadata = {
      ...this.snapshot.metadata,
      ...patch,
      projectId: this.snapshot.projectId,
      updatedAt: nowIso(),
    };
    this.persist();
  }

  updateWorkflowState(patch: Partial<WorkflowState>): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.workflowState = {
      ...this.snapshot.workflowState,
      ...patch,
    };
    this.persist();
  }

  setTasks(tasks: Task[]): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.tasks = tasks;
    this.persist();
  }

  updateTask(taskId: string, patch: Partial<Task>): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.tasks = this.snapshot.tasks.map((task) =>
      task.taskId === taskId ? { ...task, ...patch } : task,
    );
    this.persist();
  }

  addArtifact(artifactId: string): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    if (!this.snapshot.artifacts.includes(artifactId)) {
      this.snapshot.artifacts.push(artifactId);
      this.persist();
    }
  }

  addExecution(execution: ExecutionRecord): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.executionHistory.push(execution);
    this.persist();
  }

  addError(error: ErrorRecord): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.errorHistory.push(error);
    this.persist();
  }

  addAudit(event: string, details: Record<string, unknown> = {}): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    this.snapshot.auditHistory.push({
      auditId: createId('audit'),
      timestamp: nowIso(),
      event,
      details,
    });
    this.persist();
  }

  setStage(stage: WorkflowStage, agent: AgentName | null): void {
    if (!this.snapshot) throw new Error('Project memory is not initialized');
    const current = this.snapshot.workflowState.currentStage;
    this.snapshot.workflowState = {
      ...this.snapshot.workflowState,
      previousStage: current,
      currentStage: stage,
      currentAgent: agent,
    };
    this.persist();
  }
}
