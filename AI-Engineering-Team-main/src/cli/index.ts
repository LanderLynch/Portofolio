import process from 'node:process';
import { ConfigManager } from '../config/config-manager.js';
import { Orchestrator } from '../orchestrator/orchestrator.js';
import { createAgentRegistry } from '../agents/agent-registry.js';
import { createLogger } from '../shared/logger.js';
import { asJson } from '../shared/utils.js';
import type { ProjectRequest } from '../shared/models.js';

function parseArgs(argv: string[]): ProjectRequest {
  const positional = argv.filter((arg) => !arg.startsWith('--'));

  if (positional.length === 0) {
    return {
      name: 'Demo Project',
      description: 'Demonstrate the full AI Engineering Team workflow.',
      goals: ['Create a simple product dashboard', 'Allow authenticated data access'],
      additionalNotes: 'Default demo request created by the CLI.',
    };
  }

  const name = positional[0];
  const description = positional[1] ?? `Build ${name} end to end.`;
  const goals = positional.slice(2);

  return {
    name,
    description,
    goals: goals.length ? goals : [`Build ${name} end to end.`],
  };
}

async function main(): Promise<void> {
  const config = new ConfigManager();
  const logger = createLogger(config.config.logLevel, { component: 'cli' });
  const agents = createAgentRegistry();
  const request = parseArgs(process.argv.slice(2));

  logger.info('Starting AI Engineering Team workflow', { request });

  const orchestrator = new Orchestrator(
    { config: config.config, logger, agents },
    createTemporaryProjectId(),
  );

  const projectId = await orchestrator.run(request);
  const finalReport = orchestrator.getFinalReport();

  console.log(asJson({
    projectId,
    finalReport: finalReport?.content ?? null,
  }));

  logger.info('Workflow finished', { projectId });
}

function createTemporaryProjectId(): string {
  return `proj-${Date.now().toString(36)}`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
