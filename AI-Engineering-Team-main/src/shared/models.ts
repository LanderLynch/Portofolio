import type { AgentName, AgentStatus, WorkflowStage, WorkflowStatus } from './enums.js';

export interface ProjectRequest {
  name: string;
  goals: string[];
  description: string;
  additionalNotes?: string;
}

export interface ProjectMetadata {
  projectId: string;
  name: string;
  description: string;
  goals: string[];
  scope: string[];
  createdAt: string;
  updatedAt: string;
  status: WorkflowStatus;
}

export interface Task {
  taskId: string;
  name: string;
  description: string;
  assignedAgent: AgentName;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  finishedAt?: string;
}

export interface WorkflowState {
  currentStage: WorkflowStage;
  currentAgent: AgentName | null;
  previousStage: WorkflowStage | null;
  nextStage: WorkflowStage | null;
  status: WorkflowStatus;
  retryCount: number;
}

export interface ExecutionRecord {
  executionId: string;
  agent: AgentName;
  stage: WorkflowStage;
  startedAt: string;
  finishedAt?: string;
  status: AgentStatus;
  summary: string;
}

export interface ErrorRecord {
  errorId: string;
  agent: AgentName;
  stage: WorkflowStage;
  message: string;
  retryCount: number;
  timestamp: string;
  resolutionStatus: 'OPEN' | 'RETRYING' | 'RESOLVED' | 'FAILED';
}

export interface AuditRecord {
  auditId: string;
  timestamp: string;
  event: string;
  details: Record<string, unknown>;
}

export interface Artifact {
  artifactId: string;
  projectId: string;
  type: string;
  name: string;
  version: number;
  createdAt: string;
  createdBy: AgentName;
  content: unknown;
}

export interface Job {
  jobId: string;
  projectId: string;
  stage: WorkflowStage;
  targetAgent: AgentName;
  inputArtifacts: Artifact[];
  instructions: string;
  timestamp: string;
}

export interface JobResult {
  jobId: string;
  projectId: string;
  agentName: AgentName;
  status: AgentStatus;
  outputArtifacts: Artifact[];
  summary: string;
  error?: string;
  timestamp: string;
}

export interface RequirementAnalysis {
  overview: string;
  goals: string[];
}

export interface FunctionalRequirement {
  requirementId: string;
  name: string;
  description: string;
}

export interface NonFunctionalRequirement {
  requirementId: string;
  name: string;
  category: 'PERFORMANCE' | 'SECURITY' | 'RELIABILITY' | 'SCALABILITY' | 'MAINTAINABILITY' | 'AVAILABILITY';
  description: string;
}

export interface Feature {
  featureId: string;
  name: string;
  description: string;
}

export interface PlanningArtifact {
  requirementAnalysis: RequirementAnalysis;
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  featureList: Feature[];
  taskList: Task[];
  scopeIn: string[];
  scopeOut: string[];
  summary: string;
}

export interface ModuleDesign {
  moduleId: string;
  name: string;
  purpose: string;
  responsibilities: string[];
  dependencies: string[];
}

export interface ApiEndpoint {
  endpointId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestShape?: string;
  responseShape?: string;
  errorResponses?: string[];
}

export interface DatabaseEntity {
  entityId: string;
  name: string;
  fields: { name: string; type: string; constraints?: string }[];
  relationships: string[];
}

export interface ArchitectureArtifact {
  technicalSpecification: string;
  architectureStyle: string;
  layers: string[];
  projectStructure: string[];
  moduleDesigns: ModuleDesign[];
  databaseDesign: DatabaseEntity[];
  apiDesign: ApiEndpoint[];
  technologyStack: string[];
  developmentGuidelines: string[];
  summary: string;
}

export interface BackendImplementationArtifact {
  sourceFiles: { path: string; content: string }[];
  apiImplemented: ApiEndpoint[];
  businessLogic: string[];
  authentication: string[];
  authorization: string[];
  databaseLayer: string[];
  buildInstructions: string[];
  report: string;
}

export interface FrontendImplementationArtifact {
  sourceFiles: { path: string; content: string }[];
  uiComponents: string[];
  pages: string[];
  routing: string[];
  apiIntegration: string[];
  clientValidation: string[];
  buildInstructions: string[];
  report: string;
}

export interface Bug {
  bugId: string;
  title: string;
  description: string;
  reproductionSteps: string[];
  expectedResult: string;
  actualResult: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'FIXED' | 'VERIFIED' | 'WONT_FIX';
}

export interface TestCase {
  testId: string;
  name: string;
  requirementRef: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  actualResult: string;
  status: 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';
}

export interface QaArtifact {
  totalRequirements: number;
  passedRequirements: number;
  failedRequirements: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  testCases: TestCase[];
  bugs: Bug[];
  recommendation: 'PROCEED' | 'DEBUG';
  summary: string;
}

export interface DebugArtifact {
  rootCauseAnalyses: {
    bugId: string;
    rootCause: string;
    affectedModules: string[];
    impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    solution: string;
  }[];
  changedFiles: {
    path: string;
    reason: string;
    summary: string;
    impact: string;
  }[];
  updatedSourceFiles: { path: string; content: string }[];
  validationNotes: string[];
  report: string;
}

export interface SecurityFinding {
  findingId: string;
  title: string;
  description: string;
  affectedModule: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  potentialImpact: string;
  recommendation: string;
}

export interface SecurityAuditArtifact {
  scope: string[];
  findings: SecurityFinding[];
  riskAssessment: string;
  recommendation: 'PROCEED' | 'DEBUG';
  summary: string;
}

export interface DeploymentArtifact {
  buildStatus: 'SUCCESS' | 'FAILED';
  environment: string;
  deploymentStatus: 'SUCCESS' | 'FAILED';
  verification: {
    backendAccessible: boolean;
    frontendAccessible: boolean;
    apiResponding: boolean;
    configApplied: boolean;
    criticalErrors: string[];
  };
  buildPackage: string;
  report: string;
}

export interface FinalReportArtifact {
  projectInfo: {
    projectId: string;
    projectName: string;
    projectStatus: string;
    startTime: string;
    finishTime: string;
  };
  requirementSummary: string;
  architectureSummary: string;
  developmentSummary: string;
  testingSummary: string;
  debugSummary: string;
  securitySummary: string;
  deploymentSummary: string;
  statistics: {
    totalFeatures: number;
    totalTasks: number;
    totalModules: number;
    totalBugs: number;
    totalSecurityFindings: number;
    deploymentStatus: string;
    overallStatus: string;
  };
  conclusion: string;
}

export type AgentArtifact =
  | PlanningArtifact
  | ArchitectureArtifact
  | BackendImplementationArtifact
  | FrontendImplementationArtifact
  | QaArtifact
  | DebugArtifact
  | SecurityAuditArtifact
  | DeploymentArtifact
  | FinalReportArtifact;
