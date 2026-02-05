/* eslint-disable max-classes-per-file */
import type { Job } from '../core/job-registry';
import type { Step, ItemReader, ItemProcessor, ItemWriter } from '../step/step.interface';
import { ChunkStep, type ChunkStepOptions } from '../step/chunk-step';
import { JobRepository } from '../repository/job-repository';
import { TransactionRunner } from '../transaction/transaction-runner';

export class JobBuilder {
  private readonly steps: Step[] = [];

  constructor(private readonly name: string) {}

  step(step: Step): this {
    this.steps.push(step);
    return this;
  }

  build(): Job {
    return { name: this.name, steps: [...this.steps] };
  }
}

export class StepFactory {
  constructor(
    private readonly repo: JobRepository,
    private readonly tx: TransactionRunner,
  ) {}

  chunk<I, O>(
    name: string,
    reader: ItemReader<I>,
    processor: ItemProcessor<I, O> | null,
    writer: ItemWriter<O>,
    options: ChunkStepOptions,
  ) {
    return new ChunkStep<I, O>(name, reader, processor, writer, options, this.repo, this.tx);
  }
}

export function job(name: string) {
  return new JobBuilder(name);
}
