import type { AgentName } from '../shared/enums.js';
import type { Agent } from './agent.js';
import { PlannerAgent } from '../planner/planner-agent.js';
import { ArchitectAgent } from '../architect/architect-agent.js';
import { BackendAgent } from '../backend/backend-agent.js';
import { FrontendAgent } from '../frontend/frontend-agent.js';
import { QaAgent } from '../qa/qa-agent.js';
import { DebugAgent } from '../debug/debug-agent.js';
import { SecurityAgent } from '../security/security-agent.js';
import { DevopsAgent } from '../devops/devops-agent.js';
import { ReporterAgent } from '../reporter/reporter-agent.js';

export function createAgentRegistry(): Map<AgentName, Agent> {
  const agents: Agent[] = [
    new PlannerAgent(),
    new ArchitectAgent(),
    new BackendAgent(),
    new FrontendAgent(),
    new QaAgent(),
    new DebugAgent(),
    new SecurityAgent(),
    new DevopsAgent(),
    new ReporterAgent(),
  ];

  return new Map(agents.map((agent) => [agent.name, agent]));
}
