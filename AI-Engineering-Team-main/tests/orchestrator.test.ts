import { describe, expect, it } from 'vitest';
import { Orchestrator } from '../src/orchestrator/orchestrator.js';
import { ConfigManager } from '../src/config/config-manager.js';
import { createLogger } from '../src/shared/logger.js';
import { createAgentRegistry } from '../src/agents/agent-registry.js';

describe('Orchestrator', () => {
  it('runs the full workflow end to end', async () => {
    const config = new ConfigManager({
      repositoryRoot: process.cwd(),
      projectsDir: 'projects-test',
      artifactsDir: 'artifacts-test',
      logsDir: 'logs-test',
    });
    const agents = createAgentRegistry();
    const orchestrator = new Orchestrator(
      { config: config.config, logger: createLogger('error'), agents },
      'proj-test',
    );

    const projectId = await orchestrator.run({
      name: 'End to End Test',
      description: 'Run every agent.',
      goals: ['Create a dashboard', 'Add authentication'],
    });

    expect(projectId).toBe('proj-test');
    expect(orchestrator.getFinalReport()).toBeDefined();
  });
});
