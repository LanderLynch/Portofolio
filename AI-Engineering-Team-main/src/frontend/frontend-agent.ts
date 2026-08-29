import type { AgentName } from '../shared/enums.js';
import type {
  ArchitectureArtifact,
  BackendImplementationArtifact,
  FrontendImplementationArtifact,
  Job,
  JobResult,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class FrontendAgent extends BaseAgent {
  readonly name: AgentName = 'Frontend';

  async execute(job: Job): Promise<JobResult> {
    const architectureArtifact = job.inputArtifacts.find((artifact) => artifact.type === 'architecture');
    const backendArtifact = job.inputArtifacts.find((artifact) => artifact.type === 'backend');
    if (!architectureArtifact || !backendArtifact) {
      return this.fail(job, 'Frontend requires architecture and backend artifacts');
    }

    const architecture = architectureArtifact.content as ArchitectureArtifact;
    const backend = backendArtifact.content as BackendImplementationArtifact;

    const files: { path: string; content: string }[] = [];

    for (const module of architecture.moduleDesigns) {
      const moduleName = module.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      files.push({
        path: `src/frontend/pages/${moduleName}-page.ts`,
        content: `export function render${module.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return \`<section><h1>${module.name}</h1><p>${module.purpose}</p></section>\`;
}
`,
      });
    }

    files.push({
      path: 'src/frontend/app.ts',
      content: `import { render${architecture.moduleDesigns[0]?.name.replace(/[^a-zA-Z0-9]/g, '') ?? 'Home'}Page } from './pages/${architecture.moduleDesigns[0]?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? 'home'}-page';

export function renderApp() {
  return \`<main>\${render${architecture.moduleDesigns[0]?.name.replace(/[^a-zA-Z0-9]/g, '') ?? 'Home'}Page()}</main>\`;
}
`,
    });

    files.push({
      path: 'src/frontend/api-client.ts',
      content: `export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options);
  if (!response.ok) {
    throw new Error(\`API request failed: \${response.status}\`);
  }
  return response.json() as Promise<T>;
}
`,
    });

    const artifact: FrontendImplementationArtifact = {
      sourceFiles: files,
      uiComponents: architecture.moduleDesigns.map((module) => `${module.name}View`),
      pages: architecture.moduleDesigns.map((module) => `${module.name}Page`),
      routing: ['/', ...architecture.moduleDesigns.map((module) => `/${module.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)],
      apiIntegration: architecture.apiDesign.map(
        (endpoint) => `${endpoint.method} ${endpoint.path} -> apiRequest`,
      ),
      clientValidation: ['Required field checks', 'Email format check', 'Input length check'],
      buildInstructions: ['Run `npm install`', 'Run `npm run build`', 'Serve the static output'],
      report: `Frontend implemented ${files.length} source files using ${backend.sourceFiles.length} backend files and the architecture blueprint.`,
    };

    const frontendArtifact = this.makeArtifact(job, 'frontend', 'Frontend Implementation', artifact);
    return this.success(job, [frontendArtifact], artifact.report);
  }
}
