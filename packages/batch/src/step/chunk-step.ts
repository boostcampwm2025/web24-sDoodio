import type { JobParameters } from '../core/types';
import type { ItemProcessor, ItemReader, ItemWriter, Step } from './step.interface';
import { JobRepository } from '../repository/job-repository';
import { TransactionRunner } from '../transaction/transaction-runner';

export type ChunkStepOptions = {
  chunkSize: number;

  /**
   * 기본: 각 chunk 성공 시 context 저장 (재시작 포인트)
   * - false로 하면 성능은 좋아지지만 재시작 granularity가 나빠짐
   */
  saveContextEveryChunk?: boolean;

  /**
   * commitCount 증가 여부 (기본 true)
   */
  countCommit?: boolean;
};

export class ChunkStep<I, O> implements Step {
  public readonly name: string;

  constructor(
    name: string,
    private readonly reader: ItemReader<I>,
    private readonly processor: ItemProcessor<I, O> | null,
    private readonly writer: ItemWriter<O>,
    private readonly opts: ChunkStepOptions,
    private readonly repo: JobRepository,
    private readonly tx: TransactionRunner,
  ) {
    this.name = name;
  }

  async execute(jobExecutionId: string, params: JobParameters): Promise<void> {
    const stepExec = await this.repo.startStep(jobExecutionId, this.name);
    if (stepExec.status === 'COMPLETED') {
      return;
    }

    // step context: restart state lives here
    const ctx = await this.repo.loadStepContext(stepExec.id);

    // convenience: job params 넣어두면 reader/processor/writer가 언제든 참조 가능
    ctx.set('jobParameters', params);
    ctx.set('jobExecutionId', jobExecutionId);
    ctx.set('stepExecutionId', stepExec.id);

    await this.reader.open(ctx);

    const saveEveryChunk = this.opts.saveContextEveryChunk ?? true;
    const countCommit = this.opts.countCommit ?? true;

    try {
      /* eslint-disable no-await-in-loop */
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const shouldContinue = await this.tx.runInTransaction(async (manager) => {
          const items = await this.reader.read(ctx, this.opts.chunkSize, manager);
          if (items.length === 0) return false;

          const out: O[] = [];

          // iterator 금지 규칙은 프런트 번들 정책용; 여기서는 노드 런타임
          // eslint-disable-next-line no-restricted-syntax
          for (const item of items) {
            const processed = this.processor
              ? await this.processor.process(item, ctx, manager)
              : (item as unknown as O);

            if (processed !== null) out.push(processed);
          }

          await this.writer.write(out, ctx, manager);

          await this.repo.updateCounts(
            stepExec.id,
            {
              read: items.length,
              write: out.length,
              commit: countCommit ? 1 : 0,
            },
            manager,
          );

          if (saveEveryChunk) {
            // ★ 재시작 포인트: chunk 성공마다 context 저장
            await this.repo.saveStepContext(stepExec.id, ctx, manager);
          }
          return true;
        });

        if (!shouldContinue) break;
      }
      /* eslint-enable no-await-in-loop */

      // 마지막에 한 번 더 저장(옵션 false인 경우에도 최소 1회는 보장)
      if (!saveEveryChunk) {
        await this.repo.saveStepContext(stepExec.id, ctx);
      }

      await this.reader.close(ctx);
      await this.repo.completeStep(stepExec.id);
    } catch (e: any) {
      await this.reader.close(ctx).catch(() => {
        // MEMO: 추후 추가, 최소 Log 남기기
      });
      await this.repo.failStep(stepExec.id, e?.message ?? 'unknown error');
      throw e;
    }
  }
}
