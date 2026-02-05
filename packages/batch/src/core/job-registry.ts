import { Injectable } from '@nestjs/common';
import type { Step } from '../step/step.interface';

export type Job = {
  name: string;
  steps: Step[];
};

@Injectable()
export class JobRegistry {
  private readonly jobs = new Map<string, Job>();

  register(job: Job) {
    if (this.jobs.has(job.name)) {
      throw new Error(`Job already registered: ${job.name}`);
    }
    this.jobs.set(job.name, job);
  }

  get(jobName: string): Job {
    const job = this.jobs.get(jobName);
    if (!job) throw new Error(`Job not found: ${jobName}`);
    return job;
  }

  list(): string[] {
    return [...this.jobs.keys()].sort((a, b) => a.localeCompare(b));
  }
}
