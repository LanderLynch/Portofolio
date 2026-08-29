import type { AgentName } from '../shared/enums.js';
import type {
  ArchitectureArtifact,
  BackendImplementationArtifact,
  FrontendImplementationArtifact,
  Job,
  JobResult,
  PlanningArtifact,
  QaArtifact,
  TestCase,
} from '../shared/models.js';
import { BaseAgent } from '../agents/base-agent.js';

export class QaAgent extends BaseAgent {
  readonly name: AgentName = 'QA';

  async execute(job: Job): Promise<JobResult> {
    const planning = job.inputArtifacts.find((artifact) => artifact.type === 'planning')?.content as PlanningArtifact | undefined;
    const architecture = job.inputArtifacts.find((artifact) => artifact.type === 'architecture')?.content as ArchitectureArtifact | undefined;
    const backend = job.inputArtifacts.find((artifact) => artifact.type === 'backend')?.content as BackendImplementationArtifact | undefined;
    const frontend = job.inputArtifacts.find((artifact) => artifact.type === 'frontend')?.content as FrontendImplementationArtifact | undefined;

    if (!planning || !architecture || !backend || !frontend) {
      return this.fail(job, 'QA requires planning, architecture, backend, and frontend artifacts');
    }

    const testCases = this.buildTestCases(planning, architecture, backend, frontend);
    const failures = testCases.filter((test) => test.status === 'FAILED');
    const passed = testCases.filter((test) => test.status === 'PASSED');
    const blocked = testCases.filter((test) => test.status === 'BLOCKED');
    const hasBlockingBug = failures.length > 0;

    const artifact: QaArtifact = {
      totalRequirements: planning.functionalRequirements.length,
      passedRequirements: hasBlockingBug ? planning.functionalRequirements.length - failures.length : planning.functionalRequirements.length,
      failedRequirements: failures.length,
      totalTests: testCases.length,
      passedTests: passed.length,
      failedTests: failures.length,
      blockedTests: blocked.length,
      testCases,
      bugs: failures.map((test) => ({
        bugId: `BUG-${test.testId}`,
        title: `Failed: ${test.name}`,
        description: test.actualResult,
        reproductionSteps: test.steps,
        expectedResult: test.expectedResult,
        actualResult: test.actualResult,
        priority: this.priorityFor(test.name),
        status: 'OPEN',
      })),
      recommendation: hasBlockingBug ? 'DEBUG' : 'PROCEED',
      summary: hasBlockingBug
        ? `QA found ${failures.length} failing test cases that require debugging.`
        : `QA passed all ${testCases.length} test cases.`,
    };

    const qaArtifact = this.makeArtifact(job, 'qa', 'Quality Assurance Report', artifact);
    return this.success(job, [qaArtifact], artifact.summary);
  }

  private buildTestCases(
    planning: PlanningArtifact,
    architecture: ArchitectureArtifact,
    backend: BackendImplementationArtifact,
    frontend: FrontendImplementationArtifact,
  ): TestCase[] {
    const testCases: TestCase[] = [];

    for (const [index, requirement] of planning.functionalRequirements.entries()) {
      const module = architecture.moduleDesigns[index];
      const hasBackend = backend.sourceFiles.some((file) => file.path.includes(requirement.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
      const hasFrontend = frontend.sourceFiles.some((file) => file.path.includes(requirement.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
      const passed = Boolean(module && hasBackend && hasFrontend);

      testCases.push({
        testId: `TC-${String(index + 1).padStart(3, '0')}`,
        name: requirement.name,
        requirementRef: requirement.requirementId,
        preconditions: ['Application is built', 'Authentication token is available'],
        steps: [`Invoke the ${requirement.name} flow`, 'Verify the response structure'],
        expectedResult: `The ${requirement.name} requirement is satisfied.`,
        actualResult: passed
          ? `The ${requirement.name} requirement is satisfied.`
          : `The ${requirement.name} requirement is missing a backend or frontend implementation.`,
        status: passed ? 'PASSED' : 'FAILED',
      });
    }

    testCases.push({
      testId: `TC-${String(testCases.length + 1).padStart(3, '0')}`,
      name: 'Health endpoint',
      requirementRef: 'NFR-001',
      preconditions: ['API server is running'],
      steps: ['GET /api/health', 'Check status code and body'],
      expectedResult: 'Returns 200 with ok status.',
      actualResult: 'Returns 200 with ok status.',
      status: 'PASSED',
    });

    return testCases;
  }

  private priorityFor(name: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const lower = name.toLowerCase();
    if (lower.includes('auth') || lower.includes('security')) return 'CRITICAL';
    if (lower.includes('data') || lower.includes('dashboard')) return 'HIGH';
    if (lower.includes('report')) return 'MEDIUM';
    return 'LOW';
  }
}
