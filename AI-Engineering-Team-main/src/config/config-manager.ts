import path from 'node:path';
import fs from 'node:fs';
import { createLogger, type Logger } from '../shared/logger.js';

export interface AppConfig {
  projectsDir: string;
  artifactsDir: string;
  logsDir: string;
  maxQaRounds: number;
  maxSecurityRounds: number;
  maxRetries: number;
  logLevel: string;
  repositoryRoot: string;
}

const DEFAULTS: AppConfig = {
  projectsDir: 'projects',
  artifactsDir: 'artifacts',
  logsDir: 'logs',
  maxQaRounds: 3,
  maxSecurityRounds: 3,
  maxRetries: 2,
  logLevel: 'info',
  repositoryRoot: process.cwd(),
};

export class ConfigManager {
  readonly config: AppConfig;
  readonly logger: Logger;

  constructor(overrides: Partial<AppConfig> = {}) {
    this.logger = createLogger(overrides.logLevel ?? DEFAULTS.logLevel, { component: 'config' });
    this.config = this.load(overrides);
  }

  private load(overrides: Partial<AppConfig>): AppConfig {
    const config = { ...DEFAULTS, ...this.readEnv(), ...overrides };
    config.repositoryRoot = path.resolve(config.repositoryRoot);
    config.projectsDir = path.resolve(config.repositoryRoot, config.projectsDir);
    config.artifactsDir = path.resolve(config.repositoryRoot, config.artifactsDir);
    config.logsDir = path.resolve(config.repositoryRoot, config.logsDir);

    this.validate(config);
    this.ensureDirectories(config);
    return config;
  }

  private readEnv(): Partial<AppConfig> {
    const result: Partial<AppConfig> = {};
    const env = process.env;

    if (env.AI_TEAM_PROJECTS_DIR) result.projectsDir = env.AI_TEAM_PROJECTS_DIR;
    if (env.AI_TEAM_ARTIFACTS_DIR) result.artifactsDir = env.AI_TEAM_ARTIFACTS_DIR;
    if (env.AI_TEAM_LOGS_DIR) result.logsDir = env.AI_TEAM_LOGS_DIR;
    if (env.AI_TEAM_LOG_LEVEL) result.logLevel = env.AI_TEAM_LOG_LEVEL;
    if (env.AI_TEAM_MAX_QA_ROUNDS) result.maxQaRounds = Number(env.AI_TEAM_MAX_QA_ROUNDS);
    if (env.AI_TEAM_MAX_SECURITY_ROUNDS) result.maxSecurityRounds = Number(env.AI_TEAM_MAX_SECURITY_ROUNDS);
    if (env.AI_TEAM_MAX_RETRIES) result.maxRetries = Number(env.AI_TEAM_MAX_RETRIES);

    return result;
  }

  private validate(config: AppConfig): void {
    if (!config.projectsDir) throw new Error('projectsDir is required');
    if (!config.artifactsDir) throw new Error('artifactsDir is required');
    if (!config.logsDir) throw new Error('logsDir is required');
    if (!Number.isInteger(config.maxQaRounds) || config.maxQaRounds < 1) {
      throw new Error('maxQaRounds must be a positive integer');
    }
    if (!Number.isInteger(config.maxSecurityRounds) || config.maxSecurityRounds < 1) {
      throw new Error('maxSecurityRounds must be a positive integer');
    }
    if (!Number.isInteger(config.maxRetries) || config.maxRetries < 0) {
      throw new Error('maxRetries must be a non-negative integer');
    }
  }

  private ensureDirectories(config: AppConfig): void {
    for (const dir of [config.projectsDir, config.artifactsDir, config.logsDir]) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  projectDir(projectId: string): string {
    return path.join(this.config.projectsDir, projectId);
  }

  artifactDir(projectId: string): string {
    return path.join(this.config.artifactsDir, projectId);
  }
}
