import type { JobParameters } from '../core/types';
import type { ExecutionContext } from '../core/execution-context';

export interface Step {
  name: string;
  execute(jobExecutionId: string, params: JobParameters): Promise<void>;
}

export interface ItemReader<I> {
  open(ctx: ExecutionContext): Promise<void>;
  read(ctx: ExecutionContext, chunkSize: number): Promise<I[]>; // [] => end
  close(ctx: ExecutionContext): Promise<void>;
}

export interface ItemProcessor<I, O> {
  process(item: I, ctx: ExecutionContext): Promise<O | null>; // null => filter out
}

export interface ItemWriter<O> {
  write(items: O[], ctx: ExecutionContext): Promise<void>;
}
