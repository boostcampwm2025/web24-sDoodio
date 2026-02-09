import { Injectable } from '@nestjs/common';
import type { JobParameters } from './types';
import { JobRegistry } from './job-registry';
import { JobRepository } from '../repository/job-repository';
import { LockService } from '../lock/lock.service';

export type RunOptions = {
  lockTtlSeconds?: number;
  /**
   * start 시 expired lock cleanup 할지
   */
  cleanupExpiredLocks?: boolean;
};

@Injectable()
export class BatchRunnerService {
  constructor(
    private readonly registry: JobRegistry,
    private readonly repo: JobRepository,
    private readonly lock: LockService,
  ) {}

  async run(jobName: string, params: JobParameters, options: RunOptions = {}): Promise<string> {
    const job = this.registry.get(jobName);
    const paramsHash = this.repo.hashParams(params);
    const lockKey = `job:${jobName}:${paramsHash}`;
    const ttl = options.lockTtlSeconds ?? 60 * 60; // default 1h

    if (options.cleanupExpiredLocks ?? true) {
      await this.lock.cleanupExpired().catch(() => {});
    }

    return this.lock.withLock(lockKey, ttl, async () => {
      const jobExec = await this.repo.startJob(jobName, params);

      try {
        /* eslint-disable no-await-in-loop */
        // eslint-disable-next-line no-restricted-syntax
        for (const step of job.steps) {
          await step.execute(jobExec.id, params);
        }
        /* eslint-enable no-await-in-loop */
        await this.repo.completeJob(jobExec.id);
        return jobExec.id;
      } catch (e: any) {
        await this.repo.failJob(jobExec.id, e?.message ?? 'unknown error');
        throw e;
      }
    });
  }
}
