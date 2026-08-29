import type { AgentName } from '../shared/enums.js';
import type {
  Feature,
  FunctionalRequirement,
  Job,
  JobResult,
  NonFunctionalRequirement,
  PlanningArtifact,
  ProjectRequest,
  Task,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class PlannerAgent extends BaseAgent {
  readonly name: AgentName = 'Planner';

  async execute(job: Job): Promise<JobResult> {
    const requestArtifact = job.inputArtifacts.find((artifact) => artifact.type === 'request');
    if (!requestArtifact) {
      return this.fail(job, 'Planner requires a request artifact');
    }

    const request = requestArtifact.content as ProjectRequest;
    const goalText = request.goals.join('. ');
    const features = this.deriveFeatures(request);
    const functionalRequirements = this.deriveFunctionalRequirements(request);
    const nonFunctionalRequirements = this.defaultNonFunctionalRequirements();
    const tasks = this.deriveTasks(features);

    const artifact: PlanningArtifact = {
      requirementAnalysis: {
        overview: `${request.description} ${goalText}`.trim(),
        goals: request.goals,
      },
      functionalRequirements,
      nonFunctionalRequirements,
      featureList: features,
      taskList: tasks,
      scopeIn: features.map((feature) => feature.name),
      scopeOut: request.additionalNotes && request.additionalNotes.includes('scope-exclude')
        ? request.additionalNotes.split(',')
        : [],
      summary: `Planned ${features.length} features and ${tasks.length} tasks for ${request.name}.`,
    };

    const planningArtifact = this.makeArtifact(job, 'planning', 'Requirement Planning', artifact);
    return this.success(job, [planningArtifact], artifact.summary);
  }

  private deriveFeatures(request: ProjectRequest): Feature[] {
    const base = [
      {
        featureId: 'feat-auth',
        name: 'Authentication',
        description: 'Secure sign-in, session handling, and credential validation.',
      },
      {
        featureId: 'feat-data',
        name: 'Data Management',
        description: 'Create, read, update, and delete core project data.',
      },
      {
        featureId: 'feat-dashboard',
        name: 'Dashboard',
        description: 'A primary view for the most important project information.',
      },
      {
        featureId: 'feat-reporting',
        name: 'Reporting',
        description: 'Summaries and exportable records of project activity.',
      },
    ];

    const explicitFeatures: Feature[] = request.goals.map((goal, index) => ({
      featureId: `feat-goal-${index + 1}`,
      name: this.titleCase(goal.slice(0, 48)),
      description: goal,
    }));

    return [...base, ...explicitFeatures].slice(0, 10);
  }

  private deriveFunctionalRequirements(request: ProjectRequest): FunctionalRequirement[] {
    return this.deriveFeatures(request).map((feature, index) => ({
      requirementId: `FR-${String(index + 1).padStart(3, '0')}`,
      name: feature.name,
      description: `The system must support ${feature.name.toLowerCase()} as described: ${feature.description}`,
    }));
  }

  private defaultNonFunctionalRequirements(): NonFunctionalRequirement[] {
    const categories: NonFunctionalRequirement['category'][] = [
      'PERFORMANCE',
      'SECURITY',
      'RELIABILITY',
      'SCALABILITY',
      'MAINTAINABILITY',
      'AVAILABILITY',
    ];
    return categories.map((category, index) => ({
      requirementId: `NFR-${String(index + 1).padStart(3, '0')}`,
      name: category.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      category,
      description: `The system must satisfy baseline ${category.toLowerCase()} requirements defined in the project blueprint.`,
    }));
  }

  private deriveTasks(features: Feature[]): Task[] {
    return features.map((feature, index) => ({
      taskId: `TASK-${String(index + 1).padStart(3, '0')}`,
      name: `Build ${feature.name} Module`,
      description: `Implement the ${feature.name} feature end to end.`,
      assignedAgent: this.agentForTask(feature.name),
      status: 'PENDING',
    }));
  }

  private agentForTask(featureName: string): AgentName {
    const name = featureName.toLowerCase();
    if (name.includes('report')) return 'Reporter';
    if (name.includes('security') || name.includes('auth')) return 'Backend';
    if (name.includes('dashboard') || name.includes('ui') || name.includes('view')) return 'Frontend';
    if (name.includes('data') || name.includes('api')) return 'Backend';
    return 'Architect';
  }

  private titleCase(value: string): string {
    return value
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
