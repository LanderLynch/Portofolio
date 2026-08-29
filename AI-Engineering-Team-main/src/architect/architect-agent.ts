import type { AgentName } from '../shared/enums.js';
import type {
  ApiEndpoint,
  ArchitectureArtifact,
  DatabaseEntity,
  Job,
  JobResult,
  ModuleDesign,
  PlanningArtifact,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class ArchitectAgent extends BaseAgent {
  readonly name: AgentName = 'Architect';

  async execute(job: Job): Promise<JobResult> {
    const planningArtifact = job.inputArtifacts.find((artifact) => artifact.type === 'planning');
    if (!planningArtifact) {
      return this.fail(job, 'Architect requires a planning artifact');
    }

    const planning = planningArtifact.content as PlanningArtifact;
    const featureNames = planning.featureList.map((feature) => feature.name);

    const moduleDesigns: ModuleDesign[] = featureNames.map((name, index) => ({
      moduleId: `mod-${String(index + 1).padStart(3, '0')}`,
      name,
      purpose: `Implement the ${name} feature described in the planning artifact.`,
      responsibilities: [
        `Expose the ${name} capability to its consumers.`,
        'Validate inputs and return structured results.',
        'Follow the shared error and logging standards.',
      ],
      dependencies: index === 0 ? [] : [`mod-${String(index).padStart(3, '0')}`],
    }));

    const entities: DatabaseEntity[] = [
      {
        entityId: 'ent-001',
        name: 'User',
        fields: [
          { name: 'id', type: 'string', constraints: 'primary key' },
          { name: 'email', type: 'string', constraints: 'unique, required' },
          { name: 'createdAt', type: 'datetime', constraints: 'required' },
        ],
        relationships: ['Has many project records'],
      },
      {
        entityId: 'ent-002',
        name: 'ProjectRecord',
        fields: [
          { name: 'id', type: 'string', constraints: 'primary key' },
          { name: 'userId', type: 'string', constraints: 'foreign key to User' },
          { name: 'data', type: 'json', constraints: 'required' },
        ],
        relationships: ['Belongs to one User'],
      },
    ];

    const endpoints: ApiEndpoint[] = [
      {
        endpointId: 'api-001',
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate a user and return a session token.',
      },
      {
        endpointId: 'api-002',
        method: 'GET',
        path: '/api/records',
        description: 'List project records for the authenticated user.',
      },
      {
        endpointId: 'api-003',
        method: 'POST',
        path: '/api/records',
        description: 'Create a new project record.',
      },
      {
        endpointId: 'api-004',
        method: 'GET',
        path: '/api/health',
        description: 'Return system health information for monitoring.',
      },
    ];

    const artifact: ArchitectureArtifact = {
      technicalSpecification:
        'Orchestrator-centric multi-agent system. The application is split into clear backend and frontend modules, with deterministic data flow and standardized artifact handoffs.',
      architectureStyle: 'Layered + modular monolith (first version)',
      layers: ['Presentation', 'Application', 'Domain', 'Infrastructure'],
      projectStructure: [
        'src/backend/',
        'src/frontend/',
        'src/shared/',
        'tests/',
        'artifacts/',
      ],
      moduleDesigns,
      databaseDesign: entities,
      apiDesign: endpoints,
      technologyStack: ['TypeScript', 'Node.js', 'REST API'],
      developmentGuidelines: [
        'Single responsibility per module.',
        'Structured validation at every boundary.',
        'No direct communication between agents outside the Orchestrator.',
        'Keep artifacts traceable and versioned.',
      ],
      summary: `Designed ${moduleDesigns.length} modules, ${entities.length} entities, and ${endpoints.length} endpoints from the planning output.`,
    };

    const architectureArtifact = this.makeArtifact(job, 'architecture', 'Technical Architecture', artifact);
    return this.success(job, [architectureArtifact], artifact.summary);
  }
}
