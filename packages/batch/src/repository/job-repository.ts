import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { DataSource, Repository } from 'typeorm';
import { createHash } from 'node:crypto';
import type { CountsDelta, JobParameters, JobStatus } from '../core/types';
import { ExecutionContext } from '../core/execution-context';
import { ExecutionContextEntity } from './entities/execution-context.entity';
import { JobExecutionEntity } from './entities/job-execution.entity';
import { StepExecutionEntity } from './entities/step-execution.entity';
import { BATCH_DATA_SOURCE } from '../core/tokens';

@Injectable()
export class JobRepository {
  constructor(@Inject(BATCH_DATA_SOURCE) private readonly dataSource: DataSource) {}

  private jobRepo(manager?: EntityManager): Repository<JobExecutionEntity> {
    return (manager ?? this.dataSource.manager).getRepository(JobExecutionEntity);
  }

  private stepRepo(manager?: EntityManager): Repository<StepExecutionEntity> {
    return (manager ?? this.dataSource.manager).getRepository(StepExecutionEntity);
  }

  private ctxRepo(manager?: EntityManager): Repository<ExecutionContextEntity> {
    return (manager ?? this.dataSource.manager).getRepository(ExecutionContextEntity);
  }

  // eslint-disable-next-line class-methods-use-this
  hashParams(params: JobParameters): string {
    // stable stringify
    const stable = JSON.stringify(
      params,
      Object.keys(params).sort((a, b) => a.localeCompare(b)),
    );
    return createHash('sha256').update(stable).digest('hex').slice(0, 64);
  }

  async startJob(jobName: string, params: JobParameters): Promise<JobExecutionEntity> {
    const paramsHash = this.hashParams(params);

    const job = this.jobRepo().create({
      jobName,
      paramsHash,
      params,
      status: 'STARTED',
      startedAt: new Date(),
      endedAt: null,
      exitMessage: null,
    });

    const saved = await this.jobRepo().save(job);

    // job context (optional, but nice)
    await this.upsertContext('JOB', saved.id, {});
    return saved;
  }

  async completeJob(jobExecId: string): Promise<void> {
    await this.jobRepo().update(
      { id: jobExecId },
      { status: 'COMPLETED', endedAt: new Date(), exitMessage: null },
    );
  }

  async failJob(jobExecId: string, message: string): Promise<void> {
    await this.jobRepo().update(
      { id: jobExecId },
      { status: 'FAILED', endedAt: new Date(), exitMessage: message?.slice(0, 4000) ?? 'FAILED' },
    );
  }

  async startStep(jobExecId: string, stepName: string): Promise<StepExecutionEntity> {
    // unique(jobExecId, stepName) -> restart 시 기존 step exec 계속 쓰게끔
    const existing = await this.stepRepo().findOne({
      where: { jobExecutionId: jobExecId, stepName },
    });

    if (existing) {
      // 이미 완료된 step이면 재실행 막고 싶으면 여기서 체크
      if (existing.status === 'COMPLETED') return existing;

      await this.stepRepo().update(
        { id: existing.id },
        {
          status: 'STARTED',
          startedAt: existing.startedAt ?? new Date(),
          endedAt: null,
          exitMessage: null,
        },
      );
      return this.stepRepo().findOneOrFail({ where: { id: existing.id } });
    }

    const step = this.stepRepo().create({
      jobExecutionId: jobExecId,
      stepName,
      status: 'STARTED',
      startedAt: new Date(),
      endedAt: null,
      exitMessage: null,
      readCount: 0,
      writeCount: 0,
      skipCount: 0,
      commitCount: 0,
    });
    const saved = await this.stepRepo().save(step);

    await this.upsertContext('STEP', saved.id, {});
    return saved;
  }

  async completeStep(stepExecId: string): Promise<void> {
    await this.stepRepo().update(
      { id: stepExecId },
      { status: 'COMPLETED', endedAt: new Date(), exitMessage: null },
    );
  }

  async failStep(stepExecId: string, message: string): Promise<void> {
    await this.stepRepo().update(
      { id: stepExecId },
      { status: 'FAILED', endedAt: new Date(), exitMessage: message?.slice(0, 4000) ?? 'FAILED' },
    );
  }

  async updateCounts(
    stepExecId: string,
    delta: CountsDelta,
    manager?: EntityManager,
  ): Promise<void> {
    // atomic increment (query builder)
    const repo = manager?.getRepository(StepExecutionEntity) ?? this.stepRepo();
    const qb = repo
      .createQueryBuilder()
      .update(StepExecutionEntity)
      .where('id = :id', { id: stepExecId });

    const sets: Record<string, any> = {};
    if (delta.read) sets.readCount = () => `"read_count" + ${Math.floor(delta.read ?? 0)}`;
    if (delta.write) sets.writeCount = () => `"write_count" + ${Math.floor(delta.write ?? 0)}`;
    if (delta.skip) sets.skipCount = () => `"skip_count" + ${Math.floor(delta.skip ?? 0)}`;
    if (delta.commit) sets.commitCount = () => `"commit_count" + ${Math.floor(delta.commit ?? 0)}`;

    if (Object.keys(sets).length === 0) return;
    await qb.set(sets).execute();
  }

  async getStepStatus(stepExecId: string): Promise<JobStatus> {
    const step = await this.stepRepo().findOneOrFail({ where: { id: stepExecId } });
    return step.status;
  }

  async loadStepContext(stepExecId: string): Promise<ExecutionContext> {
    const row = await this.ctxRepo().findOne({ where: { scope: 'STEP', scopeId: stepExecId } });
    return new ExecutionContext(row?.context ?? {});
  }

  async saveStepContext(
    stepExecId: string,
    ctx: ExecutionContext,
    manager?: EntityManager,
  ): Promise<void> {
    await this.upsertContext('STEP', stepExecId, ctx.toJSON(), manager);
  }

  async loadJobContext(jobExecId: string): Promise<ExecutionContext> {
    const row = await this.ctxRepo().findOne({ where: { scope: 'JOB', scopeId: jobExecId } });
    return new ExecutionContext(row?.context ?? {});
  }

  async saveJobContext(
    jobExecId: string,
    ctx: ExecutionContext,
    manager?: EntityManager,
  ): Promise<void> {
    await this.upsertContext('JOB', jobExecId, ctx.toJSON(), manager);
  }

  /**
   * atomic upsert (json replace)
   * - merge는 애플리케이션에서 수행 (ExecutionContext.merge)
   */
  private async upsertContext(
    scope: 'JOB' | 'STEP',
    scopeId: string,
    context: Record<string, any>,
    manager?: EntityManager,
  ): Promise<void> {
    // ON CONFLICT (scope, scope_id) DO UPDATE
    const repo = manager?.getRepository(ExecutionContextEntity) ?? this.ctxRepo();
    await repo
      .createQueryBuilder()
      .insert()
      .into(ExecutionContextEntity)
      .values({ scope, scopeId, context })
      .orUpdate(['context', 'updatedAt'], ['scope', 'scopeId'])
      .execute();
  }
}
