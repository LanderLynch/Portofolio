import type { AgentName } from '../shared/enums.js';
import type {
  ArchitectureArtifact,
  BackendImplementationArtifact,
  Job,
  JobResult,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class BackendAgent extends BaseAgent {
  readonly name: AgentName = 'Backend';

  async execute(job: Job): Promise<JobResult> {
    const architectureArtifact = job.inputArtifacts.find((artifact) => artifact.type === 'architecture');
    if (!architectureArtifact) {
      return this.fail(job, 'Backend requires an architecture artifact');
    }

    const architecture = architectureArtifact.content as ArchitectureArtifact;
    const files = this.generateSourceFiles(architecture);

    const artifact: BackendImplementationArtifact = {
      sourceFiles: files,
      apiImplemented: architecture.apiDesign,
      businessLogic: architecture.moduleDesigns.map(
        (module) => `${module.name} service with deterministic input validation and error handling.`,
      ),
      authentication: ['Login endpoint', 'Token validation', 'Credential hashing placeholder'],
      authorization: ['Role check middleware', 'Resource ownership check'],
      databaseLayer: architecture.databaseDesign.map(
        (entity) => `${entity.name} repository with create, read, update, and delete operations.`,
      ),
      buildInstructions: ['Run `npm install`', 'Run `npm run build`', 'Start the API server'],
      report: `Backend implemented ${files.length} source files from the architecture blueprint.`,
    };

    const backendArtifact = this.makeArtifact(job, 'backend', 'Backend Implementation', artifact);
    return this.success(job, [backendArtifact], artifact.report);
  }

  private generateSourceFiles(architecture: ArchitectureArtifact): { path: string; content: string }[] {
    const files: { path: string; content: string }[] = [];

    files.push({
      path: 'src/backend/server.ts',
      content: `import { createServer } from 'node:http';

export function startServer(port = Number(process.env.PORT ?? 3000)) {
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, path: req.url }));
  });
  server.listen(port, () => {
    console.log(\`API listening on port \${port}\`);
  });
  return server;
}
`,
    });

    for (const module of architecture.moduleDesigns) {
      const moduleName = module.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      files.push({
        path: `src/backend/services/${moduleName}-service.ts`,
        content: `export class ${module.name.replace(/[^a-zA-Z0-9]/g, '')}Service {
  private data: unknown[] = [];

  create(input: unknown) {
    this.data.push(input);
    return input;
  }

  list() {
    return this.data;
  }

  validate(input: unknown): string[] {
    return input === undefined || input === null ? ['Input is required'] : [];
  }
}
`,
      });
    }

    files.push({
      path: 'src/backend/routes/index.ts',
      content: `import type { IncomingMessage, ServerResponse } from 'node:http';

export function handleRoutes(req: IncomingMessage, res: ServerResponse) {
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}
`,
    });

    return files;
  }
}
