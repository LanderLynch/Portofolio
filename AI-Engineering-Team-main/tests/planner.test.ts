import { describe, expect, it } from 'vitest';
import { PlannerAgent } from '../src/planner/planner-agent.js';
import type { Job, ProjectRequest } from '../src/shared/models.js';

function makeRequest(): ProjectRequest {
  return {
    name: 'Test App',
    description: 'A small test application.',
    goals: ['Allow users to log in', 'Show a dashboard'],
  };
}

function makeJob(request: ProjectRequest): Job {
  return {
    jobId: 'job-test',
    projectId: 'proj-test',
    stage: 'PLANNING',
    targetAgent: 'Planner',
    instructions: 'Plan the project',
    inputArtifacts: [
      {
        artifactId: 'artifact-test',
        projectId: 'proj-test',
        type: 'request',
        name: 'Test App',
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: 'Orchestrator',
        content: request,
      },
    ],
    timestamp: '2026-01-01T00:00:00.000Z',
  };
}

describe('PlannerAgent', () => {
  it('produces a planning artifact', async () => {
    const agent = new PlannerAgent();
    const result = await agent.execute(makeJob(makeRequest()));

    expect(result.status).toBe('COMPLETED');
    expect(result.outputArtifacts).toHaveLength(1);
    expect(result.outputArtifacts[0].type).toBe('planning');
  });

  it('fails without a request artifact', async () => {
    const agent = new PlannerAgent();
    const job = makeJob(makeRequest());
    job.inputArtifacts = [];

    const result = await agent.execute(job);
    expect(result.status).toBe('FAILED');
  });
});
