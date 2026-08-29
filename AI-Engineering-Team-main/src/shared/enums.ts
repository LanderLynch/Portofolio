export const WORKFLOW_STAGES = [
  'CREATED',
  'PLANNING',
  'ARCHITECTURE',
  'BACKEND_DEVELOPMENT',
  'FRONTEND_DEVELOPMENT',
  'QUALITY_ASSURANCE',
  'DEBUGGING',
  'SECURITY_AUDIT',
  'DEPLOYMENT',
  'REPORTING',
  'COMPLETED',
  'FAILED',
] as const;

export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export const WORKFLOW_STATUS = [
  'CREATED',
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUS)[number];

export const AGENT_STATUS = [
  'IDLE',
  'WAITING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
] as const;

export type AgentStatus = (typeof AGENT_STATUS)[number];

export const AGENT_NAMES = [
  'Orchestrator',
  'Planner',
  'Architect',
  'Backend',
  'Frontend',
  'QA',
  'Debug',
  'Security',
  'DevOps',
  'Reporter',
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];

export type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type TestStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
